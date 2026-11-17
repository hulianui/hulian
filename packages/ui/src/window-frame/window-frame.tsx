import { memo } from "react";
import { cn } from "../lib/cn";
import type { WindowFrameProps } from "./window-frame.types";

// 紧凑的应用窗口外框：三色点 + 标题 + 右侧操作槽，把一块产品界面包成「一张截图」。
// 与 Safari / Chrome 的区别：它不是浏览器，没有地址栏 / 标签页 —— 产品预览、AI 对话窗、
// 代码演示这类「一个应用窗口」用它。纯 CSS，可 RSC。
// 三个点用 macOS 固定色：设备拟物的真实世界约定，不跟主题色走（与 Safari 同一处例外）。
function WindowFrameImpl({ title, toolbar, className, children, ...rest }: WindowFrameProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-lg",
        className,
      )}
      {...rest}
    >
      <div className="flex shrink-0 items-center gap-1.5 border-b border-border/70 bg-muted/40 px-4 py-2.5">
        <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#ff5f57]" />
        <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#febc2e]" />
        <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[#28c840]" />
        {title != null && (
          <span
            className={cn(
              "ml-3 flex min-w-0 items-center",
              typeof title === "string" && "truncate font-mono text-xs text-muted-foreground",
            )}
          >
            {title}
          </span>
        )}
        {toolbar != null && <span className="ml-auto flex items-center gap-1">{toolbar}</span>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
WindowFrameImpl.displayName = "WindowFrame";

export const WindowFrame = memo(WindowFrameImpl);
WindowFrame.displayName = "WindowFrame";
