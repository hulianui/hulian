"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";

const FAQ = [
  { v: "ship", q: "瑚琏怎么发版？", a: "本地 master 直接 commit，trunk-based，无 remote。三道门全绿即可。" },
  { v: "token", q: "颜色怎么适配明暗？", a: "只消费语义 token，禁写死裸值；Tailwind v4 dark variant 自动换肤。" },
  { v: "a11y", q: "无障碍谁兜底？", a: "焦点环/键盘/ARIA 全交给 Base UI primitive，瑚琏只换皮肤。" },
];

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
  controls: [
    { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple（多开）" },
    { prop: "disabledItem", type: "boolean", defaultValue: false, label: "禁用第二项" },
  ],
  states: [
    { name: "单开（默认收起）", render: () => <Demo multiple={false} /> },
    { name: "单开·首项展开", render: () => <Demo multiple={false} defaultValue={["ship"]} /> },
    { name: "多开", render: () => <Demo multiple defaultValue={["ship", "token"]} /> },
    { name: "含禁用项", render: () => <Demo disabledItem defaultValue={["ship"]} /> },
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
