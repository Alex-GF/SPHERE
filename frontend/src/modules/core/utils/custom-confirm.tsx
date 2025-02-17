import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';

const ConfirmButton = styled(Button)(() => ({
  position: 'relative',
  padding: '10px',
  border: 'none',
  borderRadius: '15px',
  color: 'black',
  fontFamily: 'Login',
  fontSize: '20px',
  overflow: 'hidden',

  '&::before, &::after': {
    content: "''",
    position: 'absolute',
    width: '20%',
    height: '20%',
    border: '2px solid',
    borderRadius: '2px',
    transition: 'all 0.6s ease',
  },
  '&::before': {
    top: 0,
    left: 0,
    borderBottomColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'black',
    borderLeftColor: 'black',
  },
  '&::after': {
    bottom: 0,
    right: 0,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'black',
    borderRightColor: 'black',
  },
  '&:hover::before, &:hover::after': {
    width: '100%',
    height: '100%',
  },
  '&:hover': {
    cursor: 'pointer',
  },
}));

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
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="custom-confirm-dialog"
      PaperProps={{ style: { textAlign: 'center' } }}
    >
      <DialogContent>
        <Typography variant="h5" sx={{ fontFamily: 'Login', textAlign: 'center' }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', padding: '5% 10%' }}>
        <ConfirmButton onClick={handleConfirm}>Confirm</ConfirmButton>
        <ConfirmButton onClick={handleCancel}>Deny</ConfirmButton>
      </DialogActions>
    </Dialog>
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
