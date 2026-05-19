import { CreateCollectionFormFieldProps } from '../create-collection-form';

export default function CollectionNameInput({ value, onChange }: CreateCollectionFormFieldProps) {
  return (
    <input
      placeholder="Collection Name"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full rounded-md border border-tp-input-border bg-tp-input-bg px-3 py-2 text-2xl text-tp-ink outline-none focus:border-tp-primary focus:ring-1 focus:ring-tp-primary/20 dark:focus:ring-tp-primary/20"
      required
    />
  );
}
