import { TextField } from '@mui/material';
import { CreateCollectionFormFieldProps } from '../create-collection-form';

export default function CollectionNameInput({ value, onChange }: CreateCollectionFormFieldProps) {
  return (
    <TextField
      placeholder="Collection Name"
      value={value}
      onChange={e => onChange(e.target.value)}
      fullWidth
      slotProps={{
        input: { style: { fontSize: 24 } },
      }}
      required
    />
  );
}
