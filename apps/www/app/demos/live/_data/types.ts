import type { ReactNode } from "react";

/** 小黄车商品。 */
export interface LiveProduct {
  id: string;
  index: number; // 第 N 号链接
  title: string;
  image: string; // 内联渐变 data-uri
  price: number;
  originalPrice: number;
  stock: number;
  sold: number;
  tag?: string;
  explaining?: boolean;
}

/** AI 副驾建议类型。 */
export type AiSuggestionKind = "reply" | "tip" | "alert" | "action";

export interface AiSuggestion {
  id: string;
  kind: AiSuggestionKind;
  /** 触发该建议的弹幕/情境。 */
  context?: string;
  /** 建议正文（答弹幕草稿 / 提词 / 提醒）。 */
  text: string;
  /** action 类建议附带的工具名（如「上架 3 号链接」）。 */
  tool?: string;
  adopted?: boolean;
}

/** 主播信息。 */
export interface Streamer {
  name: string;
  fans: string;
  avatar?: string;
  meta?: ReactNode;
}
