"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Spinner } from "./spinner";

type Size = "sm" | "md" | "lg";
type Tone = "primary" | "current" | "muted";

export const spinnerShowcase: ShowcaseSpec = {
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
