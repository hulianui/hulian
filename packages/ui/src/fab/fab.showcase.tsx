"use client";
import { Plus, Search, Copy, ExternalLink } from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import { Fab } from "./fab";

// Fab 默认 fixed 贴视口，gallery 里会飘到整页角落；demo 用 relative 框 + className 覆盖 fixed→absolute 收进框内。
function FabBox({ withActions, label }: { withActions?: boolean; label?: string }) {
  return (
    <div
      className={`relative ${withActions ? "h-72" : "h-56"} w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface-hover`}
    >
      <div className="p-4 text-sm text-muted">
        右下角悬浮按钮{withActions ? "（点击展开子动作）" : label ? "（extended 胶囊态）" : ""}。
      </div>
      <Fab
        className="absolute bottom-4 right-4"
        label={label}
        actions={
          withActions
            ? [
                { key: "search", icon: <Search className="size-5" aria-hidden />, label: "搜索" },
                { key: "copy", icon: <Copy className="size-5" aria-hidden />, label: "复制" },
                { key: "link", icon: <ExternalLink className="size-5" aria-hidden />, label: "分享" },
              ]
            : undefined
        }
        icon={label ? <ExternalLink className="size-5" aria-hidden /> : <Plus className="size-6" aria-hidden />}
      />
    </div>
  );
}

export const fabShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "默认 fixed 贴视口右下；无 actions 时主钮直接触发 onClick。",
      code: `<Fab icon={<Plus />} onClick={() => alert("新建")} />`,
      render: () => <FabBox />,
    },
    {
      title: "Extended 胶囊",
      description: "传 label 后主钮从圆形变为「图标 + 文字」自适应宽度胶囊。",
      code: `<Fab label="返回示例库" icon={<ExternalLink />} />`,
      render: () => <FabBox label="返回示例库" />,
    },
    {
      title: "Speed-dial 子动作",
      description: "提供 actions 则点主钮展开/收起一组子动作，主钮图标旋转 45°。",
      code: `<Fab
  actions={[
    { key: "search", icon: <Search />, label: "搜索" },
    { key: "copy", icon: <Copy />, label: "复制" },
    { key: "link", icon: <ExternalLink />, label: "分享" },
  ]}
/>`,
      render: () => <FabBox withActions />,
    },
  ],
  controls: [],
  states: [
    { name: "单按钮", render: () => <FabBox /> },
    { name: "Extended 胶囊（带文字）", render: () => <FabBox label="返回示例库" /> },
    { name: "Speed-dial 子动作", render: () => <FabBox withActions /> },
  ],
  renderWithProps: () => <FabBox withActions />,
  toCode: () =>
    `<Fab\n  actions={[\n    { key: "search", icon: <Search />, label: "搜索" },\n    { key: "share", icon: <Share />, label: "分享" },\n  ]}\n/>`,
};
