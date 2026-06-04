import type { ReactNode } from "react";

export interface PromptInputProps {
  /** 受控值（配 onValueChange）。 */
  value?: string;
  /** 非受控初值。@default "" */
  defaultValue?: string;
  /** 值变化回调。 */
  onValueChange?: (value: string) => void;
  /** 提交（Enter 或点发送）；收到 trim 后的当前文本。非受控时内部自动清空。 */
  onSubmit?: (value: string) => void;
  /** 占位提示。@default "发消息…" */
  placeholder?: string;
  /** 生成中：发送键变停止键、屏蔽提交。 */
  loading?: boolean;
  /** 点停止回调（loading 时显示停止键）。 */
  onStop?: () => void;
  disabled?: boolean;
  /** 自增高最大行数（超出滚动）。@default 8 */
  maxRows?: number;
  /** 底部工具栏左侧操作槽（深度思考 / 智能搜索等开关 chip）。 */
  actions?: ReactNode;
  /** 底部工具栏右侧、发送键之前的尾随槽（附件 / 语音等图标按钮）。 */
  trailing?: ReactNode;
  className?: string;
}
