import { useMemo, useState } from 'react';
import { Box, Typography, List, Chip, Button, TextField, Paper, Alert } from '@mui/material';
import { grey } from '../../core/theme/palette';

import type { ContextInputType, PricingContextItem, UrlContextItemInput } from '../types/types';
import ContextManagerItem from './ContextManagerItem';
import usePlayground from '../hooks/usePlayground';

interface Props {
  items: PricingContextItem[];
  detectedUrls: string[];
  onAdd: (input: ContextInputType) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function ContextManager({ items, detectedUrls, onAdd, onRemove, onClear }: Props) {
  const [urlInput, setUrlInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const isPlaygroundEnabled = usePlayground()

  const availableDetected = useMemo(
    () =>
      detectedUrls.filter(url => !items.some(item => item.kind === 'url' && item.value === url)),
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
      const urlItem: UrlContextItemInput = {
        kind: 'url',
        url: normalized,
        label: normalized,
        value: normalized,
        origin: 'user',
        transform: 'not-started',
      };
      onAdd(urlItem);
      setUrlInput('');
      setError(null);
    } catch {
      setError('Enter a valid http(s) URL.');
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}
      >
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
            Pricing Context
          </Typography>
          <Typography variant="body2" sx={{ color: grey[600] }}>
            Add URLs or YAML exports to ground H.A.R.V.E.Y.'s answers.
          </Typography>
          {!isPlaygroundEnabled && <Alert severity="info" sx={{ mt: 1 }}>
            All pricings detected or added via URL will be modeled automatically; this process can
            take up to 30-60 minutes.
          </Alert>}
          {!isPlaygroundEnabled && <Alert severity="warning" sx={{ mt: 1 }}>
            Due to temporary production limits, URL extraction might trigger a "LoadError". Please wait for the loading icon in the pricing context box to disappear; once complete, you can proceed to ask questions normally.
          </Alert>}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" sx={{ color: grey[600] }}>
            {items.length} selected
          </Typography>
          {items.length > 0 && (
            <Button size="small" onClick={onClear} color="error">
              Clear all
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 2 }}>
        {items.length === 0 ? (
          <Typography variant="body2" sx={{ color: grey[600], py: 2, textAlign: 'center' }}>
            No pricings selected. Add one to keep the conversation grounded.
          </Typography>
        ) : (
          <List sx={{ py: 0 }}>
            {items.map(item => (
              <ContextManagerItem key={item.id} item={item} onRemove={onRemove} />
            ))}
          </List>
        )}
      </Box>

      {availableDetected.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Detected in question
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {availableDetected.map(url => (
              <Chip
                key={url}
                label={`Add ${url}`}
                onClick={() =>
                  onAdd({
                    kind: 'url',
                    url: url,
                    label: url,
                    value: url,
                    transform: 'not-started',
                    origin: 'detected',
                  })
                }
                color="primary"
                variant="outlined"
                size="small"
              />
            ))}
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          type="url"
          name="context-url"
          value={urlInput}
          disabled={isPlaygroundEnabled}
          placeholder="https://example.com/pricing"
          onChange={event => {
            setUrlInput(event.target.value);
            setError(null);
          }}
          onKeyDown={event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          size="small"
          fullWidth
        />
        <Button disabled={isPlaygroundEnabled} variant="contained" onClick={handleAddUrl}>
          Add URL
        </Button>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mt: 1 }}>
          {error}
        </Alert>
      )}
    </Paper>
  );
}

export default ContextManager;
