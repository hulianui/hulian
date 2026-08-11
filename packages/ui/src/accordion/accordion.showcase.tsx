"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";

const FAQ = [
  { v: "ship", q: "瑚琏怎么发版？", a: "本地 master 直接 commit，trunk-based，无 remote。三道门全绿即可。" },
  { v: "token", q: "颜色怎么适配明暗？", a: "只消费语义 token，禁写死裸值；Tailwind v4 dark variant 自动换肤。" },
  { v: "a11y", q: "无障碍谁兜底？", a: "焦点环/键盘/ARIA 全交给 Base UI primitive，瑚琏只换皮肤。" },
];

// plain 演示：面板里装的是一整块功能区（自带分隔线与逐行内边距），而不是一段短说明。
function PlainDemo() {
  return (
    <Accordion defaultValue={["role"]} className="w-80 max-w-full">
      <AccordionItem value="role">
        <AccordionTrigger>项目管理员权限</AccordionTrigger>
        <AccordionPanel plain>
          <div className="divide-y divide-border border-t border-border">
            {["创建项目", "归档项目", "邀请成员"].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-foreground"
              >
                {label}
                <span className="text-xs text-muted-foreground">已授予</span>
              </div>
            ))}
          </div>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

function Demo(props: { multiple?: boolean; defaultValue?: string[]; disabledItem?: boolean }) {
  return (
    <Accordion
      multiple={props.multiple}
      defaultValue={props.defaultValue}
      className="w-80 max-w-full"
    >
      {FAQ.map((f, i) => (
        <AccordionItem key={f.v} value={f.v} disabled={props.disabledItem && i === 1}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionPanel>{f.a}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export const accordionShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "单开模式：同一时刻最多展开一项，点击标题切换。",
      code: `<Accordion className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>
    <AccordionPanel>本地 master 直接 commit，trunk-based，三道门全绿即可。</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token">
    <AccordionTrigger>颜色怎么适配明暗？</AccordionTrigger>
    <AccordionPanel>只消费语义 token，Tailwind v4 dark variant 自动换肤。</AccordionPanel>
  </AccordionItem>
</Accordion>`,
      render: () => <Demo multiple={false} />,
    },
    {
      title: "默认展开",
      description: "用 defaultValue 指定初始展开的项（非受控）。",
      code: `<Accordion defaultValue={["ship"]} className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>
    <AccordionPanel>本地 master 直接 commit。</AccordionPanel>
  </AccordionItem>
  {/* …更多 item */}
</Accordion>`,
      render: () => <Demo multiple={false} defaultValue={["ship"]} />,
    },
    {
      title: "多开",
      description: "multiple 允许同时展开多项。",
      code: `<Accordion multiple defaultValue={["ship", "token"]} className="w-80">
  {/* item 同上 */}
</Accordion>`,
      render: () => <Demo multiple defaultValue={["ship", "token"]} />,
    },
    {
      title: "禁用项",
      description: "在 AccordionItem 上加 disabled，该项不可展开且置灰。",
      code: `<Accordion defaultValue={["ship"]} className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>
    <AccordionPanel>本地 master 直接 commit。</AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token" disabled>
    <AccordionTrigger>颜色怎么适配明暗？</AccordionTrigger>
    <AccordionPanel>不可展开。</AccordionPanel>
  </AccordionItem>
</Accordion>`,
      render: () => <Demo disabledItem defaultValue={["ship"]} />,
    },
    {
      title: "不画皮的面板",
      description:
        "AccordionPanel 加 plain：不渲染内层皮肤 div。面板里装整块功能区时用它，否则内容会被染成次要色、内边距也会双份。",
      code: `<AccordionPanel plain>
  <div className="divide-y divide-border border-t border-border">
    {rows.map((r) => (
      <div key={r} className="flex items-center justify-between px-4 py-3 text-sm text-foreground">
        {r}
        <span className="text-xs text-muted-foreground">已授予</span>
      </div>
    ))}
  </div>
</AccordionPanel>`,
      render: () => <PlainDemo />,
    },
  ],
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多开）" },
    { prop: "disabledItem", type: "boolean", defaultValue: false, label: "禁用第二项" },
  ],
  states: [
    { name: "单开（默认收起）", render: () => <Demo multiple={false} /> },
    { name: "单开·首项展开", render: () => <Demo multiple={false} defaultValue={["ship"]} /> },
    { name: "多开", render: () => <Demo multiple defaultValue={["ship", "token"]} /> },
    { name: "含禁用项", render: () => <Demo disabledItem defaultValue={["ship"]} /> },
    { name: "plain（不画皮的面板）", render: () => <PlainDemo /> },
  ],
  renderWithProps: (p) => (
    <Demo
      multiple={p.multiple as boolean}
      disabledItem={p.disabledItem as boolean}
      defaultValue={["ship"]}
    />
  ),
  toCode: (p) =>
    `<Accordion${p.multiple ? " multiple" : ""} defaultValue={["ship"]}>\n  <AccordionItem value="ship">\n    <AccordionTrigger>瑚琏怎么发版？</AccordionTrigger>\n    <AccordionPanel>本地 master 直接 commit…</AccordionPanel>\n  </AccordionItem>\n  {/* …更多 item */}\n</Accordion>`,
};
