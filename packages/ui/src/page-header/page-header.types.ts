import type { HTMLAttributes, ReactNode } from "react";

// title 为 ReactNode → 与 HTMLAttributes 的 title?:string 冲突，必须 Omit "title"
// （同 Alert/Empty/BentoCard 的复发坑）。
export interface PageHeaderProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 主标题（必填）。 */
  title: ReactNode;
  /** 副标题，内联于标题右侧，中性弱化色。 */
  subTitle?: ReactNode;
  /** 提供则在标题左侧渲染返回箭头按钮，点击触发该回调（带回调 → 消费侧为 client）。 */
  onBack?: () => void;
  /** 返回按钮的无障碍标签，默认「返回」。 */
  backLabel?: string;
  /** 面包屑区（位于标题行上方）。直接 dogfood 传入瑚琏 <Breadcrumb/>。 */
  breadcrumb?: ReactNode;
  /** 状态标签区（贴标题右侧）。传入瑚琏 <Chip/>/<Badge/> 等。 */
  tags?: ReactNode;
  /** 右侧操作区（按钮组等）。窄屏自动换行到标题下方。 */
  extra?: ReactNode;
  /** 底部附加区，常放 <Tabs/>。 */
  footer?: ReactNode;
  /** 是否在页头底部渲染分隔线（复用瑚琏 <Separator/>），默认 false。 */
  bordered?: boolean;
}
