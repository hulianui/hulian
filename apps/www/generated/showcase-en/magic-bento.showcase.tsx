"use client";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { MagicBento } from "../../../../packages/ui/src/magic-bento/magic-bento";
function Stage({ children }: {
    children: React.ReactNode;
}) {
    return (<div className="w-full max-w-3xl rounded-xl border border-border bg-surface-hover p-4">
      {children}
    </div>);
}
const DEMO_ITEMS = [
    { label: "Insights", title: "Data Insights", description: "Track user behavior and funnels", colSpan: 2 },
    { label: "Overview", title: "Overview Panel", description: "Centralized data view" },
    { label: "Teamwork", title: "Teamwork", description: "Seamless real-time collaboration" },
    { label: "Efficiency", title: "Automation", description: "Streamline repetitive workflows" },
    { label: "Protection", title: "Safety protection", description: "Enterprise-level permissions and auditing", colSpan: 2 },
];
export const magicBentoShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Input card data, radial spotlight + stroke light appear when the cursor moves into the card; colSpan controls the bento layout of different sizes across columns.",
            code: `<MagicBento
  items={[
    { label: "Insights", title: "Data Insights", description: "Tracking user behavior and funnel", colSpan: 2 },
    { label: "Overview", title: "Overview Panel", description: "Centralized Data View" },
    { label: "Teamwork", title: "Team collaboration", description: "Seamless real-time collaboration" },
  ]}
/>`,
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS}/>
        </Stage>),
        },
        {
            title: "3D Tilt",
            description: "enableTilt Makes the card slightly tilt along with the cursor position, enhancing stereo feedback.",
            code: `<MagicBento items={items} enableTilt />`,
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} enableTilt/>
        </Stage>),
        },
        {
            title: "Customized glow color",
            description: "glowColor To feed the halo/stroke light, you must use token with the prefix --color-; spotlightRadius to adjust the focus range.",
            code: `<MagicBento
  items={items}
  glowColor="var(--color-chart-2)"
  spotlightRadius={420}
/>`,
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} glowColor="var(--color-chart-2)" spotlightRadius={420}/>
        </Stage>),
        },
        {
            title: "Close interaction",
            description: "disableAnimations renders a static mesh (equivalent to reduced-motion) without any cursor feedback.",
            code: `<MagicBento items={items} disableAnimations />`,
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} disableAnimations/>
        </Stage>),
        },
    ],
    controls: [
        { prop: "columns", type: "number", defaultValue: 4, label: "Number of grid columns" },
        { prop: "spotlightRadius", type: "number", defaultValue: 280, label: "Condensing radius px" },
        { prop: "enableSpotlight", type: "boolean", defaultValue: true, label: "Radial spotlight" },
        { prop: "enableBorderGlow", type: "boolean", defaultValue: true, label: "Stroke light" },
        { prop: "enableTilt", type: "boolean", defaultValue: false, label: "3D Tilt" },
        { prop: "disableAnimations", type: "boolean", defaultValue: false, label: "Close interaction" },
    ],
    states: [
        {
            name: "default (spot light + stroke light, move the mouse into the card experience)",
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS}/>
        </Stage>),
        },
        {
            name: "Turn on 3D Tilt",
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} enableTilt/>
        </Stage>),
        },
        {
            name: "Customized light color (chart-2) + large spotlight",
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} glowColor="var(--color-chart-2)" spotlightRadius={420}/>
        </Stage>),
        },
        {
            name: "Turn off interaction (static mesh \u00B7 reduced-motion equivalent)",
            render: () => (<Stage>
          <MagicBento items={DEMO_ITEMS} disableAnimations/>
        </Stage>),
        },
    ],
    renderWithProps: (p) => (<Stage>
      <MagicBento items={DEMO_ITEMS} columns={p.columns as number} spotlightRadius={p.spotlightRadius as number} enableSpotlight={p.enableSpotlight as boolean} enableBorderGlow={p.enableBorderGlow as boolean} enableTilt={p.enableTilt as boolean} disableAnimations={p.disableAnimations as boolean}/>
    </Stage>),
    toCode: (p) => [
        `<MagicBento`,
        `  columns={${p.columns}}`,
        `  spotlightRadius={${p.spotlightRadius}}`,
        `  enableSpotlight={${p.enableSpotlight}}`,
        `  enableBorderGlow={${p.enableBorderGlow}}`,
        `  enableTilt={${p.enableTilt}}`,
        `  disableAnimations={${p.disableAnimations}}`,
        `  items={[`,
        `    { label: "Insights", title: "Data Insights", description: "Track User Behavior", colSpan: 2 },`,
        `    { label: "Overview", title: "Overview Panel", description: "Centralized Data View" },`,
        `    // \u2026`,
        `  ]}`,
        `/>`,
    ].join("\n"),
};
