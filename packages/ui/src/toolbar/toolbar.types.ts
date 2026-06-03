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

export interface ToolbarToggleProps {
  /** 受控选中态（按下=开）。 */
  pressed?: boolean;
  /** 非受控初始选中态，默认 false。 */
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  disabled?: boolean;
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
