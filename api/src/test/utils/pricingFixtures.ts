import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const templatePath = path.resolve(
  process.cwd(),
  'public',
  'static',
  'pricings',
  'templates',
  'petclinic.yml'
);

export const createTempPricingYaml = async (namePrefix = 'IntegrationPricing') => {
  const rawTemplate = await fs.readFile(templatePath, 'utf8');
  const uniqueName = `${namePrefix}${Math.random().toString(36).slice(2, 6)}`;
  const uniqueVersion = `${Date.now()}.0.0`;
  const today = new Date().toISOString().slice(0, 10);

  const content = rawTemplate
    .replace(/^saasName:\s*.*$/m, `saasName: ${uniqueName}`)
    .replace(/^version:\s*.*$/m, `version: "${uniqueVersion}"`)
    .replace(/^createdAt:\s*.*$/m, `createdAt: "${today}"`);

  const filePath = path.join(os.tmpdir(), `${Math.random().toString(36).slice(2, 6)}.yml`);
  await fs.writeFile(filePath, content, 'utf8');

  return {
    filePath,
    saasName: uniqueName,
    version: uniqueVersion,
  };
};

const createZipFromDirectory = async (sourceDir: string) => {
  const zipPath = path.join(os.tmpdir(), `${Math.random().toString(36).slice(2, 6)}.zip`);

  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    output.on('error', reject);
    archive.on('error', reject);

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });

  return zipPath;
};

export const createBulkZipFixture = async () => {
  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bulk-pricing-'));
  const validFolder = path.join(rootDir, 'valid');
  const invalidFolder = path.join(rootDir, 'invalid');

  await fs.mkdir(validFolder, { recursive: true });
  await fs.mkdir(invalidFolder, { recursive: true });

  const validPricing = await createTempPricingYaml('BulkPricing');
  const validTargetPath = path.join(validFolder, 'valid.yml');
  await fs.copyFile(validPricing.filePath, validTargetPath);

  const invalidYamlPath = path.join(invalidFolder, 'invalid.yml');
  await fs.writeFile(invalidYamlPath, 'invalid: [', 'utf8');

  const zipPath = await createZipFromDirectory(rootDir);

  return {
    zipPath,
    tempPaths: [rootDir, validPricing.filePath],
  };
};

export const removeTempPaths = async (paths: string[]) => {
  await Promise.all(
    paths.map(async tempPath => {
      await fs.rm(tempPath, { recursive: true, force: true });
    })
  );
};
