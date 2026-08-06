"use client";
import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { InspectorPanel } from "../../../../packages/ui/src/inspector-panel/inspector-panel";
import { MIXED } from "../../../../packages/ui/src/inspector-panel/inspector-schema";
import type { InspectorSection, InspectorToken } from "../../../../packages/ui/src/inspector-panel/inspector-panel.types";
const tokens: InspectorToken[] = [
    { token: "color-foreground", label: "Primary text", group: "text" },
    { token: "color-muted", label: "Secondary text", group: "text" },
    { token: "color-primary", label: "Main color", group: "text" },
    { token: "color-surface", label: "Card surface", group: "surface" },
    { token: "color-surface-hover", label: "Surface hover", group: "surface" },
    { token: "color-bg", label: "Page base", group: "surface" },
    { token: "color-border", label: "Border", group: "border" },
];
const initialStyle: Record<string, unknown> = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "24px",
    paddingRight: "24px",
    paddingBottom: "24px",
    paddingLeft: "24px",
    fontSize: "16px",
    fontWeight: "600",
    color: "var(--color-primary)",
    backgroundColor: "var(--color-surface-hover)",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "var(--color-border)",
    borderRadius: "12px",
    opacity: 1,
};
function LiveDemo({ categories }: {
    categories?: string[];
}) {
    const [style, setStyle] = useState(initialStyle);
    const onChange = useCallback((path: string, value: unknown) => setStyle((previous) => ({ ...previous, [path]: value })), []);
    return (<div className="flex w-full flex-col gap-4 sm:flex-row">
      <div className="grid min-h-40 flex-1 place-items-center rounded-[var(--radius)] border border-dashed border-border p-4">

        <div style={style as CSSProperties}>Selected element</div>
      </div>
      <div className="w-full shrink-0 sm:w-72">
        <InspectorPanel selectedElement="Card / Title" props={style} tokenSource={tokens} categories={categories} onChange={onChange}/>
      </div>
    </div>);
}
const businessSchema: InspectorSection[] = [
    {
        id: "meta",
        label: "Contents",
        fields: [
            { key: "headline", label: "Title", kind: "text", placeholder: "Enter a headline" },
            { key: "badge", label: "Badge", kind: "text" },
            { key: "featured", label: "Pin to top", kind: "toggle" },
        ],
    },
    {
        id: "behavior",
        label: "Behavior",
        fields: [
            {
                key: "target",
                label: "Link target",
                kind: "enum",
                options: [
                    { value: "self", label: "Same tab" },
                    { value: "blank", label: "New window" },
                ],
            },
            { key: "weight", label: "Weight", kind: "number", min: 0, max: 999, hint: "Higher values rank first" },
            { key: "ratio", label: "Share", kind: "length", min: 0, max: 1, step: 0.05 },
        ],
    },
];
function BusinessDemo() {
    const [values, setValues] = useState<Record<string, unknown>>({
        headline: "Summer arrivals",
        featured: true,
        target: "blank",
        weight: 120,
        ratio: 0.35,
    });
    return (<div className="w-full max-w-xs">
      <InspectorPanel title="Card settings" sections={businessSchema} props={values} onChange={(path, value) => setValues((previous) => ({ ...previous, [path]: value }))}/>
    </div>);
}
function MixedDemo() {
    const [log, setLog] = useState<string[]>([]);
    return (<div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-xs">
        <InspectorPanel selectedElement="3 elements" commitMode="commit" categories={["typography", "effects"]} props={{ fontSize: MIXED, fontWeight: MIXED, textAlign: "left", opacity: MIXED }} onChange={(path, value) => setLog((previous) => [`${path} = ${String(value)}`, ...previous].slice(0, 4))}/>
      </div>
      <ul className="space-y-1 font-mono text-xs text-muted">
        {log.length === 0 ? (<li>Emission happens only after release or blur</li>) : (log.map((line, index) => <li key={index}>{line}</li>))}
      </ul>
    </div>);
}
export const inspectorPanelShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "Five built-in schema presets plus theme token binding; every change is emitted live to the preview box.",
            code: `const [style, setStyle] = useState(initialStyle);

<InspectorPanel
  selectedElement="Card / Title"
  props={style}
  tokenSource={tokens}
  onChange={(path, value) => setStyle((prev) => ({ ...prev, [path]: value }))}
/>`,
            render: () => <LiveDemo />,
        },
        {
            title: "Custom schema (beyond CSS)",
            description: "Swap sections for business properties: the panel itself knows no concrete property, it only derives controls from kind.",
            code: `<InspectorPanel
  title="Card settings"
  sections={[
    {
      id: "meta",
      label: "Content",
      fields: [
        { key: "headline", label: "Headline", kind: "text" },
        { key: "featured", label: "Pinned", kind: "toggle" },
      ],
    },
  ]}
  props={values}
  onChange={(path, value) => setValues((prev) => ({ ...prev, [path]: value }))}
/>`,
            render: () => <BusinessDemo />,
        },
        {
            title: "Mixed values across a multi-selection + emit on release",
            description: "Pass MIXED for a property whose values disagree and it renders as \"Multiple values\"; commitMode=\"commit\" suppresses emission while dragging or typing.",
            code: `<InspectorPanel
  selectedElement="3 elements"
  commitMode="commit"
  categories={["typography", "effects"]}
  props={{ fontSize: MIXED, fontWeight: MIXED, opacity: MIXED }}
  onChange={(path, value) => apply(path, value)}
/>`,
            render: () => <MixedDemo />,
        },
        {
            title: "Only some categories",
            description: "categories picks which built-in presets to use and in what order; an unknown id is ignored.",
            code: `<InspectorPanel categories={["layout", "border"]} props={style} onChange={onChange} />`,
            render: () => <LiveDemo categories={["layout", "border"]}/>,
        },
    ],
    controls: [],
    states: [
        { name: "Style inspector (with token swatches)", render: () => <LiveDemo /> },
        { name: "Business property schema", render: () => <BusinessDemo /> },
        { name: "Mixed values + commit mode", render: () => <MixedDemo /> },
        {
            name: "Empty state (no element selected)",
            render: () => (<div className="w-full max-w-xs">
          <InspectorPanel selectedElement={null} onChange={() => { }}/>
        </div>),
        },
    ],
    renderWithProps: () => <LiveDemo />,
    toCode: () => `<InspectorPanel selectedElement="Card / Title" props={style} tokenSource={tokens} onChange={(path, value) => \u2026} />`,
};
