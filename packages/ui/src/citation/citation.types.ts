import type { HTMLAttributes, ReactNode } from "react";

export interface CitationProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  /** 引用序号（如 1 → [1] 角标）。 */
  index?: number;
  /** 来源标题。 */
  title: ReactNode;
  /** 外链 URL；提供则渲染为新标签页链接。 */
  href?: string;
  /** 来源名（域名/站点，标题右侧弱化）。 */
  source?: ReactNode;
}
