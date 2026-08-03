"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Reveal, Stagger, StaggerItem } from "../../../../packages/ui/src/reveal/reveal";
function Card({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="rounded-xl border border-border bg-surface px-5 py-4 text-foreground">{children}</div>);
}
export const revealShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A single piece of content floats from the bottom, from blur to clear, and plays immediately after mounting. It is suitable for the first screen hero.",
            code: `<Reveal trigger="mount">
  <div className="card">A piece of content floats from bottom to top, from blur to clear. </div>
</Reveal>`,
            render: () => (<Reveal trigger="mount">
          <Card>A piece of content floats from bottom to top, from blur to clear.</Card>
        </Reveal>),
        },
        {
            title: "Level-by-level arrangement Stagger",
            description: "The Stagger container presses gap to wake up the internal StaggerItem in sequence, and can overwrite y/scale/blur one by one.",
            code: `<Stagger trigger="mount" gap={0.1}>
  <div className="flex flex-col gap-3">
    <StaggerItem>
      <div className="card">First line</div>
    </StaggerItem>
    <StaggerItem>
      <div className="card">Second line</div>
    </StaggerItem>
    <StaggerItem y={22} scale={0.94} blur={12}>
      <div className="card">Final item: heavier blur + scale</div>
    </StaggerItem>
  </div>
</Stagger>`,
            render: () => (<Stagger trigger="mount" gap={0.1}>
          <div className="flex flex-col gap-3">
            <StaggerItem>
              <Card>First line</Card>
            </StaggerItem>
            <StaggerItem>
              <Card>Second line</Card>
            </StaggerItem>
            <StaggerItem y={22} scale={0.94} blur={12}>
              <Card>The finale: the heavier blur + scale</Card>
            </StaggerItem>
          </div>
        </Stagger>),
        },
        {
            title: "Triggered when scrolling into the viewport",
            description: "Default trigger=in-view: The element appears when it is scrolled into the viewport (once only plays once by default).",
            code: `<div className="max-h-72 overflow-auto">
  <div className="h-64" />
  <Reveal>
    <div className="card">Reappears when scrolling here (one-time). </div>
  </Reveal>
  <div className="h-40" />
</div>`,
            render: () => (<div className="max-h-72 w-full max-w-md overflow-auto rounded-xl border border-border bg-bg p-4">
          <div className="h-64"/>
          <Reveal>
            <Card>Appears when scrolling here (one-time only).</Card>
          </Reveal>
          <div className="h-40"/>
        </div>),
        },
    ],
    controls: [
        { prop: "y", type: "number", defaultValue: 24, label: "Start moving down px" },
        { prop: "blur", type: "number", defaultValue: 8, label: "Starting blur px" },
        { prop: "scale", type: "number", defaultValue: 1, label: "Start zoom" },
        {
            prop: "trigger",
            type: "select",
            options: ["mount", "in-view"],
            defaultValue: "mount",
            label: "Trigger timing",
        },
    ],
    states: [
        {
            name: "Reveal (single block\u00B7mounted floating + focus pulled in)",
            render: () => (<Reveal trigger="mount">
          <Card>A piece of content floats from bottom to top, from blur to clear.</Card>
        </Reveal>),
        },
        {
            name: "Stagger (level-by-level arrangement\u00B7mounting trigger)",
            render: () => (<Stagger trigger="mount" gap={0.1}>
          <div className="flex flex-col gap-3">
            <StaggerItem>
              <Card>First line</Card>
            </StaggerItem>
            <StaggerItem>
              <Card>Second line</Card>
            </StaggerItem>
            <StaggerItem>
              <Card>Third line</Card>
            </StaggerItem>
            <StaggerItem y={22} scale={0.94} blur={12}>
              <Card>The finale: the heavier blur + scale, like "put it on the bookshelf"</Card>
            </StaggerItem>
          </div>
        </Stagger>),
        },
        {
            name: "Reveal (triggered by scrolling into the viewport)",
            render: () => (<div className="max-h-72 w-full max-w-md overflow-auto rounded-xl border border-border bg-bg p-4">
          <div className="h-64"/>
          <Reveal>
            <Card>Appears when scrolling here (one-time only).</Card>
          </Reveal>
          <div className="h-40"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Reveal trigger={p.trigger as "mount" | "in-view"} y={p.y as number} blur={p.blur as number} scale={p.scale as number}>
      <Card>A piece of content floats according to the selected parameters, from blur to clear.</Card>
    </Reveal>),
    toCode: (p) => `<Reveal trigger="${p.trigger}" y={${p.y}} blur={${p.blur}} scale={${p.scale}}>
  <div className="card">Floating content</div>
</Reveal>`,
};
