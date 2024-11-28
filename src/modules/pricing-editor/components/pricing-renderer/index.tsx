import { Feature, Plan } from 'pricing4ts';
import { getPricingData } from '../../services/pricing.service';
import './styles.css';
import { PricingData, PricingProps, RenderingStyles } from './types.d';

import { useMemo } from 'react';
import AddOnElement from './components/addon-element';
import PlanHeader from './components/plan-header';
import PricingElement from './components/pricing-element';
import { TagFeatureCard } from './components/tag-card';
import PricingCard from './components/pricing-card';
import { CURRENCIES } from '../../../pricing/pages/card';

export const DEFAULT_RENDERING_STYLES: RenderingStyles = {
  plansColor: '#000000',
  priceColor: '#000000',
  periodColor: '#000000',
  headerColor: '#000000',
  namesColor: '#000000',
  valuesColor: '#000000',
  checkColor: '#000000',
  crossColor: '#000000',
  backgroundColor: '#f3f4f6',
  dividerColor: '#000000',
  billingSelectionColor: '#ffffff',
  billingSelectionBackgroundColor: '#EEE',
  billingSelectionTextColor: '#000000',
  addonBackgroundColor: '#ffffff',
  addonTextColor: '#000000',
};

export function PricingRenderer({ pricing, errors, style }: Readonly<PricingProps>): JSX.Element {
  let pricingData: PricingData = getPricingData(pricing, errors);

  if (!style) {
    style = {};
  }

  const tagFeatures = useMemo(() => {
    const tagMap = new Map<string, Feature[]>();
    pricing.features.forEach((feature) => {
      if (feature.tag) {
        if (!tagMap.has(feature.tag)) tagMap.set(feature.tag, []);
        tagMap.get(feature.tag)?.push(feature);
      }
    });
    return tagMap;
  }, [pricing?.features]);

  const featuresWithoutTags = useMemo(() => {
    return Object.entries(pricingData).filter(([name, _]) => {
      const normalizedName = name.toLowerCase().replace(/\s+/g, '');
      const feature = pricing.features.find(
        (f) => f.name.toLowerCase().replace(/\s+/g, '') === normalizedName
      );
      return feature && !feature.tag;
    });
  }, [pricing.features, pricingData]);

  // const [selectedBilledType, setSelectedBilledType] =
  //   useState<BilledType>("monthly");
  // function handleSwitchTab(tab: BilledType) {
  //   setSelectedBilledType(tab);
  // }

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
        {/* {pricing.hasAnnualPayment && (
          <div className="pricing-page-title">
            <SelectOfferTab
              handleSwitchTab={handleSwitchTab}
              selectedBilledType={selectedBilledType}
              style={style}
            />
          </div>
        )} */}
        <table className='pricing-table'>
          <thead>
            <tr>
              <th></th>
              {pricing.plans && pricing.plans.map((plan: Plan, key: number) => (
                <PlanHeader
                  plan={plan}
                  currency={pricing.currency in CURRENCIES ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES] : pricing.currency}
                  style={style}
                  key={`${plan.name}-${key}`}
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
                plans={pricing.plans ?? []}
                currency={pricing.currency}
                pricingData={pricingData}
              />
            ))}
          </div>
        )}

        {(pricing.addOns && pricing.addOns.length > 0) && (
          <>
            <div
              className='pricing-page-title'
              style={{ color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor }}>
              <h1>Add-Ons</h1>
            </div>
            <div className='add-ons-container'>
              {pricing.addOns.map((addOn, index) => {
                return (
                  <AddOnElement
                    addOn={addOn}
                    currency={pricing.currency in CURRENCIES ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES] : pricing.currency}
                    style={style}
                    key={index}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
