"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Link } from "./link";

type Tone = "primary" | "foreground" | "danger";
type Underline = "always" | "hover" | "none";

export const linkShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认主色链接，悬停出现下划线。",
      code: `<Link href="#">瑚琏文档</Link>`,
      render: () => <Link href="#">瑚琏文档</Link>,
    },
    {
      title: "语调",
      description: "tone 切换前景色：primary / foreground / danger。",
      code: `<>
  <Link href="#" tone="primary">主色链接</Link>
  <Link href="#" tone="foreground">前景色链接</Link>
  <Link href="#" tone="danger">危险链接</Link>
</>`,
      render: () => (
        <div className="flex gap-4">
          <Link href="#" tone="primary">主色链接</Link>
          <Link href="#" tone="foreground">前景色链接</Link>
          <Link href="#" tone="danger">危险链接</Link>
        </div>
      ),
    },
    {
      title: "下划线",
      description: "underline 控制下划线时机：hover（默认）/ always / none。",
      code: `<>
  <Link href="#" underline="hover">悬停下划线</Link>
  <Link href="#" underline="always">始终下划线</Link>
  <Link href="#" underline="none">无下划线</Link>
</>`,
      render: () => (
        <div className="flex gap-4">
          <Link href="#" underline="hover">悬停下划线</Link>
          <Link href="#" underline="always">始终下划线</Link>
          <Link href="#" underline="none">无下划线</Link>
        </div>
      ),
    },
    {
      title: "外链",
      description: "external 自动加 target=_blank + rel 安全属性，并附外链图标。",
      code: `<Link href="https://base-ui.com" external>Base UI 官网</Link>`,
      render: () => (
        <Link href="https://base-ui.com" external>
          Base UI 官网
        </Link>
      ),
    },
  ],
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
