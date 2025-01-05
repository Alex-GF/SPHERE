import { styled, AppBar } from '@mui/material';
import { grey } from '../../../../core/theme/palette';

export const StyledAppBar = styled(AppBar)(({ mode }: { mode: 'light' | 'dark' }) => ({
  backgroundColor: mode === 'light' ? grey[100] : 'black',
  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
}));
