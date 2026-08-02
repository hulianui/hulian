"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "../../../../packages/ui/src/accordion/accordion";
const FAQ = [
    { v: "ship", q: "How to publish the version of Hulian?", a: "Local master Direct commit, trunk-based, None remote. All three doors are green." },
    { v: "token", q: "How to adapt colors to light and dark?", a: "Only consumes semantics token, prohibits writing naked values; Tailwind v4 dark variant automatically changes skin." },
    { v: "a11y", q: "Who knows about accessibility?", a: "Focus ring/keyboard/ARIA is all given to Base UI primitive, Hulian only changes the skin." },
];
function Demo(props: {
    multiple?: boolean;
    defaultValue?: string[];
    disabledItem?: boolean;
}) {
    return (<Accordion multiple={props.multiple} defaultValue={props.defaultValue} className="w-80 max-w-full">
      {FAQ.map((f, i) => (<AccordionItem key={f.v} value={f.v} disabled={props.disabledItem && i === 1}>
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionPanel>{f.a}</AccordionPanel>
        </AccordionItem>))}
    </Accordion>);
}
export const accordionShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Single opening mode: Expand at most one item at the same time, click the title to switch.",
            code: `<Accordion className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger> How to publish the version of Hulian? </AccordionTrigger>
    <AccordionPanel> Local master directly commit, trunk-based, the three doors are all green. </AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token">
    <AccordionTrigger>How to adapt colors to light and dark? </AccordionTrigger>
    <AccordionPanel> Only consume semantics token, Tailwind v4 dark variant automatic skin change. </AccordionPanel>
  </AccordionItem>
</Accordion>`,
            render: () => <Demo multiple={false}/>,
        },
        {
            title: "Expand by default",
            description: "Use defaultValue to specify initially expanded items (uncontrolled).",
            code: `<Accordion defaultValue={["ship"]} className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger> How to publish the version of Hulian? </AccordionTrigger>
    <AccordionPanel> Local master Direct commit. </AccordionPanel>
  </AccordionItem>
  {/* ...more item */}
</Accordion>`,
            render: () => <Demo multiple={false} defaultValue={["ship"]}/>,
        },
        {
            title: "Open more",
            description: "multiple allows multiple expansions at the same time.",
            code: `<Accordion multiple defaultValue={["ship", "token"]} className="w-80">
  {/* item Same as above */}
</Accordion>`,
            render: () => <Demo multiple defaultValue={["ship", "token"]}/>,
        },
        {
            title: "Disabled item",
            description: "Add disabled to AccordionItem. This item cannot be expanded and is grayed out.",
            code: `<Accordion defaultValue={["ship"]} className="w-80">
  <AccordionItem value="ship">
    <AccordionTrigger> How to publish the version of Hulian? </AccordionTrigger>
    <AccordionPanel> Local master Direct commit. </AccordionPanel>
  </AccordionItem>
  <AccordionItem value="token" disabled>
    <AccordionTrigger>How to adapt colors to light and dark? </AccordionTrigger>
    <AccordionPanel> cannot be expanded. </AccordionPanel>
  </AccordionItem>
</Accordion>`,
            render: () => <Demo disabledItem defaultValue={["ship"]}/>,
        },
    ],
    controls: [
        { prop: "multiple", type: "boolean", defaultValue: false, label: "multiple (multiple)" },
        { prop: "disabledItem", type: "boolean", defaultValue: false, label: "Disable the second item" },
    ],
    states: [
        { name: "Single opening (default closed)", render: () => <Demo multiple={false}/> },
        { name: "Single opening\u00B7First item expansion", render: () => <Demo multiple={false} defaultValue={["ship"]}/> },
        { name: "Open more", render: () => <Demo multiple defaultValue={["ship", "token"]}/> },
        { name: "Includes disabled items", render: () => <Demo disabledItem defaultValue={["ship"]}/> },
    ],
    renderWithProps: (p) => (<Demo multiple={p.multiple as boolean} disabledItem={p.disabledItem as boolean} defaultValue={["ship"]}/>),
    toCode: (p) => `<Accordion${p.multiple ? " multiple" : ""} defaultValue={["ship"]}>
  <AccordionItem value="ship">
    <AccordionTrigger> How to publish the version of Hulian? </AccordionTrigger>
    <AccordionPanel>Local master Direct commit...</AccordionPanel>
  </AccordionItem>
  {/* ...more item */}
</Accordion>`,
};
