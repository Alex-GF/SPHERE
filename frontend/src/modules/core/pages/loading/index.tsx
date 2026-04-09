export default function LoadingView() {
  return (
    <div className="mx-auto max-w-screen-xl px-4">
      <div className="mx-auto flex min-h-[80vh] max-w-[480px] flex-col items-center justify-center py-12 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sphere-grey-300 border-t-sphere-primary-700" />
      </div>
    </div>
  );
}
