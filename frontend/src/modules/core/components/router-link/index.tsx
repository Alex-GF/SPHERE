import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link, LinkProps } from 'react-router-dom';


interface RouterLinkProps extends Omit<LinkProps, 'to'> {
  href: string;
}

const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => {
  const { href, ...other } = props;
  return <Link ref={ref} to={href} {...other} />;
});

RouterLink.propTypes = {
  href: PropTypes.string.isRequired,
};

export default RouterLink;
