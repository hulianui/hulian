/**
 * 存量 HTML 归一：把**上世纪的排版标记**翻译成编辑器 schema 认识的现代等价物。
 *
 * 为什么要有这一层：编辑器的 schema 在**载入时**就决定了哪些标签能活下来，
 * 而运营五年攒下来的正文里全是 schema 之外的东西 —— 微信编辑器给每段套 `<section>`、
 * 老 UEditor 与 Word 吐 `<font color face size>`、更早的还有 `<center>` 和 `align="center"`。
 * 这些不是脏标记，是**运营真正在用的排版**：红字强调、字体字号、居中。
 * 打开一篇不做任何编辑再存回去，它们就没了。
 *
 * 口径是「翻译，不是放行」：
 * - `<font color|face|size>` → `<span style="color|font-family|font-size">`（TextStyle 系列认这个）。
 *   反向不做 —— 输出保持 span，没必要再吐回 `<font>`。
 * - 块级 `text-align`（含 `<section>` / `<div>` 上的、`align="center"` 属性、`<center>` 标签）
 *   **下推到子块**。CSS 里 text-align 是继承属性，ProseMirror 里不是：`<section>` 本身不进 schema，
 *   它一被丢，挂在它身上的居中就跟着没了。
 * - 属性值一律过形状白名单再拼进 `style`。`color` 是消费方数据库里的用户可写字段，
 *   直接字符串拼接等于把 `style` 属性整个交出去。
 *
 * **这不是消毒函数**。它只做标记翻译，不负责 XSS —— 净化仍在 `sanitizePastedHtml` 与服务端。
 *
 * 依赖 `DOMParser`（浏览器与 jsdom 都有）。拿不到的环境（SSR）原样返回：
 * 编辑器本身也只在客户端挂载，服务端那一遍不影响最终结果。
 */

/** 纯函数这一档能翻译的：`<font>` 与块级对齐。 */
export interface NormalizeLegacyHtmlOptions {
  /** `<font color|face|size>` → `<span style>`。 */
  font?: boolean;
  /** 块级 `text-align` 下推（含 `<section>` / `align` 属性 / `<center>`）。 */
  align?: boolean;
}

/** `<font size="1..7">` 到 px —— 用浏览器自己那张表，不另发明。 */
const FONT_SIZE_PX = ["10px", "13px", "16px", "18px", "24px", "32px", "48px"];

/** 颜色值形状白名单：命名色 / #hex / rgb() / rgba()。其余（含带 `;` 的注入）一律丢。 */
const COLOR_VALUE = /^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d\s.,%]+\))$/i;

/** 对齐值白名单。`align="middle"`（垂直对齐语义）之类不在其中。 */
const ALIGN_VALUES = new Set(["left", "center", "right", "justify"]);

/** 会进编辑器 schema 的块。它们能自己扛住 `text-align`。 */
const EDITOR_BLOCKS = new Set([
  "P",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "LI",
  "TD",
  "TH",
]);

/** 进不了 schema 的包裹块。挂在它们身上的对齐必须下推，否则随它们一起消失。 */
const WRAPPER_BLOCKS = new Set([
  "SECTION",
  "DIV",
  "ARTICLE",
  "HEADER",
  "FOOTER",
  "ASIDE",
  "MAIN",
  "CENTER",
]);

const BLOCKISH_SELECTOR = [...EDITOR_BLOCKS, ...WRAPPER_BLOCKS].join(",").toLowerCase();
const WRAPPER_SELECTOR = [...WRAPPER_BLOCKS].join(",").toLowerCase();

function isBlockish(el: Element): boolean {
  return EDITOR_BLOCKS.has(el.tagName) || WRAPPER_BLOCKS.has(el.tagName);
}

/** `<font size>` → CSS。支持 `3` 与 `+1` / `-1`（相对值以正文 3 为基，同浏览器口径）。 */
function fontSizeToCss(raw: string): string | null {
  const matched = raw.trim().match(/^([+-]?)(\d+)$/);
  if (!matched) return null;
  const n = Number(matched[2]);
  const level = matched[1] === "+" ? 3 + n : matched[1] === "-" ? 3 - n : n;
  return FONT_SIZE_PX[Math.min(7, Math.max(1, level)) - 1] ?? null;
}

/** 不用引号也安全的族名：纯 ASCII 标识符。其余一律加引号。 */
const BARE_FAMILY = /^[A-Za-z][A-Za-z0-9-]*$/;

/**
 * `<font face>` → `font-family`。
 *
 * 中文族名（`微软雅黑` / `宋体`）按 CSS 规范不加引号也合法，但**实测撑不住**：
 * jsdom 的 cssstyle 会把整条声明判为非法直接丢掉，`'Arial', 宋体` 这种后备栈还会被
 * 从非法那一项起截断。加引号是唯一一处都活的写法。用单引号 —— 双引号序列化成 `&quot;`
 * 之后就成了族名字面量的一部分（TipTap FontFamily 自己也踩过这条）。
 */
