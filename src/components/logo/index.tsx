import PropTypes, { InferProps } from 'prop-types';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import RouterLink from '../../routes/components/router-link';


type LogoProps = {
  disabledLink?: boolean;
  sx?: object;
};

const Logo = forwardRef(({ disabledLink = false, sx, ...other }: InferProps<LogoProps>, ref) => {
  const logo = (
    <Box
      component="img"
      src="./assets/logo/logo.png"
      ref={ref}
      sx={{ width: 150, height: 150, cursor: 'pointer', alignSelf: 'center', margin: '0 !important', ...sx }}
      {...other}
    />
  );

  if (disabledLink) {
    return logo;
  }

  return (
    <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
      {logo}
    </Link>
  );
});

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;
