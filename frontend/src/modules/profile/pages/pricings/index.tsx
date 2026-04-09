import ProfileSidebar from '../../components/sidebar';
import CollectionSection from '../../components/collection-section';
import PricingSection from '../../components/pricing-section';
import { useState } from 'react';

const SIDEBAR_WIDTH = 400;

export default function MyPricingsPage() {
  const [addPricingToCollectionModalOpen, setAddPricingToCollectionModalOpen] = useState(false);
  const [pricingToAdd, setPricingToAdd] = useState('');
  const [renderFlag, setRenderFlag] = useState(false);

  return (
    <div className="flex h-full w-[95vw] max-w-[1300px]">
      {/* SIDEBAR */}
      <div className="w-[500px] border-r border-[#ddd]">
        <ProfileSidebar sidebarWidth={SIDEBAR_WIDTH} />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow p-2">
        {/* Collections */}
        <CollectionSection
          addPricingToCollectionModalOpen={addPricingToCollectionModalOpen}
          setAddPricingToCollectionModalOpen={setAddPricingToCollectionModalOpen}
          pricingToAdd={pricingToAdd}
          renderFlag={renderFlag}
          setRenderFlag={setRenderFlag}
        />
        {/* Pricings */}
        <PricingSection
          setAddToCollectionModalOpen={setAddPricingToCollectionModalOpen}
          setPricingToAdd={setPricingToAdd}
          renderFlag={renderFlag}
        />
      </div>
    </div>
  );
}
