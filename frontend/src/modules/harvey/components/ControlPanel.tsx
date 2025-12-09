import { ChangeEvent, FormEvent } from 'react';
import { Box, TextField, Button } from '@mui/material';

import ContextManager from './ContextManager';
import type { ContextItemInput, PricingContextItem } from '../types/types';

interface Props {
  question: string;
  detectedPricingUrls: string[];
  contextItems: PricingContextItem[];
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onQuestionChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  onFileSelect: (files: FileList | null) => void;
  onContextAdd: (input: ContextItemInput) => void;
  onContextRemove: (id: string) => void;
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
  onContextClear
}: Props) {
  const handleQuestionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange(event.target.value);
  };

  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 2 }}>
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

      <ContextManager
        items={contextItems}
        detectedUrls={detectedPricingUrls}
        onAdd={onContextAdd}
        onRemove={onContextRemove}
        onClear={onContextClear}
      />

      <Box>
        <Button
          variant="outlined"
          component="label"
          fullWidth
        >
          Upload pricing YAML (optional)
          <input
            type="file"
            accept=".yaml,.yml"
            multiple
            hidden
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              const files = event.target.files ?? null;
              onFileSelect(files);
              event.target.value = '';
            }}
          />
        </Button>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitDisabled}
          size="large"
        >
          {isSubmitting ? 'Processing...' : 'Ask'}
        </Button>
      </Box>
    </Box>
  );
}

export default ControlPanel;
