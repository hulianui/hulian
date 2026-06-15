"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "./collapsible";

function Demo(p: Record<string, unknown>) {
  return (
    <Collapsible
      defaultOpen={p.defaultOpen as boolean}
      disabled={p.disabled as boolean}
      className="w-80"
    >
      <CollapsibleTrigger>瑚琏设计系统是什么？</CollapsibleTrigger>
      <CollapsiblePanel>
        瑚琏是从各家 React 库吸取最佳实现、统一成一套 API + 明暗 token 的吸取式聚合设计系统。
      </CollapsiblePanel>
    </Collapsible>
  );
}

export const collapsibleShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "点击标题展开 / 收起补充内容，默认折叠。",
      code: `<Collapsible className="w-80">
  <CollapsibleTrigger>展开查看详情</CollapsibleTrigger>
  <CollapsiblePanel>这里是默认折叠起来的补充内容，点击标题即可展开。</CollapsiblePanel>
</Collapsible>`,
      render: () => (
        <Collapsible className="w-80">
          <CollapsibleTrigger>展开查看详情</CollapsibleTrigger>
          <CollapsiblePanel>这里是默认折叠起来的补充内容，点击标题即可展开。</CollapsiblePanel>
        </Collapsible>
      ),
    },
    {
      title: "默认展开",
      description: "非受控用 defaultOpen 让面板初始即展开。",
      code: `<Collapsible defaultOpen className="w-80">
  <CollapsibleTrigger>收起详情</CollapsibleTrigger>
  <CollapsiblePanel>这里是默认展开的补充内容，再次点击标题即可收起。</CollapsiblePanel>
</Collapsible>`,
      render: () => (
        <Collapsible defaultOpen className="w-80">
          <CollapsibleTrigger>收起详情</CollapsibleTrigger>
          <CollapsiblePanel>这里是默认展开的补充内容，再次点击标题即可收起。</CollapsiblePanel>
        </Collapsible>
      ),
    },
    {
      title: "禁用态",
      description: "disabled 下触发器置灰且不可展开。",
      code: `<Collapsible disabled className="w-80">
  <CollapsibleTrigger>已禁用</CollapsibleTrigger>
  <CollapsiblePanel>禁用态下不可展开。</CollapsiblePanel>
</Collapsible>`,
      render: () => (
        <Collapsible disabled className="w-80">
          <CollapsibleTrigger>已禁用</CollapsibleTrigger>
          <CollapsiblePanel>禁用态下不可展开。</CollapsiblePanel>
        </Collapsible>
      ),
    },
  ],
  controls: [
    { prop: "defaultOpen", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    {
      name: "closed",
      render: () => (
        <Collapsible className="w-80">
          <CollapsibleTrigger>展开查看详情</CollapsibleTrigger>
          <CollapsiblePanel>这里是默认折叠起来的补充内容，点击标题即可展开。</CollapsiblePanel>
        </Collapsible>
      ),
    },
    {
      name: "open",
      render: () => (
        <Collapsible defaultOpen className="w-80">
          <CollapsibleTrigger>收起详情</CollapsibleTrigger>
          <CollapsiblePanel>这里是默认展开的补充内容，再次点击标题即可收起。</CollapsiblePanel>
        </Collapsible>
      ),
    },
    {
      name: "disabled",
      render: () => (
        <Collapsible disabled className="w-80">
          <CollapsibleTrigger>已禁用</CollapsibleTrigger>
          <CollapsiblePanel>禁用态下不可展开。</CollapsiblePanel>
        </Collapsible>
      ),
    },
  ],
  renderWithProps: (p) => <Demo {...p} />,
  toCode: (p) =>
    `<Collapsible${p.defaultOpen ? " defaultOpen" : ""}${p.disabled ? " disabled" : ""}>\n  <CollapsibleTrigger>标题</CollapsibleTrigger>\n  <CollapsiblePanel>内容</CollapsiblePanel>\n</Collapsible>`,
};
