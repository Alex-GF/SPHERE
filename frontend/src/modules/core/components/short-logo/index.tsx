import PropTypes, { InferProps } from "prop-types";
import { forwardRef } from "react";

import Link from "@mui/material/Link";
import RouterLink from "../../components/router-link";
import { ReactSVG } from "react-svg";

type LogoProps = {
  disabledLink?: boolean;
  sx?: object;
};

const ShortLogo = forwardRef(
  ({ disabledLink = false, sx, ...other }: InferProps<LogoProps>) => {
    const logo = (
      <ReactSVG
        src="../../../../assets/logo/SPHERE-logo-short.svg"
        useRequestCache={true}
        style={{
          width: 75,
          height: "80%",
          cursor: "pointer",
          margin: "0 !important",
          ...sx,
        }}
        {...other}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/" sx={{ display: "contents" }}>
        {logo}
      </Link>
    );
  }
);

ShortLogo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default ShortLogo;
