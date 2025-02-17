import {
  Typography,
  Box,
  useTheme,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaCheck } from "react-icons/fa6";

type SelectableCardProps = {
  readonly name: string;
  readonly selected: boolean;
  readonly onClick: () => void;
};

const StyledCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'selected',
})<{ selected: boolean }>(({ theme, selected }) => ({
  position: 'relative',
  border: selected
    ? `2px solid ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  padding: "10px 20px",
  cursor: 'pointer',
  transition: 'border 0.3s, box-shadow 0.3s',
}));

export default function SelectablePricingCard({ name, selected, onClick }: SelectableCardProps) {
  const theme = useTheme();

  return (
    <StyledCard selected={selected} onClick={onClick}>
      <Typography variant="body1">{name}</Typography>
      {selected && (
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: -10,
            right: -10,
            height: 20,
            width: 20,
            color: "white",
            backgroundColor: theme.palette.primary.main,
            borderRadius: '50%',
          }}
        >
          <FaCheck />
        </Box>
      )}
    </StyledCard>
  );
};