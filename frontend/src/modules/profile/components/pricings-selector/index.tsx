// MultiSelectCards.tsx
import { useEffect, useState } from 'react';
import SelectablePricingCard from '../selectable-pricing-card';
import { usePricingsApi } from '../../../pricing/api/pricingsApi';

type MultiSelectCardsProps = {
  readonly value: string[];
  readonly onChange: (selectedNames: string[]) => void;
};

export default function PricingSelector({ value, onChange }: MultiSelectCardsProps) {
  const [pricings, setPricings] = useState<string[]>([]);

  const {getLoggedUserPricings} = usePricingsApi();

  const handleCardClick = (name: string) => {
    let newSelected: string[];
    if (value.includes(name)) {
      newSelected = value.filter(item => item !== name);
    } else {
      newSelected = [...value, name];
    }

    onChange(newSelected);
  };

  useEffect(() => {
    getLoggedUserPricings()
      .then(data => {
        if (data.error) {
          throw new Error(data.error);
        } else if (data.pricings) {
          setPricings(data.pricings.map((pricing: any) => pricing.name));
        }
      })
      .catch(error => {
        console.error('Cannot GET pricings. Error:', error);
      })
  }, [])

  return pricings.length > 0 ? (
    <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#ccc] p-2 md:grid-cols-2 lg:grid-cols-3">
      {pricings ? pricings.map((name: string) => (
        <div key={name}>
          <SelectablePricingCard
            name={name}
            selected={value.includes(name)}
            onClick={() => handleCardClick(name)}
          />
        </div>
      ))
      :
      <div>
        You have no pricings without collection
      </div>
    }
    </div>
  ) : <></>;
}
