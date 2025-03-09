import { Box, Modal, Paper } from '@mui/material';
import CollectionLoader from '../collection-loader';
import { flex } from '../../theme/css';

export default function LoadingModal({
  loader,
  message,
  showLoading,
}: {
  loader?: JSX.Element;
  message?: string;
  showLoading: boolean;
}) {
  return (
    <Modal open={showLoading}>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 600,
          width: '90dvw',
          maxHeight: 'auto',
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
        <Box sx={{ ...flex({ direction: 'column' }), height: '100%' }}>
          {loader ? loader : <CollectionLoader />}
        </Box>
        <h3 style={{ textAlign: 'center', zIndex: 1 }}>
          {message ?? 'Uploading pricings to collection. This may take a few minutes...'}
        </h3>
      </Paper>
    </Modal>
  );
}
