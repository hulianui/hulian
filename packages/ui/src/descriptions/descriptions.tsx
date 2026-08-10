import {
  Children,
  Fragment,
  isValidElement,
  memo,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import type {
  DescriptionsItemData,
  DescriptionsItemProps,
  DescriptionsProps,
} from "./descriptions.types";

// 递归收集 DescriptionsItem 子节点的 props。
// 关键：Children.toArray 不会展开 Fragment（<>...</> 会被当成单个节点），
// 必须手动下钻，否则 Fragment 包裹的多个 item 会被误并成一格（label 丢失、值全挤一起）。
function collectItems(children: ReactNode): DescriptionsItemData[] {
  const out: DescriptionsItemData[] = [];
  Children.toArray(children).forEach((c) => {
    if (!isValidElement(c)) return;
    const el = c as ReactElement<DescriptionsItemProps>;
    if (el.type === Fragment) {
      out.push(...collectItems((el.props as { children?: ReactNode }).children));
      return;
    }
    out.push({ label: el.props.label, children: el.props.children, span: el.props.span });
  });
  return out;
}

// 纯皮肤 + CSS Grid 布局（零 Base UI、零浮层、零依赖，纯静态可 RSC，照 breadcrumb/badge 范式）：
// 详情页键值对。数据源二选一——items 数组 prop 优先，否则读 DescriptionsItem 子节点的 props。
// 全吃语义 token：label=text-muted-foreground / value=text-foreground / border=border-border，明暗自适配。

// DescriptionsItem 仅作数据载体：由父级 Descriptions 读取其 props 渲染；单独渲染时降级显示内容。
export function DescriptionsItem({ children }: DescriptionsItemProps) {
  return <>{children}</>;
}

function DescriptionsImpl({
  title,
  extra,
  column = 3,
  layout = "horizontal",
  bordered = false,
  items,
  className,
  children,
  ...props
}: DescriptionsProps) {
  // 归一化数据源：items 数组 prop 优先，否则下钻 DescriptionsItem 子节点（含 Fragment 展开）
  const data: DescriptionsItemData[] = items ?? collectItems(children);

  const vertical = layout === "vertical";

  return (
    <div className={cn("w-full text-sm", className)} {...props}>
      {(title != null || extra != null) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title != null ? (
            <div className="text-base font-medium text-foreground">{title}</div>
          ) : (
            <span />
          )}
          {extra != null ? <div className="text-muted-foreground">{extra}</div> : null}
        </div>
      )}

      <div
        className={cn(
          "grid",
          bordered &&
            "overflow-hidden rounded-[var(--radius)] border-t border-l border-border",
        )}
        style={{ gridTemplateColumns: `repeat(${column}, minmax(0, 1fr))` }}
      >
        {data.map((item, i) => {
          const span = Math.min(Math.max(item.span ?? 1, 1), column);
          const hasLabel = item.label != null;

          return (
            <div
              key={i}
              style={{ gridColumn: `span ${span} / span ${span}` }}
              className={cn(
                "min-w-0",
                bordered
                  ? cn("flex border-r border-b border-border", vertical && "flex-col")
                  : cn("py-1.5", vertical ? "flex flex-col gap-1" : "flex items-baseline gap-2"),
              )}
            >
              {hasLabel &&
                (bordered ? (
                  <div
                    className={cn(
                      "bg-surface px-4 py-2.5 font-medium text-muted-foreground",
                      vertical
                        ? "border-b border-border"
                        : "min-w-[6rem] shrink-0 whitespace-nowrap border-r border-border",
                    )}
                  >
                    {item.label}
                  </div>
                ) : (
                  <span
                    className={cn(
                      "text-muted-foreground",
                      vertical ? "text-sm" : "shrink-0 whitespace-nowrap",
                    )}
                  >
                    {item.label}
                  </span>
                ))}

              {bordered ? (
                <div className="min-w-0 flex-1 px-4 py-2.5 text-foreground">{item.children}</div>
              ) : (
                <span className="min-w-0 text-foreground">{item.children}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
DescriptionsImpl.displayName = "Descriptions";

// children 路径每次渲染都要 collectItems 递归下钻一遍（含 Fragment 展开），详情页里
// 又常和会频繁更新的操作区共存。items（或 children）引用没变、其余 props 全是原语时
// React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
// memo 在 RSC 下被 Flight 直接拆包渲染，故本体仍不需要 "use client"。
export const Descriptions = memo(DescriptionsImpl);
Descriptions.displayName = "Descriptions";
