import { CreateCollectionFormFieldProps } from '../create-collection-form';

export default function CollectionNameInput({ value, onChange }: CreateCollectionFormFieldProps) {
  return (
    <input
      placeholder="Collection Name"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-slate-300 px-3 py-2 text-2xl"
      required
    />
  );
}
