import CreateCollectionForm from '../../components/create-collection-form';
import { useState } from 'react';
import LoadingModal from '../../../core/components/loading-modal';

export default function CreateCollectionPage() {
  
  const [showLoading, setShowLoading] = useState(false);

  return (
    <div className="mx-auto mt-4 w-full max-w-[900px] px-4">
      <CreateCollectionForm setShowLoading={setShowLoading}/>
      <LoadingModal showLoading={showLoading}/>
    </div>
  );
}
