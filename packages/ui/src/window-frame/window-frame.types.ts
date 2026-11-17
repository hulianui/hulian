import type { HTMLAttributes, ReactNode } from "react";

export interface WindowFrameProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 三色点右侧的标题槽：字符串按等宽小字渲染（像文件名 / 路由），也可以放 Tag 等节点。 */
  title?: ReactNode;
  /** 标题栏右端的操作槽（按钮、状态点等）。 */
  toolbar?: ReactNode;
  /** 窗口内容。内容区不带内边距，由内容自己决定。 */
  children?: ReactNode;
}
