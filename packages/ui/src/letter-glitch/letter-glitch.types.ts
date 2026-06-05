import type { CSSProperties, HTMLAttributes } from "react";

export interface LetterGlitchProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  /**
   * 字符闪变取色的调色板，默认取瑚琏 chart token（自动吃明暗主题）。
   * 可传任意 CSS 颜色字符串数组（hex / rgb / oklch / var(--…) 均可），
   * 内部统一用离屏 canvas 解析为 RGB 再做插值过渡。
   * 默认：["var(--color-chart-2)", "var(--color-chart-1)", "var(--color-chart-4)"]
   */
  glitchColors?: string[];
  /**
   * 相邻两次字符／颜色刷新的最小间隔（毫秒），默认 50。
   * 越小越躁动密集；越大越克制稀疏。建议范围 20–200。
   */
  glitchSpeed?: number;
  /**
   * 是否启用颜色平滑过渡（逐帧插值），默认 true。
   * 关闭后字符颜色硬切（更生硬的故障感）。
   */
  smooth?: boolean;
  /**
   * 是否叠加外缘暗角（四周径向渐隐），默认 true。
   * 让字符矩阵向边缘淡出，聚焦中部内容。
   */
  outerVignette?: boolean;
  /**
   * 是否叠加中心暗角（中部压暗 → 边缘透亮），默认 false。
   * 与 outerVignette 相反方向，用于反衬中部置入的内容。
   */
  centerVignette?: boolean;
  /**
   * 参与闪变的字符集合，默认为大写字母 + 常见符号 + 数字。
   * 传入字符串，内部按码点拆分（支持任意 Unicode 字符）。
   */
  characters?: string;
  /**
   * 透传到根容器的额外 className（控制尺寸 / 圆角 / 透明度等）。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式（如自定义背景底色）。
   */
  style?: CSSProperties;
}
