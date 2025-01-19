import { RenderingStyles } from '../../types';
import { DEFAULT_RENDERING_STYLES } from '../..';
import { pluralizeUnit } from '../../../../services/pricing.service';
import { Tooltip, Typography } from '@mui/material';
import { RiErrorWarningFill } from 'react-icons/ri';

export default function PricingElement({
  name,
  values,
  style,
}: Readonly<{
  name: string;
  values: {
    value: string | number | boolean;
    unit?: string;
    addonName: string | null;
    addonValue: string | number | boolean | null;
    addonExtension: boolean;
  }[];
  style: RenderingStyles;
}>): JSX.Element {
  return (
    <tr>
      <th
        scope="row"
        className="row-header divide-y"
        style={{
          borderTopColor: style.dividerColor ?? DEFAULT_RENDERING_STYLES.dividerColor,
        }}
      >
        <h3 style={{ color: style.namesColor ?? DEFAULT_RENDERING_STYLES.namesColor }}>{name}</h3>
      </th>
      {values.map(({ value, unit, addonName, addonValue, addonExtension }, key) => {
        if (typeof value === 'boolean') {
          return (
            <td
              className="divide-y"
              style={{
                borderTopColor: style.dividerColor ?? DEFAULT_RENDERING_STYLES.dividerColor,
              }}
              key={`${name}-${key}`}
            >
              {value ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="Included"
                  className="icon-check"
                  style={{
                    color: style.checkColor ?? DEFAULT_RENDERING_STYLES.checkColor,
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              ) : addonValue ? (
                <Typography variant="h6">Add-on</Typography>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-label="Not included"
                  className="icon-cross"
                  style={{
                    color: style.crossColor ?? DEFAULT_RENDERING_STYLES.crossColor,
                  }}
                >
                  <path
                    fillRule="evenodd"
                    d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              )}
            </td>
          );
        } else {
          return (
            <td
              className="divide-y"
              style={{
                borderTopColor: style.dividerColor ?? DEFAULT_RENDERING_STYLES.dividerColor,
              }}
              key={`${name}-${key}`}
            >
              <span
                className="text-value"
                style={{
                  color: style.valuesColor ?? DEFAULT_RENDERING_STYLES.valuesColor,
                }}
              >
                {(() => {
                  if (typeof value === 'number') {
                    if (addonValue && typeof addonValue === 'number' && addonValue !== 0) {
                      const valueToUse = addonExtension ? value - addonValue : value;

                      return valueToUse === 0
                        ? '-'
                        : `${valueToUse} ${valueToUse > 1 ? pluralizeUnit(unit ?? '') : unit}`;
                    } else {
                      return value === 0
                        ? '-'
                        : `${value} ${value > 1 ? pluralizeUnit(unit ?? '') : unit}`;
                    }
                  }
                  return value;
                })()}
                {typeof value == 'number' &&
                addonValue &&
                ((!addonExtension && (addonValue as number) > value) || addonExtension) &&
                (addonValue as number) > 0 ? (
                  <Tooltip
                    title={`${
                      addonExtension
                        ? `You can contract ${addonValue} more ${
                            (addonValue as number) > 1 ? pluralizeUnit(unit ?? '') : unit
                          } by contracting the add-on '${addonName!}'`
                        : `You can extend this limit up to ${addonValue} ${
                            (addonValue as number) > 1 ? pluralizeUnit(unit ?? '') : unit
                          } by contracting the add-on '${addonName!}'`
                    }`}
                    placement="top"
                  >
                    <span>
                      <RiErrorWarningFill />
                    </span>
                  </Tooltip>
                ) : (
                  <></>
                )}
              </span>
            </td>
          );
        }
      })}
    </tr>
  );
}
