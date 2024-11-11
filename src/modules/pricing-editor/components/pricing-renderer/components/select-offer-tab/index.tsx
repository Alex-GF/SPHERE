import { BilledType, RenderingStyles } from "../../types";
import { DEFAULT_RENDERING_STYLES } from "../..";

export default function SelectOfferTab({
  selectedBilledType,
  handleSwitchTab,
  style,
}: Readonly<{
  selectedBilledType: BilledType;
  handleSwitchTab: (tab: BilledType) => void;
  style: RenderingStyles;
}>): JSX.Element {
  return (
    <div
      className="radio-inputs"
      style={{
        backgroundColor:
          style.billingSelectionBackgroundColor ??
          DEFAULT_RENDERING_STYLES.billingSelectionBackgroundColor,
      }}
    >
      <label className="radio">
        <input
          type="radio"
          name="radio"
          onClick={() => handleSwitchTab("monthly")}
          checked={selectedBilledType === "monthly"}
        />
        <span
          className="name"
          style={{
            color:
              style.billingSelectionTextColor ??
              DEFAULT_RENDERING_STYLES.billingSelectionTextColor,
            backgroundColor:
              selectedBilledType === "monthly"
                ? style.billingSelectionColor ??
                  DEFAULT_RENDERING_STYLES.billingSelectionColor
                : "transparent",
          }}
        >
          Monthly
        </span>
      </label>
      <label className="radio">
        <input
          type="radio"
          name="radio"
          onClick={() => handleSwitchTab("annually")}
          checked={selectedBilledType === "annually"}
        />
        <span
          className="name"
          style={{
            color:
              style.billingSelectionTextColor ??
              DEFAULT_RENDERING_STYLES.billingSelectionTextColor,
            backgroundColor:
              selectedBilledType === "annually"
                ? style.billingSelectionColor ??
                  DEFAULT_RENDERING_STYLES.billingSelectionColor
                : "transparent",
          }}
        >
          Annually
        </span>
      </label>
    </div>
  );
}
