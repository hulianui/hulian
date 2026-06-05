import type { CSSProperties, ReactNode } from "react";

export interface BlobCursorProps {
  /**
   * 拖尾水滴的数量（含领头水滴），默认 3。
   * 越多越「黏稠」，越少越轻盈。领头水滴跟手最快，其后逐级延迟形成拖尾。
   */
  trailCount?: number;
  /**
   * 各水滴直径（px），数组长度建议 ≥ trailCount，不足时循环复用。
   * 默认 [56, 116, 72]——领头偏小、中段最大、尾部居中，错落更自然。
   */
  sizes?: number[];
  /**
   * 各水滴内部高光点直径（px），同样按索引取用、不足循环。
   * 默认 [18, 32, 22]，营造水珠的反光中心。
   */
  innerSizes?: number[];
  /**
   * 水滴主体填充色。默认 var(--color-primary)（吃瑚琏主题）。
   * 可传任意 CSS 颜色（hex / oklch / var(--color-*)）。
   */
  fillColor?: string;
  /**
   * 内部高光点颜色。默认 var(--color-primary-foreground)（与主体形成对比）。
   */
  innerColor?: string;
  /**
   * 是否为方形水滴（false=圆形），默认 false。
   * 方形配合 gooey 滤镜可得「液态方块」融合效果。
   */
  square?: boolean;
  /**
   * 是否启用 SVG gooey 融合滤镜（高斯模糊 + 对比度色阶），默认 true。
   * 开启后相邻水滴边缘会像水银一样吸附融合；关闭则各自独立。
   */
  gooey?: boolean;
  /**
   * gooey 滤镜的高斯模糊标准差，默认 16。越大融合范围越广、边缘越软。
   */
  gooeyStrength?: number;
  /**
   * 领头水滴跟手弹簧的刚度（motion useSpring stiffness），默认 500，越大越跟手。
   */
  leadStiffness?: number;
  /**
   * 拖尾水滴弹簧刚度，默认 120，越小拖尾越长越「拖泥带水」。
   */
  trailStiffness?: number;
  /**
   * 弹簧阻尼（damping），默认 28，越大越不回弹、越「黏」。
   */
  damping?: number;
  /**
   * 容器层级 z-index，默认 50。水滴层不拦截指针事件（pointer-events:none）。
   */
  zIndex?: number;
  /**
   * 透传到根容器的额外 className（根容器为 relative，铺满父级）。
   */
  className?: string;
  /**
   * 覆盖在水滴上方的内容，relative z-10 层叠于水滴层之上。
   */
  children?: ReactNode;
  /**
   * 透传到根容器的内联样式。
   */
  style?: CSSProperties;
}
