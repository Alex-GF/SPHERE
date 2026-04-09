import FileUpload from "../file-upload-input";

export default function ImportPricingModal({modalState, handleClose, onSubmit}: {modalState: boolean, handleClose: () => void, onSubmit: (file: File) => void}) {
    if (!modalState) {
      return null;
    }

    return(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          onClick={handleClose}
          role="presentation"
          aria-labelledby="modal-import-title"
          aria-describedby="modal-import-description"
        >
        <div
          className="mt-4 flex w-[90dvw] max-w-[500px] flex-col rounded-[20px] bg-white p-4 shadow-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <FileUpload onSubmit={onSubmit}/>
        </div>
      </div>
    );
}