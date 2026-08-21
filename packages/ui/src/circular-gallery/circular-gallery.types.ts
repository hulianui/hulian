export interface CircularGalleryItem {
  /**
   * 卡片图片地址（远程 URL / data URI / 本地静态资源均可）。
   * 留空则该卡片用瑚琏 chart token 程序化生成的渐变占位图（离线可用、自动吃明暗主题）。
   */
  image?: string;
  /** 卡片下方标题文字。 */
  text: string;
}

export interface CircularGalleryProps {
  /**
   * 画廊条目数组（图片 + 标题）。
   * 不传 / 空数组时用一组瑚琏内置占位卡（chart token 程序化渐变，无任何远程资源）。
   */
  items?: CircularGalleryItem[];
  /**
   * 弧形弯曲强度，默认 3。
   * 0 = 平直一字排开；正值向下凹（圆弧底朝上）；负值向上凸。
   * 绝对值越大弧越深，建议范围 -6 ~ 6。
   */
  bend?: number;
  /**
   * 标题文字颜色，默认 `var(--color-foreground)`（吃明暗主题）。
   * 接受任意 CSS 颜色字符串，也接受 `var(--color-*)` token（运行时解析为实色喂给 canvas）。
   */
  textColor?: string;
  /**
   * 卡片圆角（归一化到卡片半边长，0–0.5），默认 0.05。
   * 0 = 直角，0.5 = 胶囊/圆。
   */
  borderRadius?: number;
  /**
   * 滚动 / 拖拽灵敏度，默认 2。越大滑动一次跨度越大。
   */
  scrollSpeed?: number;
  /**
   * 惯性缓动系数（lerp 系数 0–1），默认 0.05。
   * 越小越"重"越顺滑，越大越跟手越生硬。
   */
  scrollEase?: number;
  /**
   * 标题字体（canvas font 简写串），默认 `bold 30px ui-sans-serif, system-ui, sans-serif`。
   * 与原版不同：默认不再远程拉 Figtree，改用系统字体栈，不发网络请求、SSR 期也不会缺字。
   */
  font?: string;
  /**
   * 透传到根容器的额外 className。
   */
  className?: string;
  /**
   * reduced-motion / 无 WebGL 时的降级槽位（渲染在静态占位层之上）。
   */
  fallback?: React.ReactNode;
}
