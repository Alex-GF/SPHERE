import ShortLogo from '../../core/components/short-logo';
import { useMode } from '../../core/hooks/useTheme';
import MobileHeaderItems from './components/mobile-header-items';
import DesktopHeaderItems from './components/desktop-header-items';
import { useEditorValue } from '../hooks/useEditorValue';
import { downloadYaml } from '../services/export.service';
import Alerts from '../../core/components/alerts';
import { useEffect, useState } from 'react';
import { getClearEditorValue } from '../services/clear.service';

export interface MenuItems {
  name: string;
  disabled: boolean;
  onClick?: () => void;
  children?: MenuItems[];
}

const Header = ({ renderSharedLink, renderYamlImport }: { renderSharedLink: () => void, renderYamlImport: () => void }) => {
  const [errors, setErrors] = useState<string[]>([]);
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
      onClick: () => window.open('https://sphere-docs.vercel.app/docs/2.0.1/api/pricing-description-languages/Pricing2Yaml/the-pricing2yaml-syntax'),
    },
  ];

  useEffect(() => {
    if (originalEditorValue === ""){
      setOriginalEditorValue(editorValue);
    }
  }, [editorValue, originalEditorValue]);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur ${
          mode === 'light'
            ? 'border-slate-200 bg-[#f3f4f6]/95'
            : 'border-[#1f2d3d] bg-[#0b1119]/95'
        }`}
      >
        <div className="flex items-center gap-4 px-4 py-3 lg:px-6">
          <ShortLogo fill={mode === 'light' ? '#0077b6' : '#d7f7ff'} />

          <div className="hidden flex-1 md:flex">
            <DesktopHeaderItems menuItems={menuItems} />
          </div>

          <div className="ml-auto md:hidden">
            <MobileHeaderItems menuItems={menuItems} />
          </div>
        </div>
      </header>
      <Alerts messages={errors} />
    </>
  );
};

export default Header;
