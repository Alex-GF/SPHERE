import { Pricing } from 'pricing4ts';
import { RenderingStyles } from '../../types';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { motion } from 'framer-motion';
import { cardVariants } from '../../shared/motion-variants';

export default function PricingCard({
  pricing,
  style,
  defaultStyle,
}: Readonly<{
  pricing: Pricing;
  style: RenderingStyles;
  defaultStyle: RenderingStyles;
}>) {

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible">
      <Card
        elevation={3}
        sx={{
          mb: 3,
          bgcolor: 'background.paper',
        }}
      >
        <CardContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              sx={{ color: style.headerColor ?? defaultStyle.headerColor, fontWeight: 700 }}
            >
              {pricing?.saasName}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Plans:</strong> {Object.values(pricing.plans ?? {}).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Add-ons:</strong> {Object.values(pricing.addOns ?? {}).length || 0}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}