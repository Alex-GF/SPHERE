import { Accordion, AccordionDetails, AccordionSummary, Typography, Table, TableHead, TableBody } from '@mui/material';
import { Feature, Plan } from 'pricing4ts';
import { PricingData, RenderingStyles } from '../../types';
import PlanHeader from '../plan-header';
import PricingElement from '../pricing-element';
import { motion } from 'framer-motion';
import { accordionVariants } from '../../shared/motion-variants';

interface TagFeatureCardProps {
  tag: string;
  features: Feature[];
  plans: Plan[];
  currency: string;
  style: RenderingStyles;
  pricingData: PricingData;
}

export function TagFeatureCard({
  tag,
  features,
  plans,
  currency,
  style,
  pricingData,
}: Readonly<TagFeatureCardProps>): JSX.Element {
  const featureNames = features.map((feature) => feature.name);

  const filteredPricingData = Object.keys(pricingData)
    .filter((key) => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, '');
      return featureNames.some(
        (featureName) => featureName.toLowerCase().replace(/\s+/g, '') === normalizedKey
      );
    })
    .reduce((result, key) => {
      result[key] = pricingData[key];
      return result;
    }, {} as PricingData);

  return (
    <motion.div variants={accordionVariants} initial="closed" animate="open">
      <Accordion sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
        <AccordionSummary
          expandIcon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" /></svg>}
        >
          <Typography variant="h6">{tag}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ backgroundColor: 'transparent' }}>
          <div style={{ overflowX: 'auto' }}>
            <Table className="pricing-table" sx={{ minWidth: Math.max(600, plans.length * 220) }}>
              <TableHead>
                <tr>
                  <th style={{ width: 220 }}></th>
                  {plans.map((plan, index) => (
                    <PlanHeader plan={plan} currency={currency} style={style} key={`${plan.name}-${index}`} index={index} />
                  ))}
                </tr>
              </TableHead>
              <TableBody className="pricing-body">
                {Object.entries(filteredPricingData).map(([name, values], index) => (
                  <PricingElement name={name} values={values} style={style} key={`${name}-${index}`} />
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
}
