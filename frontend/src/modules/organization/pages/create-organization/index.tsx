import { useState } from 'react';
import { useOrganizationsApi } from '../../api/organizationsApi';
import { useRouter } from '../../../core/hooks/useRouter';
import customAlert from '../../../core/utils/custom-alert';

export default function CreateOrganizationPage() {
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createOrganization } = useOrganizationsApi();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    createOrganization({ name, displayName, description: description || undefined })
      .then((org) => router.push(`/me/orgs/${org.id}`))
      .catch((err: Error) => {
        customAlert(err.message);
        setIsSubmitting(false);
      });
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-xl px-4 py-8">
      <h1 className="mb-6 text-center text-2xl font-bold text-sphere-grey-800">Create a new organization</h1>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-sphere-grey-700" htmlFor="org-name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="org-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-organization"
            required
            minLength={3}
            maxLength={50}
            pattern="[a-z0-9_-]+"
            title="Lowercase letters, numbers, hyphens and underscores only"
            className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
          />
          <p className="text-xs text-sphere-grey-500">Lowercase letters, numbers, hyphens and underscores only</p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-sphere-grey-700" htmlFor="org-display-name">
            Display name <span className="text-red-500">*</span>
          </label>
          <input
            id="org-display-name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="My Organization"
            required
            maxLength={255}
            className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-sphere-grey-700" htmlFor="org-description">
            Description
          </label>
          <textarea
            id="org-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of your organization"
            rows={3}
            maxLength={500}
            className="rounded-md border border-sphere-grey-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500 focus:ring-1 focus:ring-sphere-primary-500"
          />
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md border border-sphere-grey-300 px-5 py-2 text-sm font-semibold text-sphere-grey-700 transition-colors hover:bg-sphere-grey-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-sphere-primary-800 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-sphere-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create organization'}
          </button>
        </div>
      </form>
    </div>
  );
}
