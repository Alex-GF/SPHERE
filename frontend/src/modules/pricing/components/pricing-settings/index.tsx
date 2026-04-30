import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { useEffect, useState } from 'react';
import VisibilityOptions from '../visibility-options';
import customConfirm from '../../../core/utils/custom-confirm';
import customAlert from '../../../core/utils/custom-alert';
import { usePricingsApi } from '../../api/pricingsApi';
import { useRouter } from '../../../core/hooks/useRouter';

export function SettingsPage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-dvh w-full flex-col overflow-auto p-5">{children}</div>;
}

export function DangerZone({ children }: { children: React.ReactNode }) {
  return <div className="my-5 flex w-3/4 flex-col rounded-[15px] border border-red-500 p-5">{children}</div>;
}

export default function PricingSettings({
  pricingName,
  pricingData,
  updatePricingInformation,
}: {
  pricingName: string;
  collectionName: string;
  pricingData: AnalyticsDataEntry[];
  updatePricingInformation: (pricing: any) => void;
}) {
  const [visibility, setVisibility] = useState('Public');

  const { updatePricing, removePricingByName } = usePricingsApi();
  const router = useRouter();

  function handleVisibilityChange() {
    customConfirm('Are you sure you want to change the visibility of this pricing?')
      .then(() => {
        const pricingUpdateBody = {
          private: !(visibility === 'Private'),
        };

        updatePricing(pricingName, pricingData[0].collectionName, pricingUpdateBody)
          .then((pricing: any) => {
            updatePricingInformation(pricing);
            setVisibility(visibility === 'Private' ? 'Public' : 'Private');
            customAlert('Pricing visibility updated successfully');
          })
          .catch((error: Error) => {
            customAlert(`Error: ${error.message}`);
          });
      })
      .catch(() => {});
  }

  function handleDeletePricing() {
    customConfirm('Are you sure you want to delete this pricing? This action is irreversible.')
      .then(() => {
        removePricingByName(pricingName, pricingData[0].collectionName)
          .then(() => {
            customConfirm('Pricing deleted successfully. Do you want to return to the main page?')
              .then(() => {
                router.push('/');
              })
              .catch(() => {
                router.push('/me/pricings');
              });
          }).catch(() => {
            customAlert(`An error has occurred while removing the pricing. Please, try again later.`);
          });
      })
  }

  useEffect(() => {
    setVisibility(pricingData[0].private ? 'Private' : 'Public');
  }, [pricingData]);

  return (
    <SettingsPage>
      <h2 className="mb-3 text-2xl font-bold">
        Visibility
      </h2>
      <div className="pl-5">
        <VisibilityOptions value={visibility} onChange={handleVisibilityChange} />
      </div>
      <h2 className="mt-3 text-2xl font-bold">
        Danger zone
      </h2>
      <div className="my-5 flex w-3/4 flex-col rounded-[15px] border border-red-500 p-5">
        <div className="mb-2 flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-xl font-bold">
              Delete this pricing
            </h3>
            <p className="mb-2 text-base">
              Once you delete a pricing, there is no going back. Please be certain.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeletePricing}
            className="rounded-md border border-red-500 px-4 py-2 font-bold text-red-500 hover:bg-red-500 hover:text-white"
          >
            Delete pricing
          </button>
        </div>
      </div>
    </SettingsPage>
  );
}
