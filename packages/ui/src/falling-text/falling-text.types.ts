import type { CSSProperties } from "react";

export type FallingTextTrigger = "auto" | "scroll" | "click" | "hover";

export interface FallingTextProps {
  /**
   * 要散落的整段文本，按空格切成「词块」，每个词作为一个独立刚体下落。
   * 默认空串（不渲染任何词）。
   */
  text?: string;
  /**
   * 需要高亮的词（前缀匹配：词 startsWith 任一 highlightWord 即高亮）。
   * 例如 ["瑚琏", "token"]。默认 []。
   */
  highlightWords?: string[];
  /**
   * 高亮词额外 className（叠加在词块上）。默认 "text-primary font-semibold"
   *（瑚琏 token，替原库写死的 cyan）。
   */
  highlightClass?: string;
  /**
   * 触发掉落的时机：
   * - "auto"   挂载即开始（默认）
   * - "scroll" 滚动进入视口（IntersectionObserver）才开始
   * - "click"  点击容器才开始
   * - "hover"  指针移入容器才开始
   */
  trigger?: FallingTextTrigger;
  /**
   * 重力强度（向下加速度系数），默认 1。越大下落越快、堆叠越急。
   * 建议范围 0.3–3。
   */
  gravity?: number;
  /**
   * 落地/撞墙后的反弹系数（0=不弹，1=完全弹），默认 0.6。
   */
  bounce?: number;
  /**
   * 文本字号（CSS 长度，传入根 fontSize），默认 "1.5rem"。
   */
  fontSize?: string;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
