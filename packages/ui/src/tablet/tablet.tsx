import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { TABLET_MODELS, type TabletProps } from "./tablet.types";

// 瑚琏 Tablet（iPad 系平板外壳）：纯 CSS（RSC 安全）；机身边框用 foreground token（themeable）；屏幕区 bg token。
// 区别手机——更薄相对边框、更小圆角、4:3 系机身比例、前置摄像头落在顶部边框居中（非屏内打孔）。
export function Tablet({ imageSrc, children, width, model, className, style, ...props }: TabletProps) {
  const preset = model ? TABLET_MODELS[model] : undefined;
  const resolvedWidth = width ?? preset?.width ?? 320;
  const aspectRatio = preset?.aspectRatio ?? "3 / 4.2";
  return (
    <div
      {...props}
      style={{ width: resolvedWidth, aspectRatio, ...style } as CSSProperties}
      className={cn(
        "relative rounded-[1.8rem] border-[14px] border-foreground bg-foreground shadow-2xl",
        className,
      )}
    >
      {/* 前置摄像头（顶部边框居中）：负 top 探入 14px 边框内居中，而非落在屏幕上 */}
      <div className="absolute left-1/2 -top-[9px] z-10 size-1.5 -translate-x-1/2 rounded-full bg-bg/50" />
      {/* 屏幕 */}
      <div className="h-full w-full overflow-hidden rounded-[0.6rem] bg-bg">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="block h-full w-full object-cover" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
