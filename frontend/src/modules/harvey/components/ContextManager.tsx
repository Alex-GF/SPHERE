import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  Chip,
  Button,
  TextField,
  IconButton,
  Paper,
  Alert
} from '@mui/material';
import { grey, primary } from '../../core/theme/palette';

import type { ContextItemInput, PricingContextItem } from '../types/types';

interface Props {
  items: PricingContextItem[];
  detectedUrls: string[];
  onAdd: (input: ContextItemInput) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ORIGIN_LABEL: Record<PricingContextItem['origin'], string> = {
  user: 'Manual',
  detected: 'Detected',
  preset: 'Preset',
  agent: 'Agent'
};

function ContextManager({ items, detectedUrls, onAdd, onRemove, onClear }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const availableDetected = useMemo(
    () => detectedUrls.filter((url) => !items.some((item) => item.kind === 'url' && item.value === url)),
    [detectedUrls, items]
  );

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('Enter a URL to add it to the context.');
      return;
    }

    try {
      const normalized = new URL(trimmed).href;
      onAdd({ kind: 'url', label: normalized, value: normalized, origin: 'user' });
      setUrlInput('');
      setError(null);
    } catch {
      setError('Enter a valid http(s) URL.');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pricing Context
          </Typography>
          <Typography variant="body2" sx={{ color: grey[600] }}>
            Add URLs or YAML exports to ground H.A.R.V.E.Y.'s answers.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: grey[600] }}>
            {items.length} selected
          </Typography>
          {items.length > 0 ? (
            <Button size="small" onClick={onClear} color="error">
              Clear all
            </Button>
          ) : null}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {items.length === 0 ? (
          <Typography variant="body2" sx={{ color: grey[600], py: 2, textAlign: 'center' }}>
            No pricings selected. Add one to keep the conversation grounded.
          </Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {items.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1,
                  px: 0,
                  borderBottom: `1px solid ${grey[200]}`
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: grey[600] }}>
                    {item.kind === 'url' ? 'URL' : 'YAML'} · {ORIGIN_LABEL[item.origin]}
                  </Typography>
                </Box>
                <Button size="small" onClick={() => onRemove(item.id)} color="error">
                  Remove
                </Button>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {availableDetected.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Detected in question
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {availableDetected.map((url) => (
              <Chip
                key={url}
                label={`Add ${url}`}
                onClick={() => onAdd({ kind: 'url', label: url, value: url, origin: 'detected' })}
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          type="url"
          name="context-url"
          value={urlInput}
          placeholder="https://example.com/pricing"
          onChange={(event) => {
            setUrlInput(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={handleAddUrl}>
          Add URL
        </Button>
      </Box>
      {error ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      ) : null}
    </Paper>
  );
}

export default ContextManager;
