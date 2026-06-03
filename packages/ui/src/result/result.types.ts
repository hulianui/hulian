import type { HTMLAttributes, ReactNode } from "react";

/** 结果状态：语义反馈(success/error/info/warning) + HTTP 错误页(403/404/500)。 */
export type ResultStatus =
  | "success"
  | "error"
  | "info"
  | "warning"
  | "403"
  | "404"
  | "500";

export interface ResultProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "content"> {
  /** 状态，决定内置图标与语义色。@default "info" */
  status?: ResultStatus;
  /** 自定义图标，覆盖 status 内置图标。传 null 则不渲染图标区。 */
  icon?: ReactNode;
  /** 主标题。 */
  title?: ReactNode;
  /** 副标题/辅助说明。 */
  subTitle?: ReactNode;
  /** 详情内容区（如错误堆栈、补充信息），渲染在标题下方、操作区上方。 */
  content?: ReactNode;
  /** 操作区（按钮等），渲染在最下方。 */
  children?: ReactNode;
}
