import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { WATCH_MODELS, type WatchProps } from "./watch.types";

// 瑚琏 Watch（Apple Watch 系手表外壳）：纯 CSS（RSC 安全）；表壳/表冠用 foreground token（themeable）；表盘区 bg token。
// 特征——大圆角 squircle 表壳 + 右侧凸出数码表冠 + 侧边按钮；表壳比例 ~5/6（略竖长）。
export function Watch({ imageSrc, children, width, model, className, style, ...props }: WatchProps) {
  const resolvedWidth = width ?? (model ? WATCH_MODELS[model] : 184);
  return (
    <div
      {...props}
      style={{ width: resolvedWidth, aspectRatio: "5 / 6", ...style } as CSSProperties}
      className={cn(
        "relative rounded-[28%] border-[6px] border-foreground bg-foreground shadow-2xl",
        className,
      )}
    >
      {/* 数码表冠（右侧凸出旋钮）：负 right 需超过 6px 边框才能探出外缘 */}
      <div className="absolute -right-[10px] top-[34%] h-[16%] w-[7px] rounded-full bg-foreground" />
      {/* 侧边按钮 */}
      <div className="absolute -right-[9px] top-[57%] h-[11%] w-[6px] rounded-full bg-foreground/80" />
      {/* 表盘 */}
      <div className="h-full w-full overflow-hidden rounded-[22%] bg-bg">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="block h-full w-full object-cover" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
