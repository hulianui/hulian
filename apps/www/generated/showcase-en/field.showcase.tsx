"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Field } from "../../../../packages/ui/src/field/field";
import { Input } from "../../../../packages/ui/src/input/input";
export const fieldShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "label string Field.Label, children is the control (Input / Textarea).",
            code: `<Field label="Email">
  <Input placeholder="you@work.com" />
</Field>`,
            render: () => (<Field label="Email" className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
        {
            title: "Help instructions",
            description: "description renders muted small characters and automatically strings aria-describedby.",
            code: `<Field label="Email" description="We will not publish your email">
  <Input placeholder="you@work.com" />
</Field>`,
            render: () => (<Field label="Email" description="We will not publish your email address" className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
        {
            title: "Error status",
            description: "If error is not empty, it implies invalid (marked red + shows error), and there is no need to pass invalid separately.",
            code: `<Field label="Email" error="The email format is incorrect">
  <Input defaultValue="not-an-email" />
</Field>`,
            render: () => (<Field label="Email" error="The email format is incorrect" className="w-72">
          <Input defaultValue="not-an-email"/>
        </Field>),
        },
        {
            title: "Horizontal settings row",
            description: "orientation=horizontal puts the label area on the left, the control on the right, and the error message on its own full-width row.",
            code: `<Field
  orientation="horizontal"
  label="Theme"
  description="Pick your preferred color scheme"
>
  <Input defaultValue="Dark" />
</Field>`,
            render: () => (<Field orientation="horizontal" label="Theme" description="Pick your preferred color scheme" className="w-96">
          <Input defaultValue="Dark"/>
        </Field>),
        },
        {
            title: "Horizontal with a fixed label column",
            description: "Override the default column template to get a fixed label column and a control that fills the rest; no extra prop is needed.",
            code: `<Field
  orientation="horizontal"
  label="Email"
  error="The email format is incorrect"
  className="grid-cols-[6rem_1fr]"
>
  <Input defaultValue="not-an-email" />
</Field>`,
            render: () => (<Field orientation="horizontal" label="Email" error="The email format is incorrect" className="w-96 grid-cols-[6rem_1fr]">
          <Input defaultValue="not-an-email"/>
        </Field>),
        },
        {
            title: "Disabled",
            description: "disabled is passed to Field.Root, which disables the control.",
            code: `<Field label="Email" disabled>
  <Input placeholder="you@work.com" />
</Field>`,
            render: () => (<Field label="Email" disabled className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
    ],
    controls: [
        { prop: "label", type: "text", defaultValue: "Email", label: "label" },
        { prop: "description", type: "text", defaultValue: "We will not publish your email address", label: "help" },
        { prop: "error", type: "text", defaultValue: "", label: "error (if it is not empty, it will be marked red + an error will appear)" },
        { prop: "invalid", type: "boolean", defaultValue: false, label: "invalid" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
        {
            prop: "orientation",
            type: "select",
            options: ["vertical", "horizontal"],
            defaultValue: "vertical",
            label: "orientation",
        },
    ],
    states: [
        {
            name: "default",
            render: () => (<Field label="Email" className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
        {
            name: "withHelp",
            render: () => (<Field label="Email" description="We will not publish your email address" className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
        {
            name: "invalid+error",
            render: () => (<Field label="Email" error="The email format is incorrect" className="w-72">
          <Input defaultValue="not-an-email"/>
        </Field>),
        },
        {
            name: "disabled",
            render: () => (<Field label="Email" disabled className="w-72">
          <Input placeholder="you@work.com"/>
        </Field>),
        },
        {
            name: "horizontal",
            render: () => (<Field orientation="horizontal" label="Theme" description="Pick your preferred color scheme" className="w-96">
          <Input defaultValue="Dark"/>
        </Field>),
        },
    ],
    renderWithProps: (p) => (<Field label={p.label as string} description={(p.description as string) || undefined} error={(p.error as string) || undefined} invalid={p.invalid as boolean} disabled={p.disabled as boolean} orientation={p.orientation as "vertical" | "horizontal"} className={p.orientation === "horizontal" ? "w-96" : "w-72"}>
      <Input placeholder="you@work.com"/>
    </Field>),
    toCode: (p) => `<Field label="${p.label}"${p.description ? ` description="${p.description}"` : ""}${p.error ? ` error="${p.error}"` : ""}${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""}${p.orientation === "horizontal" ? ` orientation="horizontal"` : ""}>
  <Input placeholder="you@work.com" />
</Field>`,
};
