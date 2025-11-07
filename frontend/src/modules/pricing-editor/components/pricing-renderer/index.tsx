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
import { Button } from '@mui/material';

export function PricingRenderer({
  pricing,
  style,
  onApplyVariables,
}: Readonly<PricingProps>): JSX.Element {
  style ??= {};
  const [variablesModalOpen, setVariablesModalOpen] = useState(false);

  // UI billing selector currently disabled in renderer

  return (
    <section
      style={{
        backgroundColor: style.backgroundColor ?? DEFAULT_RENDERING_STYLES.backgroundColor,
      }}
    >
      <div className="container">
        <PricingCard pricing={pricing} style={style} defaultStyle={DEFAULT_RENDERING_STYLES} />

        {/* Variables editor trigger - placed before features table */}

        {Object.keys(pricing.variables).length > 0 && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              <Button variant="outlined" size="small" onClick={() => setVariablesModalOpen(true)}>
                Open variables calculator
              </Button>
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
            <div
              className="pricing-page-title"
              style={{ color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor }}
            >
              <h1>Add-Ons</h1>
            </div>
            <div className="add-ons-container" style={{ marginBottom: '100px' }}>
              {Object.values(pricing.addOns).map(addOn => (
                <AddOnElement
                  addOn={addOn}
                  currency={
                    pricing.currency in CURRENCIES
                      ? CURRENCIES[pricing.currency as keyof typeof CURRENCIES]
                      : pricing.currency
                  }
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
