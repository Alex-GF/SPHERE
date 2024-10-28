import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { Feature, Plan } from 'pricing4ts';
import { PricingData, RenderingStyles } from '../../types';
import PlanHeader from '../plan-header';
import PricingElement from '../pricing-element';

interface TagFeatureCardProps {
  tag: string;
  features: Feature[];
  plans: Plan[];
  currency: string;
  style: RenderingStyles;
  pricingData: PricingData; // Recibimos pricingData
}

export function TagFeatureCard({
  tag,
  features,
  plans,
  currency,
  style,
  pricingData,
}: TagFeatureCardProps): JSX.Element {
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

  console.log({
    filteredPricingData,
  });

  return (
    <Accordion sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
      <AccordionSummary
        expandIcon={
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='currentColor'
            width='24'
            height='24'>
            <path d='M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z' />
          </svg>
        }>
        <Typography variant='h6'>{tag}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ backgroundColor: 'transparent' }}>
        <table className='pricing-table'>
          <thead>
            <tr>
              <th></th>
              {plans.map((plan, index) => (
                <PlanHeader
                  plan={plan}
                  currency={currency}
                  style={style}
                  key={`${plan.name}-${index}`}
                />
              ))}
            </tr>
          </thead>
          <tbody className='pricing-body'>
            {Object.entries(filteredPricingData).map(([name, values], index) => (
              <PricingElement name={name} values={values} style={style} key={`${name}-${index}`} />
            ))}
          </tbody>
        </table>
      </AccordionDetails>
    </Accordion>
  );
}
