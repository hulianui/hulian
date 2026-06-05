import type { CSSProperties } from "react";

export interface ASCIITextProps {
  /**
   * 要转换为 ASCII 字符画的文本，默认 "瑚琏"。
   * 文本会先渲染到离屏 canvas，再按像素亮度逐格映射为字符。
   */
  text?: string;
  /**
   * ASCII 字符画的字号（px），决定字符网格密度，默认 8。
   * 越小字符越密、细节越多但越费算力；建议 6–14。
   */
  asciiFontSize?: number;
  /**
   * 离屏渲染源文本的字号（px），越大采样分辨率越高，默认 160。
   * 与 asciiFontSize 的比值近似等于字符网格列数。
   */
  textFontSize?: number;
  /**
   * 源文本填充色（喂给 canvas fillStyle 的原始颜色值）。
   * 默认吃瑚琏 token `var(--color-foreground)`；自定义须传可被 canvas 解析的颜色。
   */
  textColor?: string;
  /**
   * 是否开启波动位移：字符网格按行做正弦相位偏移，营造飘动感，默认 true。
   * reduced-motion 下强制静止（DOM 不变，仅停动画）。
   */
  enableWaves?: boolean;
  /**
   * 是否启用鼠标驱动的 hue-rotate 滤镜（指针相对中心的角度 → 色相旋转），默认 true。
   * 关闭后字符画保持单一色相。
   */
  enableHue?: boolean;
  /**
   * 字符亮度坡道（从暗到亮）。索引越大代表越亮的像素。
   * 默认使用经典 70 级 ASCII ramp；可传自定义字符串做风格化。
   */
  charset?: string;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
