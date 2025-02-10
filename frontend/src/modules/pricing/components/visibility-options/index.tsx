import { FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material';

interface VisibilityOptionsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function VisibilityOptions({ value, onChange }: VisibilityOptionsProps){
  return (
    <FormControl>
      <RadioGroup
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <FormControlLabel value="Public" control={<Radio />} label="Public" />
        <FormControlLabel value="Private" control={<Radio />} label="Private" />
      </RadioGroup>
    </FormControl>
  );
};
