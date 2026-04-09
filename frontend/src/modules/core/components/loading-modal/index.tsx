import CollectionLoader from '../collection-loader';

export default function LoadingModal({
  loader,
  message,
  showLoading,
}: {
  loader?: JSX.Element;
  message?: string;
  showLoading: boolean;
}) {
  if (!showLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="mt-4 flex w-[90dvw] max-w-[600px] flex-col rounded-[20px] bg-white p-4 shadow-lg">
        <div className="flex h-full flex-col items-center justify-center">
          {loader ? loader : <CollectionLoader />}
        </div>
        <h3 className="z-[1] text-center">
          {message ?? 'Uploading pricings to collection. This may take a few minutes...'}
        </h3>
      </div>
    </div>
  );
}
