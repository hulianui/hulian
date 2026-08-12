import { memo } from "react";
import { cn } from "../lib/cn";
import { Spinner } from "../spinner";
import type { EmptyProps } from "./empty.types";

// 空状态（可 RSC）。居中图标 + 标题 + 描述 + 操作槽，纯皮肤吃主题 token。
function DefaultIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={2} className={className} aria-hidden>
      <path d="M10 26 L20 12 H44 L54 26" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 26 H24 a8 8 0 0 0 16 0 H54 V48 a4 4 0 0 1 -4 4 H14 a4 4 0 0 1 -4 -4 Z" strokeLinejoin="round" />
    </svg>
  );
}

function EmptyImpl({
  icon,
  title,
  description,
  size = "md",
  loading = false,
  className,
  children,
  ...props
}: EmptyProps) {
  const sm = size === "sm";
  return (
    <div
      // 加载中不是「空」（#245）。不打这个标记时，读屏拿到的就是一段普通静态文本 ——
      // 而消费方正是拿 Empty 顶 loading 的，用户听到的会是「暂无数据」，语义正好相反。
      // aria-busy 说的是「这块正在更新，先别当最终内容读」；「正在加载」这句话由下面
      // Spinner 自带的 role="status" + 本地化 aria-label 播报，不在这里再开一个活区域。
      // 放在 {...props} 之前：消费方要接管 aria 仍可覆盖。
      aria-busy={loading || undefined}
      className={cn("flex flex-col items-center justify-center text-center", sm ? "gap-2 py-6" : "gap-3 py-10", className)}
      {...props}
    >
      {icon !== null && (
        <span
          className={cn(
            "text-muted-foreground/70",
            // 尺寸只钉给插画：Spinner 内层 svg 是 size-full，外面再钉一次 [&_svg]:size-*
            // 会把它撑出自己的外框，加载态改用 Spinner 自己的 size 档。
            !loading && (sm ? "[&_svg]:size-10" : "[&_svg]:size-14"),
          )}
        >
          {loading ? (
            <Spinner
              size={sm ? "md" : "lg"}
              // 与插画同一色阶：同一块区域在两态之间只换形态不跳色。
              tone="muted"
              // Spinner 的 animate-spin 自己没有减弱动效开关，而这是 Empty 新引入的动效，
              // 得由引入方负责（见 sidebar.md 的全库口径）。后代变体停掉内层 svg 的动画，
              // 定格成静态双环，DOM 不变。
              className="motion-reduce:[&_svg]:animate-none"
            />
          ) : (
            (icon ?? <DefaultIcon />)
          )}
        </span>
      )}
      {title != null && (
        <div className={cn("font-medium text-foreground", sm ? "text-sm" : "text-base")}>{title}</div>
      )}
      {description != null && (
        <div className={cn("max-w-xs text-muted-foreground", sm ? "text-xs" : "text-sm")}>{description}</div>
      )}
      {children != null && <div className={cn(sm ? "mt-1" : "mt-2")}>{children}</div>}
    </div>
  );
}

EmptyImpl.displayName = "Empty";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Empty = memo(EmptyImpl);
Empty.displayName = "Empty";
