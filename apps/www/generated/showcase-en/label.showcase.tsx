"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Label } from "../../../../packages/ui/src/label/label";
import { Input } from "../../../../packages/ui/src/input/input";
import { Switch } from "../../../../packages/ui/src/switch/switch";
export const labelShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "htmlFor points at the control id, so clicking the label focuses that control.",
            code: `<Label htmlFor="email">Email</Label>
<Input id="email" placeholder="you@work.com" />`,
            render: () => (<div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="showcase-label-email">Email</Label>
          <Input id="showcase-label-email" placeholder="you@work.com"/>
        </div>),
        },
        {
            title: "Settings row with the label on the left and the control on the right",
            description: "For pages that already have a layout and cannot use Field: label on the left, control on the right.",
            code: `<div className="flex items-center justify-between">
  <Label htmlFor="sidebar">Keep the sidebar expanded</Label>
  <Switch id="sidebar" defaultChecked />
</div>`,
            render: () => (<div className="flex w-72 items-center justify-between">
          <Label htmlFor="showcase-label-sidebar">Keep the sidebar expanded</Label>
          <Switch id="showcase-label-sidebar" defaultChecked/>
        </div>),
        },
        {
            title: "Change the font size",
            description: "className goes through twMerge, so text-xs overrides the default text-sm.",
            code: `<Label htmlFor="theme" className="text-xs">Theme</Label>`,
            render: () => (<div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="showcase-label-theme" className="text-xs">
            Theme
          </Label>
          <Input id="showcase-label-theme" placeholder="Dark"/>
        </div>),
        },
    ],
    controls: [
        { prop: "children", type: "text", defaultValue: "Email", label: "Text" },
        { prop: "htmlFor", type: "text", defaultValue: "email", label: "htmlFor" },
    ],
    states: [
        { name: "default", render: () => <Label htmlFor="state-default">Email</Label> },
        {
            name: "withControl",
            render: () => (<div className="flex w-72 flex-col gap-1.5">
          <Label htmlFor="state-with-control">Email</Label>
          <Input id="state-with-control" placeholder="you@work.com"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<Label htmlFor={(p.htmlFor as string) || undefined}>{p.children as string}</Label>),
    toCode: (p) => `<Label${p.htmlFor ? ` htmlFor="${p.htmlFor}"` : ""}>${p.children}</Label>`,
};
