/* eslint-disable react-refresh/only-export-components */
import { createRoot } from 'react-dom/client';

const Alert = ({ message, onClose }: { message: string, onClose: () => void }): JSX.Element => {

  const handleClose = () => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black/35 px-4"
      onClick={handleClose}
      role="presentation"
    >
      <div
        className="mt-4 flex w-[90dvw] max-w-150 flex-col rounded-[20px] bg-white p-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h3 className="text-center">{message}</h3>
      </div>
    </div>
  );
};

function customAlert(message: string): Promise<void> {
  return new Promise((resolve) => {
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

    const handleClose = () => {
      cleanup();
      resolve();
    };

    root.render(<Alert message={message} onClose={handleClose} />);
  });
}

export default customAlert;
