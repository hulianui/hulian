"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Sortable } from "./sortable";

interface Field {
  id: string;
  label: string;
  hint: string;
}

// 真实 B 端场景：表格「列设置」抽屉里拖拽调整列顺序
const initialFields: Field[] = [
  { id: "order-no", label: "订单编号", hint: "唯一标识" },
  { id: "customer", label: "客户名称", hint: "来自客户主数据" },
  { id: "amount", label: "订单金额", hint: "含税" },
  { id: "status", label: "订单状态", hint: "枚举" },
  { id: "owner", label: "负责人", hint: "当前跟单人" },
  { id: "created-at", label: "创建时间", hint: "可排序" },
];

function ColumnSettingDemo({ handle = true }: { handle?: boolean }) {
  const [fields, setFields] = useState(initialFields);
  return (
    <div className="w-80">
      <p className="mb-2 text-xs text-muted">拖拽调整列顺序（手柄拖动 / 聚焦手柄后 Space 抓起 · 方向键移动 · Space 放下）</p>
      <Sortable
        items={fields}
        onChange={setFields}
        handle={handle}
        renderItem={(f) => (
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-foreground">{f.label}</span>
            <span className="shrink-0 text-xs text-muted">{f.hint}</span>
          </div>
        )}
      />
      <p className="mt-2 truncate text-xs text-muted">当前顺序：{fields.map((f) => f.label).join(" → ")}</p>
    </div>
  );
}

interface Tag {
  id: string;
  name: string;
}
const initialTags: Tag[] = [
  { id: "t1", name: "待处理" },
  { id: "t2", name: "进行中" },
  { id: "t3", name: "已完成" },
  { id: "t4", name: "已归档" },
];

function TagSortDemo() {
  const [tags, setTags] = useState(initialTags);
  return (
    <div className="max-w-md">
      <p className="mb-2 text-xs text-muted">横向拖拽排序（看板列 / 筛选标签）</p>
      <Sortable
        items={tags}
        orientation="horizontal"
        onChange={setTags}
        renderItem={(t) => <span className="font-medium text-foreground">{t.name}</span>}
      />
    </div>
  );
}

export const sortableShowcase: ShowcaseSpec = {
  controls: [{ prop: "handle", type: "boolean", defaultValue: true, label: "仅手柄可拖" }],
  states: [
    { name: "列设置 · 手柄拖拽（垂直 · 键盘可达）", render: () => <ColumnSettingDemo handle /> },
    { name: "整项可拖（无手柄）", render: () => <ColumnSettingDemo handle={false} /> },
    { name: "横向排序（看板列 / 标签）", render: () => <TagSortDemo /> },
  ],
  renderWithProps: (p) => <ColumnSettingDemo handle={Boolean(p.handle)} />,
  toCode: (p) =>
    [
      "const [items, setItems] = useState(fields);",
      "",
      "<Sortable",
      "  items={items}",
      "  onChange={setItems}",
      `  handle={${Boolean(p.handle)}}`,
      "  renderItem={(f) => <span>{f.label}</span>}",
      "/>",
    ].join("\n"),
};
