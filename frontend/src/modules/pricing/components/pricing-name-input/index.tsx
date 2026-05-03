import { useAuth } from '../../../auth/hooks/useAuth';

interface PricingNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PricingNameInput({ value, onChange }: PricingNameInputProps) {
  
  const {authUser} = useAuth();
  
  
  return (
    <div className="flex items-center gap-1">
      <div className="relative flex-1">
        <label className="absolute -top-8 left-0 block text-base text-slate-700">
          Owner
        </label>
        <select
          value={authUser.user?.username || ''}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
        >
          <option value={`${authUser.user?.username}`}>{authUser.user?.username}</option>
        </select>
      </div>

      <div className="text-4xl text-slate-400">
        /
      </div>

      <div className="relative flex-[2]">
        <label className="absolute -top-8 left-0 block text-base text-slate-700">
          Pricing Name
        </label>
        <input
          placeholder="New pricing name"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sphere-primary-500"
        />
      </div>
    </div>
  );
}
