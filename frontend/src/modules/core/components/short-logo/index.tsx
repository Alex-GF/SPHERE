import PropTypes, { InferProps } from "prop-types";
import { forwardRef } from "react";

import RouterLink from "../../components/router-link";
import { ReactSVG } from "react-svg";

type LogoProps = {
  disabledLink?: boolean;
  sx?: string;
};

const ShortLogo = forwardRef(
  ({ disabledLink = false, sx, ...other }: InferProps<LogoProps>) => {
    const logo = (
      <ReactSVG
        src="../../../../assets/logo/SPHERE-logo-short.svg"
        useRequestCache={true}
        className={`m-0 h-[80%] w-[75px] cursor-pointer ${sx ?? ''}`}
        {...other}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <RouterLink href="/" className="contents">
        {logo}
      </RouterLink>
    );
  }
);

ShortLogo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.string,
};

export default ShortLogo;
