import { Box } from '@mui/material';
import ProfileSidebar from '../../components/sidebar';
import CollectionSection from '../../components/collection-section';
import PricingSection from '../../components/pricing-section';
import { useState } from 'react';

const SIDEBAR_WIDTH = 400;

export default function MyPricingsPage() {
  const [addPricingToCollectionModalOpen, setAddPricingToCollectionModalOpen] = useState(false);
  const [pricingToAdd, setPricingToAdd] = useState('');

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '95vw', maxWidth: '1300px' }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH + 100,
          borderRight: '1px solid #ddd',
        }}
      >
        <ProfileSidebar sidebarWidth={SIDEBAR_WIDTH} />
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        {/* Collections */}
        <CollectionSection
          addPricingToCollectionModalOpen={addPricingToCollectionModalOpen}
          setAddPricingToCollectionModalOpen={setAddPricingToCollectionModalOpen}
          pricingToAdd={pricingToAdd}
        />
        {/* Pricings */}
        <PricingSection
          setAddToCollectionModalOpen={setAddPricingToCollectionModalOpen}
          setPricingToAdd={setPricingToAdd}
        />
      </Box>
    </Box>
  );
}
