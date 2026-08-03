"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
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
            title: "Dimensions",
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
            title: "Loading and disabling",
            description: "loading automatically enters the disabled state and displays spinner; tone=danger indicates dangerous operations.",
            code: `<Button loading>Loading</Button>
<Button disabled>Disabled</Button>
<Button tone="danger">Delete</Button>`,
            render: () => (<>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
          <Button tone="danger">Delete</Button>
        </>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["solid", "outline", "ghost", "link"], defaultValue: "solid" },
        { prop: "tone", type: "select", options: ["brand", "danger"], defaultValue: "brand" },
        { prop: "size", type: "select", options: ["sm", "md", "lg", "icon", "iconSm"], defaultValue: "md" },
        { prop: "loading", type: "boolean", defaultValue: false },
        { prop: "children", type: "text", defaultValue: "Hulian Button", label: "Copywriting" },
    ],
    states: [
        { name: "default", render: () => <Button>Default</Button> },
        { name: "outline", render: () => <Button variant="outline">Stroke</Button> },
        { name: "ghost", render: () => <Button variant="ghost">Ghost</Button> },
        { name: "link", render: () => <Button variant="link">Text link</Button> },
        { name: "danger", render: () => <Button tone="danger">Danger</Button> },
        { name: "disabled", render: () => <Button disabled>Disabled</Button> },
        { name: "loading", render: () => <Button loading>Loading</Button> },
    ],
    renderWithProps: (p) => (<Button variant={p.variant as "solid" | "outline" | "ghost" | "link"} tone={p.tone as "brand" | "danger"} size={p.size as "sm" | "md" | "lg" | "icon" | "iconSm"} loading={p.loading as boolean}>
      {p.children as string}
    </Button>),
    toCode: (p) => `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
