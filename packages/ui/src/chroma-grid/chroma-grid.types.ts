import type { CSSProperties, ReactNode } from "react";

/** 单张色卡的数据描述 */
export interface ChromaGridItem {
  /** 卡片头图地址（人像 / 封面）。缺省时只渲染文字区。 */
  image?: string;
  /** 主标题（姓名 / 名称） */
  title?: string;
  /** 副标题（角色 / 描述行） */
  subtitle?: string;
  /** 句柄（如 @handle），渲染在标题同行右侧 */
  handle?: string;
  /** 补充行（如地点），渲染在副标题同行右侧 */
  location?: string;
  /**
   * 卡片描边色。建议喂 token：`var(--color-chart-1)` ~ `var(--color-chart-5)`。
   * hover 时描边亮起为此色。
   */
  borderColor?: string;
  /**
   * 卡片背景渐变。建议形如
   * `linear-gradient(145deg, var(--color-chart-1), transparent)`。
   */
  gradient?: string;
  /** 点击跳转地址。提供时卡片可点击（新标签打开），否则光标为默认态。 */
  url?: string;
  /** 自定义卡片正文内容；提供时覆盖默认的 image + 文字区布局。 */
  children?: ReactNode;
}

export interface ChromaGridProps {
  /**
   * 卡片数据数组。缺省时回退到内置占位 demo（便于空状态预览）。
   */
  items?: ChromaGridItem[];
  /**
   * 聚光揭示半径（px）。光标周围此半径内的卡片显示为全彩，
   * 外侧渐隐为灰度暗化。默认 300。
   */
  radius?: number;
  /**
   * 栅格列数（桌面端）。默认 3。窄屏自动回落为单列。
   */
  columns?: number;
  /**
   * 光标跟随的阻尼（弹簧刚度的反向直觉值，0~1，越大越「黏」/越慢）。
   * 默认 0.45。reduced-motion 下忽略，直接吸附。
   */
  damping?: number;
  /**
   * 光标移出后，灰度遮罩恢复全覆盖的淡出秒数。默认 0.6。
   */
  fadeOut?: number;
  /** 附加到根容器的类名 */
  className?: string;
  /** 附加到根容器的内联样式 */
  style?: CSSProperties;
}
