import { Box, Modal, Paper, Typography } from '@mui/material';
import Header from './header';
import Main from './main';
import { useState } from 'react';
import { parseStringYamlToEncodedYaml } from '../services/export.service';
import CopyToClipboardIcon from '../../core/components/copy-icon';
import { EditorValueContext } from '../contexts/editorValueContext';
import FileUpload from '../../core/components/file-upload-input';
import { flex } from '../../core/theme/css';
import ImportPricingModal from '../../core/components/import-pricing-modal';
import customAlert from '../../core/utils/custom-alert';

export default function EditorLayout({ children }: { children?: React.ReactNode }) {
  const [sharedLinkModalOpen, setSharedLinkModalOpen] = useState(false);
  const [importModalOpen, setImportLinkModalOpen] = useState(false);
  const [editorValue, setEditorValue] = useState<string>('');

  const renderSharedLink = () => {
    setSharedLinkModalOpen(true);
  };

  const handleSharedLinkClose = () => {
    setSharedLinkModalOpen(false);
  };

  const renderYamlImport = () => {
    setImportLinkModalOpen(true);
  };

  const handleYamlImportClose = () => {
    setImportLinkModalOpen(false);
  };

  const onSubmitImport = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditorValue(reader.result as string);
      };
      reader.readAsText(file);
    } else {
      customAlert('No file selected');
    }
  };

  return (
    <EditorValueContext.Provider value={{ editorValue, setEditorValue }}>
      <Box
        component="div"
        sx={{ display: 'grid', minHeight: '100dvh', gridTemplateRows: 'auto 1fr' }}
      >
        <Header renderSharedLink={renderSharedLink} renderYamlImport={renderYamlImport} />
        <Main>{children}</Main>
      </Box>
      <Modal
        open={sharedLinkModalOpen}
        onClose={handleSharedLinkClose}
        aria-labelledby="modal-shared-link-title"
        aria-describedby="modal-shared-link-description"
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
      <Modal
        open={importModalOpen}
        onClose={handleYamlImportClose}
        aria-labelledby="modal-import-title"
        aria-describedby="modal-import-description"
      >
        <Paper
          elevation={3}
          sx={{
            maxWidth: 500,
            width: '90dvw',
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
          <FileUpload onSubmit={onSubmitImport} />
        </Paper>
      </Modal>
    </EditorValueContext.Provider>
  );
}
