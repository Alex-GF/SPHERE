import { Plan } from 'pricing4ts';
import { RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { listItemVariants } from '../../shared/motion-variants';
import { getColorForIndex } from '../../shared/color-palette';

export default function PlanHeader({
  plan,
  currency,
  style,
  // support optional index to pick color
  index,
}: Readonly<{
  plan: Plan;
  currency: string;
  style: RenderingStyles;
  index?: number;
}>): JSX.Element {
  const accent = typeof index === 'number' ? getColorForIndex(index) : style.plansColor ?? DEFAULT_RENDERING_STYLES.plansColor;

  return (
    <motion.th variants={listItemVariants} custom={index ?? 0} scope="col">
      <Box sx={{ textAlign: 'center', px: 1 }}>
        <Typography
          variant="h6"
          component="div"
          sx={{ color: accent, fontWeight: 600 }}
        >
          {plan.name}
        </Typography>

        <Typography variant="h5" sx={{ color: accent, fontWeight: 700 }}>
          {plan.price === 0 ? 'FREE' : <>{plan.price}{typeof plan.price === 'number' ? currency : ''}</>}
        </Typography>
        {typeof plan.price === 'number' && (
          <Typography variant="caption" sx={{ color: accent, opacity: 0.9 }}>
            {plan.unit ? plan.unit : '/month'}
          </Typography>
        )}
      </Box>
    </motion.th>
  );
}