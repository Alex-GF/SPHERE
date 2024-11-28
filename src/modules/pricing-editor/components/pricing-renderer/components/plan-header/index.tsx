import {Plan} from "pricing4ts";
import { RenderingStyles } from "../../types";
import {DEFAULT_RENDERING_STYLES} from "../..";

export default function PlanHeader({
    plan,
    currency,
    style,
  }: Readonly<{
    plan: Plan;
    currency: string;
    style: RenderingStyles;
  }>): JSX.Element {
    return (
      <th scope="col" className="plan-col">
        <h2
          className="plan-heading"
          style={{ color: style.plansColor ?? DEFAULT_RENDERING_STYLES.plansColor }}
        >
          {plan.name}
        </h2>
        <p className="plan-price-container">
          {
            plan.price == 0 ?
            (
              <span
                className="plan-price"
                style={{ color: style.priceColor ?? DEFAULT_RENDERING_STYLES.priceColor }}
              >
                FREE
              </span>
            )
            :
            (
              <>
                <span
                  className="plan-price"
                  style={{ color: style.priceColor ?? DEFAULT_RENDERING_STYLES.priceColor }}
                >
                  {plan.price}
                  {typeof plan.price === 'number' ? currency : ''}
                </span>
                {typeof plan.price === 'number' &&
                <span
                  className="plan-period"
                  style={{ color: style.periodColor ?? DEFAULT_RENDERING_STYLES.periodColor }}
                >
                  {plan.unit ? plan.unit : "/month"}
                </span>
                }
              </>
            )
          }
        </p>
      </th>
    );
  }