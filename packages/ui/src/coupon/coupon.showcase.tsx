"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Coupon } from "./coupon";

type Kind = "amount" | "discount" | "shipping";
type Tone = "brand" | "danger" | "neutral";
type Status = "available" | "claimed" | "used" | "expired";

export const couponShowcase: ShowcaseSpec = {
  controls: [
    { prop: "kind", type: "select", options: ["amount", "discount", "shipping"], defaultValue: "amount" },
    { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
    { prop: "status", type: "select", options: ["available", "claimed", "used", "expired"], defaultValue: "available" },
    { prop: "shine", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "kinds",
      render: () => (
        <div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={50} threshold={299} title="全场通用满减券" scope="支持全部品类" validUntil="2026.06.30 前有效" onClaim={() => {}} />
          <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="数码专享折扣券" scope="仅限数码 3C" validUntil="本周内有效" onClaim={() => {}} />
          <Coupon kind="shipping" tone="neutral" title="全国包邮券" scope="偏远地区除外" validUntil="长期有效" onClaim={() => {}} />
        </div>
      ),
    },
    {
      name: "status",
      render: () => (
        <div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={20} threshold={99} title="可领取" status="available" onClaim={() => {}} />
          <Coupon kind="amount" amount={20} threshold={99} title="已领待用" status="claimed" onUse={() => {}} />
          <Coupon kind="amount" amount={20} threshold={99} title="已使用" status="used" />
          <Coupon kind="amount" amount={20} threshold={99} title="已过期" status="expired" />
        </div>
      ),
    },
    {
      name: "shine（扫光引导领取）",
      render: () => (
        <div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={50} threshold={299} title="全场通用满减券" scope="支持全部品类" validUntil="2026.06.30 前有效" shine onClaim={() => {}} />
          <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="数码专享折扣券" scope="仅限数码 3C" validUntil="本周内有效" shine onClaim={() => {}} />
        </div>
      ),
    },
    {
      name: "selectable",
      render: () => (
        <div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={30} threshold={199} title="结算选券（选中）" status="claimed" selected onSelect={() => {}} />
          <Coupon kind="discount" discount={9} threshold={0} title="结算选券（未选）" status="claimed" onSelect={() => {}} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="max-w-md">
      <Coupon
        kind={(p.kind as Kind) ?? "amount"}
        tone={(p.tone as Tone) ?? "brand"}
        status={(p.status as Status) ?? "available"}
        shine={Boolean(p.shine)}
        amount={50}
        discount={8.5}
        threshold={299}
        title="全场通用券"
        scope="支持全部品类"
        validUntil="2026.06.30 前有效"
        onClaim={() => {}}
        onUse={() => {}}
      />
    </div>
  ),
  toCode: (p) =>
    `<Coupon kind="${p.kind ?? "amount"}"${p.tone && p.tone !== "brand" ? ` tone="${p.tone}"` : ""} amount={50} threshold={299} title="全场通用券" status="${p.status ?? "available"}" onClaim={() => {}} />`,
};
