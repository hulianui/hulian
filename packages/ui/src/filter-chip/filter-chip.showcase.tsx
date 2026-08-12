"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { FilterChip, FilterChipGroup } from "./filter-chip";

type Condition = { id: string; subject: string; operator?: string; value: string };

const initial: Condition[] = [
  { id: "status", subject: "状态", operator: "属于以下任一项", value: "已选 2 项" },
  { id: "owner", subject: "负责人", value: "张三" },
  { id: "due", subject: "截止日期", operator: "早于", value: "2026-09-01" },
];

function FilterBar() {
  const [items, setItems] = useState(initial);
  return (
    <div className="space-y-2">
      <FilterChipGroup onClearAll={() => setItems([])}>
        {items.map((c) => (
          <FilterChip
            key={c.id}
            subject={c.subject}
            operator={c.operator}
            value={c.value}
            onRemove={() => setItems((s) => s.filter((x) => x.id !== c.id))}
          />
        ))}
      </FilterChipGroup>
      {items.length === 0 && (
        <span className="text-sm text-muted-foreground">没有筛选条件</span>
      )}
    </div>
  );
}

// 值区常是「几个头像负重叠 + 一句已选 N 项」。这里用最小节点示意重叠堆叠，
// 换成任何自定义节点都可以 —— value 收的是 ReactNode，不是 string。
function StackedValue() {
  return (
    <span className="flex items-center">
      <span className="flex size-4 items-center justify-center rounded-full bg-primary/15 text-[9px] text-primary ring-1 ring-surface">
        安
      </span>
      <span className="-ml-1 flex size-4 items-center justify-center rounded-full bg-success/15 text-[9px] text-success ring-1 ring-surface">
        博
      </span>
      <span className="ml-1">已选 2 人</span>
    </span>
  );
}

export const filterChipShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "三段结构",
      description:
        "主语 ｜ 操作符 ｜ 值，段间竖分隔线；主语字重最重，操作符弱一档。传 onRemove 才出现末尾的移除按钮。",
      code: `<FilterChip
  subject="状态"
  operator="属于以下任一项"
  value="已选 2 项"
  onRemove={() => remove("status")}
/>`,
      render: () => (
        <FilterChip
          subject="状态"
          operator="属于以下任一项"
          value="已选 2 项"
          onRemove={() => {}}
        />
      ),
    },
    {
      title: "省略操作符退化成两段",
      description: "只有主语和值的条件不传 operator，胶囊自动少一栏，而不是留一条空栏。",
      code: `<FilterChip subject="负责人" value="张三" onRemove={remove} />`,
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip subject="负责人" value="张三" onRemove={() => {}} />
          <FilterChip subject="优先级" value="紧急" onRemove={() => {}} />
        </div>
      ),
    },
    {
      title: "值是富节点",
      description: "value 收 ReactNode：头像堆叠、状态图标、「已选 N 项」都可以直接塞进来。",
      code: `<FilterChip
  subject="参与者"
  operator="包含"
  value={
    <>
      <StackedAvatars users={users} />
      <span>已选 2 人</span>
    </>
  }
  onRemove={remove}
/>`,
      render: () => (
        <FilterChip
          subject="参与者"
          operator="包含"
          value={<StackedValue />}
          onRemove={() => {}}
        />
      ),
    },
    {
      title: "整段可点重开筛选菜单",
      description:
        "传 onClick 后本体变成按钮（点它重新打开对应的筛选菜单），移除按钮是它的兄弟节点而非后代，故点 × 不会顺带触发 onClick，无需自己写 stopPropagation。",
      code: `<FilterChip
  subject="状态"
  operator="属于以下任一项"
  value="已选 2 项"
  onClick={() => openFilterMenu("status")}
  onRemove={() => remove("status")}
/>`,
      render: () => (
        <FilterChip
          subject="状态"
          operator="属于以下任一项"
          value="已选 2 项"
          onClick={() => {}}
          onRemove={() => {}}
        />
      ),
    },
    {
      title: "成行排布与清除全部",
      description:
        "FilterChipGroup 负责换行排布、行尾「清除全部」和分组无障碍名；一条筛选条件都没有时整行不渲染。",
      code: `<FilterChipGroup onClearAll={() => setItems([])}>
  {items.map((c) => (
    <FilterChip
      key={c.id}
      subject={c.subject}
      operator={c.operator}
      value={c.value}
      onRemove={() => remove(c.id)}
    />
  ))}
</FilterChipGroup>`,
      render: () => <FilterBar />,
    },
    {
      title: "尺寸与禁用",
      description: "size 只换高度、字号与段内边距，不改结构；isDisabled 让本体与移除按钮一起失效。",
      code: `<>
  <FilterChip size="sm" subject="状态" value="进行中" onRemove={remove} />
  <FilterChip subject="状态" value="进行中" onRemove={remove} />
  <FilterChip isDisabled subject="状态" value="进行中" onRemove={remove} />
</>`,
      render: () => (
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip size="sm" subject="状态" value="进行中" onRemove={() => {}} />
          <FilterChip subject="状态" value="进行中" onRemove={() => {}} />
          <FilterChip isDisabled subject="状态" value="进行中" onRemove={() => {}} />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    { prop: "operator", type: "text", defaultValue: "属于以下任一项" },
  ],
  states: [
    {
      name: "三段",
      render: () => (
        <FilterChip subject="状态" operator="属于以下任一项" value="已选 2 项" onRemove={() => {}} />
      ),
    },
    {
      name: "两段",
      render: () => <FilterChip subject="负责人" value="张三" onRemove={() => {}} />,
    },
    {
      name: "可点本体",
      render: () => (
        <FilterChip subject="状态" operator="等于" value="进行中" onClick={() => {}} onRemove={() => {}} />
      ),
    },
    {
      name: "无移除按钮",
      render: () => <FilterChip subject="状态" operator="等于" value="进行中" />,
    },
    {
      name: "sm",
      render: () => (
        <FilterChip size="sm" subject="状态" operator="等于" value="进行中" onRemove={() => {}} />
      ),
    },
    {
      name: "禁用",
      render: () => (
        <FilterChip isDisabled subject="状态" operator="等于" value="进行中" onRemove={() => {}} />
      ),
    },
    {
      name: "富节点值",
      render: () => (
        <FilterChip subject="参与者" operator="包含" value={<StackedValue />} onRemove={() => {}} />
      ),
    },
    { name: "成组", render: () => <FilterBar /> },
  ],
  renderWithProps: (p) => (
    <FilterChip
      size={(p.size as "sm" | "md") ?? "md"}
      subject="状态"
      operator={(p.operator as string) || undefined}
      value="已选 2 项"
      onRemove={() => {}}
    />
  ),
  toCode: (p) =>
    `<FilterChip${p.size && p.size !== "md" ? ` size="${p.size}"` : ""} subject="状态"${p.operator ? ` operator="${p.operator}"` : ""} value="已选 2 项" onRemove={remove} />`,
};
