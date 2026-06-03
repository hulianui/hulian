import type { MouseEvent, ReactNode } from "react";

export interface ToolbarProps {
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  /** 键盘导航到末端时是否回环，默认 true。 */
  loopFocus?: boolean;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export interface ToolbarButtonProps {
  disabled?: boolean;
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export interface ToolbarGroupProps {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export interface ToolbarSeparatorProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}
