import { useState } from 'react';
import VisibilityOptions from '../visibility-options';
import FileUpload from '../../../core/components/file-upload-input';
import OrganizationSelector from '../organization-selector';
import { usePricingsApi } from '../../api/pricingsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import { retrievePricingFromYaml } from 'pricing4ts';
import customAlert from '../../../core/utils/custom-alert';
import { Organization } from '../../../organization/api/organizationsApi';

export default function CreatePricingForm() {
  const [pricingName, setPricingName] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const { createPricing } = usePricingsApi();
  const router = useRouter();

  const handleSubmit = (file: File) => {
    if (!selectedOrg) {
      customAlert('Please select an organization');
      return;
    }
    if (!pricingName.trim()) {
      customAlert('Please enter a pricing name');
      return;
    }

    file.text().then(text => {
      try {
        const uploadedPricing = retrievePricingFromYaml(text);
        setErrors([]);
        const formData = new FormData();
        formData.append('saasName', uploadedPricing.saasName);
        formData.append('version', uploadedPricing.version);
        formData.append('yaml', file);
        formData.append('private', visibility === 'Private' ? 'true' : 'false');
        createPricing(formData, selectedOrg.id, setErrors).then(() => {
          router.push('/pricings');
        }).catch((error) => {
          console.error('Error creating pricing:', error);
        });
      } catch (e) {
        setErrors([(e as Error).message]);
      }
    });
  };

  return (
    <form className="flex flex-col gap-3">
      <h2 className="mb-5 text-center text-2xl font-bold">
        Upload a pricing to SPHERE
      </h2>

      <div className="flex items-end gap-1">
        <div className="flex-1">
          <OrganizationSelector value={selectedOrg} onChange={setSelectedOrg} />
        </div>

        <div className="text-4xl text-slate-400">
          /
        </div>

        <div className="relative flex-[2]">
          <label className="absolute -top-8 left-0 block text-base text-slate-700">
            Pricing Name
          </label>
          <input
            placeholder="e.g. GitHub"
            value={pricingName}
            onChange={e => setPricingName(e.target.value)}
            className="w-full rounded-md border border-tp-input-border bg-tp-input-bg px-3 py-2 text-sm text-tp-ink outline-none focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20 dark:focus:ring-tp-primary/20"
          />
        </div>
      </div>

      <VisibilityOptions value={visibility} onChange={setVisibility} />

      <FileUpload
        onSubmit={handleSubmit}
        submitButtonText="Upload Pricing"
        submitButtonWidth={400}
        isDragActiveText="Drop a Pricing2Yaml file here"
        isNotDragActiveText="Drag and drop a Pricing2Yaml file here"
      />

      {errors.length > 0 && (
        <div className="mt-2 rounded-md bg-red-50 p-3">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">{err}</p>
          ))}
        </div>
      )}

      <div className="h-12" />
    </form>
  );
}
