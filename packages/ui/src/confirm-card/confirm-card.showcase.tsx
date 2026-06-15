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
  examples: [
    {
      title: "基础用法",
      description: "label/value 清单 + 确认/修改双动作。onConfirm/onEdit 接业务回调。",
      code: `<ConfirmCard
  title="案卷摘要 · 请确认"
  items={[
    { label: "基本信息", value: "林晚晴 · 138-0000-0000" },
    { label: "求职意向", value: "云栖科技 · 总裁私人秘书" },
  ]}
  onConfirm={handleConfirm}
  onEdit={handleEdit}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <ConfirmCard
            title="案卷摘要 · 请确认"
            items={items}
            onConfirm={() => {}}
            onEdit={() => {}}
          />
        </div>
      ),
    },
    {
      title: "已确认（锁定）",
      description: "acted=\"confirmed\" 锁定按钮并标记所选结果。",
      code: `<ConfirmCard items={items} acted="confirmed" onConfirm={…} onEdit={…} />`,
      render: () => (
        <div className="w-full max-w-md">
          <ConfirmCard
            items={items}
            acted="confirmed"
            onConfirm={() => {}}
            onEdit={() => {}}
          />
        </div>
      ),
    },
    {
      title: "单动作场景",
      description: "不传 onEdit 即不渲染修改钮，避免出现无响应的死按钮。",
      code: `<ConfirmCard
  title="余额不足"
  items={[{ label: "当前余额", value: "¥ 0.00" }]}
  confirmText="去充值"
  onConfirm={goRecharge}
/>`,
      render: () => (
        <div className="w-full max-w-md">
          <ConfirmCard
            title="余额不足"
            items={[{ label: "当前余额", value: "¥ 0.00" }]}
            confirmText="去充值"
            onConfirm={() => {}}
          />
        </div>
      ),
    },
  ],
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
