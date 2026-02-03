import { ChangeEvent, FormEvent, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  Typography,
  DialogTitle,
  DialogActions,
  DialogContent,
  Stack,
  Divider,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import ContextManager from './ContextManager';
import type { ContextInputType, PricingContextItem } from '../types/types';
import SearchPricings from './SearchPricings';
import { grey } from '@mui/material/colors';
import usePlayground from '../hooks/usePlayground';

interface Props {
  question: string;
  detectedPricingUrls: string[];
  contextItems: PricingContextItem[];
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onFileSelect: (files: FileList | null) => void;
  onContextAdd: (input: ContextInputType) => void;
  onContextRemove: (id: string) => void;
  onSphereContextRemove: (sphereId: string) => void;
  onContextClear: () => void;
}

function ControlPanel({
  question,
  detectedPricingUrls,
  contextItems,
  isSubmitting,
  isSubmitDisabled,
  onQuestionChange,
  onSubmit,
  onFileSelect,
  onContextAdd,
  onContextRemove,
  onSphereContextRemove,
  onContextClear,
}: Props) {
  const [showPricingModal, setPricingModal] = useState<boolean>(false);
  const isPlaygroundEnabled = usePlayground();

  const handleQuestionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange(event.target.value);
  };

  const handleOpenModal = () => setPricingModal(true);
  const handleCloseModal = () => setPricingModal(false);

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}
    >
      <TextField
        label="Question"
        name="question"
        required
        multiline
        rows={4}
        value={question}
        onChange={handleQuestionChange}
        placeholder="Which is the best available subscription for a team of five users?"
        fullWidth
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="contained" disabled={isSubmitDisabled} size="large">
          {isSubmitting ? 'Processing...' : 'Ask'}
        </Button>
      </Box>
      <ContextManager
        items={contextItems}
        detectedUrls={detectedPricingUrls}
        onAdd={onContextAdd}
        onRemove={onContextRemove}
        onClear={onContextClear}
      />

      {!isPlaygroundEnabled && (
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2, color: grey[800] }}>
          Add Pricing Context
        </Typography>
      )}

      {!isPlaygroundEnabled && (
        <Stack direction="row" spacing={2} divider={<Divider orientation="vertical" flexItem />}>
          <Box component="section">
            <Button variant="outlined" component="label" fullWidth>
              Select archives
              <input
                type="file"
                accept=".yaml,.yml"
                multiple
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const files = event.target.files ?? null;
                  onFileSelect(files);
                }}
              />
            </Button>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, mb: 2, color: grey[800] }}
            >
              Upload pricing YAML (optional)
            </Typography>
            <Typography variant="body1">
              Uploaded YAMLs appear in the pricing context above so you can remove them at any time.
            </Typography>
          </Box>

          <Box component="section">
            <Button variant="outlined" onClick={handleOpenModal} fullWidth>
              Search pricings
            </Button>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, mb: 2, color: grey[800] }}
            >
              Add SPHERE iPricing (optional)
            </Typography>
            <Typography variant="body1">
              Add iPricings with our SPHERE integration (our iPricing repository).
            </Typography>
            <Typography variant="body1">
              You can further customize the search if you type a pricing name in the search bar.
            </Typography>

            <Dialog maxWidth="lg" fullWidth open={showPricingModal} onClose={handleCloseModal}>
              <DialogActions>
                <IconButton aria-label="close" onClick={handleCloseModal}>
                  <CloseIcon />
                </IconButton>
              </DialogActions>
              <DialogTitle>Search Pricings</DialogTitle>
              <DialogContent>
                <SearchPricings
                  onContextAdd={onContextAdd}
                  onContextRemove={onSphereContextRemove}
                />
              </DialogContent>
            </Dialog>
          </Box>
        </Stack>
      )}
    </Box>
  );
}

export default ControlPanel;
