import type { CSSProperties } from "react";

/** 单个菜单项的数据结构。 */
export interface InfiniteMenuItem {
  /** 卡面图片 URL（铺满圆形卡片，object-cover 居中裁切）。可省略，省略时仅显示标题首字。 */
  image?: string;
  /** 标题，激活时显示在覆盖层。 */
  title?: string;
  /** 描述，激活时显示在覆盖层副文案。 */
  description?: string;
  /** 点击动作箭头时跳转的链接；以 http 开头则 window.open 新标签，否则交给 onItemActivate 回调处理。 */
  link?: string;
}

export interface InfiniteMenuProps {
  /**
   * 菜单项数组。围绕球面（Fibonacci 均匀分布）排布，可拖拽旋转，
   * 正对镜头的项为「激活项」，其标题/描述显示在覆盖层。
   * @default []（空数组渲染占位球）
   */
  items?: InfiniteMenuItem[];
  /**
   * 球体缩放系数。越大球越近、单卡越大。
   * @default 1
   */
  scale?: number;
  /**
   * 单张卡片直径（px）。决定每个菜单项圆形卡面的尺寸。
   * @default 88
   */
  itemSize?: number;
  /**
   * 自动旋转角速度（度/秒，绕 Y 轴）。设 0 关闭自动旋转。
   * 拖拽时暂停，松手后惯性衰减再恢复自动旋转。reduced-motion 下强制为 0。
   * @default 6
   */
  autoRotate?: number;
  /**
   * 激活项变化回调（拖拽停止、贴靠到最前项后触发）。
   */
  onActiveItemChange?: (item: InfiniteMenuItem, index: number) => void;
  /**
   * 点击激活项动作箭头时的回调。返回 false 可阻止默认的 window.open 行为。
   */
  onItemActivate?: (item: InfiniteMenuItem, index: number) => void | false;
  /** 透传到根容器的额外类名（与内部类名经 cn 合并）。 */
  className?: string;
  /** 透传到根容器的内联样式。 */
  style?: CSSProperties;
}
