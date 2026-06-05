import { cn } from "../lib/cn";
import type { ChromeProps } from "./chrome.types";

// 瑚琏自制 Chrome 浏览器外壳（对照 magicui 仅有 Safari 的缺口）：标签页条 + 工具栏包裹截图/children。
// 瑚琏化：纯 CSS + 极简内联 SVG（RSC 安全，无 client）；chrome 各层用 surface/bg/border token 吃明暗；
// 三个红绿灯点用 macOS 固定色（设备拟物的真实世界约定，非主题色，刻意例外，与 Safari 一致）。
// 视觉分层：标签条底 = bg（窗口顶部较暗区）；激活标签 + 工具栏 = surface（与下方融为一体）；内容区 = bg。
export function Chrome({
  url = "hulian.design",
  title,
  imageSrc,
  children,
  className,
  ...props
}: ChromeProps) {
  return (
    <div
      {...props}
      className={cn("overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg", className)}
    >
      {/* 标签页条：红绿灯 + 单个激活标签 */}
      <div className="flex items-end gap-2 bg-bg px-3 pt-2">
        <div className="flex shrink-0 items-center gap-1.5 pb-2">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="ml-1 flex min-w-0 max-w-[200px] flex-1 items-center gap-2 rounded-t-lg bg-surface px-3 py-1.5 text-xs text-foreground">
          <span className="size-3 shrink-0 rounded-full bg-primary/70" aria-hidden />
          <span className="truncate">{title ?? url}</span>
        </div>
      </div>
      {/* 工具栏：前进/后退/刷新 + 地址栏胶囊 */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-3 py-2">
        <div className="flex shrink-0 items-center gap-1 text-muted [&_svg]:size-4">
          {/* back */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m15 18-6-6 6-6" />
          </svg>
          {/* forward */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="m9 18 6-6-6-6" />
          </svg>
          {/* reload */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-bg px-3 py-1 text-xs text-muted">
          {/* lock */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3 shrink-0" aria-hidden>
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="truncate">{url}</span>
        </div>
        <div className="w-6 shrink-0" />
      </div>
      {/* 内容区 */}
      <div className="bg-bg">
        {imageSrc ? <img src={imageSrc} alt="" className="block w-full" /> : children}
      </div>
    </div>
  );
}
