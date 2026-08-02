"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { CardSpotlight } from "../../../../packages/ui/src/card-spotlight/card-spotlight";
function FeatureCard({ icon, title, description, color, radius, }: {
    icon: string;
    title: string;
    description: string;
    color?: string;
    radius?: number;
}) {
    return (<CardSpotlight color={color} radius={radius} className="w-64">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="mb-1.5 text-base font-semibold">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </CardSpotlight>);
}
export const cardSpotlightShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Wraps the card content and displays a soft spotlight at the cursor when the mouse is hovered (default chart-1).",
            code: `<CardSpotlight className="w-64">
  <div className="mb-3 text-3xl">\u2726</div>
  <h3 className="mb-1.5 text-base font-semibold">Hulian Component</h3>
  <p className="text-sm text-muted">Hover the mouse to feel the soft spotlight. </p>
</CardSpotlight>`,
            render: () => (<FeatureCard icon="✦" title="Hulian component" description="Ancestral temple jade, both beautiful and useful - hover the mouse to feel the soft spotlight."/>),
        },
        {
            title: "Custom highlight color",
            description: "color Pass any CSS color (including token), and the highlight will be linked with the theme color.",
            code: `<CardSpotlight color="var(--color-primary)" className="w-64">
  <div className="mb-3 text-3xl">\u26A1</div>
  <h3 className="mb-1.5 text-base font-semibold">Theme color highlight</h3>
  <p className="text-sm text-muted">Highlights are linked with the theme. </p>
</CardSpotlight>`,
            render: () => (<FeatureCard icon="⚡" title="Theme color highlight" description="color passes to var (--color-primary), the highlight is linked with the theme." color="var(--color-primary)"/>),
        },
        {
            title: "Focus on small radius",
            description: "radius The smaller the halo, the tighter it is, suitable for emphasizing a single core content area.",
            code: `<CardSpotlight radius={180} color="var(--color-chart-3)" className="w-64">
  <div className="mb-3 text-3xl">\uD83D\uDD0D</div>
  <h3 className="mb-1.5 text-base font-semibold">Focused beam</h3>
  <p className="text-sm text-muted">radius=180 The halo is tighter. </p>
</CardSpotlight>`,
            render: () => (<FeatureCard icon="🔍" title="Focused beam" description="radius=180 The halo is tighter, suitable for emphasizing core content areas." radius={180} color="var(--color-chart-3)"/>),
        },
        {
            title: "Multiple cards tied together",
            description: "Each card tracks the cursor independently and is equipped with different highlight colors to form a characteristic grid.",
            code: `<div className="flex flex-wrap gap-4">
  <CardSpotlight color="var(--color-chart-1)" className="w-64">...</CardSpotlight>
  <CardSpotlight color="var(--color-chart-2)" className="w-64">...</CardSpotlight>
</div>`,
            render: () => (<div className="flex flex-wrap gap-4">
          <FeatureCard icon="🎨" title="Design" description="Pixel-level restoration, the theme is linked with the system." color="var(--color-chart-1)"/>
          <FeatureCard icon="⚙️" title="Engineering" description="TypeScript Full coverage, the type is the document." color="var(--color-chart-2)"/>
        </div>),
        },
    ],
    controls: [
        {
            prop: "radius",
            type: "number",
            defaultValue: 350,
            label: "Highlight Radius (px)",
        },
        {
            prop: "color",
            type: "text",
            defaultValue: "",
            label: "Highlight color (empty = default chart-1)",
        },
    ],
    states: [
        {
            name: "Default (chart-1)",
            render: () => (<FeatureCard icon="✦" title="Hulian component" description="Ancestral temple jade, both beautiful and useful - hover the mouse to feel the soft spotlight."/>),
        },
        {
            name: "Brand color primary",
            render: () => (<FeatureCard icon="⚡" title="Theme color highlight" description="color passes to var (--color-primary), the highlight is linked with the theme." color="var(--color-primary)"/>),
        },
        {
            name: "Small Radius \u00B7 Focus",
            render: () => (<FeatureCard icon="🔍" title="Focused beam" description="radius=180 The halo is tighter, suitable for emphasizing core content areas." radius={180} color="var(--color-chart-3)"/>),
        },
        {
            name: "Multiple cards tied together",
            render: () => (<div className="flex flex-wrap gap-4">
          <FeatureCard icon="🎨" title="Design" description="Pixel-level restoration, the theme is linked with the system." color="var(--color-chart-1)"/>
          <FeatureCard icon="⚙️" title="Engineering" description="TypeScript Full coverage, the type is the document." color="var(--color-chart-2)"/>
          <FeatureCard icon="♿" title="Accessible" description="WCAG AA·Compatible with all keyboard/screen readers." color="var(--color-chart-4)"/>
        </div>),
        },
    ],
    renderWithProps: (p) => (<CardSpotlight radius={typeof p.radius === "number" ? p.radius : 350} color={p.color ? String(p.color) : undefined} className="w-64">
      <div className="mb-3 text-3xl">✦</div>
      <h3 className="mb-1.5 text-base font-semibold">CardSpotlight</h3>
      <p className="text-sm text-muted">Hover to feel the spotlight effect, and move the mouse to track the center of the halo.</p>
    </CardSpotlight>),
    toCode: (p) => {
        const radius = typeof p.radius === "number" ? p.radius : 350;
        const colorProp = p.color ? ` color="${p.color}"` : "";
        const radiusProp = radius !== 350 ? ` radius={${radius}}` : "";
        return `<CardSpotlight${radiusProp}${colorProp} className="w-64">
  <div className="mb-3 text-3xl">\u2726</div>
  <h3 className="mb-1.5 text-base font-semibold">Title</h3>
  <p className="text-sm text-muted">Card description text. </p>
</CardSpotlight>`;
    },
};
