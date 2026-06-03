import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import type { AvatarProps } from "../avatar/avatar.types";

/** 评论类型：comment=普通讨论(默认·气泡正文+头像) / log=系统操作日志(弱化·点标记+单行内联)。 */
export type CommentType = "comment" | "log";

export interface CommentProps extends Omit<HTMLAttributes<HTMLElement>, "content" | "title"> {
  /** 作者名（必填）。 */
  author: ReactNode;
  /** 透传瑚琏 Avatar 的属性（src/alt/fallback/size）；type=log 时忽略，改渲系统点标记。 */
  avatar?: AvatarProps;
  /** 时间戳（相对「2 分钟前」或绝对皆可）。 */
  datetime?: ReactNode;
  /** 正文：comment 渲为下方段落；log 内联在作者后。 */
  content?: ReactNode;
  /** 操作区（点赞/回复等），建议用 CommentAction 组合。 */
  actions?: ReactNode;
  /** 嵌套子评论（递归 Comment）；自动缩进 + 可选左侧连接线。 */
  children?: ReactNode;
  /** 评论类型，默认 comment。 */
  type?: CommentType;
  /** 子评论区是否画左侧连接线（默认 false，仅缩进）。 */
  connector?: boolean;
  className?: string;
}

export interface CommentActionsProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export interface CommentActionProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 传 href → 渲染为瑚琏 Link（链接型操作，如「回复」跳锚点）；否则 <button>。 */
  href?: string;
  children?: ReactNode;
}
