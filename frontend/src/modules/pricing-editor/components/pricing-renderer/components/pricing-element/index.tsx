import { RenderingStyles } from '../../types';
import DEFAULT_RENDERING_STYLES from '../../shared/constants';
import { pluralizeUnit } from '../../../../services/pricing.service';
import { formatPricingValue } from '../../shared/value-helpers';
import { Tooltip, Typography, TableCell, TableRow, useTheme } from '@mui/material';
import { RiErrorWarningFill } from 'react-icons/ri';
import { motion } from 'framer-motion';
import { listItemVariants } from '../../shared/motion-variants';
import { getColorForIndex } from '../../shared/color-palette';
import { alpha } from '@mui/material/styles';

export default function PricingElement({
  name,
  values,
  style,
}: Readonly<{
  name: string;
  values: {
    value: string | number | boolean;
    unit?: string;
    addonName: string | null;
    addonValue: string | number | boolean | null;
    addonExtension: boolean;
  }[];
  style: RenderingStyles;
}>): JSX.Element {

  const theme = useTheme();

  return (
    <TableRow>
      <TableCell
        component="th"
        scope="row"
        sx={{ borderTopColor: style.dividerColor ?? DEFAULT_RENDERING_STYLES.dividerColor, px: 2 }}
      >
        <Typography variant="subtitle1" sx={{ color: style.namesColor ?? DEFAULT_RENDERING_STYLES.namesColor }}>
          {name}
        </Typography>
      </TableCell>
      {values.map(({ value, unit, addonName, addonValue, addonExtension }, key) => {
        const accent = getColorForIndex(key);
        const bg = theme.palette.mode === 'dark' ? alpha(accent, 0.06) : alpha(accent, 0.04);

        const cellSx = {
          borderTopColor: style.dividerColor ?? DEFAULT_RENDERING_STYLES.dividerColor,
          textAlign: 'center' as const,
          verticalAlign: 'middle' as const,
          px: 2,
          backgroundColor: bg,
        };

        // Build content for boolean cells without nested ternaries
        if (typeof value === 'boolean') {
          let content: JSX.Element | string;
          if (value) {
            content = (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-label="Included" style={{ color: style.checkColor ?? DEFAULT_RENDERING_STYLES.checkColor, width: 20, height: 20 }}>
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            );
          } else if (addonValue) {
            content = <Typography variant="body2">Add-on</Typography>;
          } else {
            content = (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-label="Not included" style={{ color: style.crossColor ?? DEFAULT_RENDERING_STYLES.crossColor, width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
            );
          }

          return (
            <TableCell key={`${name}-${key}`} sx={cellSx}>
              <motion.div variants={listItemVariants} custom={key} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {content}
              </motion.div>
            </TableCell>
          );
        }

        // Non-boolean (string or number) cells
  const formatted = formatPricingValue(value as unknown as string | number, unit, typeof addonValue === 'number' ? addonValue : null, addonExtension);
        const showTooltip = typeof value === 'number' && typeof addonValue === 'number' && (((!addonExtension && addonValue > value) || addonExtension) && addonValue > 0);

        let addonUnit = '';
        if (typeof addonValue === 'number') {
          addonUnit = addonValue > 1 ? pluralizeUnit(unit ?? '') : (unit ?? '');
        }
        const tooltipText = addonExtension
          ? `You can contract ${addonValue} more ${addonUnit} by contracting the add-on '${addonName!}'`
          : `You can extend this limit up to ${addonValue} ${addonUnit} by contracting the add-on '${addonName!}'`;

        return (
          <TableCell key={`${name}-${key}`} sx={cellSx}>
            <motion.div variants={listItemVariants} custom={key} style={{ display: 'flex', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: style.valuesColor ?? DEFAULT_RENDERING_STYLES.valuesColor }}>
                {formatted}
                {showTooltip ? (
                  <Tooltip title={tooltipText} placement="top">
                    <span style={{ marginLeft: 6 }}>
                      <RiErrorWarningFill />
                    </span>
                  </Tooltip>
                ) : null}
              </Typography>
            </motion.div>
          </TableCell>
        );
      })}
    </TableRow>
  );
}
