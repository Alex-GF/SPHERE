import { styled, Button } from '@mui/material';
import { primary } from '../../../core/theme/palette';

export const StyledButtonLanding = styled(Button)({
  textAlign: 'center',
  backgroundColor: primary[300],
  transition: 'background-color color .5s',
  '&:hover': { backgroundColor: primary[500], color: 'white' },
});
