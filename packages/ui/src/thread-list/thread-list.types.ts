import type { ReactNode } from "react";

export interface ThreadListItem {
  id: string;
  title: ReactNode;
  /** 次行元信息（相对时间/摘要） */
  meta?: ReactNode;
  /** 当前打开的会话，高亮 */
  active?: boolean;
}

export interface ThreadListProps {
  items: ThreadListItem[];
  onSelect?: (id: string) => void;
  /** 提供则每项渲染删除按钮（点击不触发 onSelect） */
  onDelete?: (id: string) => void;
  /** @default "历史" */
  title?: ReactNode;
  /** 头部右侧动作槽（如「新对话」按钮） */
  action?: ReactNode;
  /** items 为空时的占位 @default "暂无历史" */
  empty?: ReactNode;
  /** 去掉容器边框背景，内嵌用 @default false */
  bare?: boolean;
  className?: string;
}
