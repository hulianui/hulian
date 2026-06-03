"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Link } from "./link";

type Tone = "primary" | "foreground" | "danger";
type Underline = "always" | "hover" | "none";

export const linkShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["primary", "foreground", "danger"], defaultValue: "primary" },
    { prop: "underline", type: "select", options: ["hover", "always", "none"], defaultValue: "hover" },
  ],
  states: [
    { name: "default", render: () => <Link href="#">瑚琏文档</Link> },
    { name: "always-underline", render: () => <Link href="#" underline="always">始终下划线</Link> },
    { name: "external", render: () => <Link href="https://base-ui.com" external>Base UI 官网</Link> },
    { name: "foreground", render: () => <Link href="#" tone="foreground">前景色链接</Link> },
  ],
  renderWithProps: (p) => (
    <Link href="#" tone={(p.tone as Tone) ?? "primary"} underline={(p.underline as Underline) ?? "hover"}>
      示例链接
    </Link>
  ),
  toCode: (p) =>
    `<Link href="#"${p.tone && p.tone !== "primary" ? ` tone="${p.tone}"` : ""}${p.underline && p.underline !== "hover" ? ` underline="${p.underline}"` : ""}>链接</Link>`,
};
