import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InteractiveHoverButton } from "../../../../packages/ui/src/interactive-hover-button/interactive-hover-button";
export const interactiveHoverButtonShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "At rest it is a dot plus a label; on hover or focus the dot expands into a full background and an arrow appears.",
            code: `<InteractiveHoverButton>Get started</InteractiveHoverButton>`,
            render: () => <InteractiveHoverButton>Get started</InteractiveHoverButton>,
        },
        {
            title: "Size",
            description: "size maps one to one onto Button's sm / md / lg (32/40/48px tall), so it lines up with ordinary buttons.",
            code: `<>
  <InteractiveHoverButton size="sm">Small</InteractiveHoverButton>
  <InteractiveHoverButton size="md">Medium</InteractiveHoverButton>
  <InteractiveHoverButton size="lg">Large</InteractiveHoverButton>
</>`,
            render: () => (<div className="flex flex-wrap items-center gap-3">
          <InteractiveHoverButton size="sm">Small</InteractiveHoverButton>
          <InteractiveHoverButton size="md">Medium</InteractiveHoverButton>
          <InteractiveHoverButton size="lg">Large</InteractiveHoverButton>
        </div>),
        },
        {
            title: "Colors",
            description: "background and foreground change the expanded background and text colors; feeding them a chart token keeps them aligned with the light and dark themes.",
            code: `<InteractiveHoverButton background="var(--color-chart-2)">Try it now</InteractiveHoverButton>`,
            render: () => (<InteractiveHoverButton background="var(--color-chart-2)">Try it now</InteractiveHoverButton>),
        },
        {
            title: "Long labels are still covered",
            description: "The expansion uses a clip-path circle at 150%, whose percentage resolves against the reference box's diagonal, so any button width is covered \u2014 unlike a scale magic number derived from one particular width.",
            code: `<InteractiveHoverButton size="lg">Download the desktop client (macOS / Windows)</InteractiveHoverButton>`,
            render: () => (<InteractiveHoverButton size="lg">Download the desktop client (macOS / Windows)</InteractiveHoverButton>),
        },
        {
            title: "Rendered as a link",
            description: "A landing-page primary CTA is often a link: render takes over the element, and the styles and both internal layers merge into it.",
            code: `<InteractiveHoverButton render={<a href="#" />}>Read the docs</InteractiveHoverButton>`,
            render: () => (<InteractiveHoverButton render={<a href="#"/>}>Read the docs</InteractiveHoverButton>),
        },
    ],
    controls: [
        { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
        { prop: "children", type: "text", defaultValue: "Get started", label: "Copywriting" },
        { prop: "disabled", type: "boolean", defaultValue: false, label: "disabled" },
    ],
    states: [
        { name: "default", render: () => <InteractiveHoverButton>Get started</InteractiveHoverButton> },
        {
            name: "chart-2 colors",
            render: () => (<InteractiveHoverButton background="var(--color-chart-2)">Try it now</InteractiveHoverButton>),
        },
        { name: "lg", render: () => <InteractiveHoverButton size="lg">Get started</InteractiveHoverButton> },
        {
            name: "No arrow",
            render: () => <InteractiveHoverButton icon={null}>Get started</InteractiveHoverButton>,
        },
        {
            name: "disabled",
            render: () => <InteractiveHoverButton disabled>Get started</InteractiveHoverButton>,
        },
    ],
    renderWithProps: (p) => (<InteractiveHoverButton size={p.size as "sm" | "md" | "lg"} disabled={p.disabled as boolean}>
      {p.children as string}
    </InteractiveHoverButton>),
    toCode: (p) => `<InteractiveHoverButton size="${p.size}"${p.disabled ? " disabled" : ""}>${p.children}</InteractiveHoverButton>`,
};
