import type { CSSProperties, ReactNode } from "react";

export interface LanyardProps {
  /**
   * 挂绳长度（px），即从顶部锚点到工牌钩扣的静止悬挂距离，默认 120。
   * 越大摆幅越舒展、回弹越慢；越小越短促紧绷。
   */
  ropeLength?: number;
  /**
   * 挂绳颜色，默认取主色 var(--color-primary)。
   * 可传任意 CSS 颜色字符串（hex / oklch / var(--color-…)）。
   * 注意：喂给 SVG stroke 的 token 必须带 --color- 前缀方能解析。
   */
  ropeColor?: string;
  /**
   * 摆动回弹刚度（弹簧常数），默认 0.045。
   * 越大回正越快越「硬」；越小越绵软、余摆更久。建议 0.02–0.12。
   */
  stiffness?: number;
  /**
   * 摆动阻尼（每帧速度衰减系数），默认 0.92。
   * 越接近 1 余摆越久（更「飘」）；越小越快静止。建议 0.85–0.97。
   */
  damping?: number;
  /**
   * 工牌正面内容（姓名 / 头像 / Logo 等）。
   * 不传则渲染一张占位工牌，含默认标题文案。
   */
  children?: ReactNode;
  /**
   * 工牌默认占位标题（仅在未传 children 时显示），默认 "瑚琏 · HULIAN"。
   */
  title?: string;
  /**
   * 工牌默认占位副标题（仅在未传 children 时显示），默认 "拖动摆一摆"。
   */
  subtitle?: string;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
