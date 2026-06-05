import type { ReactNode } from "react";

/** 公屏消息类型：普通发言 / 进场 / 送礼 / 关注 / 系统公告。 */
export type LiveChatItemType = "message" | "enter" | "gift" | "follow" | "system";

export interface LiveChatUser {
  name: string;
  avatar?: string;
  /** 粉丝等级（渲染等级牌）。 */
  level?: number;
  /** 自定义身份徽标（房管/铁粉…）。 */
  badge?: ReactNode;
}

export interface LiveChatItem {
  id: string;
  type: LiveChatItemType;
  user?: LiveChatUser;
  /** message 文本。 */
  text?: ReactNode;
  /** gift 信息。 */
  gift?: { name: string; icon?: ReactNode; combo?: number };
  at?: string;
}

export interface LiveChatProps {
  /** 消息流（受控，追加）。 */
  items: LiveChatItem[];
  /** 顶部置顶区（公告/规则）。 */
  pinned?: LiveChatItem[];
  /** 是否自动滚到底，默认 true。 */
  autoScroll?: boolean;
  /** 滚动窗保留上限（性能），默认 200。 */
  maxItems?: number;
  /** 自定义单条渲染。 */
  renderItem?: (item: LiveChatItem) => ReactNode;
  /** 叠加在深色视频上的浅色态（公屏默认文字改为白/半透白，带文字阴影）。 */
  overlay?: boolean;
  className?: string;
}
