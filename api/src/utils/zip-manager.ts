import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
/**
 * Decompresses a ZIP file to the specified destination directory.
 *
 * @param zipPath - The path to the ZIP file to be decompressed.
 * @param destination - The directory where the contents of the ZIP file will be extracted.
 * @returns An array of strings representing the paths of the extracted files.
 */
export async function decompressZip(zipPath: string, destination: string): Promise<string[]> {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const extractedFiles: string[] = [];
  const extractionPromises: Promise<void>[] = [];

  return new Promise<string[]>((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse())
      .on('entry', (entry: any) => {
        const fileName = entry.path;
        const filePath = path.join(destination, fileName);
        const fileDir = path.dirname(filePath); // Obtener el directorio del archivo

        if (entry.type === 'File') {
          extractedFiles.push(filePath);

          // 🔥 **SOLUCIÓN: Crear los directorios antes de escribir el archivo**
          if (!fs.existsSync(fileDir)) {
            fs.mkdirSync(fileDir, { recursive: true });
          }

          const writeStream = fs.createWriteStream(filePath);
          extractionPromises.push(
            new Promise((fileResolve, fileReject) => {
              entry.pipe(writeStream).on('finish', fileResolve).on('error', fileReject);
            })
          );
        } else {
          entry.autodrain();
        }
      })
      .on('close', async () => {
        try {
          await Promise.all(extractionPromises);
          fs.unlinkSync(zipPath);
          resolve(extractedFiles);
        } catch (err) {
          reject(err);
        }
      })
      .on('error', reject);
  });
}
