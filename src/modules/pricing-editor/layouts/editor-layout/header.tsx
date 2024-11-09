import {
  Container,
  Toolbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { primary } from '../../../core/theme/palette';
import ShortLogo from '../../../core/components/short-logo';
import { StyledAppBar } from './components/styled-appbar';
import { useMode } from '../../../core/hooks/useTheme';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';

export interface MenuItems{
  name: string;
  disabled: boolean;
  onClick?: () => void;
  children?: MenuItems[];
}

const Header = ({renderSharedLink}: {renderSharedLink: () => void}) => {

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode } = useMode();

  const menuItems = [
    // {
    //   name: "File",
    //   disabled: false,
    //   children: [
    //     { name: "New", disabled: false, onClick: () => console.log("New") },
    //   ],
    // },
    {
      name: "Export",
      disabled: false,
      children: [
        { name: "Share Link", disabled: false, onClick: renderSharedLink },
      ],
    },
    {
      name: 'Documentation',
      disabled: false,
      onClick: () => window.open('https://pricing4saas-docs.vercel.app'),
    },
  ];

  return (
    <StyledAppBar position="sticky" mode={mode}>
      <Container maxWidth={false} sx={{ marginLeft: 0 }}>
        <Toolbar disableGutters>
          <ShortLogo sx={{ fill: mode === 'light' ? primary[800] : primary[100] }} />

          {isMobile ? (
            <MobileHeaderItems menuItems={menuItems}/>
          ) : (
            <DesktopHeaderItems menuItems={menuItems}/>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Header;
