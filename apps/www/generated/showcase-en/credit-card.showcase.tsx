"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CreditCard } from "../../../../packages/ui/src/credit-card/credit-card";
import { Button } from "../../../../packages/ui/src/button/button";
function Flippable() {
    const [flipped, setFlipped] = useState(false);
    return (<div className="flex flex-col items-start gap-3">
      <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped={flipped}/>
      <Button size="sm" variant="outline" onClick={() => setFlipped((f) => !f)}>
        Turn over to view {flipped ? "Front" : "Back"}
      </Button>
    </div>);
}
export const creditCardShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Just enter the card number, cardholder, and validity period, and the brand will be automatically identified by the card number prefix.",
            code: `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />`,
            render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28"/>,
        },
        {
            title: "Automatic brand recognition",
            description: "Different card number prefixes are mapped to different card organization skins (Visa / Mastercard / UnionPay...).",
            code: `<>
  <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />
  <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26" />
  <CreditCard number="6212345678901232" holder="Zhao Liu" expiry="11/27" />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28"/>
          <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26"/>
          <CreditCard number="6212345678901232" holder="Zhao Liu" expiry="11/27"/>
        </div>),
        },
        {
            title: "Show full card number",
            description: "Display the complete card number when masked={false} (only used in security scenarios).",
            code: `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false} />`,
            render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false}/>,
        },
        {
            title: "Front and back",
            description: "flipped Flip to the back to reveal the magnetic strip and CVC.",
            code: `<>
  <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" />
  <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped />
</>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27"/>
          <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped/>
        </div>),
        },
        {
            title: "Empty card space",
            description: "Render the placeholder card surface when the card number is empty, which can be used for the initial state of real-time preview of form entry.",
            code: `<CreditCard number="" />`,
            render: () => <CreditCard number=""/>,
        },
    ],
    controls: [
        { prop: "masked", type: "boolean", defaultValue: true },
        { prop: "flipped", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "Automatic brand recognition",
            render: () => (<div className="flex flex-wrap gap-4">
          <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28"/>
          <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26"/>
        </div>),
        },
        {
            name: "More card organizations",
            render: () => (<div className="flex flex-wrap gap-4">
          <CreditCard number="371449635398431" holder="JOHN DOE" expiry="03/29"/>
          <CreditCard number="6212345678901232" holder="Zhao Liu" expiry="11/27"/>
        </div>),
        },
        {
            name: "Complete card number (masked=false)",
            render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false}/>,
        },
        {
            name: "Switch between front and back",
            render: () => <Flippable />,
        },
        {
            name: "Empty card space",
            render: () => <CreditCard number=""/>,
        },
    ],
    renderWithProps: (p) => (<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" cvc="123" masked={p.masked as boolean} flipped={p.flipped as boolean}/>),
    toCode: (p) => `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28"${p.masked === false ? " masked={false}" : ""}${p.flipped ? " flipped cvc=\"123\"" : ""} />`,
};
