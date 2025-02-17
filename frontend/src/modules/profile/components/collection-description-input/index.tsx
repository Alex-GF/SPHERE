import { TextField } from "@mui/material";
import { CreateCollectionFormFieldProps } from "../create-collection-form";

export default function CollectionDescriptionInput({value, onChange}: CreateCollectionFormFieldProps){  
  return (
      <TextField
        type="textarea"
        placeholder="Description of this collection"
        value={value}
        onChange={e => onChange(e.target.value)}
        fullWidth
        multiline
        rows={5}
      />
  );
}