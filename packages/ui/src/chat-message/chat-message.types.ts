import type { HTMLAttributes, ReactNode } from "react";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 角色：user 右对齐(primary 底) / assistant 左对齐(surface 底) / system 居中弱化通告。 */
  role: ChatRole;
  /** 头像槽（传瑚琏 <Avatar/>）；不传用角色默认字符 fallback。system 不渲染头像。 */
  avatar?: ReactNode;
  /** 发送者名称（正文上方）。 */
  name?: ReactNode;
  /** 时间戳（名称右侧，弱化色）。 */
  timestamp?: ReactNode;
  /** 加载态：正文位置显示 TypingDots（agent 生成中）。 */
  loading?: boolean;
  /** 底部操作区槽（放 <MessageActions/>，仅气泡下方）。 */
  actions?: ReactNode;
  /** 已读回执：仅 role=user（右气泡）渲染。sending 转圈 / sent 单勾 / read 双蓝勾。 */
  status?: "sending" | "sent" | "read";
  /** 正文：markdown 建议外层包 <Prose/>，纯文本直接传。 */
  children?: ReactNode;
}
