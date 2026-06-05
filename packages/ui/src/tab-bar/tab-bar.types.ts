import type { ReactNode } from "react";

export interface TabBarItem {
  key: string;
  label: ReactNode;
  /** 默认态图标。 */
  icon?: ReactNode;
  /** 激活态图标（缺省复用 icon）。 */
  activeIcon?: ReactNode;
  /** 红点提示。 */
  dot?: boolean;
  /** 角标内容（数字/文本，优先于 dot）。 */
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabBarProps {
  items: TabBarItem[];
  /** 受控激活 key。 */
  value?: string;
  /** 非受控初始 key，缺省取首项。 */
  defaultValue?: string;
  onChange?: (key: string) => void;
  /** 吃底部安全区 inset（默认 true）。 */
  safeArea?: boolean;
  /** fixed 贴底（默认 true）；false 则随文档流。 */
  fixed?: boolean;
  className?: string;
}
