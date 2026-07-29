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

// 真实 B 端场景：问卷/试卷题目排序——行内既要显示序号（state.index），又有输入框和删除按钮。
// 整项可拖（handle=false，默认值）时这些控件不会被拖拽劫持：守卫在 sensor 层内置。
interface Question {
  id: string;
  title: string;
  score: number;
}
const initialQuestions: Question[] = [
  { id: "q1", title: "您对本次服务的整体满意度", score: 20 },
  { id: "q2", title: "上门人员是否准时", score: 15 },
  { id: "q3", title: "问题是否一次解决", score: 25 },
];

function QuestionSortDemo() {
  const [list, setList] = useState(initialQuestions);
  return (
    <div className="w-96">
      <p className="mb-2 text-xs text-muted">行内有输入框与按钮：拖它们不会触发排序，拖空白处才排序</p>
      <Sortable
        items={list}
        onChange={setList}
        renderItem={(q, { index }) => (
          <div className="flex items-center gap-2">
            <span className="w-14 shrink-0 text-xs text-muted">第 {index + 1} 题</span>
            <span className="min-w-0 flex-1 truncate font-medium text-foreground">{q.title}</span>
            <input
              type="number"
              value={q.score}
              // 行内输入框可拖选文字、可改值——序号进 aria-label，读屏才分得清是第几题的分值
              aria-label={`第 ${index + 1} 题分值`}
              onChange={(e) =>
                setList((prev) =>
                  prev.map((it) => (it.id === q.id ? { ...it, score: Number(e.target.value) } : it)),
                )
              }
              className="w-16 shrink-0 rounded-[var(--radius)] border border-border bg-surface px-2 py-1 text-xs"
            />
            <button
              type="button"
              aria-label={`删除第 ${index + 1} 题`}
              onClick={() => setList((prev) => prev.filter((it) => it.id !== q.id))}
              className="shrink-0 rounded px-2 py-1 text-xs text-muted hover:text-danger"
            >
              删除
            </button>
          </div>
        )}
      />
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
  examples: [
    {
      title: "列设置 · 手柄拖拽（垂直）",
      description: "受控 items + onChange 回吐新顺序；handle 时仅左侧手柄可拖，键盘可达。",
      code: `const [fields, setFields] = useState(initialFields);

<Sortable
  items={fields}
  onChange={setFields}
  handle
  renderItem={(f) => (
    <div className="flex items-center justify-between gap-3">
      <span className="font-medium text-foreground">{f.label}</span>
      <span className="shrink-0 text-xs text-muted">{f.hint}</span>
    </div>
  )}
/>`,
      render: () => <ColumnSettingDemo handle />,
    },
    {
      title: "整项可拖（无手柄）",
      description: "handle={false} 时整行可拖，适合行内无交互元素的简单列表。",
      code: `const [fields, setFields] = useState(initialFields);

<Sortable
  items={fields}
  onChange={setFields}
  renderItem={(f) => <span className="font-medium text-foreground">{f.label}</span>}
/>`,
      render: () => <ColumnSettingDemo handle={false} />,
    },
    {
      title: "行内交互元素 + 序号（state.index）",
      description:
        "整项可拖时，行内 input/button 不会被拖拽劫持（守卫内置在 sensor 层，无需设 handle）；state.index 直接给出下标，用于「第 N 题」与唯一 aria-label。",
      code: `<Sortable
  items={list}
  onChange={setList}
  renderItem={(q, { index }) => (
    <div className="flex items-center gap-2">
      <span className="w-14 shrink-0 text-xs text-muted">第 {index + 1} 题</span>
      <span className="min-w-0 flex-1 truncate">{q.title}</span>
      {/* 输入框可拖选文字、按钮可点，都不会触发排序 */}
      <input type="number" value={q.score} aria-label={\`第 \${index + 1} 题分值\`} onChange={...} />
      <button type="button" aria-label={\`删除第 \${index + 1} 题\`} onClick={...}>删除</button>
    </div>
  )}
/>`,
      render: () => <QuestionSortDemo />,
    },
    {
      title: "横向排序（orientation）",
      description: "orientation=\"horizontal\" 横向排列，适合看板列 / 筛选标签。",
      code: `const [tags, setTags] = useState(initialTags);

<Sortable
  items={tags}
  orientation="horizontal"
  onChange={setTags}
  renderItem={(t) => <span className="font-medium text-foreground">{t.name}</span>}
/>`,
      render: () => <TagSortDemo />,
    },
  ],
  controls: [{ prop: "handle", type: "boolean", defaultValue: true, label: "仅手柄可拖" }],
  states: [
    { name: "列设置 · 手柄拖拽（垂直 · 键盘可达）", render: () => <ColumnSettingDemo handle /> },
    { name: "整项可拖（无手柄）", render: () => <ColumnSettingDemo handle={false} /> },
    { name: "行内交互元素不劫持拖拽 + 序号（state.index）", render: () => <QuestionSortDemo /> },
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
