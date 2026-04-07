import { usePricingContext } from '../hooks/usePricingContext';
import { usePricingVersions } from '../hooks/useVersion';
import { fetchPricingYaml } from '../sphere';
import { SphereContextItemInput } from '../types/types';
import PricingVersionLoader from './PricingVersionLoader';

interface PricingVersionProps {
  owner: string;
  name: string;
  collectionName?: string | null;
  onContextAdd: (input: SphereContextItemInput) => void;
  onContextRemove: (id: string) => void;
}

function PricingVersions({
  owner,
  name,
  collectionName,
  onContextAdd,
  onContextRemove,
}: PricingVersionProps) {
  const { loading, error, versions } = usePricingVersions(owner, name, collectionName);
  const pricingContextItems = usePricingContext();

  const isVersionIncludedInContext = (yamlPath: string) =>
    pricingContextItems.filter(
      item => item.origin && item.origin === 'sphere' && item.yamlPath === yamlPath
    ).length > 0;

  const totalVersions = versions?.versions.length;

  if (error) {
    return <div>Something went wrong...</div>;
  }

  if (loading) {
    return <PricingVersionLoader />;
  }

  const calculateLabel = (name: string, collectionName?: string | null) =>
    `${collectionName ? collectionName + '/' : ''}${name}`;

  const calculateTotalVersionLabel = () => {
    const res = 'version';
    if (totalVersions === 1) {
      return res;
    }
    return res + 's';
  };

  const handleAddSpherePricing = async (sphereId: string, yamlUrl: string, version: string) => {
    const yamlFile = await fetchPricingYaml(yamlUrl);
    onContextAdd({
      sphereId: sphereId,
      kind: 'yaml',
      label: calculateLabel(name, collectionName),
      value: yamlFile,
      origin: 'sphere',
      owner: owner,
      yamlPath: yamlUrl,
      pricingName: name,
      version: version,
      collection: collectionName ?? null,
    });
  };

  return (
    <>
      {totalVersions && (
        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-sm">
          {totalVersions} {calculateTotalVersionLabel()} available
        </span>
      )}
      <ul className="mt-3 space-y-2">
        {versions?.versions.map(item => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3">
            <span>{item.version}</span>
            {!isVersionIncludedInContext(item.yaml) ? (
              <button
                type="button"
                className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50"
                onClick={() => handleAddSpherePricing(item.id, item.yaml, item.version)}
              >
                Add
              </button>
            ) : (
              <button
                type="button"
                className="rounded-md border border-red-500 px-3 py-2 text-red-500 hover:bg-red-500 hover:text-white"
                onClick={() => onContextRemove(item.id)}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-3 border-t border-slate-200" />
    </>
  );
}

export default PricingVersions;
