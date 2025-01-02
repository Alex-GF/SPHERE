import { Pricing } from "pricing4ts";
import { RenderingStyles } from "../../types";

export default function PricingCard({pricing, style, defaultStyle}: {pricing: Pricing, style: RenderingStyles, defaultStyle: RenderingStyles}){
    return(
        <div className='pricing-info' style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: style.headerColor ?? defaultStyle.headerColor }}>
            {pricing?.saasName}
          </h2>
          <div
            style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <strong>Plans:</strong> {pricing.plans?.length}
            </div>
            <div>
              <strong>Add-ons:</strong> {pricing.addOns?.length || 0}
            </div>
            {/* <div>
              <strong>Number of subscriptions:</strong> 0
            </div>
            <div>
              <strong>Success rate:</strong> 0.00
            </div> */}
          </div>
        </div>
    );
}