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
