import PropTypes from 'prop-types';

export default function Main({ children, sx, ...other } : { children: React.ReactNode, sx?: object }) {

  return (
    <main className="flex items-center justify-center" {...other}>
      {children}
    </main>
  );
}

Main.propTypes = {
  children: PropTypes.node,
  sx: PropTypes.object,
};
