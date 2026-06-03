import type { ReactNode } from "react";

export interface CollapsibleProps {
  /** 受控展开态。 */
  open?: boolean;
  /** 非受控初始展开态（默认 false）。 */
  defaultOpen?: boolean;
  /** 瑚琏收敛签名（丢 Base UI eventDetails，同 Switch/Toggle 风格）。 */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface CollapsibleTriggerProps {
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface CollapsiblePanelProps {
  className?: string;
  children?: ReactNode;
}
