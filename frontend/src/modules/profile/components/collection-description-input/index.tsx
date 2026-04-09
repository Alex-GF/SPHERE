import { CreateCollectionFormFieldProps } from "../create-collection-form";

export default function CollectionDescriptionInput({value, onChange}: CreateCollectionFormFieldProps){  
  return (
      <textarea
        placeholder="Description of this collection"
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={5}
        className="w-full rounded-md border border-slate-300 px-3 py-2"
      />
  );
}