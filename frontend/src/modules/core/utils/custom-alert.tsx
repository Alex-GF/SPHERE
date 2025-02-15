import { useState } from 'react';
import { Modal, Paper } from '@mui/material';
import { createRoot } from 'react-dom/client';
import { flex } from '../theme/css';

function customAlert(string: string) {
  const Alert = (): JSX.Element => {
    const [show, setShow] = useState(true);

    const handleClose = () => {
      setShow(false);
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
          <h3 style={{ textAlign: 'center' }}>{string}</h3>
        </Paper>
      </Modal>
    );
  };

  const container = document.getElementById('alert');
  if (container) {
    const root = createRoot(container);
    root.render(<Alert />);
  }
}

export default customAlert;
