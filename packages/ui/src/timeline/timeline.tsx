import { Children, cloneElement, isValidElement, type ReactElement } from "react";
import { cn } from "../lib/cn";
import type {
  TimelineDotColor,
  TimelineItemInternalProps,
  TimelineItemProps,
  TimelineProps,
} from "./timeline.types";

// 纯皮肤（零依赖·零浮层·无 hook/state → RSC 安全，照 breadcrumb/alert 范式，本体不加 "use client"）：
// 复合 Timeline/TimelineItem + items 数组双 API。Timeline 作编排者，用 cloneElement 给每个
// TimelineItem 注入布局元信息（_mode/_side/_last/_lineDashed，照 Resizable __index 先例），
// 故 TimelineItem 既能直接作 children，也能由 items 构造，且单一布局逻辑不重复。

// 默认圆点的语气色 —— 字面查表（Tailwind @source 只扫字面量，禁动态拼 `bg-${color}`）。
const dotColorClass: Record<TimelineDotColor, string> = {
  default: "bg-muted",
  primary: "bg-primary",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

// 节点容器文字色 —— 自定义 dot（多用 currentColor 的 SVG）靠它上色，与 color 语气对齐。
// 默认圆点走 bg-* 自带色，不依赖此项（故 default 仍取 muted 不影响）。
const dotTextClass: Record<TimelineDotColor, string> = {
  default: "text-muted",
  primary: "text-primary",
  success: "text-success",
  danger: "text-danger",
  warning: "text-warning",
};

function DefaultDot({ color, pending }: { color: TimelineDotColor; pending: boolean }) {
  // pending=加载态旋转环（纯 CSS animate-spin，reduced-motion 降级静止）。
  if (pending) {
    return (
      <span className="size-3 rounded-full border-2 border-border border-t-primary animate-spin motion-reduce:animate-none" />
    );
  }
  return <span className={cn("size-3 rounded-full", dotColorClass[color])} />;
}

export function TimelineItem({
  dot,
  color = "default",
  label,
  pending = false,
  children,
  className,
  _mode = "left",
  _side = "left",
  _last = false,
  _lineDashed = false,
}: TimelineItemInternalProps) {
  // 节点列：圆点在上 + 向下连线（flex-1 填满本项剩余高度，连到下一项圆点）。
  // mt-0.5 让小圆点大致对齐首行文字中线；最后一项不画线。
  const node = (
    <div className="flex shrink-0 flex-col items-center">
      <span className={cn("mt-0.5 flex items-center justify-center [&>svg]:size-4", dotTextClass[color])}>
        {dot ?? <DefaultDot color={color} pending={pending} />}
      </span>
      {!_last && (
        <span
          className={cn(
            "w-0 flex-1 border-l border-border",
            _lineDashed ? "border-dashed" : "border-solid",
          )}
        />
      )}
    </div>
  );

  // 内容对齐：left/alternate-right 靠左，right/alternate-left 靠右（贴近中轴/节点）。
  const alignRight = _mode === "right" || (_mode === "alternate" && _side === "left");
  const content = (
    <div
      className={cn(
        "min-w-0 flex-1",
        !_last && "pb-6",
        alignRight ? "text-right" : "text-left",
      )}
    >
      {label != null && <div className="mb-0.5 text-xs text-muted">{label}</div>}
      {children != null && <div className="text-sm text-foreground">{children}</div>}
    </div>
  );

  const spacer = <div className="flex-1" aria-hidden="true" />;

  let row: ReactElement;
  if (_mode === "right") {
    row = (
      <>
        {content}
        {node}
      </>
    );
  } else if (_mode === "alternate") {
    row =
      _side === "left" ? (
        <>
          {content}
          {node}
          {spacer}
        </>
      ) : (
        <>
          {spacer}
          {node}
          {content}
        </>
      );
  } else {
    // left（默认）
    row = (
      <>
        {node}
        {content}
      </>
    );
  }

  return <li className={cn("flex gap-3", className)}>{row}</li>;
}

export function Timeline({ items, mode = "left", pending, className, children, ...props }: TimelineProps) {
  // 统一为 TimelineItem 元素数组：items 数组路径直接构造，复合路径过滤出 TimelineItem 子节点。
  let nodes: ReactElement<TimelineItemProps>[];
  if (items) {
    nodes = items.map((it, i) => <TimelineItem key={i} {...it} />);
  } else {
    nodes = Children.toArray(children).filter(
      (c): c is ReactElement<TimelineItemProps> => isValidElement(c) && c.type === TimelineItem,
    );
  }

  // pending：末尾追加进行中的幽灵项（加载态圆点；ReactNode 时作其内容）。
  if (pending) {
    nodes = [
      ...nodes,
      <TimelineItem key="__pending" pending>
        {typeof pending === "boolean" ? null : pending}
      </TimelineItem>,
    ];
  }

  const count = nodes.length;
  return (
    <ol className={cn("flex flex-col", className)} {...props}>
      {nodes.map((node, i) => {
        const isLast = i === count - 1;
        // 连入「下一项 pending」的那条线（由本项向下画）转虚线。
        const nextPending = !isLast && Boolean((nodes[i + 1].props as TimelineItemProps).pending);
        const side = i % 2 === 0 ? "left" : "right";
        return cloneElement(node as ReactElement<TimelineItemInternalProps>, {
          key: node.key ?? i,
          _mode: mode,
          _side: side,
          _last: isLast,
          _lineDashed: nextPending,
        });
      })}
    </ol>
  );
}
