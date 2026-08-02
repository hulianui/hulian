"use client";
import { useState } from "react";
import { Zap, Building2, Rocket, CreditCard, Wallet, Banknote } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ChoiceboxGroup, Choicebox } from "../../../../packages/ui/src/choicebox/choicebox";
import { Tag } from "../../../../packages/ui/src/tag/tag";
function Plans() {
    const [v, setV] = useState<string | string[]>("pro");
    return (<ChoiceboxGroup value={v} onValueChange={setV} aria-label="Subscription Package" className="w-80">
      <Choicebox value="free" icon={<Zap />} title="Basic version" description="Personal project · Free forever">
        <div className="mt-1 font-semibold">¥0</div>
      </Choicebox>
      <Choicebox value="pro" icon={<Rocket />} title={<span className="flex items-center gap-2">Professional Edition <Tag tone="brand" size="sm">Recommended</Tag></span>} description="Small Team · Includes all components and updates">
        <div className="mt-1 font-semibold">¥39/month</div>
      </Choicebox>
      <Choicebox value="ent" icon={<Building2 />} title="Enterprise Edition" description="Private deployment · Dedicated support">
        <div className="mt-1 font-semibold">Contact Sales</div>
      </Choicebox>
    </ChoiceboxGroup>);
}
function Payments() {
    const [v, setV] = useState<string | string[]>([]);
    return (<ChoiceboxGroup multiple value={v} onValueChange={setV} columns={1} aria-label="Payment method" className="w-72">
      <Choicebox value="card" icon={<CreditCard />} title="Bank card" description="Debit Card/Credit Card"/>
      <Choicebox value="wallet" icon={<Wallet />} title="Electronic Wallet" description="WeChat / Alipay"/>
      <Choicebox value="cash" icon={<Banknote />} title="Cash on delivery" disabled description="This region is not supported yet."/>
    </ChoiceboxGroup>);
}
export const choiceboxShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic radio selection",
            description: "Card-based single selection, for uncontrolled use defaultValue; each item can have an icon/title/description/additional content.",
            code: `<ChoiceboxGroup defaultValue="pro" aria-label="Subscription Package" className="w-80">
  <Choicebox value="free" icon={<Zap />} title="Basic version" description="Personal project \u00B7 Free forever">
    <div className="mt-1 font-semibold">\u00A50</div>
  </Choicebox>
  <Choicebox value="pro" icon={<Rocket />} title="Professional Edition" description="Small Team \u00B7 Includes All Components">
    <div className="mt-1 font-semibold">\u00A539/month</div>
  </Choicebox>
</ChoiceboxGroup>`,
            render: () => (<ChoiceboxGroup defaultValue="pro" aria-label="Subscription Package" className="w-80">
          <Choicebox value="free" icon={<Zap />} title="Basic version" description="Personal project · Free forever">
            <div className="mt-1 font-semibold">¥0</div>
          </Choicebox>
          <Choicebox value="pro" icon={<Rocket />} title="Professional Edition" description="Small Team · Includes all components">
            <div className="mt-1 font-semibold">¥39/month</div>
          </Choicebox>
        </ChoiceboxGroup>),
        },
        {
            title: "Multiple selection + disabled items",
            description: "multiple switches to multi-select semantics; single-item disabled locks the card.",
            code: `<ChoiceboxGroup multiple defaultValue={["card"]} columns={1} aria-label="Payment method" className="w-72">
  <Choicebox value="card" icon={<CreditCard />} title="Bank Card" description="Debit Card/Credit Card" />
  <Choicebox value="wallet" icon={<Wallet />} title="Electronic Wallet" description="WeChat/Alipay" />
  <Choicebox value="cash" icon={<Banknote />} title="Cash on delivery" disabled description="This region is not supported yet" />
</ChoiceboxGroup>`,
            render: () => (<ChoiceboxGroup multiple defaultValue={["card"]} columns={1} aria-label="Payment method" className="w-72">
          <Choicebox value="card" icon={<CreditCard />} title="Bank card" description="Debit Card/Credit Card"/>
          <Choicebox value="wallet" icon={<Wallet />} title="Electronic Wallet" description="WeChat / Alipay"/>
          <Choicebox value="cash" icon={<Banknote />} title="Cash on delivery" disabled description="This region is not supported yet."/>
        </ChoiceboxGroup>),
        },
        {
            title: "Two column grid",
            description: "columns Controls the number of grid columns, suitable for compact options without icons.",
            code: `<ChoiceboxGroup defaultValue="b" columns={2} aria-label="Theme" className="w-[28rem]">
  <Choicebox value="a" title="Light color" description="Bright interface" />
  <Choicebox value="b" title="Dark" description="Dark interface" />
  <Choicebox value="c" title="Follow the system" description="Automatic switching" />
  <Choicebox value="d" title="High contrast" description="Barrier-free" />
</ChoiceboxGroup>`,
            render: () => (<ChoiceboxGroup defaultValue="b" columns={2} aria-label="Theme" className="w-[28rem]">
          <Choicebox value="a" title="Light color" description="Bright interface"/>
          <Choicebox value="b" title="Dark" description="Dark interface"/>
          <Choicebox value="c" title="Follow the system" description="Automatic switching"/>
          <Choicebox value="d" title="High contrast" description="Accessibility"/>
        </ChoiceboxGroup>),
        },
    ],
    controls: [
        { prop: "multiple", type: "boolean", defaultValue: false },
        { prop: "columns", type: "number", defaultValue: 1 },
    ],
    states: [
        { name: "Single choice package card (controlled)", render: () => <Plans /> },
        { name: "Multiple payment methods (includes disabled items)", render: () => <Payments /> },
        {
            name: "Two column grid",
            render: () => (<ChoiceboxGroup defaultValue="b" columns={2} aria-label="Theme" className="w-[28rem]">
          <Choicebox value="a" title="Light color" description="Bright interface"/>
          <Choicebox value="b" title="Dark" description="Dark interface"/>
          <Choicebox value="c" title="Follow the system" description="Automatic switching"/>
          <Choicebox value="d" title="High contrast" description="Accessibility"/>
        </ChoiceboxGroup>),
        },
    ],
    renderWithProps: (p) => (<ChoiceboxGroup multiple={p.multiple as boolean} defaultValue={p.multiple ? ["a"] : "a"} columns={Number(p.columns) || 1} aria-label="Example" className="w-80">
      <Choicebox value="a" title="Option A" description="Description of the first option"/>
      <Choicebox value="b" title="Option B" description="Description of the second option"/>
    </ChoiceboxGroup>),
    toCode: (p) => `<ChoiceboxGroup${p.multiple ? " multiple" : ""}${Number(p.columns) > 1 ? ` columns={${p.columns}}` : ""} defaultValue="a">
  <Choicebox value="a" title="Option A" description="..." />
  <Choicebox value="b" title="Option B" description="..." />
</ChoiceboxGroup>`,
};
