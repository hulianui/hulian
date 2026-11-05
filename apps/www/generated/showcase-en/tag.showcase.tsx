"use client";
import { useState } from "react";
import { CircleCheck, CircleX, Info, TriangleAlert } from "lucide-react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { Tag } from "../../../../packages/ui/src/tag/tag";
type Variant = "soft" | "solid" | "outline";
type Tone = "neutral" | "brand" | "info" | "success" | "warning" | "danger";
function Closable() {
    const [items, setItems] = useState(["Pending review", "Passed", "Rejected", "Draft"]);
    return (<div className="flex flex-wrap items-center gap-2">
      {items.map((t) => (<Tag key={t} onClose={() => setItems((s) => s.filter((x) => x !== t))}>
          {t}
        </Tag>))}
      {items.length === 0 && <span className="text-sm text-muted-foreground">Remove all</span>}
    </div>);
}
export const tagShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Tone color",
            description: "tone covers the semantic state spectrum: neutral / brand / info / success / warning / danger.",
            code: `<>
  <Tag>Default</Tag>
  <Tag tone="brand">Processing</Tag>
  <Tag tone="info">External browser mode</Tag>
  <Tag tone="success">Success</Tag>
  <Tag tone="warning">Warning</Tag>
  <Tag tone="danger">Error</Tag>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag>Default</Tag>
          <Tag tone="brand">Processing</Tag>
          <Tag tone="info">External browser mode</Tag>
          <Tag tone="success">Success</Tag>
          <Tag tone="warning">Warning</Tag>
          <Tag tone="danger">Error</Tag>
        </div>),
        },
        {
            title: "Category colours",
            description: "tone carries state and color carries category \u2014 channels, business lines and file types routinely need a dozen-plus colours that six semantic tones cannot carry. color resolves through semantic token layers, so it follows the theme, and it also accepts any CSS colour.",
            code: `<>
  <Tag color="chart-1">TikTok</Tag>
  <Tag color="chart-2">Xiaohongshu</Tag>
  <Tag color="chart-3">WeChat Channels</Tag>
  <Tag color="chart-4">Bilibili</Tag>
  <Tag color="chart-5">Kuaishou</Tag>
  <Tag color="chart-6">Zhihu</Tag>
  <Tag color="#ec4899">Custom colour</Tag>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag color="chart-1">TikTok</Tag>
          <Tag color="chart-2">Xiaohongshu</Tag>
          <Tag color="chart-3">WeChat Channels</Tag>
          <Tag color="chart-4">Bilibili</Tag>
          <Tag color="chart-5">Kuaishou</Tag>
          <Tag color="chart-6">Zhihu</Tag>
          <Tag color="#ec4899">Custom colour</Tag>
        </div>),
        },
        {
            title: "Variants",
            description: "variant provides soft (default light background) / solid background / outline stroke.",
            code: `<>
  <Tag variant="soft" tone="brand">soft</Tag>
  <Tag variant="solid" tone="brand">solid</Tag>
  <Tag variant="outline" tone="brand">outline</Tag>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag variant="soft" tone="brand">soft</Tag>
          <Tag variant="solid" tone="brand">solid</Tag>
          <Tag variant="outline" tone="brand">outline</Tag>
        </div>),
        },
        {
            title: "Status Dot",
            description: "dot leading status point; pulse lets the point breathe and flash to express the ongoing status.",
            code: `<>
  <Tag dot tone="success">Running</Tag>
  <Tag dot pulse tone="brand">Deploying</Tag>
  <Tag dot pulse tone="warning">Retrying</Tag>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag dot tone="success">Running</Tag>
          <Tag dot pulse tone="brand">Deploying</Tag>
          <Tag dot pulse tone="warning">Retrying</Tag>
        </div>),
        },
        {
            title: "With icon",
            description: "icon slot puts the leading icon (dot is not rendered when it exists).",
            code: `<>
  <Tag tone="success" icon={<CircleCheck />}>Passed</Tag>
  <Tag tone="danger" icon={<CircleX />}>Rejected</Tag>
</>`,
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag tone="success" icon={<CircleCheck />}>Passed</Tag>
          <Tag tone="danger" icon={<CircleX />}>Rejected</Tag>
        </div>),
        },
        {
            title: "Dismissible",
            description: "Pass onClose to render the close button. Click to trigger the callback to remove the label by the caller.",
            code: `<Tag tone="brand" onClose={() => remove(tag)}>
  Removable
</Tag>`,
            render: () => (<Tag tone="brand" onClose={() => { }}>
          Removable
        </Tag>),
        },
    ],
    controls: [
        { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
        { prop: "tone", type: "select", options: ["neutral", "brand", "info", "success", "warning", "danger"], defaultValue: "neutral" },
    ],
    states: [
        {
            name: "soft (default)",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag>Default</Tag>
          <Tag tone="brand">Processing</Tag>
          <Tag tone="success">Success</Tag>
          <Tag tone="warning">Warning</Tag>
          <Tag tone="danger">Error</Tag>
        </div>),
        },
        {
            name: "solid",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag variant="solid" tone="brand">Processing</Tag>
          <Tag variant="solid" tone="success">Success</Tag>
          <Tag variant="solid" tone="warning">Warning</Tag>
          <Tag variant="solid" tone="danger">Error</Tag>
        </div>),
        },
        {
            name: "outline",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag variant="outline">Default</Tag>
          <Tag variant="outline" tone="brand">Processing</Tag>
          <Tag variant="outline" tone="success">Success</Tag>
        </div>),
        },
        {
            name: "Category colour (color)",
            render: () => (<div className="flex flex-wrap gap-2">
          {["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"].map((c) => (<Tag key={c} color={c}>
              {c}
            </Tag>))}
          <Tag color="#ec4899">#ec4899</Tag>
        </div>),
        },
        {
            name: "Status Dot",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag dot tone="neutral">is offline</Tag>
          <Tag dot tone="success">Running</Tag>
          <Tag dot tone="warning">Alarm</Tag>
          <Tag dot tone="danger">has been shut down</Tag>
        </div>),
        },
        {
            name: "Breathing dot (progressive state)",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag dot pulse tone="brand">Deploying</Tag>
          <Tag dot pulse tone="success">Synchronizing</Tag>
          <Tag dot pulse tone="warning">Retrying</Tag>
        </div>),
        },
        {
            name: "With icon",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag tone="brand" icon={<Info />}>Information</Tag>
          <Tag tone="success" icon={<CircleCheck />}>Passed</Tag>
          <Tag tone="warning" icon={<TriangleAlert />}>Pending review</Tag>
          <Tag tone="danger" icon={<CircleX />}>Rejected</Tag>
        </div>),
        },
        {
            name: "Size",
            render: () => (<div className="flex flex-wrap items-center gap-2">
          <Tag size="sm" tone="brand" dot>small</Tag>
          <Tag size="md" tone="brand" dot>medium</Tag>
        </div>),
        },
        {
            name: "Disabled",
            render: () => (<div className="flex flex-wrap gap-2">
          <Tag isDisabled tone="success">Disabled</Tag>
          <Tag isDisabled tone="danger" onClose={() => { }}>Disable to turn off</Tag>
        </div>),
        },
        { name: "Dismissible", render: () => <Closable /> },
    ],
    renderWithProps: (p) => (<Tag variant={(p.variant as Variant) ?? "soft"} tone={(p.tone as Tone) ?? "neutral"} dot>
      Status Label
    </Tag>),
    toCode: (p) => `<Tag${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""}${p.tone && p.tone !== "neutral" ? ` tone="${p.tone}"` : ""} dot>Status Label</Tag>`,
};
