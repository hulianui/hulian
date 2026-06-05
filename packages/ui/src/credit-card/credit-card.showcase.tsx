"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CreditCard } from "./credit-card";
import { Button } from "../button/button";

function Flippable() {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col items-start gap-3">
      <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped={flipped} />
      <Button size="sm" variant="outline" onClick={() => setFlipped((f) => !f)}>
        翻面查看 {flipped ? "正面" : "背面"}
      </Button>
    </div>
  );
}

export const creditCardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "masked", type: "boolean", defaultValue: true },
    { prop: "flipped", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "品牌自动识别",
      render: () => (
        <div className="flex flex-wrap gap-4">
          <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />
          <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26" />
        </div>
      ),
    },
    {
      name: "更多卡组织",
      render: () => (
        <div className="flex flex-wrap gap-4">
          <CreditCard number="371449635398431" holder="JOHN DOE" expiry="03/29" />
          <CreditCard number="6212345678901232" holder="赵六" expiry="11/27" />
        </div>
      ),
    },
    {
      name: "完整卡号（masked=false）",
      render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false} />,
    },
    {
      name: "正反面切换",
      render: () => <Flippable />,
    },
    {
      name: "空卡占位",
      render: () => <CreditCard number="" />,
    },
  ],
  renderWithProps: (p) => (
    <CreditCard
      number="4111111111111111"
      holder="ZHANG SAN"
      expiry="12/28"
      cvc="123"
      masked={p.masked as boolean}
      flipped={p.flipped as boolean}
    />
  ),
  toCode: (p) =>
    `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28"${p.masked === false ? " masked={false}" : ""}${p.flipped ? " flipped cvc=\"123\"" : ""} />`,
};
