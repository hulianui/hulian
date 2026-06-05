import type { CSSProperties } from "react";

export interface TargetCursorProps {
  /**
   * 命中目标的 CSS 选择器：指针悬停到匹配元素时，四角括号会展开包裹该元素。
   * @default ".cursor-target"
   */
  targetSelector?: string;
  /**
   * 空闲态四角括号绕中心自转一圈的秒数（越小越快）。
   * @default 2
   */
  spinDuration?: number;
  /**
   * 是否隐藏系统默认光标（挂载时把 document.body 的 cursor 设为 none，卸载还原）。
   * @default true
   */
  hideDefaultCursor?: boolean;
  /**
   * 自定义光标主色（喂给 dot 背景与四角描边）。须带 `--color-` 前缀的 token 才能解析，
   * 例如 `var(--color-primary)`、`var(--color-foreground)`。
   * @default "var(--color-foreground)"
   */
  color?: string;
  /**
   * 四角括号包裹目标时的缓动跟随时长（秒），越大越「黏」。
   * @default 0.2
   */
  hoverDuration?: number;
  /**
   * 透传到根容器的额外类名（根为 fixed 全屏指针图层）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
