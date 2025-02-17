import { Box, Menu, MenuItem, Select, TextField, Typography } from '@mui/material';
import { useAuth } from '../../../auth/hooks/useAuth';

interface PricingNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PricingNameInput({ value, onChange }: PricingNameInputProps) {
  
  const {authUser} = useAuth();
  
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Campo de texto para Owner */}
      <Box sx={{ flex: 1, position: 'relative'}}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 16, position: 'absolute', top: -30, left: 0 }}>
          Owner
        </Typography>
        <Select
          value={authUser.user?.username}
          fullWidth
          size="small"
        >
          <MenuItem value={`${authUser.user?.username}`}>{authUser.user?.username}</MenuItem>
        </Select>
      </Box>

      {/* Barra inclinada */}
      <Typography variant="h4" sx={{ color: 'gray' }}>
        /
      </Typography>

      {/* Campo de texto para Model Name */}
      <Box sx={{ flex: 2, position: 'relative' }}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5, fontSize: 16, position: 'absolute', top: -30, left: 0 }}>
          Pricing Name
        </Typography>
        <TextField
          placeholder="New pricing name"
          value={value}
          onChange={e => onChange(e.target.value)}
          fullWidth
          size="small"
        />
      </Box>
    </Box>
  );
}
