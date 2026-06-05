import type { HTMLAttributes, ReactNode } from "react";

/** 节点圆点语气色，吃语义 token（无 success/warning 旧约束已过时，token 现已补齐五色）。 */
export type TimelineDotColor = "default" | "primary" | "success" | "danger" | "warning";

/** 布局方向：left=节点在左内容在右（默认）；right=镜像；alternate=逐项左右交替（中轴）。 */
export type TimelineMode = "left" | "right" | "alternate";

export interface TimelineItemProps {
  /** 自定义节点（ReactNode，如图标）；省略则渲染按 color 着色的默认圆点 */
  dot?: ReactNode;
  /** 默认圆点的语气色；自定义 dot 时忽略 */
  color?: TimelineDotColor;
  /** 次要标签（如时间戳/元信息），渲染在主内容（children）下方、中性弱化；圆点对齐主内容首行 */
  label?: ReactNode;
  /** 标记为进行中：默认圆点变加载态（旋转环）；连入此项的竖线由 Timeline 自动转虚线 */
  pending?: boolean;
  /** 主内容 */
  children?: ReactNode;
  className?: string;
}

/** Timeline 注入到每个 TimelineItem 的内部布局元信息（消费者不传，`_` 前缀标记私有）。 */
export interface TimelineItemInternalProps extends TimelineItemProps {
  _mode?: TimelineMode;
  /** alternate 模式下该项落在中轴的哪一侧 */
  _side?: "left" | "right";
  /** 是否为最后一项（最后一项不画向下连线） */
  _last?: boolean;
  /** 本项向下的连线是否虚线（= 下一项 pending） */
  _lineDashed?: boolean;
}

export interface TimelineProps extends Omit<HTMLAttributes<HTMLOListElement>, "children"> {
  /** 数据驱动：等价于把每项作为 <TimelineItem {...item} /> 渲染；与 children 二选一 */
  items?: TimelineItemProps[];
  /** 布局方向，默认 left */
  mode?: TimelineMode;
  /** 末尾追加一个进行中的幽灵项（加载态圆点）；true=仅图标，传 ReactNode 作其内容 */
  pending?: boolean | ReactNode;
  /** 复合用法：直接传若干 <TimelineItem> */
  children?: ReactNode;
}
