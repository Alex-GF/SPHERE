// MultiSelectCards.tsx
import { useEffect, useState } from 'react';
//ts-ignore
import { Grid2 } from '@mui/material';
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
          setPricings(data.pricings.pricings.map((pricing: any) => pricing.name));
        }
      })
      .catch(error => {
        console.error('Cannot GET pricings. Error:', error);
      })
  }, [])

  return (
    <Grid2 container spacing={2} sx={{border: '1px solid #ccc', borderRadius: 4, padding: 2}}>
      {pricings ? pricings.map((name: string) => (
        <Grid2 key={name}>
          <SelectablePricingCard
            name={name}
            selected={value.includes(name)}
            onClick={() => handleCardClick(name)}
          />
        </Grid2>
      ))
      :
      <Grid2>
        You have no pricings without collection
      </Grid2>
    }
    </Grid2>
  );
}