function fontFaceToCss(raw: string): string | null {
  const families = raw
    .split(",")
    .map((one) => one.trim().replace(/^['"]|['"]$/g, ""))
    // 拼进 style 属性的东西必须先把结构字符敲掉，否则 face 里一个 `;` 就能另起一条声明。
    .filter((one) => one.length > 0 && !/[;{}<>'"()]/.test(one))
    .map((one) => (BARE_FAMILY.test(one) ? one : `'${one}'`));
  return families.length > 0 ? families.join(", ") : null;
}

/** 读一个元素声明的对齐：`<center>` 标签、`align` 属性、内联 `text-align`，后者优先。 */
function readAlign(el: Element): string | null {
  const inline = (el as HTMLElement).style?.textAlign?.trim().toLowerCase();
  if (inline && ALIGN_VALUES.has(inline)) return inline;
  const attr = el.getAttribute("align")?.trim().toLowerCase();
  if (attr && ALIGN_VALUES.has(attr)) return attr;
  if (el.tagName === "CENTER") return "center";
  return null;
}

function writeAlign(el: Element, align: string): void {
  const style = (el as HTMLElement).style;
  if (!style) return;
  style.textAlign = align;
}

/**
 * 把对齐往下推一层。
 * 自己声明了对齐的子树不动 —— 那是 CSS 里「子覆盖父」的等价行为。
 */
function pushAlignDown(el: Element, align: string): void {
  for (const child of Array.from(el.children)) {
    if (isBlockish(child)) {
      if (readAlign(child)) continue;
      writeAlign(child, align);
      // 块里还能套块（li / td / section），继续往下，让最里层那个真正进 schema 的块拿到。
      pushAlignDown(child, align);
    } else {
      // 内联包裹层（<span> / <a> / <font>），块可能藏在更深处。
      pushAlignDown(child, align);
    }
  }
}

function normalizeFont(root: Element, doc: Document): void {
  for (const el of Array.from(root.querySelectorAll("font"))) {
    const decls: string[] = [];

    const color = el.getAttribute("color")?.trim();
    if (color && COLOR_VALUE.test(color)) decls.push(`color: ${color}`);

    const face = el.getAttribute("face");
    const family = face ? fontFaceToCss(face) : null;
    if (family) decls.push(`font-family: ${family}`);

    const size = el.getAttribute("size");
    const px = size ? fontSizeToCss(size) : null;
    if (px) decls.push(`font-size: ${px}`);

    // 一条都没留下的 `<font>` 就是个空壳，换成 span 也会被 schema 丢掉，直接解掉。
    if (decls.length === 0) {
      el.replaceWith(...Array.from(el.childNodes));
      continue;
    }

    const span = doc.createElement("span");
    span.setAttribute("style", decls.join("; "));
    while (el.firstChild) span.appendChild(el.firstChild);
    el.replaceWith(span);
  }
}

function normalizeAlign(root: Element, doc: Document): void {
  // 文档序 = 外层在前，于是外层推给内层的对齐，轮到内层时还能继续往下推。
  for (const el of Array.from(root.querySelectorAll(WRAPPER_SELECTOR))) {
    const align = readAlign(el);
    if (align) pushAlignDown(el, align);
  }
  // `align` 属性在 schema 里没有对应物，翻成内联 style 才活得下来。
  // （`<img align="left">` 那种是浮动语义不是文字对齐，只认块级元素。）
  for (const el of Array.from(root.querySelectorAll("[align]"))) {
    const align = readAlign(el);
    if (align && isBlockish(el)) writeAlign(el, align);
    el.removeAttribute("align");
  }
  // 只裹了行内内容的包裹块：ProseMirror 反正要把它拆成 `<p>`，我们提前拆，顺手把对齐带上。
  for (const el of Array.from(root.querySelectorAll(WRAPPER_SELECTOR))) {
    const align = readAlign(el);
    if (!align) continue;
    if (el.querySelector(BLOCKISH_SELECTOR)) continue; // 里面还有块，转 <p> 会造出非法嵌套
    // 图片是块级节点，包一层 <p> 只会让 ProseMirror 把它提出去、留下一个空段落。
    if (!el.textContent?.trim()) continue;
    const p = doc.createElement("p");
    p.setAttribute("style", `text-align: ${align}`);
    while (el.firstChild) p.appendChild(el.firstChild);
    el.replaceWith(p);
  }
}

/**
 * 归一一段存量 HTML。纯函数，不改入参，不做消毒。
 *
 * 不传 options 即两档全开。传对象则**只开写明的那几档**（`{ font: true }` 就只翻译 `<font>`）。
 */
export function normalizeLegacyHtml(
  html: string,
  options: NormalizeLegacyHtmlOptions = { font: true, align: true },
): string {
  if (!html || typeof DOMParser === "undefined") return html;
  if (!options.font && !options.align) return html;

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  if (options.font) normalizeFont(body, doc);
  if (options.align) normalizeAlign(body, doc);

  return body.innerHTML;
}
