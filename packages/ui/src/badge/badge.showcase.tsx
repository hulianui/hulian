"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Badge } from "./badge";

export const badgeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["solid", "soft", "outline"], defaultValue: "solid" },
    { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    { prop: "children", type: "text", defaultValue: "标签", label: "文案" },
  ],
  states: [
    { name: "solid", render: () => <Badge>品牌</Badge> },
    { name: "soft", render: () => <Badge variant="soft">柔和</Badge> },
    { name: "outline", render: () => <Badge variant="outline">描边</Badge> },
    { name: "danger", render: () => <Badge tone="danger">危险</Badge> },
    { name: "neutral", render: () => <Badge tone="neutral">中性</Badge> },
    { name: "sm", render: () => <Badge size="sm">小号</Badge> },
  ],
  renderWithProps: (p) => (
    <Badge
      variant={p.variant as "solid" | "soft" | "outline"}
      tone={p.tone as "brand" | "danger" | "neutral"}
      size={p.size as "sm" | "md"}
    >
      {p.children as string}
    </Badge>
  ),
  toCode: (p) =>
    `<Badge variant="${p.variant}" tone="${p.tone}" size="${p.size}">${p.children}</Badge>`,
};
