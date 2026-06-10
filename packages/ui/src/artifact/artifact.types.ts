import type { ReactNode } from "react";

export interface ArtifactProps {
  title: ReactNode;
  icon?: ReactNode;
  /** 版本标识，渲染为小 chip，如 "v2" */
  version?: ReactNode;
  /** 头部右侧操作区 */
  actions?: ReactNode;
  /** 折叠态内容限高 px；<=0 表示不折叠 @default 240 */
  collapsedHeight?: number;
  /** @default false */
  defaultExpanded?: boolean;
  /** 受控展开态 */
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** @default "展开全文" */
  expandLabel?: ReactNode;
  /** @default "收起" */
  collapseLabel?: ReactNode;
  className?: string;
  children?: ReactNode;
}
