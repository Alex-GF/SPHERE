import { Box, Typography, Card, CardContent, CardActionArea } from '@mui/material';
import { grey, primary } from '../../core/theme/palette';

import type { PromptPreset } from '../types/types';

interface Props {
  presets: PromptPreset[];
  onSelect: (preset: PromptPreset) => void;
  disabled?: boolean;
}

function PromptGallery({ presets, onSelect, disabled = false }: Props) {
  if (!presets || presets.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Prompt presets
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
        {presets.map((preset) => (
          <Card
            key={preset.id}
            sx={{
              '&:hover': {
                boxShadow: 3,
                borderColor: primary[500]
              }
            }}
          >
            <CardActionArea
              onClick={() => onSelect(preset)}
              disabled={disabled}
              title={preset.description}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: primary[500],
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 600,
                      flexShrink: 0
                    }}
                  >
                    {preset.label.charAt(0).toUpperCase()}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {preset.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: grey[600] }}>
                      {preset.description}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: grey[500], fontSize: '1.5rem' }}>
                    ↗
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}

export default PromptGallery;
