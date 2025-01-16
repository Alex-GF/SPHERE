import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';


interface RouterLinkProps {
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
