"use client";
import { Plus, Search, Copy, ExternalLink, GripVertical } from "../_icons";
import type { ShowcaseSpec } from "../showcase/types";
import { Fab } from "./fab";

// Fab 默认 fixed 贴视口，gallery 里会飘到整页角落；demo 用 relative 框 + className 覆盖 fixed→absolute 收进框内。
function FabBox({
  withActions,
  label,
  draggable,
}: {
  withActions?: boolean;
  label?: string;
  draggable?: boolean;
}) {
  return (
    <div
      className={`relative ${withActions ? "h-72" : "h-56"} w-full max-w-md overflow-hidden rounded-[var(--radius)] border border-border bg-surface-hover`}
    >
      <div className="p-4 text-sm text-muted">
        {draggable
          ? "按住悬浮按钮可拖着走（松手后停在原地）。"
          : `右下角悬浮按钮${withActions ? "（点击展开子动作）" : label ? "（extended 胶囊态）" : ""}。`}
      </div>
      <Fab
        className="absolute bottom-4 right-4"
        label={label}
        draggable={draggable}
        actions={
          withActions
            ? [
                { key: "search", icon: <Search className="size-5" aria-hidden />, label: "搜索" },
                { key: "copy", icon: <Copy className="size-5" aria-hidden />, label: "复制" },
                { key: "link", icon: <ExternalLink className="size-5" aria-hidden />, label: "分享" },
              ]
            : undefined
        }
        icon={
          // 可拖拽示例用抓握手柄图标，让「按住能拖」在按钮本体上就可读，不必只靠旁边说明文字。
          draggable ? (
            <GripVertical className="size-5" aria-hidden />
          ) : label ? (
            <ExternalLink className="size-5" aria-hidden />
          ) : (
            <Plus className="size-6" aria-hidden />
          )
        }
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
    {
      title: "可拖拽",
      description:
        "draggable 默认关闭（不开则按住不动）。开启后按住主钮即可拖到任意位置；位移超过 3px 视为拖拽，本次抬手不触发 onClick。",
      code: `<Fab draggable label="按住拖我" icon={<GripVertical />} onClick={() => alert("新建")} />`,
      render: () => <FabBox draggable label="按住拖我" />,
    },
  ],
  controls: [],
  states: [
    { name: "单按钮", render: () => <FabBox /> },
    { name: "Extended 胶囊（带文字）", render: () => <FabBox label="返回示例库" /> },
    { name: "Speed-dial 子动作", render: () => <FabBox withActions /> },
    { name: "可拖拽（draggable）", render: () => <FabBox draggable label="按住拖我" /> },
  ],
  renderWithProps: () => <FabBox withActions />,
  toCode: () =>
    `<Fab\n  actions={[\n    { key: "search", icon: <Search />, label: "搜索" },\n    { key: "share", icon: <Share />, label: "分享" },\n  ]}\n/>`,
};
