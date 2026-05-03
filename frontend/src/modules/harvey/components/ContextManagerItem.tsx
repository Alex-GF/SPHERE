import { PricingContextItem } from '../types/types';
import { usePreset } from '../hooks/usePreset';
import usePlayground from '../hooks/usePlayground';
import { UseCases } from '../use-cases';
import { parseStringYamlToEncodedYaml } from '../../pricing-editor/services/export.service';

const HARVEY_API_BASE_URL = import.meta.env.VITE_HARVEY_URL ?? 'http://localhost:8086';

interface ContextManagerItemProps {
  item: PricingContextItem;
  onRemove: (id: string) => void;
}

function computeOriginLabel(pricingContextItem: PricingContextItem): string {
  switch (pricingContextItem.origin) {
    case 'user':
      return 'Manual';
    case 'detected':
      return 'Detected';
    case 'preset':
      return 'Preset';
    case 'agent':
      return 'Agent';
    case 'sphere':
      return 'SPHERE';
    default:
      return '';
  }
}

function computeContextItemMetadata(pricingContextItem: PricingContextItem): string {
  let res = `${pricingContextItem.kind.toUpperCase()} · ${computeOriginLabel(pricingContextItem)} `;
  switch (pricingContextItem.origin) {
    case 'agent':
    case 'detected':
    case 'preset':
    case 'user': {
      return res;
    }
    case 'sphere': {
      res += `· ${pricingContextItem.owner} · ${pricingContextItem.version}`;
      return res;
    }
    default:
      return '';
  }
}

function ContextManagerItem({ item, onRemove }: ContextManagerItemProps) {
  const isPlaygroundEnabled = usePlayground();

  const { preset } = usePreset();

  const formatSphereEditorLink = (url: string) => `/editor?pricingUrl=${url}`;

  const formatEditorLink = (): string => {
    switch (item.origin) {
      case 'preset':
      case 'user':
      case 'detected':
      case 'agent':
        return formatSphereEditorLink(
          `https://${import.meta.env.VITE_SPHERE_HOST}${HARVEY_API_BASE_URL}/static/${item.id}.yaml`
        );
      case 'sphere':
        return formatSphereEditorLink(item.yamlPath);
      default:
        return '#';
    }
  };

  const formatPlaygroundModeLink = (): string => {

    if (!preset) {
      return '';
    }

    if (preset.id === UseCases.AMINT) {
      const url =
        'https://gist.githubusercontent.com/pgmarc/570f51424ef80fcb720f9bc656645a89/raw/549721cb3e7d14a6cc91555ab827e167dfa4f51c/protonmail-2026.yaml';
      return formatSphereEditorLink(url);
    }

    if (item.kind === 'yaml') {
      return `/editor?pricing=${parseStringYamlToEncodedYaml(item.value)}`;
    }

    return "#"
  };

  const isSphereEditorLinkEnabled =
    item.kind === 'yaml' || (item.kind === 'url' && item.transform === 'done');

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">
          {item.label}
        </div>
        <div className="text-xs text-slate-600">
          {computeContextItemMetadata(item)}
        </div>
        {item.kind === 'url' && item.transform === 'not-started' && (
          <div className="mt-2 rounded-md border border-sky-200 bg-sky-50 px-2 py-1 text-xs text-sky-800">
            URL waiting to be processed by A-MINT...
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-red-500 px-3 py-2 text-sm text-red-600 hover:bg-red-500 hover:text-white"
          onClick={() => onRemove(item.id)}
        >
          Remove
        </button>
        {isSphereEditorLinkEnabled && (
          <a
            target="_blank"
            href={!isPlaygroundEnabled ? formatEditorLink() : formatPlaygroundModeLink()}
            rel="noreferrer"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Open in editor
          </a>
        )}
        {item.kind === 'url' && item.transform === 'pending' && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
        )}
      </div>
    </li>
  );
}

export default ContextManagerItem;
