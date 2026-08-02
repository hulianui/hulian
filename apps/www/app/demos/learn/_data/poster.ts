import type { CourseCategoryKey } from "./types";

// 课程封面：程序化 data-URI SVG（离线零素材、SSR/CSR 确定性一致），仿 projects/photoArt。
// 按分类配色 + 几何「播放键」纹理 + 课程标题，语义贴合课程封面，绝不外链随机图。

const HUE: Record<CourseCategoryKey, number> = {
  frontend: 212, // 蓝
  design: 286, // 紫
  ai: 168, // 青绿
  career: 28, // 琥珀
};

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 简易确定性 hash → 用于细节摆位，避免 Math.random（SSR 一致）。 */
function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

export function coursePoster(category: CourseCategoryKey, title: string, w = 640, h = 360): string {
  const hue = HUE[category];
  const r = hash(title);
  const cx = (w * (0.66 + r * 0.18)).toFixed(0);
  const cy = (h * (0.2 + r * 0.2)).toFixed(0);
  const fontSize = Math.max(28, Math.min(44, Math.round(w / Math.max(8, title.length))));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 60% 48%)"/>
      <stop offset="1" stop-color="hsl(${hue + 18} 64% 28%)"/>
    </linearGradient>
    <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,0.12)"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#dots)"/>
  <circle cx="${cx}" cy="${cy}" r="${(w * 0.22).toFixed(0)}" fill="rgba(255,255,255,0.07)"/>
  <circle cx="${(w * 0.5).toFixed(0)}" cy="${(h * 0.42).toFixed(
    0,
  )}" r="34" fill="rgba(255,255,255,0.16)"/>
  <path d="M${(w * 0.5 - 9).toFixed(0)} ${(h * 0.42 - 15).toFixed(
    0,
  )} l24 15 l-24 15 z" fill="#fff"/>
  <text x="50%" y="76%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff">${xmlEscape(
    title,
  )}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
