import { cn } from "../lib/cn";
import type { AspectRatioProps } from "./aspect-ratio.types";

// 纯皮肤比例容器（可 RSC）。用 CSS aspect-ratio 锁定宽高比，子元素默认铺满（图片 object-cover）。
export function AspectRatio({ ratio = 1, className, style, children, ...props }: AspectRatioProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>video]:h-full [&>video]:w-full [&>video]:object-cover",
        className,
      )}
      style={{ aspectRatio: String(ratio), ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
