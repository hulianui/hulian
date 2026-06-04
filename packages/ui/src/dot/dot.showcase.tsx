"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Dot } from "./dot";

export const dotShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "tone",
      type: "select",
      options: ["neutral", "brand", "success", "warning", "danger"],
      defaultValue: "success",
    },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "pulse", type: "boolean", defaultValue: false, label: "呼吸" },
  ],
  states: [
    { name: "neutral", render: () => <Dot tone="neutral" /> },
    { name: "brand", render: () => <Dot tone="brand" /> },
    { name: "success", render: () => <Dot tone="success" /> },
    { name: "warning", render: () => <Dot tone="warning" /> },
    { name: "danger", render: () => <Dot tone="danger" /> },
    { name: "pulse（在线）", render: () => <Dot tone="success" pulse label="在线" /> },
    { name: "lg", render: () => <Dot size="lg" tone="brand" /> },
  ],
  renderWithProps: (p) => (
    <Dot
      tone={p.tone as "neutral" | "brand" | "success" | "warning" | "danger"}
      size={p.size as "sm" | "md" | "lg"}
      pulse={p.pulse as boolean}
    />
  ),
  toCode: (p) => `<Dot tone="${p.tone}" size="${p.size}"${p.pulse ? " pulse" : ""} />`,
};
