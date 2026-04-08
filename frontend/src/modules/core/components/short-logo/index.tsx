import PropTypes, { InferProps } from "prop-types";
import { forwardRef } from "react";

import RouterLink from "../../components/router-link";
import { ReactSVG } from "react-svg";

type LogoProps = {
  disabledLink?: boolean;
  sx?: string;
  fill?: string;
};

const ShortLogo = forwardRef(
  ({ disabledLink = false, sx, fill, ...other }: InferProps<LogoProps>) => {
    const logo = (
      <ReactSVG
        src="../../../../assets/logo/SPHERE-logo-short.svg"
        useRequestCache={true}
        className={`m-0 h-[80%] w-[75px] cursor-pointer ${sx ?? ''}`}
        beforeInjection={(svg) => {
          if (!fill) return;

          svg.setAttribute('fill', fill);
          svg.style.fill = fill;

          const withFill = svg.querySelectorAll<SVGElement>('[fill]');
          withFill.forEach((el) => {
            if (el.getAttribute('fill') !== 'none') {
              el.setAttribute('fill', fill);
            }
          });

          const shapes = svg.querySelectorAll<SVGElement>('path, circle, rect, polygon, ellipse, line, polyline, g');
          shapes.forEach((el) => {
            const currentFill = el.getAttribute('fill');
            if (currentFill !== 'none' && (!currentFill || currentFill === 'currentColor')) {
              el.setAttribute('fill', fill);
            }
          });
        }}
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
  fill: PropTypes.string,
};

export default ShortLogo;
