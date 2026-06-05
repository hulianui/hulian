import { cn } from "../lib/cn";
import type { SafariProps } from "./safari.types";

// 吸取自 magicui.design Safari（瑚琏风 CSS 框，非 verbatim 巨型 SVG）：浏览器窗口外壳包裹截图/children。
// 瑚琏化：纯 CSS（RSC 安全）；窗口 chrome 用 surface/border token 吃明暗；
// 三个红绿灯点用 macOS 固定色（设备拟物的真实世界约定，非主题色，刻意例外）。
export function Safari({ url = "hulian.design", imageSrc, children, className, ...props }: SafariProps) {
  return (
    <div
      {...props}
      className={cn("overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg", className)}
    >
      {/* 顶栏：红绿灯 + 地址胶囊 */}
      <div className="flex items-center gap-2 border-b border-border bg-bg px-3 py-2">
        <div className="flex shrink-0 gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex max-w-[60%] flex-1 items-center justify-center truncate rounded-md bg-surface px-3 py-1 text-xs text-muted">
          {url}
        </div>
        <div className="w-12 shrink-0" />
      </div>
      {/* 内容区 */}
      <div className="bg-bg">
        {imageSrc ? <img src={imageSrc} alt="" className="block w-full" /> : children}
      </div>
    </div>
  );
}
