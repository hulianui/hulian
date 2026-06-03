import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { AndroidProps } from "./android.types";

// 吸取自 magicui.design Android（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：含居中打孔摄像头的手机外壳。
// 瑚琏化：纯 CSS（RSC 安全）；机身 foreground token；区别 iPhone——打孔摄像头(非灵动岛) + 稍小圆角 + 稍细边框。
export function Android({ imageSrc, children, width = 280, className, style, ...props }: AndroidProps) {
  return (
    <div
      {...props}
      style={{ width, aspectRatio: "9 / 19.5", ...style } as CSSProperties}
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
