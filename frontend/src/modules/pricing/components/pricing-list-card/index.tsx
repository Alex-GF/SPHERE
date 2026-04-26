import { useRouter } from '../../../core/hooks/useRouter';
import { PricingEntry } from '../../pages/list';
import { formatDistanceToNow, parseISO, set } from 'date-fns';
import { getCurrency } from '../stats';
import { IoMdPricetags } from 'react-icons/io';
import { FaFileInvoiceDollar } from 'react-icons/fa6';
import { MdMoreVert } from 'react-icons/md';
import { grey } from '../../../core/theme/palette';
import { useEffect, useRef, useState } from 'react';
import { usePricingsApi } from '../../api/pricingsApi';
import customAlert from '../../../core/utils/custom-alert';
import customConfirm from '../../../core/utils/custom-confirm';

export default function PricingListCard({
  name,
  owner,
  dataEntry,
  showOptions = false,
  setPricingToAdd = () => {},
  setAddToCollectionModalOpen,
}: {
  name: string;
  owner: string;
  dataEntry: PricingEntry;
  showOptions?: boolean;
  setPricingToAdd?: (value: string) => void;
  setAddToCollectionModalOpen?: (value: boolean) => void;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { removePricingFromCollection, removePricingByName } = usePricingsApi();

  const handleAddToCollection = () => {
    if (setAddToCollectionModalOpen){
      setAddToCollectionModalOpen(true);
    }
    
    setPricingToAdd(name);
  };

  const handleRemoveFromCollection = () => {
    customConfirm('Are you sure you want to remove this pricing from the collection?').then(() => {
      removePricingFromCollection(name)
        .then(() => {
          customAlert('Pricing removed from collection');
          window.location.reload();
        })
        .catch(error => {
          console.error(error);
          customAlert('An error occurred while removing the pricing from the collection');
        });
    });
  };

  const handleRemovePricing = () => {
    removePricingByName(name, dataEntry.collectionName)
      .then(() => {
        customAlert('Pricing removed');
        window.location.reload();
      })
      .catch(error => {
        console.error(error);
        customAlert('An error occurred while removing the pricing');
      });
  };

  const handleOpenOptionsMenu = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseOptionsMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleCloseOptionsMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const router = useRouter();

  return (
    <div className="relative h-[150px] w-full max-w-[600px] overflow-hidden rounded-lg px-[5px] shadow-md transition-shadow hover:shadow-lg">
      {showOptions && (
        <>
          <button
            type="button"
            className="absolute right-2.5 top-2.5 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200"
            onClick={handleOpenOptionsMenu}
          >
            <MdMoreVert size={30} />
          </button>
          {anchorEl && (
            <div ref={menuRef} className="absolute right-2.5 top-12 z-10 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
              {setAddToCollectionModalOpen ? (
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left hover:bg-slate-100"
                  onClick={handleAddToCollection}
                >
                  Add to collection
                </button>
              ) : (
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-slate-100"
                  onClick={handleRemoveFromCollection}
                >
                  Remove from collection
                </button>
              )}
              <button
                type="button"
                className="block w-full px-4 py-2 text-left text-red-600 hover:bg-slate-100"
                onClick={handleRemovePricing}
              >
                Remove
              </button>
            </div>
          )}
        </>
      )}
      <div className="px-3 py-3">
        <button
          type="button"
          className="flex h-[45px] w-full items-center px-[10px] text-left transition-colors hover:text-sphere-primary-600"
          onClick={() => 
            router.push(`/pricings/${owner}/${name}?collectionName=${dataEntry.collectionName}`)
          }
        >
          <h3 className="mt-1 text-lg font-bold">
            {dataEntry.collectionName ? `${dataEntry.collectionName}/${name}` : name}
          </h3>
        </button>
        <div className="mt-2 flex items-center justify-evenly gap-3">
          <div>
            <span>Updated </span>
            {dataEntry && formatDistanceToNow(parseISO(dataEntry.createdAt))} ago
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-black mx-2" />
          <div className="flex items-center justify-center">
            <FaFileInvoiceDollar
              fill={grey[700]}
              size={18}
              className="mr-2"
            />
            <p>
              {dataEntry.analytics ? (
                <>{dataEntry.analytics.configurationSpaceSize} subscriptions</>
              ) : (
                <>–</>
              )}
            </p>
          </div>
          <div className="h-1.5 w-1.5 rounded-full bg-black mx-2" />
          <div className="flex items-center justify-between">
            <IoMdPricetags fill={grey[700]} size={20} className="mr-2" />
            <p>
              {dataEntry.analytics ? (
                <>
                  {dataEntry.analytics.minSubscriptionPrice}
                  {getCurrency(dataEntry.currency)} - {dataEntry?.analytics.maxSubscriptionPrice}
                  {getCurrency(dataEntry.currency)}
                </>
              ) : (
                <>–</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
