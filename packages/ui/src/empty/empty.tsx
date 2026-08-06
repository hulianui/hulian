import { memo } from "react";
import { cn } from "../lib/cn";
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

function EmptyImpl({ icon, title, description, size = "md", className, children, ...props }: EmptyProps) {
  const sm = size === "sm";
  return (
    <div
      className={cn("flex flex-col items-center justify-center text-center", sm ? "gap-2 py-6" : "gap-3 py-10", className)}
      {...props}
    >
      {icon !== null && (
        <span className={cn("text-muted/70", sm ? "[&_svg]:size-10" : "[&_svg]:size-14")}>
          {icon ?? <DefaultIcon />}
        </span>
      )}
      {title != null && (
        <div className={cn("font-medium text-foreground", sm ? "text-sm" : "text-base")}>{title}</div>
      )}
      {description != null && (
        <div className={cn("max-w-xs text-muted", sm ? "text-xs" : "text-sm")}>{description}</div>
      )}
      {children != null && <div className={cn(sm ? "mt-1" : "mt-2")}>{children}</div>}
    </div>
  );
}

EmptyImpl.displayName = "Empty";

// #89：父级稳定更新时 React 无法自己 bailout，只能靠 memo —— 与 Button/Checkbox/Chip 同一处方。
export const Empty = memo(EmptyImpl);
Empty.displayName = "Empty";
