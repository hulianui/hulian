"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Spinner } from "./spinner";

type Size = "sm" | "md" | "lg";
type Tone = "primary" | "current" | "muted";

export const spinnerShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认 md 尺寸、primary 色的旋转指示器，纯 CSS 动画，可 RSC。",
      code: `<Spinner />`,
      render: () => <Spinner />,
    },
    {
      title: "三尺寸",
      description: "size 控制大小：sm / md / lg。",
      code: `<>
  <Spinner size="sm" />
  <Spinner size="md" />
  <Spinner size="lg" />
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      ),
    },
    {
      title: "色调",
      description: "tone 切换语义色，current 跟随父级 text 色，可置于深色按钮内。",
      code: `<>
  <Spinner tone="primary" />
  <Spinner tone="muted" />
  <span className="text-danger"><Spinner tone="current" /></span>
</>`,
      render: () => (
        <div className="flex items-center gap-6">
          <Spinner tone="primary" />
          <Spinner tone="muted" />
          <span className="text-danger">
            <Spinner tone="current" />
          </span>
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "tone", type: "select", options: ["primary", "current", "muted"], defaultValue: "primary" },
  ],
  states: [
    { name: "sm", render: () => <Spinner size="sm" /> },
    { name: "md", render: () => <Spinner size="md" /> },
    { name: "lg", render: () => <Spinner size="lg" /> },
    { name: "muted", render: () => <Spinner tone="muted" /> },
  ],
  renderWithProps: (p) => <Spinner size={(p.size as Size) ?? "md"} tone={(p.tone as Tone) ?? "primary"} />,
  toCode: (p) =>
    `<Spinner${p.size && p.size !== "md" ? ` size="${p.size}"` : ""}${p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : ""} />`,
};
