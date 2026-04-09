import { useState } from 'react';
import VisibilityOptions from '../../../pricing/components/visibility-options';
import CollectionNameInput from '../collection-name-input';
import CollectionDescriptionInput from '../collection-description-input';
import PricingSelector from '../pricings-selector';
import { usePricingCollectionsApi } from '../../api/pricingCollectionsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import FileUpload from '../../../core/components/file-upload-input';
import customAlert from '../../../core/utils/custom-alert';
import customConfirm from '../../../core/utils/custom-confirm';

export type CreateCollectionFormProps = {
  readonly setShowLoading: (show: boolean) => void;
}

export default function CreateCollectionForm({setShowLoading}: CreateCollectionFormProps) {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [selectedPricings, setSelectedPricings] = useState<string[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const { createCollection, createBulkCollection, deleteCollection } = usePricingCollectionsApi();
  const router = useRouter();

  const handleSubmit = (file?: File | null) => {

    const fileToUpload = file instanceof File ? file : null;

  if (!fileToUpload) {
      const collectionToCreate = {
        name: collectionName,
        description: collectionDescription,
        private: visibility === 'Private',
        pricings: selectedPricings,
      };

      createCollection(collectionToCreate)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          // If API returned an Error with status 409, show duplicate alert and keep form
          if (error instanceof Error) {
            customAlert(error.message);
            return;
          }
          alert(error instanceof Error ? error.message : String(error));
        });
    } else {
      const formData = new FormData();

      formData.append('zip', fileToUpload);
      formData.append('name', collectionName);
      formData.append('description', collectionDescription);
      formData.append('private', visibility === 'Private' ? 'true' : 'false');

      setShowLoading(true);

      createBulkCollection(formData)
        .then(data => {
          setShowLoading(false);
          handleBulkSuccess(data);
        })
        .catch(error => {
          setShowLoading(false);
          if (error instanceof Error && (error as unknown as { status?: number }).status === 409) {
            customAlert(error.message);
            return;
          }
          customAlert(error instanceof Error ? error.message : String(error));
        });
    }
  };


  function handleBulkSuccess(data: { pricingsWithErrors?: Array<{ name: string; error: string }>} ) {
    if (data.pricingsWithErrors && data.pricingsWithErrors.length > 0) {
      customConfirm(`Some pricings could not be added to the collection due to errors: ${data.pricingsWithErrors.map((p: {name: string, error: string}) => p.name).join(' | ')}. Do you still want to save the collection and add them again manually?`).then(() => {
        router.push('/me/pricings');
      }).catch(() => {
        deleteCollection(collectionName, true).then(() => {
            router.push('/me/pricings');
          })
      });
    } else {
      router.push('/me/pricings');
    }
  }

  function handleAddCollectionClick() {
    handleSubmit();
  }

  return (
    <form className="flex flex-col gap-3">
      <h2 className="mb-5 text-center text-2xl font-bold">
        Create a collection to store your pricings
      </h2>
      <CollectionNameInput value={collectionName} onChange={setCollectionName} />
      <CollectionDescriptionInput
        value={collectionDescription}
        onChange={setCollectionDescription}
      />
      <VisibilityOptions value={visibility} onChange={setVisibility} />
      <div className="border-b border-slate-300">
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-t-md px-4 py-2 ${tabValue === 0 ? 'bg-sphere-primary-700 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setTabValue(0)}
          >
            Select unassigned pricings
          </button>
          <button
            type="button"
            className={`rounded-t-md px-4 py-2 ${tabValue === 1 ? 'bg-sphere-primary-700 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => setTabValue(1)}
          >
            Upload collection
          </button>
        </div>
      </div>
      {tabValue === 0 ? (
        <>
          <PricingSelector value={selectedPricings} onChange={setSelectedPricings} />{' '}
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="mt-5 w-[400px] rounded-xl bg-sphere-primary-700 px-5 py-2 text-base font-bold text-white"
              onClick={handleAddCollectionClick}
                >
              Add Collection
            </button>
          </div>
        </>
      ) : (
        <FileUpload
          onSubmit={handleSubmit}
          submitButtonText="Add Collection"
          submitButtonWidth={400}
          isDragActiveText="Drop a .zip file containing all the pricings of the collection"
          isNotDragActiveText="Drag and drop a .zip file containing all the pricings of the collection"
          accept={{ 'application/zip': ['.zip'] }}
        />
      )}
    </form>
  );
}
