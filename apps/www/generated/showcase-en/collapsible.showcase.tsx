"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "../../../../packages/ui/src/collapsible/collapsible";
function Demo(p: Record<string, unknown>) {
    return (<Collapsible defaultOpen={p.defaultOpen as boolean} disabled={p.disabled as boolean} className="w-80">
      <CollapsibleTrigger>What is the Hulian design system?</CollapsibleTrigger>
      <CollapsiblePanel>
        Hulian is an absorptive aggregation design system that absorbs the best implementations from various React libraries and unifies them into a set of API + light and dark token.
      </CollapsiblePanel>
    </Collapsible>);
}
export const collapsibleShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Click the title to expand/collapse the supplementary content, which is collapsed by default.",
            code: `<Collapsible className="w-80">
  <CollapsibleTrigger>Expand to view details</CollapsibleTrigger>
  <CollapsiblePanel>Here is the supplementary content that is collapsed by default. Click the title to expand it. </CollapsiblePanel>
</Collapsible>`,
            render: () => (<Collapsible className="w-80">
          <CollapsibleTrigger>Expand to view details</CollapsibleTrigger>
          <CollapsiblePanel>Here is the supplementary content that is collapsed by default. Click the title to expand it.</CollapsiblePanel>
        </Collapsible>),
        },
        {
            title: "Expand by default",
            description: "Uncontrolled use defaultOpen allows the panel to expand initially.",
            code: `<Collapsible defaultOpen className="w-80">
  <CollapsibleTrigger>Collapse details</CollapsibleTrigger>
  <CollapsiblePanel>Here is the supplementary content expanded by default. Click the title again to collapse it. </CollapsiblePanel>
</Collapsible>`,
            render: () => (<Collapsible defaultOpen className="w-80">
          <CollapsibleTrigger>Collapse details</CollapsibleTrigger>
          <CollapsiblePanel>Here is the supplementary content expanded by default. Click the title again to collapse it.</CollapsiblePanel>
        </Collapsible>),
        },
        {
            title: "Disabled",
            description: "The trigger under disabled is grayed out and cannot be expanded.",
            code: `<Collapsible disabled className="w-80">
  <CollapsibleTrigger>Disabled</CollapsibleTrigger>
  <CollapsiblePanel> cannot be expanded when disabled. </CollapsiblePanel>
</Collapsible>`,
            render: () => (<Collapsible disabled className="w-80">
          <CollapsibleTrigger>Disabled</CollapsibleTrigger>
          <CollapsiblePanel>Cannot be expanded when disabled.</CollapsiblePanel>
        </Collapsible>),
        },
    ],
    controls: [
        { prop: "defaultOpen", type: "boolean", defaultValue: false },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        {
            name: "closed",
            render: () => (<Collapsible className="w-80">
          <CollapsibleTrigger>Expand to view details</CollapsibleTrigger>
          <CollapsiblePanel>Here is the supplementary content that is collapsed by default. Click the title to expand it.</CollapsiblePanel>
        </Collapsible>),
        },
        {
            name: "open",
            render: () => (<Collapsible defaultOpen className="w-80">
          <CollapsibleTrigger>Collapse details</CollapsibleTrigger>
          <CollapsiblePanel>Here is the supplementary content expanded by default. Click the title again to collapse it.</CollapsiblePanel>
        </Collapsible>),
        },
        {
            name: "disabled",
            render: () => (<Collapsible disabled className="w-80">
          <CollapsibleTrigger>Disabled</CollapsibleTrigger>
          <CollapsiblePanel>Cannot be expanded when disabled.</CollapsiblePanel>
        </Collapsible>),
        },
    ],
    renderWithProps: (p) => <Demo {...p}/>,
    toCode: (p) => `<Collapsible${p.defaultOpen ? " defaultOpen" : ""}${p.disabled ? " disabled" : ""}>
  <CollapsibleTrigger>Title</CollapsibleTrigger>
  <CollapsiblePanel>Content</CollapsiblePanel>
</Collapsible>`,
};
