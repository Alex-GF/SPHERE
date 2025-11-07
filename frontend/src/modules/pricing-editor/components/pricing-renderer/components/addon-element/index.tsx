import { AddOn } from 'pricing4ts';
import { RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { formatPricingComponentName } from '../../../../services/pricing.service';
import { Card, CardContent, Avatar, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';
import { indexFromString, getColorForIndex } from '../../shared/color-palette';
import { formatMoneyDisplay } from '../../shared/value-helpers';

const MotionCard = motion(Card);

export default function AddOnElement({
  addOn,
  currency,
  style,
}: Readonly<{
  addOn: AddOn;
  currency: string;
  style: RenderingStyles;
}>): JSX.Element {
  const idx = indexFromString(addOn.name);
  const accent = getColorForIndex(idx);

  return (
    <MotionCard
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02, boxShadow: '0 6px 18px rgba(0,0,0,0.12)' }}
      elevation={4}
      sx={{ width: 280, height: 104, borderRadius: 2, m: 1, display: 'flex', alignItems: 'center' }}
    >
      <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1, width: '100%', boxSizing: 'border-box' }}>
        <Avatar sx={{ bgcolor: accent, width: 52, height: 52, fontWeight: 700 }} aria-hidden>
          {formatPricingComponentName(addOn.name).charAt(0)}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: style.addonTextColor ?? DEFAULT_RENDERING_STYLES.addonTextColor,
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={formatPricingComponentName(addOn.name)}
          >
            {formatPricingComponentName(addOn.name)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            title={addOn.description ?? ''}
          >
            {addOn.description ?? ''}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 80 }}>
          <Typography variant="h6" sx={{ color: style.priceColor ?? DEFAULT_RENDERING_STYLES.priceColor, fontWeight: 700 }}>
            {formatMoneyDisplay(addOn.price)}{typeof addOn.price === 'number' ? currency : ''}
          </Typography>
          {typeof addOn.price === 'number' && (
            <Typography variant="caption" sx={{ color: style.periodColor ?? DEFAULT_RENDERING_STYLES.periodColor }}>
              {addOn.unit ? addOn.unit : '/month'}
            </Typography>
          )}
        </Box>
      </CardContent>
    </MotionCard>
  );
}
