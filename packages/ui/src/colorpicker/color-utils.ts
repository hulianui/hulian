import type { ColorFormat } from "./color-picker.types";

// 零依赖色彩转换：hex 为单一真源，rgb/hsl 由 hex 派生。无 alpha 通道。
// 仅服务 ColorPicker 多格式输出，不引入任何 color 库（吃主题 token + 零运行时依赖路线）。

export interface RGB {
  r: number;
  g: number;
  b: number;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * 把任意受支持的颜色字符串解析为 {r,g,b}。
 * 接受：#rgb / #rrggbb / 裸 6 位或 3 位 hex / rgb(r,g,b) / hsl(h,s%,l%)（容忍 rgba/hsla 前缀，忽略 alpha）。
 * 无法解析返回 null。
 */
export function parseColor(input: string): RGB | null {
  if (!input) return null;
  const s = input.trim().toLowerCase();

  // hex（带或不带 #）
  const hex = s.replace(/^#/, "");
  if (/^[0-9a-f]{3}$/.test(hex)) {
    return {
      r: parseInt(hex[0] + hex[0], 16),
      g: parseInt(hex[1] + hex[1], 16),
      b: parseInt(hex[2] + hex[2], 16),
    };
  }
  if (/^[0-9a-f]{6}$/.test(hex)) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  // rgb() / rgba()（忽略第 4 通道）
  const rgb = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/);
  if (rgb) {
    return {
      r: clamp(Math.round(+rgb[1]), 0, 255),
      g: clamp(Math.round(+rgb[2]), 0, 255),
      b: clamp(Math.round(+rgb[3]), 0, 255),
    };
  }

  // hsl() / hsla()（忽略第 4 通道）
  const hsl = s.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%/);
  if (hsl) {
    return hslToRgb(+hsl[1], +hsl[2], +hsl[3]);
  }

  return null;
}

export function rgbToHex({ r, g, b }: RGB): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

export function rgbToHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const r1 = r / 255;
  const g1 = g / 255;
  const b1 = b / 255;
  const max = Math.max(r1, g1, b1);
  const min = Math.min(r1, g1, b1);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r1:
        h = (g1 - b1) / d + (g1 < b1 ? 6 : 0);
        break;
      case g1:
        h = (b1 - r1) / d + 2;
        break;
      default:
        h = (r1 - g1) / d + 4;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  h = ((((h % 360) + 360) % 360) / 360);
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return {
    r: Math.round(hue(h + 1 / 3) * 255),
    g: Math.round(hue(h) * 255),
    b: Math.round(hue(h - 1 / 3) * 255),
  };
}

/** 把 hex 规范串按目标格式格式化为展示/输出字符串。 */
export function formatColor(hex: string, fmt: ColorFormat): string {
  const rgb = parseColor(hex) ?? { r: 0, g: 0, b: 0 };
  if (fmt === "rgb") return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  if (fmt === "hsl") {
    const { h, s, l } = rgbToHsl(rgb);
    return `hsl(${h}, ${s}%, ${l}%)`;
  }
  return rgbToHex(rgb);
}
