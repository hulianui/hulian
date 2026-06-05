import type { CSSProperties } from "react";

/** Shuffle 洗牌方向：每个字位解析前从该侧滚入随机字符 */
export type ShuffleDirection = "left" | "right";

/** 渲染所用标签（与 React Bits 的 tag 对齐，限定为安全的内联/块级文本标签） */
export type ShuffleTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4";

export interface ShuffleProps {
  /** 最终要呈现的文本（解析目标） */
  text: string;
  /**
   * 整段洗牌动画的时长（秒）。字符按从一侧到另一侧的顺序依次锁定，
   * 实际每字解析点 = 该字索引 / 总字数 × duration。
   * @default 0.6
   */
  duration?: number;
  /** 洗牌方向：字符解析顺序与滚动方向，left 从右往左定、right 从左往右定。 @default "right" */
  shuffleDirection?: ShuffleDirection;
  /**
   * 乱码字符集。解析前每个字位会从中随机取字闪烁。
   * 默认混合大写字母 + 数字 + 少量符号，营造「电传打字机/解密」质感。
   */
  scrambleCharset?: string;
  /** 是否循环播放（解析完成后清空重洗）。 @default false */
  loop?: boolean;
  /** 循环间隔（秒，仅 loop 时生效）。 @default 1 */
  loopDelay?: number;
  /** 是否在元素进入视口时才触发（IntersectionObserver）。 @default true */
  triggerOnView?: boolean;
  /** triggerOnView 时，进入视口是否只触发一次。 @default true */
  triggerOnce?: boolean;
  /** 鼠标移入时重新洗牌（动画空闲时才响应）。 @default false */
  triggerOnHover?: boolean;
  /** 渲染标签。 @default "p" */
  tag?: ShuffleTag;
  /** 文本对齐。 @default "center" */
  textAlign?: CSSProperties["textAlign"];
  /** 解析完成回调（loop 时每轮结束都会触发）。 */
  onShuffleComplete?: () => void;
  /** 合并到根元素的类名 */
  className?: string;
  /** 行内样式（会与 textAlign 合并） */
  style?: CSSProperties;
}
