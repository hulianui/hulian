"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { RowActions } from "./row-actions";
import { Eye, Pencil, Trash2 } from "lucide-react";
import type { RowActionItem } from "./row-actions.types";

const ROWS = [
  { id: "IV-2026-0431", customer: "延安百货大楼", amount: "¥ 128,400", status: "已开票" },
  { id: "IV-2026-0432", customer: "广云家政服务", amount: "¥ 32,000", status: "待开票" },
];

const basic: RowActionItem[] = [
  { key: "view", label: "查看", tone: "brand" },
  { key: "edit", label: "编辑" },
  { key: "del", label: "删除", tone: "danger", confirm: { title: "确认删除这条记录？" } },
];

function Table({
  actionsOf,
  variant,
}: {
  actionsOf: (row: (typeof ROWS)[number]) => RowActionItem[];
  variant?: "text" | "button" | "icon";
}) {
  return (
    <table className="w-full text-sm">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="py-2 pe-4 text-left font-medium">发票号</th>
          <th className="py-2 pe-4 text-left font-medium">客户</th>
          <th className="py-2 pe-8 text-right font-medium">金额</th>
          <th className="py-2 text-left font-medium">操作</th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={row.id} className="border-b border-hairline">
            <td className="py-2 pe-4">{row.id}</td>
            <td className="py-2 pe-4">{row.customer}</td>
            <td className="py-2 pe-8 text-right tabular-nums">{row.amount}</td>
            <td className="py-2">
              <RowActions actions={actionsOf(row)} variant={variant} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const PLAYGROUND: RowActionItem[] = [
  { key: "view", label: "查看", tone: "brand" },
  { key: "edit", label: "编辑" },
  { key: "copy", label: "复制发票号" },
  { key: "export", label: "导出 PDF" },
  { key: "void", label: "作废", tone: "danger", confirm: { title: "确认作废这张发票？" } },
];

export const rowActionsShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["text", "button", "icon"], defaultValue: "text", label: "形态" },
    { prop: "max", type: "number", defaultValue: 3, label: "最多露出" },
  ],
  states: [
    {
      name: "文字档（默认）",
      render: () => (
        <div className="w-full max-w-2xl">
          <Table actionsOf={() => basic} />
        </div>
      ),
    },
    {
      name: "溢出菜单（动作多于 max）",
      render: () => (
        <div className="w-full max-w-2xl">
          <Table actionsOf={() => PLAYGROUND} />
        </div>
      ),
    },
  ],
  renderWithProps: (p) => (
    <div className="w-full max-w-2xl">
      <RowActions
        actions={
          p.variant === "icon"
            ? PLAYGROUND.map((a, i) => ({
                ...a,
                icon: [<Eye key="a" className="size-4" aria-hidden />, <Pencil key="b" className="size-4" aria-hidden />, <Trash2 key="c" className="size-4" aria-hidden />][i % 3],
              }))
            : PLAYGROUND
        }
        variant={p.variant === "icon" ? "icon" : p.variant === "button" ? "button" : "text"}
        max={typeof p.max === "number" ? p.max : 3}
      />
    </div>
  ),
  toCode: (p) =>
    [
      "<RowActions",
      p.variant === "text" ? null : `  variant="${p.variant}"`,
      `  max={${typeof p.max === "number" ? p.max : 3}}`,
      "  actions={actions}",
      "/>",
    ]
      .filter(Boolean)
      .join("\n"),
  examples: [
    {
      title: "基本：主操作 + 常规 + 破坏性",
      description: "层级用 tone 表达：主操作 brand、破坏性 danger、其余中性。破坏性动作给 confirm。",
      code: `<RowActions
  actions={[
    { key: "view", label: "查看", tone: "brand", onSelect: () => {} },
    { key: "edit", label: "编辑", onSelect: () => {} },
    { key: "del", label: "删除", tone: "danger", confirm: { title: "确认删除这条记录？" }, onSelect: () => {} },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <Table actionsOf={() => basic} />
        </div>
      ),
    },
    {
      title: "超出 max 自动收进菜单",
      description:
        "露出 max-1 个，其余进溢出菜单；破坏性动作在菜单里排最后并用分隔线隔开，避免手滑误触。",
      code: `<RowActions
  max={3}
  actions={[
    { key: "view", label: "查看" },
    { key: "edit", label: "编辑" },
    { key: "copy", label: "复制发票号" },
    { key: "export", label: "导出 PDF" },
    { key: "void", label: "作废", tone: "danger", confirm: { title: "确认作废这张发票？" } },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <Table
            actionsOf={() => [
              { key: "view", label: "查看" },
              { key: "edit", label: "编辑" },
              { key: "copy", label: "复制发票号" },
              { key: "export", label: "导出 PDF" },
              {
                key: "void",
                label: "作废",
                tone: "danger",
                confirm: { title: "确认作废这张发票？", description: "作废后不可恢复，需要重新开具。" },
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "按钮档（动作会改数据时）",
      description:
        "variant=button 换成描边按钮：点击范围与可点性一眼可见。语气色与文字档一致，差的只是明显程度。",
      code: `<RowActions
  variant="button"
  actions={[
    { key: "view", label: "查看", tone: "brand" },
    { key: "edit", label: "编辑" },
    { key: "del", label: "删除", tone: "danger", confirm: { title: "确认删除这条记录？" } },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <Table variant="button" actionsOf={() => basic} />
        </div>
      ),
    },
    {
      title: "图标档（密集表格）",
      description: "variant=icon 省横向空间；label 自动当无障碍名与悬浮提示，按钮上不再有可见文字。",
      code: `<RowActions
  variant="icon"
  actions={[
    { key: "view", label: "查看", icon: <Eye className="size-4" /> },
    { key: "edit", label: "编辑", icon: <Pencil className="size-4" /> },
    { key: "del", label: "删除", tone: "danger", icon: <Trash2 className="size-4" />, confirm: { title: "确认删除？" } },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <Table
            actionsOf={() => [
              { key: "view", label: "查看", icon: <Eye className="size-4" aria-hidden /> },
              { key: "edit", label: "编辑", icon: <Pencil className="size-4" aria-hidden /> },
              {
                key: "del",
                label: "删除",
                tone: "danger",
                icon: <Trash2 className="size-4" aria-hidden />,
                confirm: { title: "确认删除这条记录？" },
              },
            ]}
          />
        </div>
      ),
    },
    {
      title: "禁用要给原因",
      description:
        "灰按钮本身答不了「为什么不能点」。disabledReason 会在悬浮/聚焦时说明，收进菜单时直接写在名字后面。",
      code: `<RowActions
  actions={[
    { key: "view", label: "查看" },
    { key: "del", label: "删除", tone: "danger", disabled: true, disabledReason: "已开票不可删除" },
  ]}
/>`,
      render: () => (
        <div className="w-full max-w-2xl">
          <Table
            actionsOf={(row) => [
              { key: "view", label: "查看" },
              {
                key: "del",
                label: "删除",
                tone: "danger",
                disabled: row.status === "已开票",
                disabledReason: "已开票不可删除",
                confirm: { title: "确认删除这条记录？" },
              },
            ]}
          />
        </div>
      ),
    },
  ],
};
