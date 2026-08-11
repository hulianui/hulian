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
 * - `href` / `src` 里的 `javascript:` / `vbscript:` 协议直接删属性。
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

/** 允许留下的 CSS 属性：够表达「存量文案的排版」，又不至于把 Word 的私有属性带进来。 */
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
const UNSAFE_URL = /^\s*(javascript|vbscript|data:text\/html)/i;

function cleanStyle(value: string): string {
  return value
    .split(";")
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const prop = decl.slice(0, decl.indexOf(":")).trim().toLowerCase();
      return KEEP_STYLE_PROPS.has(prop);
    })
    .join("; ");
}

/**
 * 洗一段粘贴进来的 HTML 片段。纯函数，只依赖 DOMParser（浏览器与 jsdom 都有）。
 * 拿不到 DOMParser 的环境（SSR）直接原样返回 —— 粘贴事件本来就只在浏览器里发生。
 */
export function sanitizePastedHtml(html: string): string {
  if (typeof DOMParser === "undefined") return html;

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
      if (URL_ATTRS.includes(name) && UNSAFE_URL.test(attr.value)) {
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
