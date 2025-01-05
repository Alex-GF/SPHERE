import fs from 'fs';
import {AnalyticsData, SAAS_DATA} from '../../frontend/src/assets/data/analytics';
import mongoose, { ObjectId } from 'mongoose';

interface Analytics {
  [key: string]: number;
}

interface OutputData {
  _id: ObjectId;
  name: string;
  extractionDate: string;
  url: string;
  yaml: string;
  analytics: Analytics;
}

const transformData = (data: AnalyticsData): OutputData[] => {
  const publicYamlPath = 'public/pricings/originalDataset';

  return Object.entries(data).flatMap(([name, pricingArray]) =>
    pricingArray.map((pricing) => ({
      _id: {
        $oid: new mongoose.Types.ObjectId()
      },
      name,
      version: pricing.date.split('-')[0],
      extractionDate: new Date(pricing.date),
      url: null,
      yaml: `${publicYamlPath}/${pricing.yaml_path.split('/').slice(2).join('/')}`,
      analytics: pricing.analytics,
    }))
  );
};

const saveToJsonFile = (data: OutputData[], fileName: string): void => {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
  console.log(`Data successfully saved to ${fileName}`);
};

const main = () => {
  const transformedData = transformData(SAAS_DATA);
  saveToJsonFile(transformedData, './api/scripts/output.json');
};

main();