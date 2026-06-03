"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Avatar } from "./avatar";

const IMG = "/demo/avatar-12.jpg";

export const avatarShowcase: ShowcaseSpec = {
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
