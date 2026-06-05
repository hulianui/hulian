import type { ReactNode } from "react";

/** 掩码策略：full 全掩 / prefix-suffix 保留首尾。 */
export type MaskStrategy = "full" | "prefix-suffix";

export interface SecretFieldProps {
  /** 密钥原值。 */
  value: string;
  /** 受控显形态；不传则组件自管。 */
  revealed?: boolean;
  /** 显形态变化回调（受控时使用）。 */
  onRevealedChange?: (revealed: boolean) => void;
  /** 掩码策略，默认 prefix-suffix。 */
  maskStrategy?: MaskStrategy;
  /** 是否显示复制按钮，默认 true。 */
  copyable?: boolean;
  /** 复制回调（拿到原值）。 */
  onCopy?: (value: string) => void;
  /** 尾部动作槽（重置 / 吊销等）。 */
  actions?: ReactNode;
  /** 只读外观（去掉交互态描边）。 */
  readOnly?: boolean;
  /** 尺寸。 */
  size?: "sm" | "md";
  className?: string;
}
