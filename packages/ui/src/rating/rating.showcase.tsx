"use client";
import { useState } from "react";
import type { ReactNode } from "react";
import { Heart, Star, Flame } from "lucide-react";
import type { ShowcaseSpec } from "../showcase/types";
import { Rating } from "./rating";

const ICON_MAP: Record<string, ReactNode | undefined> = {
  star: undefined, // 默认五角星
  heart: <Heart size="1em" fill="currentColor" />,
  flame: <Flame size="1em" fill="currentColor" />,
  outline: <Star size="1em" />,
};

function Demo() {
  const [v, setV] = useState<number | null>(3);
  return <Rating value={v ?? 0} onValueChange={setV} />;
}

export const ratingShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "非受控默认 3 星，点击/悬停可改分；受控时用 value + onValueChange。",
      code: `<Rating defaultValue={3} onValueChange={setValue} />`,
      render: () => <Rating defaultValue={3} />,
    },
    {
      title: "只读",
      description: "readOnly 仅展示评分，禁止交互。",
      code: `<Rating value={4} readOnly />`,
      render: () => <Rating value={4} readOnly />,
    },
    {
      title: "尺寸",
      description: "size 控制图标大小（sm / md / lg）。",
      code: `<>
  <Rating defaultValue={3} size="sm" />
  <Rating defaultValue={3} size="md" />
  <Rating defaultValue={3} size="lg" />
</>`,
      render: () => (
        <div className="flex flex-col gap-2">
          <Rating defaultValue={3} size="sm" />
          <Rating defaultValue={3} size="md" />
          <Rating defaultValue={3} size="lg" />
        </div>
      ),
    },
    {
      title: "自定义颜色",
      description: "color 接受 token var() 或任意 CSS 颜色，hover 自动派生。",
      code: `<Rating defaultValue={4} color="var(--color-warning)" />`,
      render: () => <Rating defaultValue={4} color="var(--color-warning)" />,
    },
    {
      title: "自定义图标",
      description: "icon 透传任意图标（如 ❤️），空状态复用同形状。",
      code: `<Rating
  defaultValue={3}
  color="var(--color-danger)"
  icon={<Heart size="1em" fill="currentColor" />}
/>`,
      render: () => (
        <Rating
          defaultValue={3}
          color="var(--color-danger)"
          icon={<Heart size="1em" fill="currentColor" />}
        />
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md", label: "尺寸" },
    {
      prop: "color",
      type: "select",
      options: ["var(--color-primary)", "var(--color-danger)", "var(--color-warning)", "#f59e0b"],
      defaultValue: "var(--color-primary)",
      label: "星色",
    },
    {
      prop: "icon",
      type: "select",
      options: ["star", "heart", "flame", "outline"],
      defaultValue: "star",
      label: "图标",
    },
    { prop: "readOnly", type: "boolean", defaultValue: false, label: "只读" },
  ],
  states: [
    { name: "可交互", render: () => <Demo /> },
    { name: "只读", render: () => <Rating value={4} readOnly /> },
    { name: "lg", render: () => <Rating defaultValue={3} size="lg" /> },
    { name: "改色", render: () => <Rating defaultValue={4} color="var(--color-warning)" /> },
    {
      name: "换 icon",
      render: () => (
        <Rating defaultValue={3} color="var(--color-danger)" icon={<Heart size="1em" fill="currentColor" />} />
      ),
    },
  ],
  renderWithProps: (p) => (
    <Rating
      defaultValue={3}
      size={(p.size as "sm" | "md" | "lg") ?? "md"}
      color={(p.color as string) ?? "var(--color-primary)"}
      icon={ICON_MAP[(p.icon as string) ?? "star"]}
      readOnly={p.readOnly === true}
    />
  ),
  toCode: (p) => {
    const icon = (p.icon as string) ?? "star";
    const iconAttr = icon === "star" ? "" : ` icon={<${icon === "outline" ? "Star" : icon[0].toUpperCase() + icon.slice(1)} size="1em"${icon === "outline" ? "" : ' fill="currentColor"'} />}`;
    return `<Rating defaultValue={3} size="${p.size ?? "md"}" color="${p.color ?? "var(--color-primary)"}"${iconAttr}${p.readOnly ? " readOnly" : ""} />`;
  },
};
