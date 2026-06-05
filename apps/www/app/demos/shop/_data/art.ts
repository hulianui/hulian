// 程序化生成商品图 / banner / 头像（data-URI SVG，离线零素材，SSR/CSR 确定性一致）。
// 铁律四：零外链。按品类色相配色 + 几何形态，语义贴合而非随机图。

const xmlEscape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONT = "-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";

// 品类色相
export const HUE: Record<string, number> = {
  digital: 212,
  home: 28,
  beauty: 332,
  outdoor: 152,
  grocery: 96,
  apparel: 268,
};

// 简单可重复 hash → [0,1)
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/**
 * 商品主图：品类色相渐变 + 柔光圆 + 居中产品「图标」占位方块。
 * 铁律：**不把商品名烤进图**——名字在卡片 UI 里另有渲染，烤进图会被 object-cover 在小缩略图里裁切遮挡。
 * 形态差异交给 hash(name) 驱动的柔光圆位置/饱和度 + variant，保证同品类不雷同且 SSR/CSR 确定一致。
 */
export function productArt(opts: {
  name: string;
  hue: number;
  w: number;
  h: number;
  variant?: number;
  /** 兼容旧调用签名（品牌名），已不再烤进图。 */
  label?: string;
}): string {
  const { name, hue, w, h, variant = 0 } = opts;
  const r = hash01(name + variant);
  const sat = 58 + Math.round(r * 10);
  const lightTop = 58 - variant * 6;
  const lightBot = 34 - variant * 4;
  const cx = (w * (0.2 + r * 0.6)).toFixed(0);
  const cy = (h * (0.18 + variant * 0.12)).toFixed(0);
  const icon = (w * 0.28).toFixed(0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} ${sat}% ${lightTop}%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 18) % 360} ${sat}% ${lightBot}%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <circle cx="${cx}" cy="${cy}" r="${(w * 0.34).toFixed(0)}" fill="rgba(255,255,255,0.12)"/>
  <circle cx="${(w * 0.78).toFixed(0)}" cy="${(h * 0.82).toFixed(0)}" r="${(w * 0.2).toFixed(0)}" fill="rgba(0,0,0,0.08)"/>
  <rect x="${(w * 0.5 - Number(icon) / 2).toFixed(0)}" y="${(h * 0.5 - Number(icon) / 2).toFixed(0)}" width="${icon}" height="${icon}" rx="${(w * 0.05).toFixed(0)}" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
</svg>`;
  return svgToDataUri(svg);
}

/** Hero 背景：纯渐变 + 柔光圆，不烤文字（文字交给 HTML 覆盖层，更清晰可响应）。 */
export function heroBg(hue: number, w = 1200, h = 420): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="h" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 64% 50%)"/>
      <stop offset="0.55" stop-color="hsl(${(hue + 20) % 360} 66% 36%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 38) % 360} 60% 24%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#h)"/>
  <circle cx="${(w * 0.84).toFixed(0)}" cy="${(h * 0.28).toFixed(0)}" r="${(h * 0.55).toFixed(0)}" fill="rgba(255,255,255,0.1)"/>
  <circle cx="${(w * 0.72).toFixed(0)}" cy="${(h * 0.82).toFixed(0)}" r="${(h * 0.34).toFixed(0)}" fill="rgba(255,255,255,0.06)"/>
  <circle cx="${(w * 0.93).toFixed(0)}" cy="${(h * 0.7).toFixed(0)}" r="${(h * 0.2).toFixed(0)}" fill="rgba(0,0,0,0.06)"/>
</svg>`;
  return svgToDataUri(svg);
}

/** 营销 banner：宽幅渐变 + 大标题 + 副标题。 */
export function bannerArt(opts: { title: string; subtitle: string; hue: number; w?: number; h?: number }): string {
  const { title, subtitle, hue, w = 1200, h = 420 } = opts;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 64% 52%)"/>
      <stop offset="0.55" stop-color="hsl(${(hue + 22) % 360} 66% 38%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 26%)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#b)"/>
  <circle cx="${(w * 0.82).toFixed(0)}" cy="${(h * 0.3).toFixed(0)}" r="${(h * 0.5).toFixed(0)}" fill="rgba(255,255,255,0.1)"/>
  <circle cx="${(w * 0.7).toFixed(0)}" cy="${(h * 0.78).toFixed(0)}" r="${(h * 0.32).toFixed(0)}" fill="rgba(255,255,255,0.07)"/>
  <text x="8%" y="46%" font-family="${FONT}" font-size="58" font-weight="800" fill="#fff">${xmlEscape(title)}</text>
  <text x="8%" y="60%" font-family="${FONT}" font-size="26" fill="rgba(255,255,255,0.85)">${xmlEscape(subtitle)}</text>
</svg>`;
  return svgToDataUri(svg);
}

/** 头像：首字 + 配色圆，用于评价区。 */
export function avatarArt(name: string, size = 80): string {
  const r = hash01(name);
  const hue = Math.round(r * 360);
  const ch = xmlEscape(name.slice(0, 1));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="100%" height="100%" rx="${size / 2}" fill="hsl(${hue} 50% 48%)"/>
  <text x="50%" y="50%" dy="0.35em" text-anchor="middle" font-family="${FONT}" font-size="${size * 0.46}" font-weight="600" fill="#fff">${ch}</text>
</svg>`;
  return svgToDataUri(svg);
}
