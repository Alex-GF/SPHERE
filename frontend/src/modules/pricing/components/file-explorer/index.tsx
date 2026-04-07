import { useMemo, useState } from 'react';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { parseStringYamlToEncodedYaml } from '../../../pricing-editor/services/export.service';
import customAlert from '../../../core/utils/custom-alert';
import { MdDeleteForever } from 'react-icons/md';
import customConfirm from '../../../core/utils/custom-confirm';
import { usePricingsApi } from '../../api/pricingsApi';
import { IoIosLink } from 'react-icons/io';
import CopyToClipboardIcon from '../../../core/components/copy-icon';
import { FileExplorerContext } from '../../contexts/fileExplorerContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';
import { useCacheApi } from '../../../pricing-editor/components/pricing-renderer/api/cacheApi';
import { FaDownload, FaExternalLinkAlt } from 'react-icons/fa';

type ExplorerItem = {
  id: string;
  label: string;
  yaml: string;
  fileType: 'doc';
};

function ExplorerRow({
  item,
  onDownload,
  onOpen,
  onCopyLink,
  onDelete,
  canDelete,
}: {
  item: ExplorerItem;
  onDownload: (yaml: string) => void;
  onOpen: (yaml: string) => void;
  onCopyLink: (yaml: string) => void;
  onDelete: (yaml: string) => void;
  canDelete: boolean;
}) {
  const fileName = item.yaml.split('/')[item.yaml.split('/').length - 1].replace('.yaml', '').replace('.yml', '');

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3 hover:bg-slate-50">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{fileName}</p>
        <p className="truncate text-sm text-slate-500">{item.yaml}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={() => onDownload(item.yaml)} title="Download">
          <FaDownload />
        </button>
        <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={() => onOpen(item.yaml)} title="Open">
          <FaExternalLinkAlt />
        </button>
        <button type="button" className="rounded-full p-2 hover:bg-slate-100" onClick={() => onCopyLink(item.yaml)} title="Copy link">
          <IoIosLink fontSize={24} />
        </button>
        {canDelete && (
          <button type="button" className="rounded-full p-2 text-red-600 hover:bg-slate-100" onClick={() => onDelete(item.yaml)} title="Delete version">
            <MdDeleteForever fontSize={24} />
          </button>
        )}
      </div>
    </div>
  );
}

function YamlLinkModal({
  open,
  link,
  onClose,
}: {
  open: boolean;
  link: string;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={onClose}>
      <div
        className="absolute left-1/2 top-1/2 w-[90vw] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-[20px] bg-white p-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-center text-xl font-bold">Your link is ready!</h2>
        <p className="mt-2 mb-3 text-center text-sm text-slate-600">
          This link points directly to the YAML file of the selected pricing version. It can be used to leverage some functionalities within the{' '}
          <a href="https://pricing4saas-docs.vercel.app" target="_blank" rel="noreferrer" className="underline">
            Pricing4SaaS suite
          </a>
          .
        </p>
        <div className="flex items-center">
          <CopyToClipboardIcon value={link} />
        </div>
      </div>
    </div>
  );
}

export default function FileExplorer({ pricingData }: { pricingData: AnalyticsDataEntry[] }) {
  const [selectedYamlLink, setSelectedYamlLink] = useState<string>('');
  const [yamlLinkModalOpen, setYamlLinkModalOpen] = useState<boolean>(false);

  const { removePricingVersion } = usePricingsApi();
  const { authUser } = useAuth();
  const { setInCache } = useCacheApi();

  const pricingOwner = pricingData[0]?.owner.username ?? '';

  const items = useMemo<ExplorerItem[]>(
    () =>
      pricingData.map((entry, index) => ({
        id: `pricing-${index}`,
        label: entry.yaml,
        yaml: entry.yaml,
        fileType: 'doc',
      })),
    [pricingData]
  );

  const handleDownload = (fileName: string) => {
    if (!fileName) {
      customAlert('No file selected.');
      return;
    }

    const saasName = fileName.split('/')[fileName.split('/').length - 2];
    const version = fileName.split('/')[fileName.split('/').length - 1];

    fetch(fileName).then(async response => {
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = `${saasName}-${version}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectURL);
    });
  };

  const handleOpen = (fileName: string) => {
    if (!fileName) {
      customAlert('No file selected.');
      return;
    }

    fetch(fileName).then(async response => {
      const text = await response.text();
      const urlParam = parseStringYamlToEncodedYaml(text);
      const assignedId = uuidv4();

      setInCache(assignedId, urlParam, 24 * 60 * 60).then(() => {
        window.open(`/editor?pricing=${assignedId}`, '_blank');
      });
    });
  };

  const handleCopyLink = (fileName: string) => {
    if (!fileName) {
      customAlert('No file selected.');
      return;
    }

    setSelectedYamlLink(fileName);
    setYamlLinkModalOpen(true);
  };

  const handleDeleteVersion = async (fileName: string) => {
    if (!fileName) {
      customAlert('No file selected.');
      return;
    }

    const saasName = fileName.split('/')[fileName.split('/').length - 2];
    const version = fileName.split('/')[fileName.split('/').length - 1]
      .replace(/\.[^/.]+$/, '')
      .replace(/\./g, '_');

    customConfirm(`Are you sure you want to delete ${saasName}-${version}?`).then(() => {
      removePricingVersion(saasName, version)
        .then(() => {
          customAlert(`${saasName}-${version} has been deleted.`).then(() => window.location.reload());
        })
        .catch(() => {
          customAlert(
            `Failed to delete ${saasName}-${version}. Please, try again later or contact with support.`
          );
        });
    });
  };

  const contextValue = {
    pricingOwner,
    selectedYamlLink,
    setSelectedYamlLink,
    yamlLinkModalOpen,
    setYamlLinkModalOpen,
  };

  return (
    <FileExplorerContext.Provider value={contextValue}>
      <div className="flex w-full flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h2 className="text-xl font-semibold">File Explorer</h2>
        </div>

        <div className="flex flex-col gap-2 p-4">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 font-medium">
            Pricings
          </div>
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <ExplorerRow
                key={item.id}
                item={item}
                onDownload={handleDownload}
                onOpen={handleOpen}
                onCopyLink={handleCopyLink}
                onDelete={handleDeleteVersion}
                canDelete={Boolean(authUser.user && pricingOwner === authUser.user.username)}
              />
            ))}
          </div>
        </div>
      </div>
      <YamlLinkModal
        open={yamlLinkModalOpen}
        link={selectedYamlLink}
        onClose={() => setYamlLinkModalOpen(false)}
      />
    </FileExplorerContext.Provider>
  );
}
