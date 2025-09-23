import { Feature, Plan } from 'pricing4ts';
import { getPricingData } from '../../services/pricing.service';
import './styles.css';
import { PricingData, PricingProps } from './types.d';

import { useMemo } from 'react';
import AddOnElement from './components/addon-element';
import PlanHeader from './components/plan-header';
import PricingElement from './components/pricing-element';
import { TagFeatureCard } from './components/tag-card';
import PricingCard from './components/pricing-card';
import { CURRENCIES } from '../../../pricing/pages/card';

import DEFAULT_RENDERING_STYLES from './shared/constants';

export function PricingRenderer({ pricing, errors, style }: Readonly<PricingProps>): JSX.Element {
  const pricingData: PricingData = getPricingData(pricing, errors);

  style ??= {};

  const tagFeatures = useMemo(() => {
    const tagMap = new Map<string, Feature[]>();
    Object.values(pricing.features).forEach((feature) => {
      if (feature.tag) {
        if (!tagMap.has(feature.tag)) tagMap.set(feature.tag, []);
        tagMap.get(feature.tag)?.push(feature);
      }
    });
    return tagMap;
  }, [pricing?.features]);

  const featuresWithoutTags = useMemo(() => {
    return Object.entries(pricingData).filter(([name]) => {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      const feature = Object.values(pricing.features).find(
        (f) => f.name.toLowerCase().replace(/\s+/g, '') === normalizedName
      );
      return feature && !feature.tag;
    });
  }, [pricing.features, pricingData]);

  // UI billing selector currently disabled in renderer

  return (
    <section
      style={{
        backgroundColor: style.backgroundColor ?? DEFAULT_RENDERING_STYLES.backgroundColor,
      }}>
      <div className='container'>
        <PricingCard pricing={pricing} style={style} defaultStyle={DEFAULT_RENDERING_STYLES}/>
        {/* <div className="pricing-page-title">
          <h1
            style={{ color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor }}
          >
            {pricing.name.charAt(0).toUpperCase() + pricing.name.slice(1)}{" "}
            Pricing
          </h1>
        </div> */}
        
        <table className='pricing-table'>
          <thead>
            <tr>
              <th></th>
              {pricing.plans && Object.values(pricing.plans).map((plan: Plan) => (
                <PlanHeader
                  plan={plan}
                  currency={pricing.currency in CURRENCIES ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES] : pricing.currency}
                  style={style}
                  key={plan.name}
                  index={Object.values(pricing.plans ?? {}).indexOf(plan)}
                />
              ))}
            </tr>
          </thead>
          <tbody className='pricing-body'>
            {featuresWithoutTags.map(
              (
                [name, values]: [string, { value: string | number | boolean; unit?: string; addonName: string | null, addonValue: string | number | boolean | null, addonExtension: boolean }[]],
                key: number
              ) => (
                <PricingElement name={name} values={values} style={style} key={`${name}-${key}`} />
              )
            )}
          </tbody>
        </table>

        {tagFeatures && (
          <div className='tag-feature-cards-container' style={{ marginTop: '1rem' }}>
              {Array.from(tagFeatures.entries()).map(([tag, features]) => (
              <TagFeatureCard
                tag={tag}
                features={features}
                style={style}
                key={tag}
                plans={Object.values(pricing.plans!) ?? []}
                currency={pricing.currency}
                pricingData={pricingData}
              />
            ))}
          </div>
        )}

        {(pricing.addOns && Object.values(pricing.addOns).length > 0) && (
          <>
            <div
              className='pricing-page-title'
              style={{ color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor }}>
              <h1>Add-Ons</h1>
            </div>
            <div className='add-ons-container'>
              {Object.values(pricing.addOns).map((addOn) => (
                <AddOnElement
                  addOn={addOn}
                  currency={pricing.currency in CURRENCIES ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES] : pricing.currency}
                  style={style}
                  key={addOn.name}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
