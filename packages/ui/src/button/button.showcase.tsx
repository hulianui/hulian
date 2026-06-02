"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "./button";

export const buttonShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["solid", "outline", "ghost"], defaultValue: "solid" },
    { prop: "tone", type: "select", options: ["brand", "danger"], defaultValue: "brand" },
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "loading", type: "boolean", defaultValue: false },
    { prop: "children", type: "text", defaultValue: "瑚琏按钮", label: "文案" },
  ],
  states: [
    { name: "default", render: () => <Button>默认</Button> },
    { name: "outline", render: () => <Button variant="outline">描边</Button> },
    { name: "ghost", render: () => <Button variant="ghost">幽灵</Button> },
    { name: "danger", render: () => <Button tone="danger">危险</Button> },
    { name: "disabled", render: () => <Button disabled>禁用</Button> },
    { name: "loading", render: () => <Button loading>加载中</Button> },
  ],
  renderWithProps: (p) => (
    <Button
      variant={p.variant as "solid" | "outline" | "ghost"}
      tone={p.tone as "brand" | "danger"}
      size={p.size as "sm" | "md" | "lg"}
      loading={p.loading as boolean}
    >
      {p.children as string}
    </Button>
  ),
  toCode: (p) =>
    `<Button variant="${p.variant}" tone="${p.tone}" size="${p.size}"${p.loading ? " loading" : ""}>${p.children}</Button>`,
};
