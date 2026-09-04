import { cn } from "./cn";

// 经典常驻滚动条皮肤（Table 外壳 / stickyScrollbar 代理条 / Chart 图例 / Gantt 共用）。
//
// macOS 默认是 overlay 滚动条：平时完全不可见，元素 offsetHeight-clientHeight 恒为 0，用户看不出
// 「右边还有内容」。给 ::-webkit-scrollbar 定了尺寸，WebKit/Blink 就退回经典常驻滚动条。
//
// 标准属性 scrollbar-width / scrollbar-color **只能给不认 ::-webkit-scrollbar 的引擎**（Firefox）：
// Chromium 121+ 规定这两个属性任一非 auto 就整体忽略 ::-webkit-scrollbar*，而 macOS 上
// scrollbar-width: thin 仍走系统 overlay 条 —— 裸写并存的结果是 Chromium 一条都不画
// （0.63.2 的 Table、0.63.3 前的 Chart / Gantt 都栽在这里，#347）。所以标准属性一律包进
// @supports not selector(::-webkit-scrollbar)。任何地方要写 scrollbar-width: thin / scrollbar-color，
// 只许从这里取，不许再裸写一份（lib/scrollbar.test.ts 扫源码守着）。
//
// 滚动条厚度（`[&::-webkit-scrollbar]:h-*` / `w-*`）由调用处按场景补：Table 外壳 h-2.5、
// Gantt h-2、Chart 图例 h-1.5 —— 那是各自的版式决定，不属于皮肤。

/** 只给不认 `::-webkit-scrollbar` 的引擎生效的变体前缀。测试拿它断言「标准属性没裸写」。 */
export const SUPPORTS_NO_WEBKIT_SCROLLBAR = "supports-[not_selector(::-webkit-scrollbar)]:";

const TRACK = "[&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full";

/** 经典常驻滚动条皮肤，按滑块取色分两档。 */
export const classicScrollbar = {
  /** 滑块取边框色（Table 外壳与 stickyScrollbar 代理条）：与表格线同一层级，悬停加深到次要文字色。 */
  border: cn(
    "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin]",
    "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--color-border)_transparent]",
    TRACK,
    "[&::-webkit-scrollbar-thumb]:bg-border hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground",
  ),
  /** 滑块取次要文字色半透明（Chart 图例 / Gantt）：给「可横滑」明确视觉与抓手，悬停加深。 */
  muted: cn(
    "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-width:thin]",
    "supports-[not_selector(::-webkit-scrollbar)]:[scrollbar-color:var(--color-muted-foreground)_transparent]",
    TRACK,
    "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/80",
  ),
} as const;
