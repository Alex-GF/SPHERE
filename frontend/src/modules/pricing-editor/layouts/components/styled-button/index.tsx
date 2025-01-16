import { styled, Button } from '@mui/material';
import { alpha } from '@mui/material';
import { primary } from '../../../../core/theme/palette';

export const StyledButton = styled(Button)(
  ({ mode }: { mode: 'light' | 'dark'}) => ({
    textTransform: 'none',
    color: mode === 'light' ? primary[700] : primary[100],
    fontWeight: 900,
    '&:hover': {
      backgroundColor: alpha(primary[100], 0.4),
      color: mode === 'light' ? primary[800] : primary[500],
    },
    transition: 'all 0.3s ease',
    position: 'relative',
  })
);
