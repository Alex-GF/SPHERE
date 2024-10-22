import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { HEADER } from './config-layout';
import { useResponsive } from '../../hooks/useResponsive';
import { flex } from '../../theme/css';

export default function Main({ children, sx, ...other } : { children: React.ReactNode, sx?: object }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        ...flex({}),
        height: `calc(100vh - ${lgUp ? HEADER.H_DESKTOP : HEADER.H_MOBILE}px)`,
        ...sx,
      }}
      {...other}
    >
      {children}
    </Box>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
