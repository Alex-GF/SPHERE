import { Link } from 'react-router-dom';
import Logo from '../../../../core/components/logo';
import { headerRoutes } from '../../router/header-routes';

export default function Footer() {
  return (
    <footer className="bg-[#033E8A] py-3 text-white">
      <div className="mx-auto w-full max-w-[1024px] px-4">
        <div className="flex flex-col gap-3">
          {/* Top row with logo and navigation */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-1">
              <Logo sx="fill-sphere-grey-100" />
            </div>

            {/* Navigation Links */}
            <nav className="flex gap-4">
              {headerRoutes.map(
                (link, index) =>
                  !link.children && (
                    <Link
                      key={index}
                      to={link.to ? link.to : '#'}
                      className="text-sm text-white no-underline"
                    >
                      {link.name}
                    </Link>
                  )
              )}
            </nav>
          </div>

          {/* Bottom row with copyright and social icons */}
          <div className="flex items-center justify-between border-t border-[rgba(255,255,255,0.1)] pt-3">
            <p className="text-[rgba(255,255,255,0.7)]">
              © {new Date().getFullYear()} SPHERE. All rights reserved.
            </p>

            {/* Social Media Icons */}
            {/* <Stack direction="row" spacing={2}>
              {[
                { icon: <FaFacebook />, label: 'Facebook', to: 'https://www.facebook.com' },
                { icon: <FaTwitter />, label: 'Twitter', to: 'https://www.facebook.com' },
                { icon: <FaInstagram />, label: 'Instagram', to: 'https://www.facebook.com' },
                { icon: <FaLinkedin />, label: 'LinkedIn', to: 'https://www.facebook.com' },
                { icon: <FaYoutube />, label: 'YouTube', to: 'https://www.youtube.com' },
              ].map(social => (
                <IconButton
                  key={social.label}
                  aria-label={social.label}
                  sx={{
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  href={social.to}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </IconButton>
              ))}
            </Stack> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
