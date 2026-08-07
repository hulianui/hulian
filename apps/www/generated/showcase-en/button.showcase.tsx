"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { ChevronDown } from "../../../../packages/ui/src/_icons";
import { Button } from "../../../../packages/ui/src/button/button";
export const buttonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The default solid button, and there are 4 variants: stroke, ghost, and text link.",
            code: `<Button>Default</Button>
<Button variant="outline">Stroke</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Text link</Button>`,
            render: () => (<>
          <Button>Default</Button>
          <Button variant="outline">Stroke</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Text link</Button>
        </>),
        },
        {
            title: "Size",
            description: "sm / md / lg Three levels of height.",
            code: `<Button size="sm">small</Button>
<Button size="md">medium</Button>
<Button size="lg">Large</Button>`,
            render: () => (<>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </>),
        },
        {
            title: "Icon sizes match text sizes",
            description: "The side length of iconSm/icon/iconLg matches the height of sm/md/lg respectively (32/40/48). Pair an icon size with the text size of the same name so the seam stays flush.",
            code: `<Button size="sm">small</Button>
<Button size="iconSm" aria-label="More"><ChevronDown className="size-4" /></Button>
<Button size="md">medium</Button>
<Button size="icon" aria-label="More"><ChevronDown className="size-4" /></Button>
<Button size="lg">Large</Button>
<Button size="iconLg" aria-label="More"><ChevronDown className="size-5" /></Button>`,
            render: () => (<>
          <Button size="sm">Small</Button>
          <Button size="iconSm" aria-label="More">
            <ChevronDown className="size-4"/>
          </Button>
          <Button size="md">Medium</Button>
          <Button size="icon" aria-label="More">
            <ChevronDown className="size-4"/>
          </Button>
          <Button size="lg">Large</Button>
          <Button size="iconLg" aria-label="More">
            <ChevronDown className="size-5"/>
          </Button>
        </>),
        },
        {
            title: "Semantic tones",
            description: "tone says what kind of action this is, and it is orthogonal to variant. A solid neutral button is inverted, not grey.",
            code: `<Button>Submit</Button>
<Button tone="success">Approve</Button>
<Button tone="warning">Reject</Button>
<Button tone="danger">Delete</Button>
<Button tone="neutral">Skip</Button>`,
            render: () => (<>
          <Button>Submit</Button>
          <Button tone="success">Passed</Button>
          <Button tone="warning">Reject</Button>
          <Button tone="danger">Delete</Button>
          <Button tone="neutral">Skip</Button>
        </>),
        },
        {
            title: "Tone by variant",
            description: "The same tone in a different variant gives you the outlined or ghost form, so neither needs its own enum value.",
            code: `<Button tone="success" variant="outline">Approve</Button>
<Button tone="warning" variant="outline">Reject</Button>
<Button tone="danger" variant="outline">Delete</Button>
<Button tone="success" variant="ghost">Approve</Button>
<Button tone="danger" variant="link">Delete</Button>`,
            render: () => (<>
          <Button tone="success" variant="outline">
            Passed
          </Button>
          <Button tone="warning" variant="outline">
            Reject
          </Button>
          <Button tone="danger" variant="outline">
            Delete
          </Button>
          <Button tone="success" variant="ghost">
            Passed
          </Button>
          <Button tone="danger" variant="link">
            Delete
          </Button>
        </>),
        },
        {
            title: "Full width",
            description: "block stretches the button to the container width, for mobile primary actions and form footers.",
            code: `<Button block>Sign in</Button>
<Button block variant="outline">Use another method</Button>`,
            render: () => (<div className="w-full max-w-xs space-y-2">
          <Button block>Login</Button>
          <Button block variant="outline">
            Use another method
          </Button>
        </div>),
        },
        {
            title: "Loading and disabling",
            description: "loading disables the button and shows a spinner.",
            code: `<Button loading>Loading</Button>
<Button disabled>Disabled</Button>`,
            render: () => (<>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["solid", "outline", "ghost", "link"], defaultValue: "solid" },
        {
            prop: "tone",
            type: "select",
            options: ["brand", "success", "warning", "danger", "neutral"],
            defaultValue: "brand",
        },
        {
            prop: "size",
            type: "select",
            options: ["sm", "md", "lg", "icon", "iconSm", "iconLg"],
            defaultValue: "md",
        },
        { prop: "block", type: "boolean", defaultValue: false, label: "Full width" },
        { prop: "loading", type: "boolean", defaultValue: false },
        { prop: "children", type: "text", defaultValue: "Hulian Button", label: "Copywriting" },
    ],
    states: [
        { name: "default", render: () => <Button>Default</Button> },
        { name: "outline", render: () => <Button variant="outline">Stroke</Button> },
        { name: "ghost", render: () => <Button variant="ghost">Ghost</Button> },
        { name: "link", render: () => <Button variant="link">Text link</Button> },
        { name: "success", render: () => <Button tone="success">Passed</Button> },
        { name: "warning", render: () => <Button tone="warning">Reject</Button> },
        { name: "danger", render: () => <Button tone="danger">Danger</Button> },
        { name: "neutral", render: () => <Button tone="neutral">Skip</Button> },
        { name: "disabled", render: () => <Button disabled>Disabled</Button> },
        { name: "loading", render: () => <Button loading>Loading</Button> },
    ],
    renderWithProps: (p) => (<Button variant={p.variant as "solid" | "outline" | "ghost" | "link"} tone={p.tone as "brand" | "success" | "warning" | "danger" | "neutral"} size={p.size as "sm" | "md" | "lg" | "icon" | "iconSm" | "iconLg"} block={p.block as boolean} loading={p.loading as boolean}>
      {p.children as string}
    </Button>),
    toCode: (p) => `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.block ? " block" : ""}${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
