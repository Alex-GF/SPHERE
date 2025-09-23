import { BilledType, RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { ToggleButtonGroup, ToggleButton, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';

export default function SelectOfferTab({
  selectedBilledType,
  handleSwitchTab,
  style,
}: Readonly<{
  selectedBilledType: BilledType;
  handleSwitchTab: (tab: BilledType) => void;
  style: RenderingStyles;
}>): JSX.Element {
  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
        <ToggleButtonGroup
          value={selectedBilledType}
          exclusive
          onChange={(_, val) => val && handleSwitchTab(val)}
          sx={{ bgcolor: style.billingSelectionBackgroundColor ?? DEFAULT_RENDERING_STYLES.billingSelectionBackgroundColor, borderRadius: 2 }}
        >
          <ToggleButton
            value="monthly"
            sx={{ color: style.billingSelectionTextColor ?? DEFAULT_RENDERING_STYLES.billingSelectionTextColor }}
          >
            Monthly
          </ToggleButton>
          <ToggleButton
            value="annually"
            sx={{ color: style.billingSelectionTextColor ?? DEFAULT_RENDERING_STYLES.billingSelectionTextColor }}
          >
            Annually
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </motion.div>
  );
}
