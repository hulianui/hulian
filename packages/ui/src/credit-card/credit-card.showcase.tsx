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
  examples: [
    {
      title: "基础用法",
      description: "传入卡号、持卡人、有效期即可，品牌由卡号前缀自动识别。",
      code: `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />`,
      render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />,
    },
    {
      title: "品牌自动识别",
      description: "不同卡号前缀映射到不同卡组织皮肤（Visa / Mastercard / 银联 …）。",
      code: `<>
  <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />
  <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26" />
  <CreditCard number="6212345678901232" holder="赵六" expiry="11/27" />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" />
          <CreditCard number="5500005555555559" holder="WANG WU" expiry="06/26" />
          <CreditCard number="6212345678901232" holder="赵六" expiry="11/27" />
        </div>
      ),
    },
    {
      title: "显示完整卡号",
      description: "masked={false} 时展示完整卡号（仅在安全场景使用）。",
      code: `<CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false} />`,
      render: () => <CreditCard number="4111111111111111" holder="ZHANG SAN" expiry="12/28" masked={false} />,
    },
    {
      title: "正反面",
      description: "flipped 翻到背面展示磁条与 CVC。",
      code: `<>
  <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" />
  <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped />
</>`,
      render: () => (
        <div className="flex flex-wrap gap-4">
          <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" />
          <CreditCard number="5500005555555559" holder="LI LEI" expiry="08/27" cvc="321" flipped />
        </div>
      ),
    },
    {
      title: "空卡占位",
      description: "卡号为空时渲染占位卡面，可用于表单录入实时预览的初始态。",
      code: `<CreditCard number="" />`,
      render: () => <CreditCard number="" />,
    },
  ],
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
