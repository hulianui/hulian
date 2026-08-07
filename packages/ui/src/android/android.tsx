import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import { DEVICE_METRICS, bodyHeightPx } from "../lib/device-metrics";
import { ANDROID_MODELS, type AndroidProps } from "./android.types";

// 吸取自 magicui.design Android（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：含居中打孔摄像头的手机外壳。
// 瑚琏化：纯 CSS（RSC 安全）；机身 foreground token；区别 iPhone——打孔摄像头(非灵动岛) + 稍小圆角 + 稍细边框。
// 注意：aspectRatio 用机身比例 9/18.5（≈0.486），而非 19.5:9 屏占比——含上下边框后整机更宽，才像真机。
export function Android({ imageSrc, children, width, model, className, style, ...props }: AndroidProps) {
  const resolvedWidth = width ?? (model ? ANDROID_MODELS[model] : DEVICE_METRICS.android.defaultWidth);
  return (
    <div
      {...props}
      style={
        {
          width: resolvedWidth,
          // 机身高度由内屏比例 + 边框反推（真源 lib/device-metrics）。写死 aspectRatio 会让
          // 内屏比例随宽度漂移，PreviewSandbox 的 fit 缩放就会在短边留白（#117 / #139）。
          height: bodyHeightPx(DEVICE_METRICS.android, resolvedWidth),
          ...style,
        } as CSSProperties
      }
      className={cn(
        "relative rounded-[2rem] border-[8px] border-foreground bg-foreground shadow-2xl",
        className,
      )}
    >
      {/* 屏幕 */}
      <div className="relative h-full w-full overflow-hidden rounded-[1.4rem] bg-bg">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="block h-full w-full object-cover" />
        ) : (
          children
        )}
        {/* 居中打孔摄像头 */}
        <div className="absolute left-1/2 top-2 z-10 size-2.5 -translate-x-1/2 rounded-full bg-foreground" />
      </div>
    </div>
  );
}
