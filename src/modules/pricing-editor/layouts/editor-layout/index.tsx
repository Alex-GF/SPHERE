import { Box, IconButton, Modal, Paper, TextField, Typography } from '@mui/material';
import Header from './header';
import Main from './main';
import { useState } from 'react';
import { parseStringYamlToEncodedYaml } from '../../services/export.service';
import CopyToClipboardIcon from '../../../core/components/copy-icon';
import { EditorValueContext } from '../../contexts/editorValueContext';

export default function EditorLayout({ children }: { children?: React.ReactNode }) {
  const [sharedLinkModalOpen, setSharedLinkModalOpen] = useState(false);
  const [editorValue, setEditorValue] = useState<string>('');

  const renderSharedLink = () => {
    setSharedLinkModalOpen(true);
  };

  const handleClose = () => {
    setSharedLinkModalOpen(false);
  };

  return (
    <>
      <Box
        component="div"
        sx={{ display: 'grid', minHeight: '100dvh', gridTemplateRows: 'auto 1fr' }}
      >
        <EditorValueContext.Provider value={{ editorValue, setEditorValue }}>
          <Header renderSharedLink={renderSharedLink} />
          <Main>{children}</Main>
        </EditorValueContext.Provider>
      </Box>
      <Modal
        open={sharedLinkModalOpen}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 400,
            width: '90vw',
            mx: 'auto',
            mt: 4,
            p: 4,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            borderRadius: '20px',
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Your pricing is a step away from the world
          </Typography>
          <Typography sx={{ mt: 2, mb: 3, textAlign: 'center' }}>
            Share this link to allow other users to see and edit their own version of your pricing
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CopyToClipboardIcon value={parseStringYamlToEncodedYaml(editorValue)} />
          </Box>
        </Paper>
      </Modal>
    </>
  );
}
