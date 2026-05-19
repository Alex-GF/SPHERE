import { useState } from 'react';
import VisibilityOptions from '../visibility-options';
import FileUpload from '../../../core/components/file-upload-input';
import { useAuth } from '../../../auth/hooks/useAuth';
import { usePricingsApi } from '../../api/pricingsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import { retrievePricingFromYaml } from 'pricing4ts';
import customAlert from '../../../core/utils/custom-alert';

export default function CreatePricingForm() {
  const [pricingName, setPricingName] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [errors, setErrors] = useState<string[]>([]);

  const { authUser } = useAuth();
  const { createPricing } = usePricingsApi();
  const router = useRouter();

  const handleSubmit = (file: File) => {
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
        createPricing(formData, setErrors).then(() => {
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

      <div className="flex items-center gap-1">
        <div className="relative flex-1">
          <label className="absolute -top-6 left-0 block text-sm text-slate-700">
            Owner
          </label>
          <select
            value={authUser.user?.username || ''}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value={authUser.user?.username}>{authUser.user?.username}</option>
          </select>
        </div>

        <div className="text-4xl text-slate-400 pt-4">
          /
        </div>

        <div className="relative flex-[2]">
          <label className="absolute -top-6 left-0 block text-sm text-slate-700">
            Pricing Name
          </label>
          <input
            placeholder="New pricing name"
            value={pricingName}
            onChange={e => setPricingName(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500"
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
