import { Plan } from "pricing4ts";
import { PricingData, BilledType, RenderingStyles, PricingProps } from "./types.d";
import {
  getPricingData,
} from "./services/pricing.service";
import { useState } from "react";
import "./styles.css";

import PlanHeader from "./components/plan-header";
import PricingElement from "./components/pricing-element";
import AddOnElement from "./components/addon-element";


export const DEFAULT_RENDERING_STYLES: RenderingStyles = {
  plansColor: "#000000",
  priceColor: "#000000",
  periodColor: "#000000",
  headerColor: "#000000",
  namesColor: "#000000",
  valuesColor: "#000000",
  checkColor: "#000000",
  crossColor: "#000000",
  backgroundColor: "#f3f4f6",
  dividerColor: "#000000",
  billingSelectionColor: "#ffffff",
  billingSelectionBackgroundColor: "#EEE",
  billingSelectionTextColor: "#000000",
  addonBackgroundColor: "#ffffff",
  addonTextColor: "#000000",
};

export function PricingRenderer({
  pricing,
  errors,
  style,
}: Readonly<PricingProps>): JSX.Element {
  let pricingData: PricingData = getPricingData(pricing, errors);

  if (!style) {
    style = {};
  }

  // const [selectedBilledType, setSelectedBilledType] =
  //   useState<BilledType>("monthly");
  // function handleSwitchTab(tab: BilledType) {
  //   setSelectedBilledType(tab);
  // }

  return (
    <section
      style={{
        backgroundColor:
          style.backgroundColor ?? DEFAULT_RENDERING_STYLES.backgroundColor,
      }}
    >
      <div className="container">
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
        <table className="pricing-table">
          <thead>
            <tr>
              <th></th>
              {pricing.plans.map((plan: Plan, key: number) => (
                <PlanHeader
                  plan={plan}
                  currency={pricing.currency}
                  style={style}
                  key={`${plan.name}-${key}`}
                />
              ))}
            </tr>
          </thead>
          <tbody className="pricing-body">
            {Object.entries(pricingData).map(
              (
                [name, values]: [
                  string,
                  { value: string | number | boolean; unit?: string }[]
                ],
                key: number
              ) => (
                <PricingElement
                  name={name}
                  values={values}
                  style={style}
                  key={`${name}-${key}`}
                />
              )
            )}
          </tbody>
        </table>
        {pricing.addOns && (
          <>
            <div className="pricing-page-title" style={{color: style.headerColor ?? DEFAULT_RENDERING_STYLES.headerColor}}>
              <h1>Add-Ons</h1>
            </div>
            <div className="add-ons-container">
              {pricing.addOns.map((addOn, index) => {
                return <AddOnElement addOn={addOn} currency={pricing.currency} style={style} key={index}/>;
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
