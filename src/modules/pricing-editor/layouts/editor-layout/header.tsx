import { Container, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { primary } from '../../../core/theme/palette';
import ShortLogo from '../../../core/components/short-logo';
import { StyledAppBar } from './components/styled-appbar';
import { useMode } from '../../../core/hooks/useTheme';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';
import { useEditorValue } from '../../hooks/useEditorValue';
import { downloadYaml } from '../../services/export.service';
import Alerts from '../../../core/components/alerts';
import { useEffect, useState } from 'react';
import { getClearEditorValue } from '../../services/clear.service';

export interface MenuItems {
  name: string;
  disabled: boolean;
  onClick?: () => void;
  children?: MenuItems[];
}

const Header = ({ renderSharedLink, renderYamlImport }: { renderSharedLink: () => void, renderYamlImport: () => void }) => {
  const [errors, setErrors] = useState<string[]>([]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { mode } = useMode();
  const { editorValue, setEditorValue } = useEditorValue();
  const [originalEditorValue, setOriginalEditorValue] = useState<string>("");

  const menuItems = [
    {
      name: 'File',
      disabled: false,
      children: [
        {
          name: 'New',
          disabled: false,
          onClick: () => {
            setEditorValue(originalEditorValue);
          },
        },
        { name: 'Import from YAML', disabled: false, onClick: renderYamlImport },
        { name: 'Clear Editor', disabled: false, onClick: () => {
          setEditorValue(getClearEditorValue());
        } },
      ],
    },
    {
      name: 'Export',
      disabled: false,
      children: [
        {
          name: 'Download YAML',
          disabled: false,
          onClick: () => {
            try {
              downloadYaml(editorValue);
            } catch (e) {
              setErrors([...errors, (e as Error).message]);
              setTimeout(() => {
                setErrors([]);
              }, 3000);
            }
          },
        },
        { name: 'Share Link', disabled: false, onClick: renderSharedLink },
      ],
    },
    {
      name: 'Documentation',
      disabled: false,
      onClick: () => window.open('https://pricing4saas-docs.vercel.app'),
    },
  ];

  useEffect(() => {
    if (originalEditorValue === ""){
      setOriginalEditorValue(editorValue);
    }
  }, [editorValue]);

  return (
    <>
      <StyledAppBar position="sticky" mode={mode}>
        <Container maxWidth={false} sx={{ marginLeft: 0 }}>
          <Toolbar disableGutters>
            <ShortLogo sx={{ fill: mode === 'light' ? primary[800] : primary[100] }} />

            {isMobile ? (
              <MobileHeaderItems menuItems={menuItems} />
            ) : (
              <DesktopHeaderItems menuItems={menuItems} />
            )}
          </Toolbar>
        </Container>
      </StyledAppBar>
      <Alerts messages={errors} />
    </>
  );
};

export default Header;
