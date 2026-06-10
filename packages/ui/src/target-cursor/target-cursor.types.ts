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
   * 是否隐藏系统默认光标。容器作用域（默认）只隐藏父容器内的光标；
   * fullScreen 模式则接管 document.body 的 cursor（卸载均还原）。
   * @default true
   */
  hideDefaultCursor?: boolean;
  /**
   * 是否升级为整页全屏光标：根节点 fixed 铺满 viewport、事件监听挂 window。
   * 默认 false（容器作用域）——准星 absolute 锚定在父容器内、只响应容器内指针、
   * 指针离开容器即隐藏，多实例并存（如文档画廊）互不干扰。
   * 容器作用域要求父元素为定位上下文；若父元素是 static，组件会就地补 position:relative 并在卸载时还原。
   * @default false
   */
  fullScreen?: boolean;
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
   * 透传到根容器的额外类名（默认根为 absolute 容器作用域指针图层；fullScreen 时为 fixed 全屏图层）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
