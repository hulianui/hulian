import type { CSSProperties } from "react";
import { cn } from "../lib/cn";
import type { IPhoneProps } from "./iphone.types";

// 吸取自 magicui.design iPhone（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：含灵动岛的手机外壳包裹屏幕内容。
// 瑚琏化：纯 CSS（RSC 安全）；机身边框用 foreground token（themeable）；屏幕区 bg token。
export function IPhone({ imageSrc, children, width = 280, className, style, ...props }: IPhoneProps) {
  return (
    <div
      {...props}
      style={{ width, aspectRatio: "9 / 19.5", ...style } as CSSProperties}
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
