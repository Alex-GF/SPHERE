import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { HEADER } from './config-layout';
import { useResponsive } from '../../hooks/useResponsive';


const SPACING = 8;

export default function Main({ children, sx, ...other } : { children: React.ReactNode, sx?: object }) {
  const lgUp = useResponsive('up', 'lg');

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: 1,
        display: 'flex',
        flexDirection: 'column',
        pt: `${HEADER.H_MOBILE + SPACING}px`,
        ...(lgUp && {
          px: 0,
          pt: `${HEADER.H_DESKTOP + SPACING}px`,
          // width: `calc(100% - ${NAV.WIDTH}px)`, This width should be used if nav is finally configured
          width: `100%`,
        }),
        height: `calc(100vh - ${HEADER.H_MOBILE + SPACING}px)`,
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
