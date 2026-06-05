import type { CSSProperties, ReactNode } from "react";

export interface ScrambledTextProps {
  /** 要逐字打乱的文本（仅纯文本子节点，内部会拆成单字符 span） */
  children: ReactNode;
  /**
   * 指针生效半径（px）。指针落在某字符中心此半径内时该字才触发乱码翻滚。
   * @default 100
   */
  radius?: number;
  /**
   * 单字乱码翻滚的最长持续时间（秒）。离指针越近越接近此值，越远越短。
   * @default 1.2
   */
  duration?: number;
  /**
   * 翻滚速度（0~1）。值越大每帧切换乱码字符越频繁，收敛越快。
   * @default 0.5
   */
  speed?: number;
  /**
   * 乱码过程中随机替换用的字符集，逐字符循环取样。
   * @default ".:"
   */
  scrambleChars?: string;
  /** 透传到根元素的额外类名（cn 合并） */
  className?: string;
  /** 透传到根元素的内联样式 */
  style?: CSSProperties;
}
