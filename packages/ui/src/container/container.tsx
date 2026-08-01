import type { ElementType } from "react";
import { cn } from "../lib/cn";
import type { ContainerProps, ContainerSize } from "./container.types";

// 页面内容容器（纯皮肤·可 RSC）：限制最大宽度 + 居中 + 左右安全内距。
// 收口「mx-auto max-w-Nxl px-6」这一全站最高频的布局样板，as 多态保留语义标签。
const MAX: Record<ContainerSize, string> = {
  sm: "max-w-2xl",
  md: "max-w-3xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-6xl",
  "3xl": "max-w-7xl",
  full: "max-w-none",
};

export function Container<E extends ElementType = "div">({
  size = "xl",
  padded = true,
  centered = true,
  as,
  className,
  ...props
}: ContainerProps<E>) {
  const Comp = (as ?? "div") as ElementType;
  return (
    <Comp
      // 居中与内距解耦：padded 只管左右内距，居中走 centered（hulianui/hulian#58）。
      className={cn("w-full", MAX[size], centered && "mx-auto", padded && "px-6 sm:px-8", className)}
      {...props}
    />
  );
}
