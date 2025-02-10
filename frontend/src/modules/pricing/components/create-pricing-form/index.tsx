import { useState } from 'react';
import { Box, Typography } from '@mui/material';
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
    <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <PricingLogo size={100} />
      </Box>
      <Typography variant="h5" align="center" marginBottom={10} fontWeight="bold">Upload a pricing to SPHERE</Typography>
      <PricingNameInput value={modelName} onChange={setModelName} />
      {/* <LicenseInput value={license} onChange={setLicense} /> */}
      {/* <TemplateSelector /> */}
      <VisibilityOptions value={visibility} onChange={setVisibility} />
      <FileUpload onSubmit={handleSubmit} submitButtonText="Add Pricing" submitButtonWidth={200}/>
      <Box sx={{ height: 50 }} />
      {/* <Button 
        variant="contained" 
        onClick={handleSubmit} 
        sx={{ mt: 3 }}
      >
        Add pricing
      </Button> */}
    </Box>
  );
};
