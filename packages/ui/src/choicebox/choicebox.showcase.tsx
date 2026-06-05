"use client";
import { useState } from "react";
import { Zap, Building2, Rocket, CreditCard, Wallet, Banknote } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { ChoiceboxGroup, Choicebox } from "./choicebox";
import { Tag } from "../tag/tag";

function Plans() {
  const [v, setV] = useState<string | string[]>("pro");
  return (
    <ChoiceboxGroup value={v} onValueChange={setV} aria-label="订阅套餐" className="w-80">
      <Choicebox value="free" icon={<Zap />} title="基础版" description="个人项目 · 永久免费">
        <div className="mt-1 font-semibold">¥0</div>
      </Choicebox>
      <Choicebox value="pro" icon={<Rocket />} title={<span className="flex items-center gap-2">专业版 <Tag tone="brand" size="sm">推荐</Tag></span>} description="小团队 · 含全部组件与更新">
        <div className="mt-1 font-semibold">¥39 / 月</div>
      </Choicebox>
      <Choicebox value="ent" icon={<Building2 />} title="企业版" description="私有部署 · 专属支持">
        <div className="mt-1 font-semibold">联系销售</div>
      </Choicebox>
    </ChoiceboxGroup>
  );
}

function Payments() {
  const [v, setV] = useState<string | string[]>([]);
  return (
    <ChoiceboxGroup multiple value={v} onValueChange={setV} columns={1} aria-label="支付方式" className="w-72">
      <Choicebox value="card" icon={<CreditCard />} title="银行卡" description="储蓄卡 / 信用卡" />
      <Choicebox value="wallet" icon={<Wallet />} title="电子钱包" description="微信 / 支付宝" />
      <Choicebox value="cash" icon={<Banknote />} title="货到付款" disabled description="该地区暂不支持" />
    </ChoiceboxGroup>
  );
}

export const choiceboxShowcase: ShowcaseSpec = {
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false },
    { prop: "columns", type: "number", defaultValue: 1 },
  ],
  states: [
    { name: "单选套餐卡（受控）", render: () => <Plans /> },
    { name: "多选支付方式（含禁用项）", render: () => <Payments /> },
    {
      name: "两列网格",
      render: () => (
        <ChoiceboxGroup defaultValue="b" columns={2} aria-label="主题" className="w-[28rem]">
          <Choicebox value="a" title="浅色" description="明亮界面" />
          <Choicebox value="b" title="深色" description="暗黑界面" />
          <Choicebox value="c" title="跟随系统" description="自动切换" />
          <Choicebox value="d" title="高对比" description="无障碍" />
        </ChoiceboxGroup>
      ),
    },
  ],
  renderWithProps: (p) => (
    <ChoiceboxGroup
      multiple={p.multiple as boolean}
      defaultValue={p.multiple ? ["a"] : "a"}
      columns={Number(p.columns) || 1}
      aria-label="示例"
      className="w-80"
    >
      <Choicebox value="a" title="选项 A" description="第一个选项的描述" />
      <Choicebox value="b" title="选项 B" description="第二个选项的描述" />
    </ChoiceboxGroup>
  ),
  toCode: (p) =>
    `<ChoiceboxGroup${p.multiple ? " multiple" : ""}${Number(p.columns) > 1 ? ` columns={${p.columns}}` : ""} defaultValue="a">\n  <Choicebox value="a" title="选项 A" description="…" />\n  <Choicebox value="b" title="选项 B" description="…" />\n</ChoiceboxGroup>`,
};
