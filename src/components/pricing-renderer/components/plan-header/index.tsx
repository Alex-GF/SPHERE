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
          <span
            className="plan-price"
            style={{ color: style.priceColor ?? DEFAULT_RENDERING_STYLES.priceColor }}
          >
            {plan.price}
            {currency}
          </span>
          <span
            className="plan-period"
            style={{ color: style.periodColor ?? DEFAULT_RENDERING_STYLES.periodColor }}
          >
            /month
          </span>
        </p>
      </th>
    );
  }