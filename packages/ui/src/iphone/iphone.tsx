import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { DEVICE_METRICS, bodyHeightPx } from "../lib/device-metrics";
import { IPHONE_MODELS, type IPhoneProps } from "./iphone.types";

// 吸取自 magicui.design iPhone（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：含灵动岛的手机外壳包裹屏幕内容。
// 瑚琏化：纯 CSS（RSC 安全）；机身边框用 foreground token（themeable）；屏幕区 bg token。
// 注意：aspectRatio 用机身比例 9/18.5（≈0.486），而非 19.5:9 屏占比——含上下边框后整机更宽，才像真机。
export function IPhone({ imageSrc, children, width, model, className, style, ...props }: IPhoneProps) {
  const resolvedWidth = width ?? (model ? IPHONE_MODELS[model] : DEVICE_METRICS.iphone.defaultWidth);
  return (
    <div
      {...props}
      style={
        {
          width: resolvedWidth,
          // 机身高度由内屏比例 + 边框反推（真源 lib/device-metrics）。写死 aspectRatio 会让
          // 内屏比例随宽度漂移，PreviewSandbox 的 fit 缩放就会在短边留白（#117 / #139）。
          height: bodyHeightPx(DEVICE_METRICS.iphone, resolvedWidth),
          ...style,
        } as CSSProperties
      }
      className={cn(
        "relative rounded-[3rem] border-[10px] border-foreground bg-foreground shadow-2xl",
        className,
      )}
    >
      {/* 灵动岛 */}
      <div className="absolute left-1/2 top-2 z-10 h-6 w-1/3 -translate-x-1/2 rounded-full bg-foreground" />
      {/* 屏幕 */}
      <div className="h-full w-full overflow-hidden rounded-[2.2rem] bg-bg">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="block h-full w-full object-cover" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
