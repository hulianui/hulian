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
  /**
   * 不画皮：为真时不渲染内层那层内边距 + 次要文字色的皮肤 div，children 直接进 Base UI 的 Panel。
   * 面板里装的是一整块功能区（集成配置表单、权限编辑器）而不是一段短说明时用它——
   * 默认皮肤的 `text-muted-foreground` 会沿继承链把整块内容染成次要色，内边距也会跟内容自带的叠加。
   * 与 `Card` 的 `variant="plain"` 同名同义（hulianui/hulian#162 / #159）。
   * @default false
   */
  plain?: boolean;
}
