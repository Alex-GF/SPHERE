import PropTypes, { InferProps } from "prop-types";
import { forwardRef } from "react";

import Link from "@mui/material/Link";
import RouterLink from "../../components/router-link";
import { ReactSVG } from "react-svg";

type LogoProps = {
  disabledLink?: boolean;
  sx?: object;
};

const Logo = forwardRef(
  ({ disabledLink = false, sx }: InferProps<LogoProps>) => {
    const logo = (
      <ReactSVG
        src="./assets/logo/SPHERE-logo.svg"
        useRequestCache={true}
        style={{
          width: 300,
          height: "80%",
          cursor: "pointer",
          margin: "0 !important",
          ...sx,
        }}
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

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Logo;
