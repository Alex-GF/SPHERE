import { useEffect, useState } from 'react';
import VisibilityOptions from '../visibility-options';
import customConfirm from '../../../core/utils/custom-confirm';
import customAlert from '../../../core/utils/custom-alert';
import { useRouter } from '../../../core/hooks/useRouter';
import { Collection } from '../../types/collection';
import { DangerZone, SettingsPage } from '../pricing-settings';
import { usePricingCollectionsApi } from '../../../profile/api/pricingCollectionsApi';

export default function CollectionSettings({
  collection,
  updateCollectionMethod,
}: {
  collection: Collection;
  updateCollectionMethod: (collection: Collection) => void;
}) {
  const [visibility, setVisibility] = useState('Public');

  const { updateCollection, deleteCollection } = usePricingCollectionsApi();
  const router = useRouter();

  function handleRename() {
    customConfirm(
      `Are you sure you want to change the name of this collection? You'll be redirected to your profile page.`
    ).then(() => {
      const newName = (document.getElementById('collectionNameInput') as HTMLInputElement).value;

      updateCollection(collection.name, { name: newName });

      router.push(`/me/pricings`);
    });
  }

  function handleDescriptionChange() {
    const newDescription = (document.getElementById('collectionDescriptionInput') as HTMLInputElement).value;

    updateCollection(collection.name, { description: newDescription });

    customAlert('Description updated!');
  }

  function handleVisibilityChange() {
    customConfirm('Are you sure you want to change the visibility of this collection?')
      .then(() => {
        const collectionUpdateBody = {
          private: !(visibility === 'Private'),
        };

        updateCollection(collection.name, collectionUpdateBody)
          .then((data: any) => {
            if (data.error) {
              customAlert(`Error: ${data.error}`);
              return;
            }
            updateCollectionMethod(data);
            setVisibility(visibility === 'Private' ? 'Public' : 'Private');
            customAlert('Pricing visibility updated successfully');
          })
          .catch((error: Error) => {
            customAlert(`Error: ${error.message}`);
          });
      })
      .catch(() => {});
  }

  function handleDeleteCollection() {
    customConfirm(
      'Are you sure you want to delete this collection and preserve its pricings? This action is irreversible.'
    ).then(() => {
      deleteCollection(collection.name, false)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          console.log(error);
          customAlert(
            `An error has occurred while removing the collection. Please, try again later.`
          );
        });
    });
  }

  function handleDeleteCollectionAndPricings() {
    customConfirm(
      'Are you sure you want to delete this collection and its pricings? This action is irreversible.'
    ).then(() => {
      deleteCollection(collection.name, true)
        .then(() => {
          router.push('/me/pricings');
        })
        .catch(error => {
          customAlert(
            `An error has occurred while removing the collection. Please, try again later.`
          );
        });
    });
  }

  useEffect(() => {
    setVisibility(collection.private ? 'Private' : 'Public');
  }, []);

  return (
    <SettingsPage>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          Global Settings
        </h2>
        <div className="mt-3 flex max-w-[800px] items-center gap-3 pl-5">
          <input
            defaultValue={collection.name}
            id="collectionNameInput"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button type="button" className="rounded-md border border-slate-400 px-4 py-2" onClick={handleRename}>
            Rename
          </button>
        </div>
        <div className="mt-3 flex max-w-[800px] items-center gap-3 pl-5">
          <textarea
            id="collectionDescriptionInput"
            placeholder="Description of this collection"
            defaultValue={collection.description}
            rows={5}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <button type="button" className="rounded-md border border-slate-400 px-4 py-2" onClick={handleDescriptionChange}>
            Change
          </button>
        </div>
      </div>
      <h2 className="mb-3 text-2xl font-bold">
        Visibility
      </h2>
      <div className="pl-5">
        <VisibilityOptions value={visibility} onChange={handleVisibilityChange} />
      </div>
      <h2 className="mt-3 text-2xl font-bold">
        Danger zone
      </h2>
      <DangerZone>
        <div className="mb-2 flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-xl font-bold">
              Delete this collection
            </h3>
            <p className="mb-2 text-base">
              This action will delete this collection forever, but not its pricings. Please be
              certain.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteCollection}
            className="rounded-md border border-red-500 px-4 py-2 font-bold text-red-500 hover:bg-red-500 hover:text-white"
          >
            Delete collection
          </button>
        </div>
        <div className="mb-2 flex w-full items-center justify-between">
          <div className="flex flex-col gap-2">
            <h3 className="mb-2 text-xl font-bold">
              Delete this collection and its pricings
            </h3>
            <p className="mb-2 text-base">
              This action will delete this collection and all pricings associated with it forever.
              Please be certain.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteCollectionAndPricings}
            className="rounded-md border border-red-500 px-4 py-2 font-bold text-red-500 hover:bg-red-500 hover:text-white"
          >
            Delete collection and pricings
          </button>
        </div>
      </DangerZone>
    </SettingsPage>
  );
}
