import type { ReactNode } from "react";

/** 排版：inline 单行 / stacked 两行（信息在上、引用在下，列表/表格单元格刚需）。 */
export type GitCommitLayout = "inline" | "stacked";

export interface GitCommitProps {
  /** commit SHA（完整或短哈希均可，显示时按 shaLength 截短）。 */
  sha: string;
  /** 提交信息标题（单行截断；stacked 下作主行）。 */
  message?: ReactNode;
  /** 分支名；提供则前置分支图标 chip。 */
  branch?: string;
  /** 作者名。 */
  author?: string;
  /** 作者头像槽（传 `<Avatar .../>` 或任意节点；不与库强耦合）。 */
  avatar?: ReactNode;
  /** 点击短哈希跳转的链接（去 commit 详情）。 */
  href?: string;
  /** 短哈希显示位数。@default 7 */
  shaLength?: number;
  /** @default "inline" */
  layout?: GitCommitLayout;
  /** @default "md" */
  size?: "sm" | "md";
  className?: string;
}
