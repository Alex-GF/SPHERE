import './styles.css';
import { PricingProps } from './types.d';
import FeatureTableV2 from './components/FeatureTableV2';
import PricingCard from './components/pricing-card';
const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
};

import DEFAULT_RENDERING_STYLES from './shared/constants';
import AddOnElement from './components/addon-element';

export function PricingRenderer({ pricing, style }: Readonly<PricingProps>): JSX.Element {
  style ??= {};

  // UI billing selector currently disabled in renderer

  return (
    <section
      style={{
        backgroundColor: style.backgroundColor ?? DEFAULT_RENDERING_STYLES.backgroundColor,
      }}>
      <div className='container'>
        <PricingCard pricing={pricing} style={style} defaultStyle={DEFAULT_RENDERING_STYLES}/>
        
  <FeatureTableV2
    plans={pricing.plans ?? {}}
    features={pricing.features ?? {}}
    usageLimits={pricing.usageLimits ?? {}}
    addOns={pricing.addOns ?? {}}
    currency={pricing.currency in CURRENCIES ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES] : pricing.currency}
  />

        {(pricing.addOns && Object.values(pricing.addOns).length > 0) && (
          <>
            <div
              className='pricing-page-title'
              style={{ color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor}}>
              <h1>Add-Ons</h1>
            </div>
            <div className='add-ons-container' style={{marginBottom: '100px'}}>
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
