// 知识库图片占位：程序化生成 data-URI SVG，离线零素材、SSR/CSR 确定性一致（铁律四）。
// 仿 projects/_data/photos.ts 的 photoArt：按类别配色 + mesh 渐变 + 蓝图网格 + 居中标题，
// 让缩略图语义贴合「设计稿 / 海报 / 截图」，而非外链随机图。

export type ImageCategory = "设计稿" | "海报" | "截图" | "插画" | "原型";

const CATEGORY_HUE: Record<ImageCategory, [number, number]> = {
  设计稿: [262, 222], // 紫蓝
  海报: [12, 338], // 橙红→品红
  截图: [200, 188], // 青蓝
  插画: [150, 96], // 绿
  原型: [42, 28], // 琥珀
};

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** 生成一张语义占位图（data-URI SVG）。w/h 决定比例；category 决定配色；title 居中显示。 */
export function vaultImage(title: string, category: ImageCategory, w = 800, h = 600): string {
  const [h1, h2] = CATEGORY_HUE[category];
  const fontSize = Math.max(28, Math.min(46, Math.round(w / Math.max(6, title.length))));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h1} 64% 52%)"/>
      <stop offset="1" stop-color="hsl(${h2} 60% 32%)"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.78" cy="0.22" r="0.6">
      <stop offset="0" stop-color="rgba(255,255,255,0.22)"/>
      <stop offset="1" stop-color="rgba(255,255,255,0)"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#grid)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <circle cx="${(w * 0.2).toFixed(0)}" cy="${(h * 0.82).toFixed(0)}" r="${(w * 0.22).toFixed(0)}" fill="rgba(255,255,255,0.05)"/>
  <text x="50%" y="49%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="${fontSize}" font-weight="700" fill="#fff">${xmlEscape(title)}</text>
  <text x="50%" y="56%" text-anchor="middle" font-family="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif" font-size="20" letter-spacing="2" fill="rgba(255,255,255,0.8)">${xmlEscape(category)}</text>
</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
