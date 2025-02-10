import { Box } from '@mui/material';
import ProfileSidebar from '../../components/sidebar';
import CollectionSection from '../../components/collection-section';
import PricingSection from '../../components/pricing-section';

const SIDEBAR_WIDTH = 400;

export default function MyPricingsPage() {

  return (
    <Box sx={{ display: 'flex', height: '100%', width: '95vw', maxWidth: '1200px' }}>
      {/* SIDEBAR */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          borderRight: '1px solid #ddd',
        }}
      >
        <ProfileSidebar sidebarWidth={SIDEBAR_WIDTH}/>
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ flexGrow: 1, p: 2 }}>
        {/* Collections */}
        <CollectionSection />
        {/* Pricings */}
        <PricingSection />
      </Box>
    </Box>
  );
}
