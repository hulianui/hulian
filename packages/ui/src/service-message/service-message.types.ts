import type { HTMLAttributes, ReactNode } from "react";
import type { AvatarProps } from "../avatar/avatar.types";

/** 正文键值对字段（标签左·值右），如「取餐号 → 361」 */
export interface ServiceMessageField {
  /** 字段名（左列·text-muted-foreground），如「取餐号」 */
  label: ReactNode;
  /** 字段值（右列·foreground·medium），如「361」 */
  value: ReactNode;
}

/** 底部右侧动作（小程序入口形态：图标 + 文字 + chevron） */
export interface ServiceMessageAction {
  /** 动作文字，默认「小程序」；传 "" 仅留图标 + chevron */
  label?: ReactNode;
  /** 动作前图标（如小程序标识）；默认无 */
  icon?: ReactNode;
}

export interface ServiceMessageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 头部头像（复用瑚琏 Avatar 的 props，如 {src, fallback}） */
  avatar?: AvatarProps;
  /** 头部来源名称，如「luckincoffee 瑞幸咖啡」 */
  source?: ReactNode;
  /** 头部右侧「更多」回调；提供则渲染 ⋯ 按钮 */
  onMore?: () => void;
  /** 正文主标题，如「商品领取提醒」 */
  title?: ReactNode;
  /** 正文键值对字段；children 提供时被覆盖 */
  fields?: ServiceMessageField[];
  /** 自定义正文（覆盖 fields），用于非键值结构的内容 */
  children?: ReactNode;
  /** 底部左侧引导文字，默认「进入小程序查看」；传 null 隐藏整个底部 */
  footer?: ReactNode;
  /** 底部右侧动作；默认 label「小程序」 */
  action?: ServiceMessageAction;
  /** 底部行点击回调；提供则整行成为可点击 button（进入小程序/详情） */
  onAction?: () => void;
}
