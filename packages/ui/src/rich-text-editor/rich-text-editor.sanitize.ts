/**
 * 粘贴净化：从 Word / 网页复制过来的富文本，洗掉不该进正文的东西，**保留排版**。
 *
 * 为什么不是「全洗成纯文本」也不是「原样收下」：
 * 这个编辑器的存在意义就是保住存量 HTML 的排版（居中、红字、字号），所以内联 `style` 必须留；
 * 但 Word 会连带塞进 `class="MsoNormal"`、`<o:p>`、几百行 `<style>` 和 `mso-*` 私有属性，
 * 原样收下会让正文体积翻十倍、并把消费方前台的 class 命名空间污染掉。
 *
 * 口径：
 * - 整段删除：`<script>` / `<style>` / `<meta>` / `<link>` / `<title>` 与注释（Word 的条件注释藏在这里）。
 * - 属性白名单：只留 `style` / `href` / `src` / `alt` / `title` / `colspan` / `rowspan` / `width` / `height`；
 *   `class` 与所有 `on*` 一律删（前者污染样式，后者是脚本注入面）。
 * - `style` 再过一层属性白名单：`mso-*`、`font-family` 这类只对 Word 有意义的整条丢掉。
 * - `href` / `src` 过**协议白名单**（`http` / `https` / `mailto` / `tel` / 相对路径 / 锚点）：
 *   `javascript:` / `vbscript:` 之外，`data:` / `blob:` / `file:` 同样进不来 —— 前者是把
 *   base64 写进数据库，后两者存下来就是永久碎图（#213）。
 *
 * 这套口径是**默认值**，不受 `legacyHtml` 影响：存量兼容要多留 `font-family` / `max-width` 时，
 * 走 `extraStyleProps` 显式加，加的仍是白名单条目，删除类规则（`class` / `on*` / `<style>` /
 * `javascript:`）任何情况下都不放宽。
 */

const DROP_TAGS = new Set(["SCRIPT", "STYLE", "META", "LINK", "TITLE", "BASE", "NOSCRIPT"]);

const KEEP_ATTRS = new Set([
  "style",
  "href",
  "src",
  "alt",
  "title",
  "target",
  "rel",
  "colspan",
  "rowspan",
  "width",
  "height",
]);

/**
 * 允许留下的 CSS 属性：够表达「存量文案的排版」，又不至于把 Word 的私有属性带进来。
 *
 * 这张表是白名单不是黑名单 —— 新增一条前先问「消费方前台被这条 CSS 打穿会怎样」。
 * `position` / `z-index` / `float` / `transform` / `background-image` 这类能把正文
 * 从文档流里拔出去、盖住宿主页面 UI 的属性一律不进来，正文是用户可写字段。
 */
const KEEP_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "text-align",
  "text-decoration",
  "font-size",
  "font-weight",
  "font-style",
  "width",
  "height",
  "margin-left",
  "padding-left",
]);

const URL_ATTRS = ["href", "src"];

/**
 * URL 允许的协议。**白名单**，与本模块其余三张表（标签 / 属性 / CSS 属性）口径一致。
 *
 * 这里原本是黑名单（`javascript|vbscript|data:text/html`），漏掉了三类：
 * - `data:image/*` —— 从 Word / Excel / 网页粘来的正文里全是它。留下就是把几 MB base64
 *   写进数据库字段，而文档承诺的是「图片**永远不内联 base64**」（#213）。
 * - `blob:` —— 只在**当前页面生命周期内**有效。存进库、下次打开就是碎图，
 *   而且字段大小看不出异常，比 base64 更难查。
 * - `file:` —— 只在那一台机器上有效，同上。
 *
 * 黑名单挡不住明天新增的协议，白名单可以。
 */
const ALLOWED_URL_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

/**
 * 这个 URL 能不能留下。相对路径、站内绝对路径、协议相对（`//host/x`）、锚点一律放行。
 *
 * 判协议前先剥掉控制字符与空白：浏览器解析 URL 时本就会剥，`java\nscript:alert(1)`
 * 与 `javascript:alert(1)` 对它是同一个东西 —— 不先剥就等于留了一条绕过通道。
 */
export function isAllowedUrl(raw: string): boolean {
  const value = raw.replace(/[\u0000-\u0020\u007F]/g, "");
  if (value === "") return false;
  if (value.startsWith("#") || value.startsWith("/")) return true;
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (!scheme) return true; // 没有协议 = 相对路径
  return ALLOWED_URL_SCHEMES.has(scheme[1]!.toLowerCase());
}

/** src 被拒时整个元素都留不住的标签：没有 src 它们就是个空壳。 */
const SRC_ONLY_TAGS = new Set(["IMG", "SOURCE", "VIDEO", "AUDIO", "IFRAME", "EMBED"]);

/**
 * 按属性白名单过一遍内联 `style`，留下的按 `prop: value` 重新拼。
 * 内部共用件（`<img style>` 的 schema 属性也走它），刻意不进 barrel。
 */
export function filterStyleDeclarations(value: string, allowed: ReadonlySet<string>): string {
  return value
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.slice(0, decl.indexOf(":")).trim().toLowerCase();
      return allowed.has(prop);
    })
    .join("; ");
}

/** 粘贴净化的可选放宽档。只由组件的 `legacyHtml` 打开，默认口径一个字不变。 */
export interface SanitizePastedHtmlOptions {
  /**
   * 额外放行的 CSS 属性（如存量兼容要的 `font-family` / `max-width`）。
   * 仍然是白名单：这里加的每一条都要能说清「被打穿会怎样」。
   */
  extraStyleProps?: readonly string[];
}

/**
 * 洗一段粘贴进来的 HTML 片段。纯函数，只依赖 DOMParser（浏览器与 jsdom 都有）。
 * 拿不到 DOMParser 的环境（SSR）直接原样返回 —— 粘贴事件本来就只在浏览器里发生。
 */
export function sanitizePastedHtml(html: string, options?: SanitizePastedHtmlOptions): string {
  if (typeof DOMParser === "undefined") return html;

  const styleProps = options?.extraStyleProps?.length
    ? new Set([...KEEP_STYLE_PROPS, ...options.extraStyleProps])
    : KEEP_STYLE_PROPS;
  const cleanStyle = (value: string) => filterStyleDeclarations(value, styleProps);

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const body = doc.body;

  // 注释（Word 的 `<!--[if gte mso 9]>` 整块条件样式藏在这里）
  const walker = doc.createTreeWalker(body, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments: ChildNode[] = [];
  while (walker.nextNode()) comments.push(walker.currentNode as ChildNode);
  for (const node of comments) node.remove();

  for (const el of Array.from(body.querySelectorAll("*"))) {
    if (DROP_TAGS.has(el.tagName)) {
      el.remove();
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || !KEEP_ATTRS.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (URL_ATTRS.includes(name) && !isAllowedUrl(attr.value)) {
        // `<a href>` 被拒只删属性、留下文字（链接没了，字还在）；
        // `<img src>` 被拒则整个元素都没意义了，留个空壳只会在正文里留一个看不见的洞。
        if (name === "src" && SRC_ONLY_TAGS.has(el.tagName)) {
          el.remove();
          break;
        }
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "style") {
        const next = cleanStyle(attr.value);
        if (next) el.setAttribute("style", next);
        else el.removeAttribute("style");
      }
    }
  }

  return body.innerHTML;
}
