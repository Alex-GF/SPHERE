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
import { useState } from 'react';
import VariablesEditor from './components/VariablesEditor';

export function PricingRenderer({
  pricing,
  style,
  onApplyVariables,
}: Readonly<PricingProps>): JSX.Element {
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);

  // UI billing selector currently disabled in renderer

  return (
    <section className="bg-slate-50 py-4">
      <div className="container mx-auto max-w-7xl px-4">
        <PricingCard pricing={pricing} />

        {/* Variables editor trigger - placed before features table */}

        {Object.keys(pricing.variables).length > 0 && (
          <>
            <div
              className="mt-3 mb-1 flex justify-end"
            >
              <button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" onClick={() => setVariablesModalOpen(true)}>
                Open variables calculator
              </button>
            </div>
            <VariablesEditor
              open={variablesModalOpen}
              onClose={() => setVariablesModalOpen(false)}
              variables={pricing.variables}
              onApply={variables => {
                if (onApplyVariables) onApplyVariables(variables);
              }}
            />
          </>
        )}

        <FeatureTableV2
          plans={pricing.plans ?? {}}
          features={pricing.features ?? {}}
          usageLimits={pricing.usageLimits ?? {}}
          addOns={pricing.addOns ?? {}}
          currency={
            pricing.currency in CURRENCIES
              ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES]
              : pricing.currency
          }
        />

        {pricing.addOns && Object.values(pricing.addOns).length > 0 && (
          <>
            <div className="pricing-page-title mt-8 mb-4">
              <h1 className="text-2xl font-bold text-slate-900">Add-Ons</h1>
            </div>
            <div className="add-ons-container mb-24 flex flex-wrap gap-2">
              {Object.values(pricing.addOns).map(addOn => (
                <AddOnElement
                  addOn={addOn}
                  currency={
                    pricing.currency in CURRENCIES
                      ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES]
                      : pricing.currency
                  }
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
