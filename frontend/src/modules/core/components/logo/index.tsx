import PropTypes, { InferProps } from "prop-types";
import { forwardRef } from "react";

import RouterLink from "../../components/router-link";
import { ReactSVG } from "react-svg";

type LogoProps = {
  disabledLink?: boolean;
  sx?: string;
};

const Logo = forwardRef(
  ({ disabledLink = false, sx }: InferProps<LogoProps>) => {
    const logo = (
      <ReactSVG
        src="../../../../assets/logo/SPHERE-logo.svg"
        useRequestCache={true}
        className={`m-0 h-[80%] w-[300px] cursor-pointer ${sx ?? ''}`}
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

Logo.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.string,
};

export default Logo;
