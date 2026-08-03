import { copy } from "./cover.content";
import type { ServiceCategory } from "../_data/types";

// 程序化封面 SVG data-URI 生成器（本地零素材，SSR/CSR 确定性，禁 Math.random/Date.now）
// 按服务品类配色，与 projects/_data/photos.ts photoArt() 同一范式。

const CATEGORY_PALETTE: Record<ServiceCategory, { h: number; s: number; l1: number; l2: number; icon: string }> = {
  家政保洁: { h: 195, s: 65, l1: 42, l2: 26, icon: "🧹" },
  家电维修: { h: 220, s: 60, l1: 44, l2: 28, icon: "🔧" },
  上门美甲: { h: 330, s: 58, l1: 48, l2: 30, icon: "💅" },
  管道疏通: { h: 175, s: 52, l1: 40, l2: 25, icon: "🔩" },
  搬家搬运: { h: 35, s: 60, l1: 46, l2: 29, icon: "📦" },
  开锁换锁: { h: 260, s: 50, l1: 42, l2: 27, icon: "🔑" },
};

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 生成服务封面 data-URI（确定性，按品类配色） */
export function serviceCover(category: ServiceCategory, title: string, categoryLabel: string, w = 400, h = 220): string {
  const p = CATEGORY_PALETTE[category];
  const shortTitle = title.length > 8 ? title.slice(0, 7) + copy("text") : title;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${p.h} ${p.s}% ${p.l1}%)"/>
      <stop offset="1" stop-color="hsl(${p.h} ${p.s}% ${p.l2}%)"/>
    </linearGradient>
    <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1.5" fill="rgba(255,255,255,0.12)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
  <circle cx="${(w * 0.85).toFixed(0)}" cy="${(h * 0.22).toFixed(0)}" r="${(w * 0.22).toFixed(0)}" fill="rgba(255,255,255,0.07)"/>
  <text x="50%" y="44%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC',sans-serif" font-size="48" fill="rgba(255,255,255,0.9)">${p.icon}</text>
  <text x="50%" y="68%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="22" font-weight="600" fill="#fff">${xmlEscape(shortTitle)}</text>
  <text x="50%" y="82%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="14" fill="rgba(255,255,255,0.75)">${xmlEscape(categoryLabel)}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
