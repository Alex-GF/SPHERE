import Header from './header';
import Main from './main';
import { useState } from 'react';
import { createUrlWithEncodedYaml, parseStringYamlToEncodedYaml } from '../services/export.service';
import CopyToClipboardIcon from '../../core/components/copy-icon';
import { EditorValueContext } from '../contexts/editorValueContext';
import FileUpload from '../../core/components/file-upload-input';
import customAlert from '../../core/utils/custom-alert';
import { useCacheApi } from '../components/pricing-renderer/api/cacheApi';
import { v4 as uuidv4 } from 'uuid';

export default function EditorLayout({ children }: { children?: React.ReactNode }) {
  const [sharedLinkModalOpen, setSharedLinkModalOpen] = useState(false);
  const [importModalOpen, setImportLinkModalOpen] = useState(false);
  const [editorValue, setEditorValue] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);

  const { setInCache } = useCacheApi();

  const renderSharedLink = () => {
    setSharedLinkModalOpen(true);
  };

  const handleSharedLinkClose = () => {
    setSharedLinkModalOpen(false);
  };

  const renderYamlImport = () => {
    setImportLinkModalOpen(true);
  };

  const handleYamlImportClose = () => {
    setImportLinkModalOpen(false);
  };

  const handleCopyToClipboard = () => {
    if (sharedLinkModalOpen) {
      if (tabValue === 1) { // Full export
        const encodedPricing = parseStringYamlToEncodedYaml(editorValue);

        return createUrlWithEncodedYaml(encodedPricing);
      } else {
        const urlParams = new URLSearchParams(window.location.search);
        const assignedId = urlParams.get('pricing') ?? uuidv4();

        const encodedPricing = parseStringYamlToEncodedYaml(editorValue);

        setInCache(assignedId, encodedPricing, 24 * 60 * 60) // 24h
          .catch(error => {
            customAlert(`Error saving link in cache: ${error}`);
          });

        return createUrlWithEncodedYaml(assignedId);
      }
    } else {
      return '';
    }
  };

  const onSubmitImport = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditorValue(reader.result as string);
      };
      reader.readAsText(file);
    } else {
      customAlert('No file selected');
    }
  };

  return (
    <EditorValueContext.Provider value={{ editorValue, setEditorValue }}>
      <div className="grid min-h-dvh grid-rows-[auto_1fr]">
        <Header renderSharedLink={renderSharedLink} renderYamlImport={renderYamlImport} />
        <Main>{children}</Main>
      </div>
      {sharedLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
          <h2 className="text-center text-lg font-bold">
            Your pricing is a step away from the world
          </h2>
          <p className="mt-2 mb-4 text-center text-sm text-slate-600">
            Share this link to allow other users to see and edit their own version of your pricing
          </p>

          <div className="mb-4 flex justify-center gap-2">
            <button type="button" onClick={() => setTabValue(0)} className={`rounded-full px-4 py-2 text-sm font-medium ${tabValue === 0 ? 'bg-sky-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              Short encoding
            </button>
            <button type="button" onClick={() => setTabValue(1)} className={`rounded-full px-4 py-2 text-sm font-medium ${tabValue === 1 ? 'bg-sky-600 text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
              Full encoding
            </button>
          </div>

          {tabValue === 1 ? (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-900">
              <strong>WARNING:</strong> If the YAML is too large, the URL might not be processed correctly.
            </p>
          ) : (
            <p className="mb-4 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-center text-sm text-sky-900">
              <strong>INFO:</strong> The generated URL will only be available for 24h.
            </p>
          )}

          <div className="flex items-center">
            <CopyToClipboardIcon value={handleCopyToClipboard()} />
          </div>
          <div className="mt-4 flex justify-end">
            <button type="button" onClick={handleSharedLinkClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
              Close
            </button>
          </div>
        </div>
        </div>
      )}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <FileUpload onSubmit={onSubmitImport} />
            <div className="mt-4 flex justify-end">
              <button type="button" onClick={handleYamlImportClose} className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </EditorValueContext.Provider>
  );
}
