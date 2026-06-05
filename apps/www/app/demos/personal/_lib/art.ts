// 程序化作品截图 / 头像（零外链 data-URI SVG，离线可跑、SSR/CSR 确定性一致）。
// 按作品 hue 着色 + 按 shot.variant 出不同抽象 UI 布局，让「截图」语义可信而非随机外链图。

import type { WorkShot } from "../_data/works";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// 暗色 UI 底（截图看起来像一个 app），hue 提供品牌强调色。
function chrome(hue: number) {
  return {
    bg0: `hsl(${hue} 24% 9%)`,
    bg1: `hsl(${hue} 20% 13%)`,
    bg2: `hsl(${hue} 18% 18%)`,
    line: `hsl(${hue} 16% 26%)`,
    accent: `hsl(${hue} 78% 60%)`,
    accentSoft: `hsl(${hue} 60% 40%)`,
    text: `hsl(${hue} 12% 82%)`,
    textDim: `hsl(${hue} 10% 52%)`,
  };
}

function topbar(c: ReturnType<typeof chrome>, w: number, title: string) {
  return `
    <rect x="0" y="0" width="${w}" height="44" fill="${c.bg1}"/>
    <circle cx="22" cy="22" r="5" fill="${c.accent}"/>
    <rect x="40" y="16" width="${Math.min(180, title.length * 14)}" height="12" rx="6" fill="${c.bg2}"/>
    <text x="40" y="27" font-family="-apple-system,'PingFang SC',sans-serif" font-size="13" fill="${c.textDim}">${esc(title)}</text>
    <rect x="${w - 96}" y="14" width="80" height="16" rx="8" fill="${c.accentSoft}" opacity="0.7"/>
    <line x1="0" y1="44" x2="${w}" y2="44" stroke="${c.line}" stroke-width="1"/>`;
}

