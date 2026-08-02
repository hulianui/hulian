"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Coupon } from "../../../../packages/ui/src/coupon/coupon";
type Kind = "amount" | "discount" | "shipping";
type Tone = "brand" | "danger" | "neutral";
type Status = "available" | "claimed" | "used" | "expired";
export const couponShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Coupon type",
            description: "kind determines the main visual of the denomination area: amount full discount / discount discount / shipping free shipping.",
            code: `<div className="grid max-w-md gap-3">
  <Coupon kind="amount" amount={50} threshold={299} title="Universal discount coupon for the entire site" scope="Supports all categories" validUntil="Valid before 2026.06.30" onClaim={() => {}} />
  <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="Digital exclusive discount coupon" scope="Digital only 3C" validUntil="Valid within this week" onClaim={() => {}} />
  <Coupon kind="shipping" tone="neutral" title="Nationwide free shipping coupon" scope="Except for remote areas" validUntil="Long-term effective" onClaim={() => {}} />
</div>`,
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={50} threshold={299} title="General discount coupons for the entire site" scope="Supports all categories" validUntil="Valid until 2026.06.30" onClaim={() => { }}/>
          <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="Digital exclusive discount coupon" scope="Digital only 3C" validUntil="Valid this week" onClaim={() => { }}/>
          <Coupon kind="shipping" tone="neutral" title="Nationwide free shipping coupon" scope="Except for remote areas" validUntil="Valid for a long time" onClaim={() => { }}/>
        </div>),
        },
        {
            title: "Status transfer",
            description: "status Driver operating area copy and gray: Available \u2192 Received and ready for use \u2192 Used / Expired.",
            code: `<div className="grid max-w-md gap-3">
  <Coupon kind="amount" amount={20} threshold={99} title="Can be collected" status="available" onClaim={() => {}} />
  <Coupon kind="amount" amount={20} threshold={99} title="Received and ready for use" status="claimed" onUse={() => {}} />
  <Coupon kind="amount" amount={20} threshold={99} title="Already used" status="used" />
  <Coupon kind="amount" amount={20} threshold={99} title="Expired" status="expired" />
</div>`,
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={20} threshold={99} title="Available for collection" status="available" onClaim={() => { }}/>
          <Coupon kind="amount" amount={20} threshold={99} title="Already received and ready for use" status="claimed" onUse={() => { }}/>
          <Coupon kind="amount" amount={20} threshold={99} title="Used" status="used"/>
          <Coupon kind="amount" amount={20} threshold={99} title="Expired" status="expired"/>
        </div>),
        },
        {
            title: "Scanning guide",
            description: "shine allows the denomination area to periodically pass through the highlight band to guide users to receive it; used/expired coupons are automatically not displayed.",
            code: `<Coupon kind="amount" amount={50} threshold={299} title="Limited time discount coupon" scope="Supports all categories" validUntil="Valid before 2026.06.30" shine onClaim={() => {}} />`,
            render: () => (<div className="max-w-md">
          <Coupon kind="amount" amount={50} threshold={299} title="Limited time discount coupons" scope="Supports all categories" validUntil="Valid until 2026.06.30" shine onClaim={() => { }}/>
        </div>),
        },
        {
            title: "Settlement and Selection",
            description: "Pass onSelect to make the entire coupon clickable, and selected to highlight ring for coupon selection on the settlement page.",
            code: `<div className="grid max-w-md gap-3">
  <Coupon kind="amount" amount={30} threshold={199} title="Settlement Selection (Selected)" status="claimed" selected onSelect={() => {}} />
  <Coupon kind="discount" discount={9} threshold={0} title="Settlement Selection (Not Selected)" status="claimed" onSelect={() => {}} />
</div>`,
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={30} threshold={199} title="Settlement Selection (Selected)" status="claimed" selected onSelect={() => { }}/>
          <Coupon kind="discount" discount={9} threshold={0} title="Settlement ticket selection (not selected)" status="claimed" onSelect={() => { }}/>
        </div>),
        },
    ],
    controls: [
        { prop: "kind", type: "select", options: ["amount", "discount", "shipping"], defaultValue: "amount" },
        { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
        { prop: "status", type: "select", options: ["available", "claimed", "used", "expired"], defaultValue: "available" },
        { prop: "shine", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "kinds",
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={50} threshold={299} title="General discount coupons for the entire site" scope="Supports all categories" validUntil="Valid until 2026.06.30" onClaim={() => { }}/>
          <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="Digital exclusive discount coupon" scope="Digital only 3C" validUntil="Valid this week" onClaim={() => { }}/>
          <Coupon kind="shipping" tone="neutral" title="Nationwide free shipping coupon" scope="Except for remote areas" validUntil="Valid for a long time" onClaim={() => { }}/>
        </div>),
        },
        {
            name: "status",
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={20} threshold={99} title="Available for collection" status="available" onClaim={() => { }}/>
          <Coupon kind="amount" amount={20} threshold={99} title="Already received and ready for use" status="claimed" onUse={() => { }}/>
          <Coupon kind="amount" amount={20} threshold={99} title="Used" status="used"/>
          <Coupon kind="amount" amount={20} threshold={99} title="Expired" status="expired"/>
        </div>),
        },
        {
            name: "shine (scanning guide to collect)",
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={50} threshold={299} title="General discount coupons for the entire site" scope="Supports all categories" validUntil="Valid until 2026.06.30" shine onClaim={() => { }}/>
          <Coupon kind="discount" discount={8.5} threshold={199} tone="danger" title="Digital exclusive discount coupon" scope="Digital only 3C" validUntil="Valid this week" shine onClaim={() => { }}/>
        </div>),
        },
        {
            name: "selectable",
            render: () => (<div className="grid max-w-md gap-3">
          <Coupon kind="amount" amount={30} threshold={199} title="Settlement Selection (Selected)" status="claimed" selected onSelect={() => { }}/>
          <Coupon kind="discount" discount={9} threshold={0} title="Settlement ticket selection (not selected)" status="claimed" onSelect={() => { }}/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<div className="max-w-md">
      <Coupon kind={(p.kind as Kind) ?? "amount"} tone={(p.tone as Tone) ?? "brand"} status={(p.status as Status) ?? "available"} shine={Boolean(p.shine)} amount={50} discount={8.5} threshold={299} title="All tickets" scope="Supports all categories" validUntil="Valid until 2026.06.30" onClaim={() => { }} onUse={() => { }}/>
    </div>),
    toCode: (p) => `<Coupon kind="${p.kind ?? "amount"}"${p.tone && p.tone !== "brand" ? ` tone="${p.tone}"` : ""} amount={50} threshold={299} title="Universal coupon" status="${p.status ?? "available"}" onClaim={() => {}} />`,
};
