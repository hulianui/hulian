import type { GiftBanner, GiftEvent } from "./gift-feed.types";

/**
 * 把一条礼物事件并入在屏横幅栈（纯函数，便于单测）。
 * - 已存在同 id → 连击数取 max(已有, ev.combo ?? 已有+1)，bounce+1 触发数字弹跳。
 * - 新 id → 追加；超过 max 挤掉最旧（队首）。
 */
export function applyGiftEvent(banners: GiftBanner[], ev: GiftEvent, max: number): GiftBanner[] {
  const idx = banners.findIndex((b) => b.id === ev.id);
  if (idx >= 0) {
    const prev = banners[idx];
    const nextCombo = Math.max(prev.combo, ev.combo ?? prev.combo + 1);
    const next = [...banners];
    next[idx] = { ...prev, combo: nextCombo, bounce: prev.bounce + 1 };
    return next;
  }
  const banner: GiftBanner = {
    id: ev.id,
    user: ev.user,
    gift: ev.gift,
    combo: ev.combo ?? 1,
    bounce: 0,
  };
  const next = [...banners, banner];
  return next.length > max ? next.slice(next.length - max) : next;
}
