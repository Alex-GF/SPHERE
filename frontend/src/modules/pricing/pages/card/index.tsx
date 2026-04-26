import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import PricingTree from '../../components/pricing-tree';
import { PricingRenderer } from '../../../pricing-editor/components/pricing-renderer';
import { Pricing, retrievePricingFromYaml } from 'pricing4ts';
import FileExplorer from '../../components/file-explorer';
import { AnalyticsDataEntry } from '../../../../assets/data/analytics';
import { usePathname } from '../../../core/hooks/usePathname';
import Stats from '../../components/stats';
import Analytics from '../../components/analytics';
// import Harvey from '../../components/harvey';
import AnalyticsModal from '../../components/analyticsModal';
import { usePricingsApi } from '../../api/pricingsApi';
import PricingSettings from '../../components/pricing-settings';
import customAlert from '../../../core/utils/custom-alert';
import { useAuth } from '../../../auth/hooks/useAuth';
import { Link } from 'react-router-dom';
import { useQueryParams } from '../../../core/hooks/useQueryParams';
import ConfigurationSpaceView from '../../components/configuration-space-view';

export const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
};

export default function CardPage() {
  const [tabValue, setTabValue] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [fullPricingData, setFullPricingData] = useState<AnalyticsDataEntry[] | null>(null);
  const [pricingData, setPricingData] = useState<AnalyticsDataEntry[] | null>(null);
  const [currentPricing, setCurrentPricing] = useState<AnalyticsDataEntry | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [pricingYamlText, setPricingYamlText] = useState<string | null>(null);
  const [oldestPricingDate, setOldestPricingDate] = useState<string | null>(null);

  const pathname = usePathname();
  const queryParams = useQueryParams();
  const { getPricingByName, updateClientPricingVersion } = usePricingsApi();
  const { authUser } = useAuth();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updatePricingInformation(pricing: any) {
    if (pricing.versions && pricing.versions.length > 0) {
      const currentPricing = pricing.versions[0];
      const oldestPricing = pricing.versions[pricing.versions.length - 1];
      setFullPricingData(pricing.versions);
      setPricingData(pricing.versions);
      setCurrentPricing(currentPricing);
      setOldestPricingDate(oldestPricing.createdAt);
    } else {
      throw new Error('No pricing versions found');
    }
  }

  useEffect(() => {
    const name = pathname.split('/').pop() as string;
    const owner = pathname.split('/')[pathname.split('/').length - 2] as string;
    const collectionName: string | null = queryParams.get('collectionName');

    getPricingByName(name, owner, collectionName).then(pricing => {
      try {
        updatePricingInformation(pricing);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        customAlert(err.msg);
      }
    });
  }, [pathname]);

  useEffect(() => {
    if (currentPricing === null) {
      return;
    }

    const pricingYamlPath = currentPricing.yaml;

    fetch(pricingYamlPath).then(async response => {
      let p: string = '';
      p = await response.text();

      let parsedPricing: Pricing | null = null;

      try{
        parsedPricing = retrievePricingFromYaml(p);
      }catch{
        if (!(/syntaxVersion\s*:\s*["']?3\.0["']?/.test(p))) {
          parsedPricing = await updateClientPricingVersion(p);
        }
      }

      setPricing(parsedPricing);
      setPricingYamlText(p);
    });
  }, [pricingData, currentPricing]);

  // Handler to apply variables edits coming from the renderer's VariablesEditor
  const handleApplyVariables = (variables: Record<string, unknown>) => {
    // If we have the original YAML text, rebuild it with the new variables and re-parse so computed prices update
    if (pricingYamlText) {
      const newYaml = (function replaceVariablesInYaml(yaml: string, vars: Record<string, unknown>) {
        const serializeVal = (v: unknown) => {
          if (typeof v === 'string') return JSON.stringify(v);
          if (typeof v === 'boolean') return v ? 'true' : 'false';
          if (typeof v === 'number' && Number.isFinite(v)) return String(v);
          return JSON.stringify(v);
        };

        const varsLines = ['variables:'];
        for (const k of Object.keys(vars)) {
          varsLines.push(`  ${k}: ${serializeVal(vars[k])}`);
        }
        const varsBlock = varsLines.join('\n');

        const variablesRegex = /^variables:\n(?:[ \t]+.+\n?)*/gm;

        if (variablesRegex.test(yaml)) {
          return yaml.replace(variablesRegex, varsBlock + '\n');
        } else {
          const insertAfterRegex = /^(createdAt:.*|currency:.*)$/mi;
          const m = insertAfterRegex.exec(yaml);
          if (m) {
            const idx = (m.index ?? 0) + (m[0]?.length ?? 0);
            return yaml.slice(0, idx) + '\n' + varsBlock + yaml.slice(idx);
          }
          return yaml + '\n' + varsBlock + '\n';
        }
      })(pricingYamlText, variables);

      try {
        const parsedPricing = retrievePricingFromYaml(newYaml);
        setPricing(parsedPricing);
        setPricingYamlText(newYaml);
        return;
      } catch {
        // fallback: update variables in-place on the object so at least variables reflect new values
        setPricing((prev) => (prev ? { ...prev, variables } : prev));
        return;
      }
    }

    // if we don't have YAML text, fallback to in-memory update
    setPricing((prev) => (prev ? { ...prev, variables } : prev));
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen);
  };

  const handleInputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPricingData = fullPricingData?.filter(
      entry => new Date(entry.createdAt) >= new Date(e.target.value)
    );
    if (newPricingData) {
      setPricingData(newPricingData);
    } else {
      setPricingData([]);
    }
  };

  const handleOutputDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPricingData = fullPricingData?.filter(
      entry => new Date(entry.createdAt) <= new Date(e.target.value)
    );
    if (newPricingData) {
      setPricingData(newPricingData);
    } else {
      setPricingData([]);
    }
  };

  const handleVersionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPricing = pricingData?.find(entry => entry.yaml == e.target.value);
    if (newPricing) {
      setCurrentPricing(newPricing);
    }
  };

  return (
    <>
      <Helmet>
        <title> {`SPHERE - ${pricing?.saasName} Pricing`} </title>
      </Helmet>
      <div className="mx-auto my-4 w-full max-w-screen-xl px-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col mt-6 mb-2">
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-2xl tracking-wide mr-4">
                {currentPricing?.collectionName && (
                  <>
                    <span className="mr-1 text-slate-500">{currentPricing?.collectionName}</span>
                    <span className="mr-1 text-slate-500">/</span>
                  </>
                )}
                {pricing?.saasName}
              </h1>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setIsLiked(!isLiked)}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                {isLiked ? '151' : '150'}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1 text-sm"
                onClick={() => setIsFollowing(!isFollowing)}
              >
                {isFollowing ? <FaBookmark /> : <FaRegBookmark />}
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>

            {currentPricing && currentPricing.collectionName && (
              <p className="mb-2 text-lg font-bold text-slate-600">
                Collection:{' '}
                <Link
                  className='text-blue-500 hover:text-blue-700'
                  to={`/pricings/collections/${currentPricing.owner.id}/${currentPricing.collectionName}`}
                >
                  {currentPricing.collectionName}
                </Link>
              </p>
            )}

            <div className="border-b border-slate-300 mt-4">
              <div className="flex flex-wrap gap-1">
                <button type="button" className={`px-4 py-2 text-sm uppercase tracking-wide ${tabValue === 0 ? 'border-b-2 border-sphere-primary-500 text-sphere-primary-500' : 'text-slate-500'}`} onClick={() => setTabValue(0)}>Pricing card</button>
                <button type="button" className={`px-4 py-2 text-sm uppercase tracking-wide ${tabValue === 1 ? 'border-b-2 border-sphere-primary-500 text-sphere-primary-500' : 'text-slate-500'}`} onClick={() => setTabValue(1)}>Configuration Space Details</button>
                <button type="button" className={`px-4 py-2 text-sm uppercase tracking-wide ${tabValue === 2 ? 'border-b-2 border-sphere-primary-500 text-sphere-primary-500' : 'text-slate-500'}`} onClick={() => setTabValue(2)}>Files and versions</button>
                {currentPricing && authUser.user && currentPricing.owner.username === authUser.user.username && (
                  <button type="button" className={`px-4 py-2 text-sm uppercase tracking-wide ${tabValue === 3 ? 'border-b-2 border-sphere-primary-500 text-sphere-primary-500' : 'text-slate-500'}`} onClick={() => setTabValue(3)}>Settings</button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {oldestPricingDate && (
                <>
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    type="date"
                    defaultValue={new Date(oldestPricingDate).toISOString().split('T')[0]}
                    onChange={handleInputDate}
                  />
                  <input
                    className="w-full rounded-md border border-slate-300 px-3 py-2"
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    onChange={handleOutputDate}
                  />
                </>
              )}
            </div>
            <select
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              onChange={handleVersionChange}
              value={currentPricing?.yaml ?? ''}
            >
              <option value="" disabled>
                Version
              </option>
              {pricingData?.map((entry, index) => (
                <option key={index} value={entry.yaml}>
                  {entry.yaml
                    .split('/')
                    [entry.yaml.split('/').length - 1].replace('.yaml', '')
                    .replace('.yml', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 mt-6 flex gap-4">
          {tabValue === 3 && pricingData && pricing && (
            <PricingSettings
              pricingName={pricing.saasName}
              pricingData={pricingData}
              updatePricingInformation={updatePricingInformation}
            />
          )}
          {tabValue === 2 && pricingData && <FileExplorer pricingData={pricingData} />}
          {tabValue === 1 && currentPricing && <ConfigurationSpaceView pricingId={currentPricing.id} />}
          {tabValue === 0 && (
            <>
              <div className="max-w-[66.7%] flex-1">
                <h2 className="mb-2 text-xl font-semibold">
                  Pricing Information
                </h2>
                <p className="mb-4">
                  This is the pricing information for {pricing?.saasName}. The pricing version that
                  is currently displayed is from{' '}
                  {currentPricing?.createdAt
                    ? new Date(currentPricing.createdAt).toLocaleDateString()
                    : 'Unknown date'}
                  . The prices are displayed with {pricing?.currency} currency. In future versions,
                  more data will be provided in this card.
                </p>
                {pricing && (
                  <PricingRenderer
                    pricing={pricing}
                    errors={[]}
                    onApplyVariables={handleApplyVariables}
                  />
                )}
              </div>

              <div className="min-w-[33.3%]">
                {currentPricing && pricing && (
                  <div className="mb-2 rounded border border-slate-200 p-2">
                    <Stats currentPricing={currentPricing} pricing={pricing} />
                  </div>
                )}

                {pricingData && (
                  <div className="mb-2 rounded border border-slate-200 p-2">
                    <Analytics pricingData={pricingData} toggleModal={toggleModal} />
                  </div>
                )}

                <div className="mt-2 rounded border border-slate-200 p-2">
                  <PricingTree pricing={currentPricing} name={pricing?.saasName} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <AnalyticsModal open={isModalOpen} onClose={toggleModal} pricingData={pricingData!} />
    </>
  );
}
