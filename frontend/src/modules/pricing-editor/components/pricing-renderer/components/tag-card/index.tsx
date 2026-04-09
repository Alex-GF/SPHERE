import { Feature, Plan } from 'pricing4ts';
import { PricingData, RenderingStyles } from '../../types';
import PlanHeader from '../plan-header';
import PricingElement from '../pricing-element';
import { motion } from 'framer-motion';
import { accordionVariants } from '../../shared/motion-variants';

function Accordion({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <details className={className}>{children}</details>;
}

function AccordionSummary({ children, expandIcon }: { children: React.ReactNode; expandIcon?: React.ReactNode }) {
  return (
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-semibold">
      <span>{children}</span>
      {expandIcon}
    </summary>
  );
}

function AccordionDetails({ children }: { children: React.ReactNode }) {
  return <div className="border-t border-slate-200">{children}</div>;
}

function Table({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <table className={className}>{children}</table>;
}

function TableHead({ children }: { children: React.ReactNode }) {
  return <thead>{children}</thead>;
}

function TableBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <tbody className={className}>{children}</tbody>;
}

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
      <Accordion className="mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AccordionSummary
          expandIcon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" /></svg>}
        >
          <span className="text-lg">{tag}</span>
        </AccordionSummary>
        <AccordionDetails>
          <div className="overflow-x-auto">
            <Table className="pricing-table min-w-[600px]" >
              <TableHead>
                <tr>
                  <th className="w-[220px]"></th>
                  {plans.map((plan, index) => (
                    <PlanHeader plan={plan} currency={currency} key={`${plan.name}-${index}`} index={index} />
                  ))}
                </tr>
              </TableHead>
              <TableBody className="pricing-body">
                {Object.entries(filteredPricingData).map(([name, values], index) => (
                  <PricingElement name={name} values={values} key={`${name}-${index}`} />
                ))}
              </TableBody>
            </Table>
          </div>
        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
}
