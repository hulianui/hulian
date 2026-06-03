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
