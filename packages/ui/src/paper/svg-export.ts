// 把页面里一张已经画好的 <svg> 变成能离开页面独立存在的 SVG 文本（投稿用：插进 Word / 转 PDF 进 LaTeX）。
//
// 页面上的图靠 Tailwind 类 + CSS 变量上色，离开页面这些都没了。这里逐个元素读计算样式，
// 写回成 SVG 表现属性（fill="#…" stroke-width="1.3" …），再去掉 class / style / data-*：
//  · 颜色：浏览器给的计算值常是 oklab()/lab()/oklch()，Word、Inkscape、rsvg 都不认，
//    一律换成 #rrggbb，透明度并进 fill-opacity / stroke-opacity。
//  · 只写「和父元素不一样」的继承属性：输出里属性照样继承，文件小一个数量级。
//    根元素写全，元素自带的同名表现属性先清掉，避免类覆盖过的旧属性在输出里复活。
//  · display:none 的元素直接删掉；opacity 不继承，逐个照写。
// 只能在浏览器里运行（要 getComputedStyle 和布局）。

const SVG_NS = "http://www.w3.org/2000/svg";

/** 会继承的表现属性：子元素与父元素相同时不写。 */
const INHERITED = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "letter-spacing",
  "text-anchor",
  "dominant-baseline",
  "visibility",
] as const;

const LENGTHS = new Set(["stroke-width", "stroke-dashoffset", "font-size", "letter-spacing"]);

/** 输出时从元素上剥掉的属性：只在页面里有意义。 */
function strippable(name: string) {
  return (
    name === "class" ||
    name === "style" ||
    name === "tabindex" ||
    name === "focusable" ||
    name === "role" ||
    name.startsWith("data-") ||
    name.startsWith("aria-") ||
    name.startsWith("on")
  );
}

export interface SerializeSvgOptions {
  /** 输出宽度（px），高度按 viewBox 比例。默认 viewBox 的宽。 */
  width?: number;
  /** 底色，任意 CSS 颜色。默认透明。 */
  background?: string;
}

