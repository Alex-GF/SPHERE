import PropTypes from 'prop-types';

import Box from '@mui/material/Box';

import { flex } from '../../theme/css';

export default function Main({ children, sx, ...other } : { children: React.ReactNode, sx?: object }) {

  return (
    <Box
      component="main"
      sx={{
        ...flex({}),
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
