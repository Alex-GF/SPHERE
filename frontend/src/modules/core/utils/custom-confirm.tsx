import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';

interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ message, onConfirm, onCancel }) => {
  const [open, setOpen] = useState(true);

  const handleClose = () => setOpen(false);

  const handleConfirm = () => {
    handleClose();
    onConfirm();
  };

  const handleCancel = () => {
    handleClose();
    onCancel();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/35 px-4"
      onClick={handleCancel}
      role="presentation"
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white p-6 text-center shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="custom-confirm-dialog"
      >
        <h2 id="custom-confirm-dialog" className="text-2xl font-semibold">
          {message}
        </h2>
        <div className="mt-8 flex items-center justify-between gap-4 px-4">
          <button
            type="button"
            onClick={handleConfirm}
            className="rounded-xl border-2 border-black px-4 py-2 text-xl transition hover:bg-slate-100"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl border-2 border-black px-4 py-2 text-xl transition hover:bg-slate-100"
          >
            Deny
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Displays a confirmation dialog and returns a promise that resolves if confirmed
 * or rejects if canceled.
 *
 * @param message The message to display in the dialog.
 */
function customConfirm(message: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const containerId = 'alert';
    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      document.body.appendChild(container);
    }
    const root = createRoot(container);

    const cleanup = () => {
      root.unmount();
    };

    const handleConfirm = () => {
      cleanup();
      resolve();
    };

    const handleCancel = () => {
      cleanup();
      reject();
    };

    root.render(
      <ConfirmDialog message={message} onConfirm={handleConfirm} onCancel={handleCancel} />
    );
  });
}

export default customConfirm;
