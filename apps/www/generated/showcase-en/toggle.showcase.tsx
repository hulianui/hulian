"use client";
import { useState } from "react";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Sparkles, Globe } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Toggle, ToggleGroup } from "../../../../packages/ui/src/toggle/toggle";
function SingleToggle(p: Record<string, unknown>) {
    const [on, setOn] = useState(false);
    return (<Toggle pressed={on} onPressedChange={setOn} variant={(p.variant as "default" | "outline" | "pill") ?? "default"} disabled={p.disabled as boolean} aria-label="bold">
      <Bold className="size-4"/>
    </Toggle>);
}
export const toggleShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "A single Toggle is a switchable pressed button, and defaultPressed is initially selected.",
            code: `<>
  <Toggle aria-label="bold"><Bold className="size-4" /></Toggle>
  <Toggle defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle>
</>`,
            render: () => (<div className="flex gap-2">
          <Toggle aria-label="Bold"><Bold className="size-4"/></Toggle>
          <Toggle defaultPressed aria-label="Bold"><Bold className="size-4"/></Toggle>
        </div>),
        },
        {
            title: "Single choice group",
            description: "ToggleGroup Default mutually exclusive radio selection, suitable for switching such as alignment.",
            code: `<ToggleGroup defaultValue={["center"]}>
  <Toggle value="left" aria-label="Left justified"><AlignLeft className="size-4" /></Toggle>
  <Toggle value="center" aria-label="center"><AlignCenter className="size-4" /></Toggle>
  <Toggle value="right" aria-label="right-justified"><AlignRight className="size-4" /></Toggle>
</ToggleGroup>`,
            render: () => (<ToggleGroup defaultValue={["center"]}>
          <Toggle value="left" aria-label="Align left"><AlignLeft className="size-4"/></Toggle>
          <Toggle value="center" aria-label="Centered"><AlignCenter className="size-4"/></Toggle>
          <Toggle value="right" aria-label="Align right"><AlignRight className="size-4"/></Toggle>
        </ToggleGroup>),
        },
        {
            title: "Multiple choice group",
            description: "Add multiple to allow multiple items in the group to be pressed at the same time, suitable for rich text styles.",
            code: `<ToggleGroup multiple defaultValue={["bold", "italic"]}>
  <Toggle value="bold" aria-label="bold"><Bold className="size-4" /></Toggle>
  <Toggle value="italic" aria-label="italic"><Italic className="size-4" /></Toggle>
  <Toggle value="underline" aria-label="underline"><Underline className="size-4" /></Toggle>
</ToggleGroup>`,
            render: () => (<ToggleGroup multiple defaultValue={["bold", "italic"]}>
          <Toggle value="bold" aria-label="Bold"><Bold className="size-4"/></Toggle>
          <Toggle value="italic" aria-label="Italic"><Italic className="size-4"/></Toggle>
          <Toggle value="underline" aria-label="Underline"><Underline className="size-4"/></Toggle>
        </ToggleGroup>),
        },
        {
            title: "Variants",
            description: "default soft bottom / outline main color solid / pill rounded corners chip (AI toolbar switch style).",
            code: `<>
  <Toggle defaultPressed aria-label="default"><Bold className="size-4" /></Toggle>
  <Toggle variant="outline" defaultPressed aria-label="outline"><Bold className="size-4" /></Toggle>
  <Toggle variant="pill" size="sm" defaultPressed aria-label="Deep Thought">
    <Sparkles className="size-3.5" /> Deep Thoughts
  </Toggle>
</>`,
            render: () => (<div className="flex items-center gap-2">
          <Toggle defaultPressed aria-label="default"><Bold className="size-4"/></Toggle>
          <Toggle variant="outline" defaultPressed aria-label="outline"><Bold className="size-4"/></Toggle>
          <Toggle variant="pill" size="sm" defaultPressed aria-label="Deep thinking">
            <Sparkles className="size-3.5"/> Deep thinking
          </Toggle>
        </div>),
        },
        {
            title: "Disabled",
            description: "disabled Lock button, which can also be disabled when pressed.",
            code: `<Toggle disabled defaultPressed aria-label="bold"><Bold className="size-4" /></Toggle>`,
            render: () => (<Toggle disabled defaultPressed aria-label="Bold"><Bold className="size-4"/></Toggle>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["default", "outline", "pill"], defaultValue: "default" },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "off", render: () => <Toggle aria-label="bold"><Bold className="size-4"/></Toggle> },
        { name: "on", render: () => <Toggle defaultPressed aria-label="bold"><Bold className="size-4"/></Toggle> },
        {
            name: "group-single",
            render: () => (<ToggleGroup defaultValue={["center"]}>
          <Toggle value="left" aria-label="Align left"><AlignLeft className="size-4"/></Toggle>
          <Toggle value="center" aria-label="Centered"><AlignCenter className="size-4"/></Toggle>
          <Toggle value="right" aria-label="Align right"><AlignRight className="size-4"/></Toggle>
        </ToggleGroup>),
        },
        {
            name: "group-multiple",
            render: () => (<ToggleGroup multiple defaultValue={["bold", "italic"]}>
          <Toggle value="bold" aria-label="Bold"><Bold className="size-4"/></Toggle>
          <Toggle value="italic" aria-label="Italic"><Italic className="size-4"/></Toggle>
          <Toggle value="underline" aria-label="Underline"><Underline className="size-4"/></Toggle>
        </ToggleGroup>),
        },
        { name: "disabled", render: () => <Toggle disabled defaultPressed aria-label="bold"><Bold className="size-4"/></Toggle> },
        {
            name: "pill (AI toolbar switch)",
            render: () => (<div className="flex gap-2">
          <Toggle variant="pill" size="sm" defaultPressed aria-label="Deep thinking">
            <Sparkles className="size-3.5"/> Deep thinking
          </Toggle>
          <Toggle variant="pill" size="sm" aria-label="Smart Search">
            <Globe className="size-3.5"/> Smart Search
          </Toggle>
        </div>),
        },
    ],
    renderWithProps: (p) => <SingleToggle {...p}/>,
    toCode: (p) => `<Toggle${p.variant && p.variant !== "default" ? ` variant="${p.variant}"` : ""}${p.disabled ? " disabled" : ""}>
  <Bold />
</Toggle>`,
};
