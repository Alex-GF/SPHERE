import { useState } from 'react';
import PricingNameInput from '../pricing-name-input';
import VisibilityOptions from '../visibility-options';
import FileUpload from '../../../core/components/file-upload-input';
import PricingLogo from '../pricing-logo';

export default function CreatePricingForm () {
  const [modelName, setModelName] = useState('');
  const [visibility, setVisibility] = useState('Public');

  const handleSubmit = () => {
    console.log({ modelName, visibility });
  };

  return (
    <form className="flex flex-col gap-3">
      <div className="flex justify-center">
        <PricingLogo size={100} />
      </div>
      <h2 className="mb-10 text-center text-2xl font-bold">Upload a pricing to SPHERE</h2>
      <PricingNameInput value={modelName} onChange={setModelName} />
      {/* <LicenseInput value={license} onChange={setLicense} /> */}
      {/* <TemplateSelector /> */}
      <VisibilityOptions value={visibility} onChange={setVisibility} />
      <FileUpload onSubmit={handleSubmit} submitButtonText="Add Pricing" submitButtonWidth={200}/>
      <div className="h-12" />
      {/* <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ mt: 3 }}
      >
        Add pricing
      </Button> */}
    </form>
  );
};
