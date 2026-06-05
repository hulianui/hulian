import { cn } from "../lib/cn";
import type { ContainerProps, ContainerSize } from "./container.types";

// 页面内容容器（纯皮肤·可 RSC）：限制最大宽度 + 居中 + 左右安全内距。
// 收口「mx-auto max-w-Nxl px-6」这一全站最高频的布局样板，as 多态保留语义标签。
const MAX: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  full: "max-w-none",
};

export function Container({ size = "xl", padded = true, as, className, ...props }: ContainerProps) {
  const Comp = as ?? "div";
  return (
    <Comp
      className={cn("w-full", MAX[size], padded && "mx-auto px-6 sm:px-8", className)}
      {...props}
    />
  );
}