interface Rgba {
  hex: string;
  alpha: number;
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((v) => Math.round(clamp01(v) * 255).toString(16).padStart(2, "0")).join("")}`;
}

function num(value: string) {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

function fmt(n: number) {
  return String(Number(n.toFixed(4)));
}

function alphaOf(raw: string | undefined) {
  if (raw === undefined) return 1;
  return raw.endsWith("%") ? num(raw) / 100 : num(raw);
}

const RGB = /^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i;
const SRGB = /^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+%?))?\s*\)$/i;

/**
 * 任意 CSS 颜色 → sRGB 十六进制 + 透明度。
 * 先认 rgb()；其他色彩空间用相对颜色语法 `color(from X srgb r g b / alpha)` 让浏览器换算成浮点 sRGB
 * （超色域的分量截到 0–1）；浏览器不支持相对颜色时退回 canvas 取色（8 位精度，低透明度时有误差）。
 */
export function createColorResolver(doc: Document) {
  const cache = new Map<string, Rgba | null>();
  let probe: HTMLElement | null = null;
  let ctx: CanvasRenderingContext2D | null | undefined;

  function viaProbe(color: string): Rgba | null {
    if (!probe) {
      probe = doc.createElement("span");
      probe.style.display = "none";
      doc.body.appendChild(probe);
    }
    probe.style.color = "";
    probe.style.color = `color(from ${color} srgb r g b / alpha)`;
    if (!probe.style.color) return null;
    const m = SRGB.exec(getComputedStyle(probe).color);
    if (!m) return null;
    return { hex: toHex(num(m[1]), num(m[2]), num(m[3])), alpha: alphaOf(m[4]) };
  }

  function viaCanvas(color: string): Rgba | null {
    if (ctx === undefined) ctx = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return { hex: toHex(r / 255, g / 255, b / 255), alpha: a / 255 };
  }

  function resolve(color: string): Rgba | null {
    const hit = cache.get(color);
    if (hit !== undefined) return hit;
    let out: Rgba | null;
    const m = RGB.exec(color);
    if (m) out = { hex: toHex(num(m[1]) / 255, num(m[2]) / 255, num(m[3]) / 255), alpha: alphaOf(m[4]) };
    else out = viaProbe(color) ?? viaCanvas(color);
    cache.set(color, out);
    return out;
  }

  return {
    resolve,
    dispose() {
      probe?.remove();
      probe = null;
    },
  };
}

type Resolver = ReturnType<typeof createColorResolver>;

/** fill / stroke 的计算值 → 输出用的 [颜色, 透明度系数]。 */
function paint(value: string, colors: Resolver): [string, number] {
  const v = value.trim();
  if (v === "none" || v === "") return ["none", 1];
  if (v.startsWith("url(")) {
    // 计算值会把 url(#a) 展开成带页面地址的绝对 URL，离开页面就断了，截回片段。
    const hash = v.indexOf("#");
    return [hash > -1 ? `url(${v.slice(hash).replace(/["')]+$/, "")})` : v, 1];
  }
  const rgba = colors.resolve(v);
  if (!rgba) return [v, 1];
  return [rgba.hex, rgba.alpha];
}

function effectiveStyle(cs: CSSStyleDeclaration, colors: Resolver): Record<string, string> {
  const out: Record<string, string> = {};
  for (const prop of INHERITED) {
    const raw = cs.getPropertyValue(prop).trim();
    if (prop === "fill-opacity" || prop === "stroke-opacity") continue;
    if (prop === "fill" || prop === "stroke") {
      const [color, alpha] = paint(raw, colors);
      out[prop] = color;
      out[`${prop}-opacity`] = fmt(num(cs.getPropertyValue(`${prop}-opacity`) || "1") * alpha);
      continue;
    }
    if (prop === "stroke-dasharray") {
      out[prop] = raw === "none" || raw === "" ? "none" : raw.split(/[\s,]+/).map((p) => fmt(num(p))).join(" ");
      continue;
    }
    if (LENGTHS.has(prop)) {
      out[prop] = raw === "normal" || raw === "" ? "normal" : fmt(num(raw));
      continue;
    }
    // 字体名的双引号换成单引号：写进属性后不用转义成 &quot;，手改文件时也好读。
    out[prop] = prop === "font-family" ? raw.replace(/"/g, "'") : raw;
  }
  return out;
}

function viewBoxOf(svg: SVGSVGElement): [number, number, number, number] {
  const vb = svg.viewBox?.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) return [vb.x, vb.y, vb.width, vb.height];
  const rect = svg.getBoundingClientRect();
  return [0, 0, rect.width || 300, rect.height || 150];
}

/**
 * 把一张已挂载、已出样式的 <svg> 序列化成独立的 SVG 文件文本。
 * 不改动传入的元素。
 */
export function serializeSvg(svg: SVGSVGElement, options: SerializeSvgOptions = {}): string {
  const doc = svg.ownerDocument;
  if (svg.querySelector("foreignObject")) {
    throw new Error("[Paper] 图里有 <foreignObject>，里面的 HTML 离开页面就没有样式，无法导出成独立的 SVG。");
  }
  const colors = createColorResolver(doc);
  try {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const sources = [svg, ...svg.querySelectorAll("*")];
    const targets = [clone as Element, ...clone.querySelectorAll("*")];
    const styles = new Map<Element, Record<string, string>>();
    const dropped: Element[] = [];

    sources.forEach((source, i) => {
      const target = targets[i];
      const cs = getComputedStyle(source);
      if (cs.display === "none") {
        dropped.push(target);
        return;
      }
      const own = effectiveStyle(cs, colors);
      styles.set(source, own);
      const parent = source === svg ? undefined : styles.get(source.parentElement as Element);

      for (const attr of [...target.attributes]) {
        if (strippable(attr.name)) target.removeAttribute(attr.name);
      }
      for (const prop of INHERITED) target.removeAttribute(prop);
      target.removeAttribute("opacity");

      for (const [prop, value] of Object.entries(own)) {
        if (parent && parent[prop] === value) continue;
        target.setAttribute(prop, value);
      }
      const opacity = num(cs.opacity || "1");
      if (opacity !== 1) target.setAttribute("opacity", fmt(opacity));
    });
    for (const el of dropped) el.remove();

    const [x, y, w, h] = viewBoxOf(svg);
    const width = options.width ?? w;
    clone.setAttribute("xmlns", SVG_NS);
    clone.setAttribute("viewBox", [x, y, w, h].map(fmt).join(" "));
    clone.setAttribute("width", fmt(width));
    clone.setAttribute("height", fmt((width * h) / w));

    // 页面上的无障碍名改成 <title>：Word 把它当替代文字。
    const label = svg.getAttribute("aria-label");
    const first = clone.firstChild;
    if (options.background) {
      const [fill, alpha] = paint(options.background, colors);
      const rect = doc.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", fmt(x));
      rect.setAttribute("y", fmt(y));
      rect.setAttribute("width", fmt(w));
      rect.setAttribute("height", fmt(h));
      rect.setAttribute("fill", fill);
      if (alpha !== 1) rect.setAttribute("fill-opacity", fmt(alpha));
      rect.setAttribute("stroke", "none");
      clone.insertBefore(rect, first);
    }
    if (label) {
      const title = doc.createElementNS(SVG_NS, "title");
      title.textContent = label;
      clone.insertBefore(title, clone.firstChild);
    }

    return `<?xml version="1.0" encoding="UTF-8"?>\n${new XMLSerializer().serializeToString(clone)}\n`;
  } finally {
    colors.dispose();
  }
}
