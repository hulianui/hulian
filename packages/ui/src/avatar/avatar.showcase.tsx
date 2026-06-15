"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Avatar } from "./avatar";

const IMG = "/demo/avatar-12.jpg";

export const avatarShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "图片与 fallback",
      description: "src 加载成功显示图片；失败或省略时回退 fallback（首字母 / 文字）。",
      code: `<>
  <Avatar src="/demo/avatar-12.jpg" alt="demo" fallback="ZS" />
  <Avatar fallback="瑚" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Avatar src={IMG} alt="demo" fallback="ZS" />
          <Avatar fallback="瑚" />
        </div>
      ),
    },
    {
      title: "尺寸",
      description: "size 提供 sm / md / lg / xl / 2xl 五档直径。",
      code: `<>
  <Avatar size="sm" fallback="S" />
  <Avatar size="md" fallback="M" />
  <Avatar size="lg" fallback="L" />
  <Avatar size="xl" fallback="XL" />
  <Avatar size="2xl" fallback="2X" />
</>`,
      render: () => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback="S" />
          <Avatar size="md" fallback="M" />
          <Avatar size="lg" fallback="L" />
          <Avatar size="xl" fallback="XL" />
          <Avatar size="2xl" fallback="2X" />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "src", type: "text", defaultValue: IMG, label: "图片 URL" },
    { prop: "fallback", type: "text", defaultValue: "ZS", label: "fallback" },
  ],
  states: [
    { name: "图片", render: () => <Avatar src={IMG} alt="demo" fallback="ZS" /> },
    { name: "fallback", render: () => <Avatar fallback="瑚" /> },
    { name: "sm", render: () => <Avatar size="sm" fallback="S" /> },
    { name: "lg", render: () => <Avatar size="lg" fallback="L" /> },
  ],
  renderWithProps: (p) => (
    <Avatar
      size={p.size as "sm" | "md" | "lg"}
      src={(p.src as string) || undefined}
      alt="demo"
      fallback={p.fallback as string}
    />
  ),
  toCode: (p) => `<Avatar size="${p.size}" src="${p.src}" fallback="${p.fallback}" />`,
};
