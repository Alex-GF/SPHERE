import PropTypes from 'prop-types';

export default function Main({ children, className = '', ...other }: { children: React.ReactNode; className?: string }) {

  return (
    <main
      className={`flex min-h-0 ${className}`}
      {...other}
    >
      {children}
    </main>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};
