"use client";
import { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Avatar } from "../avatar";
import type { ShowcaseSpec } from "../showcase/types";
import { Chip } from "./chip";

type Variant = "solid" | "soft" | "outline";
type Tone = "brand" | "danger" | "neutral";

function Removable() {
  const [items, setItems] = useState(["React", "Vue", "Svelte", "Solid"]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((t) => (
        <Chip key={t} onClose={() => setItems((s) => s.filter((x) => x !== t))}>
          {t}
        </Chip>
      ))}
      {items.length === 0 && <span className="text-sm text-muted">全部移除</span>}
    </div>
  );
}

export const chipShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["soft", "solid", "outline"], defaultValue: "soft" },
    { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
  ],
  states: [
    {
      name: "soft",
      render: () => (
        <div className="flex gap-2">
          <Chip tone="brand">品牌</Chip>
          <Chip tone="danger">危险</Chip>
          <Chip tone="neutral">中性</Chip>
        </div>
      ),
    },
    {
      name: "solid",
      render: () => (
        <div className="flex gap-2">
          <Chip variant="solid" tone="brand">品牌</Chip>
          <Chip variant="solid" tone="danger">危险</Chip>
        </div>
      ),
    },
    {
      name: "outline",
      render: () => (
        <div className="flex gap-2">
          <Chip variant="outline" tone="brand">品牌</Chip>
          <Chip variant="outline" tone="neutral">中性</Chip>
        </div>
      ),
    },
    {
      name: "dot",
      render: () => (
        <div className="flex gap-2">
          <Chip dot tone="brand">在线</Chip>
          <Chip dot tone="danger">离线</Chip>
        </div>
      ),
    },
    {
      name: "avatar",
      render: () => (
        <div className="flex gap-2">
          <Chip tone="brand" avatar={<Avatar fallback="安" />}>
            安娜
          </Chip>
          <Chip variant="outline" tone="neutral" avatar={<Avatar fallback="B" src="https://i.pravatar.cc/40?img=5" />} onClose={() => {}}>
            Bob
          </Chip>
        </div>
      ),
    },
    {
      name: "startContent",
      render: () => (
        <div className="flex gap-2">
          <Chip tone="brand" startContent={<Sparkles className="size-3.5" />}>
            New
          </Chip>
          <Chip variant="solid" tone="brand" startContent={<Check className="size-3.5" />}>
            已完成
          </Chip>
        </div>
      ),
    },
    {
      name: "disabled",
      render: () => (
        <div className="flex gap-2">
          <Chip isDisabled>禁用</Chip>
          <Chip isDisabled onClose={() => {}}>
            禁用可关闭
          </Chip>
        </div>
      ),
    },
    { name: "removable", render: () => <Removable /> },
  ],
  renderWithProps: (p) => (
    <Chip variant={(p.variant as Variant) ?? "soft"} tone={(p.tone as Tone) ?? "brand"} onClose={() => {}}>
      可关闭
    </Chip>
  ),
  toCode: (p) =>
    `<Chip${p.variant && p.variant !== "soft" ? ` variant="${p.variant}"` : ""}${p.tone && p.tone !== "brand" ? ` tone="${p.tone}"` : ""} onClose={() => {}}>标签</Chip>`,
};