function body(variant: WorkShot["variant"], c: ReturnType<typeof chrome>, w: number, h: number) {
  const top = 44;
  const ih = h - top;
  switch (variant) {
    case "editor": {
      let lines = "";
      const widths = [0.5, 0.7, 0.35, 0.6, 0.8, 0.45, 0.55, 0.3, 0.65, 0.5, 0.4, 0.72];
      for (let i = 0; i < widths.length; i++) {
        const y = top + 28 + i * 26;
        if (y > h - 20) break;
        const col = i % 4 === 0 ? c.accent : i % 3 === 0 ? c.accentSoft : c.bg2;
        lines += `<rect x="64" y="${y}" width="14" height="12" rx="3" fill="${c.textDim}" opacity="0.5"/>
          <rect x="92" y="${y}" width="${(w - 140) * widths[i]}" height="12" rx="4" fill="${col}" opacity="0.9"/>`;
      }
      return `<rect x="0" y="${top}" width="48" height="${ih}" fill="${c.bg1}"/>${lines}`;
    }
    case "list": {
      let rows = "";
      for (let i = 0; i < 7; i++) {
        const y = top + 18 + i * 46;
        if (y > h - 30) break;
        rows += `<rect x="24" y="${y}" width="${w - 48}" height="36" rx="8" fill="${c.bg1}"/>
          <circle cx="48" cy="${y + 18}" r="11" fill="${i % 2 ? c.accentSoft : c.accent}" opacity="0.85"/>
          <rect x="68" y="${y + 9}" width="${(w - 220) * (0.4 + (i % 3) * 0.2)}" height="9" rx="4" fill="${c.text}" opacity="0.7"/>
          <rect x="68" y="${y + 22}" width="${(w - 260) * 0.3}" height="7" rx="3" fill="${c.textDim}" opacity="0.6"/>
          <rect x="${w - 86}" y="${y + 12}" width="56" height="14" rx="7" fill="${c.bg2}"/>`;
      }
      return rows;
    }
    case "detail": {
      const cx = w / 2;
      return `
        <rect x="0" y="${top}" width="${w}" height="${ih}" fill="${c.bg0}"/>
        <circle cx="${cx}" cy="${top + ih * 0.42}" r="${Math.min(w, ih) * 0.22}" fill="none" stroke="${c.accent}" stroke-width="6" opacity="0.85"/>
        <circle cx="${cx}" cy="${top + ih * 0.42}" r="${Math.min(w, ih) * 0.14}" fill="${c.accentSoft}" opacity="0.4"/>
        <rect x="${cx - 90}" y="${top + ih * 0.72}" width="180" height="14" rx="7" fill="${c.text}" opacity="0.8"/>
        <rect x="${cx - 60}" y="${top + ih * 0.8}" width="120" height="10" rx="5" fill="${c.textDim}" opacity="0.7"/>`;
    }
    case "chart": {
      const base = h - 40;
      const bw = (w - 120) / 7;
      let bars = "";
      const hs = [0.4, 0.7, 0.55, 0.9, 0.6, 0.8, 0.5];
      for (let i = 0; i < 7; i++) {
        const bh = (ih - 60) * hs[i];
        bars += `<rect x="${60 + i * bw}" y="${base - bh}" width="${bw - 16}" height="${bh}" rx="5" fill="${i === 3 ? c.accent : c.accentSoft}" opacity="${i === 3 ? 1 : 0.7}"/>`;
      }
      // 折线
      let pts = "";
      for (let i = 0; i < 7; i++) pts += `${60 + i * bw + (bw - 16) / 2},${top + 30 + (ih - 90) * (1 - hs[i]) * 0.6} `;
      return `${bars}<polyline points="${pts}" fill="none" stroke="${c.accent}" stroke-width="3" opacity="0.9"/>`;
    }
    case "dashboard":
    default: {
      let cards = "";
      for (let i = 0; i < 4; i++) {
        const cw = (w - 72) / 2;
        const ch = (ih - 60) / 2;
        const x = 24 + (i % 2) * (cw + 24);
        const y = top + 20 + Math.floor(i / 2) * (ch + 20);
        cards += `<rect x="${x}" y="${y}" width="${cw}" height="${ch}" rx="12" fill="${c.bg1}"/>
          <rect x="${x + 16}" y="${y + 16}" width="${cw * 0.4}" height="10" rx="5" fill="${c.textDim}"/>
          <rect x="${x + 16}" y="${y + 36}" width="${cw * 0.55}" height="18" rx="6" fill="${i === 0 ? c.accent : c.text}" opacity="${i === 0 ? 1 : 0.7}"/>
          <rect x="${x + 16}" y="${y + ch - 26}" width="${cw - 32}" height="8" rx="4" fill="${c.bg2}"/>`;
      }
      return `<rect x="0" y="${top}" width="56" height="${ih}" fill="${c.bg1}"/>${cards}`;
    }
  }
}

/** 作品截图：返回 data-URI SVG。w/h 默认 1200×750（贴近浏览器/应用比例）。 */
export function workShot(shot: WorkShot, hue: number, w = 1200, h = 750): string {
  const c = chrome(hue);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <rect width="100%" height="100%" fill="${c.bg0}"/>
    ${topbar(c, w, shot.caption)}
    ${body(shot.variant, c, w, h)}
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** 渐变首字母头像：data-URI SVG。用于访客/留言（Avatar fallback 的替代，可控配色）。 */
export function avatarArt(name: string, hue: number, size = 96): string {
  const initial = esc((name.trim()[0] ?? "·").toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${hue} 70% 58%)"/>
      <stop offset="1" stop-color="hsl(${(hue + 40) % 360} 68% 42%)"/>
    </linearGradient></defs>
    <rect width="100%" height="100%" rx="${size / 2}" fill="url(#g)"/>
    <text x="50%" y="50%" dy="0.06em" text-anchor="middle" dominant-baseline="middle"
      font-family="-apple-system,'PingFang SC',sans-serif" font-size="${size * 0.44}" font-weight="600" fill="#fff">${initial}</text>
  </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
