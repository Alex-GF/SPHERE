import { useState } from 'react';
import { Modal, Paper } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { flex } from '../theme/css';

const Alert = ({ message, onClose }: { message: string, onClose: () => void }): JSX.Element => {
  const [show, setShow] = useState(true);

  const handleClose = () => {
    setShow(false);
    onClose();
  };

  return (
    <Modal open={show} onClose={handleClose}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '90dvw',
          maxHeight: 400,
          mx: 'auto',
          mt: 4,
          p: 4,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%) translateY(-50%)',
          borderRadius: '20px',
          ...flex({ direction: 'column' }),
        }}
      >
        <h3 style={{ textAlign: 'center' }}>{message}</h3>
      </Paper>
    </Modal>
  );
};

function customAlert(message: string): Promise<void> {
  return new Promise((resolve, _) => {
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
