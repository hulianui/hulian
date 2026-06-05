import type { ReactNode } from "react";

export interface GiftEvent {
  /** 连击分组键：同 id 再次传入 → 视为同一连击，combo 递增。 */
  id: string;
  user: { name: string; avatar?: string };
  gift: { name: string; icon?: ReactNode; color?: string };
  /** 当前连击数（调用方维护合并，组件负责动画呈现）。不传则按出现次数自增。 */
  combo?: number;
}

export interface GiftFeedProps {
  /** 受控礼物事件流（追加）。 */
  events: GiftEvent[];
  /** 同时显示横幅上限，默认 3（超出挤掉最旧）。 */
  max?: number;
  /** 单条无新连击后停留 ms，默认 4000。 */
  duration?: number;
  className?: string;
}

/** 在屏礼物横幅（组件内部态）。 */
export interface GiftBanner {
  id: string;
  user: GiftEvent["user"];
  gift: GiftEvent["gift"];
  combo: number;
  /** 每次连击 +1，用于重放数字弹跳动画。 */
  bounce: number;
}
