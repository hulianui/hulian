"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { ConfirmCard } from "./confirm-card";

const items = [
  { label: "基本信息", value: "林晚晴 · 138-0000-0000" },
  { label: "求职意向", value: "云栖科技 · 总裁私人秘书" },
  { label: "教育背景", value: "江南大学 行政管理" },
  { label: "工作经历", value: "晨星集团 CEO 办公室主管" },
];

function InteractiveDemo() {
  const [acted, setActed] = useState<"confirmed" | "edited" | null>(null);
  return (
    <div className="w-full max-w-md">
      <ConfirmCard
        title="案卷摘要 · 请确认"
        items={items}
        acted={acted}
        onConfirm={() => setActed("confirmed")}
        onEdit={() => setActed("edited")}
      />
    </div>
  );
}

export const confirmCardShowcase: ShowcaseSpec = {
  controls: [],
  states: [
    { name: "待确认（可交互）", render: () => <InteractiveDemo /> },
    {
      name: "已确认（锁定）",
      render: () => (
        <div className="w-full max-w-md">
          <ConfirmCard items={items} acted="confirmed" />
        </div>
      ),
    },
  ],
  renderWithProps: () => <InteractiveDemo />,
  toCode: () => `<ConfirmCard items={[{ label, value }, …]} onConfirm={…} onEdit={…} />`,
};
