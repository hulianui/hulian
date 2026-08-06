import type {
  PreviewSandboxError,
  PreviewSandboxErrorKind,
} from "./preview-sandbox.types";

// iframe ↔ 宿主的错误桥。全是纯字符串/纯数据处理，没有 DOM 依赖：
// jsdom 不会真的执行 srcDoc 里的脚本，所以「注入位置对不对」「消息认不认」只能在这里单测。

/** 转发消息的标记字段名（值为该 iframe 的实例 id）。 */
export const PREVIEW_SANDBOX_MESSAGE_KEY = "__hulianPreviewSandbox";

/**
 * 沙箱没给出可读信息时用的兜底文案。
 *
 * 归一化是纯函数（好单测），但兜底文案要跟着 ConfigProvider 的 locale 走，所以由调用方
 * 传进来而不是写死在这里 —— 否则换成英文 locale 后，错误态的标题是英文、正文却是中文。
 * 默认值保留简体中文，直接调这两个纯函数的消费方不受影响。
 */
export interface PreviewSandboxErrorFallbacks {
  /** iframe 内抛错但没带 message。 */
  iframeError: string;
  /** iframe 内有未处理的 Promise 拒绝且没带 message。 */
  iframeRejection: string;
  /** 同文档模式下子树抛出的不是 Error、或 Error 没有 message。 */
  reactError: string;
  /** 同文档模式下抛出的是 null / undefined。 */
  reactEmpty: string;
}

export const DEFAULT_ERROR_FALLBACKS: PreviewSandboxErrorFallbacks = {
  iframeError: "预览内发生未知运行时错误",
  iframeRejection: "预览内有未处理的 Promise 拒绝",
  reactError: "预览子树渲染失败",
  reactEmpty: "预览子树抛出了空值",
};

/**
 * 默认 sandbox：只给 `allow-scripts`，**刻意不给** `allow-same-origin`。
 *
 * 两者同时给等于没有沙箱：`srcdoc` 文档本就继承父页面的源，再放行 same-origin，
 * 预览里的脚本就能直接读写宿主 DOM、localStorage、cookie，还能自己把 sandbox 属性摘掉。
 * 只给 allow-scripts 时 iframe 拿到的是**不透明源**：脚本照跑，但碰不到宿主的任何东西。
 *
 * 代价是宿主也读不到 `contentDocument` —— 所以错误转发走 postMessage 而不是直接挂监听。
 */
export const PREVIEW_SANDBOX_DEFAULT_SANDBOX = "allow-scripts";

const RELOAD_MARKER = "hulian-preview-sandbox-reload";

/**
 * 注入进 iframe 的引导脚本：把 error / unhandledrejection 转发给宿主。
 *
 * 写法约束（改之前先读）：
 * - 只用 ES5 语法，不用模板串/箭头函数/展开——预览内容可能声明了老旧 doctype 或被降级解析。
 * - `postMessage` 的 targetOrigin 只能是 `"*"`：不透明源的 iframe 不知道宿主的源，写死具体源会静默失败。
 *   宿主侧改用 `event.source === iframe.contentWindow` + 实例 id 双重校验，不看 origin（它恒为 "null"）。
 * - `error` 监听**不加捕获阶段**：资源加载失败（图片 404）的 error 事件不冒泡，
 *   加了 capture 就会把「图挂了」也报成运行时崩溃。
 */
export function bootstrapScript(frameId: string): string {
  const id = JSON.stringify(frameId);
  return [
    "(function(){",
    "var ID=" + id + ";",
    "function post(p){p." + PREVIEW_SANDBOX_MESSAGE_KEY + "=ID;try{(window.parent||window.top).postMessage(p,'*');}catch(e){}}",
    "function txt(v){if(v==null)return '';if(typeof v==='string')return v;if(v&&typeof v.message==='string')return v.message;try{return String(v);}catch(e){return '';}}",
    "window.addEventListener('error',function(e){post({kind:'error',message:txt(e.message)||txt(e.error),filename:e.filename||null,lineno:typeof e.lineno==='number'?e.lineno:null,colno:typeof e.colno==='number'?e.colno:null,stack:e.error&&e.error.stack?String(e.error.stack):null});});",
    "window.addEventListener('unhandledrejection',function(e){var r=e.reason;post({kind:'unhandledrejection',message:txt(r),filename:null,lineno:null,colno:null,stack:r&&r.stack?String(r.stack):null});});",
    "})();",
  ].join("");
}

// 只认真正的开标签，不能写成 /<head[^>]*>/ —— 那个正则会把 `<header>` 也当成 `<head>`
// （`[^>]*` 吃掉 "er"），于是引导脚本被塞进 body 里的某个 header 元素前面。
const HEAD_OPEN = /<head(\s[^>]*)?>/i;
const HTML_OPEN = /<html(\s[^>]*)?>/i;
const DOCTYPE = /<!doctype(\s[^>]*)?>/i;

function insertAfter(html: string, match: RegExpExecArray, fragment: string): string {
  const at = match.index + match[0].length;
  return html.slice(0, at) + fragment + html.slice(at);
}

export interface BuildSrcDocOptions {
  /** 本次 iframe 实例 id，用于校验回传消息。 */
  frameId: string;
  /** 是否注入引导脚本。@default true */
  instrument?: boolean;
  /** 重载计数：变了就让 srcDoc 字符串变化，从而触发同一个 iframe 节点重新载入文档。 */
  reloadNonce?: number;
}

/**
 * 生成最终写进 `srcDoc` 的文档串。
 *
 * 注入位置按 `<head>` → `<html>` → doctype 之后 → 整串最前面的顺序回退。
 * **绝不能无脑前置**：把 `<script>` 放到 `<!doctype html>` 前面会让浏览器进入怪异模式，
 * 预览的布局（尤其是百分比高度和盒模型）会和真实页面对不上。
 */
export function buildSrcDoc(html: string, options: BuildSrcDocOptions): string {
  const { frameId, instrument = true, reloadNonce = 0 } = options;
  let out = html;
  if (instrument) {
    const fragment = "<script>" + bootstrapScript(frameId) + "</script>";
    const head = HEAD_OPEN.exec(out);
    const htmlTag = head ? null : HTML_OPEN.exec(out);
    const doctype = head || htmlTag ? null : DOCTYPE.exec(out);
    if (head) out = insertAfter(out, head, fragment);
    else if (htmlTag) out = insertAfter(out, htmlTag, fragment);
    else if (doctype) out = insertAfter(out, doctype, fragment);
    else out = fragment + out;
  }
  // 重载靠「让字符串变化」实现：srcDoc 属性一变浏览器就重新解析文档，而 iframe 节点本身不动。
  // 不用 contentWindow.location.reload()：不透明源的 iframe 宿主根本调不到。
  if (reloadNonce > 0) out = out + "\n<!--" + RELOAD_MARKER + ":" + reloadNonce + "-->";
  return out;
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * 宿主侧：把收到的 postMessage 数据归一成 PreviewSandboxError。
 *
 * 不是自家 iframe 发的（缺标记 / id 对不上）一律返回 null —— 页面上可能同时挂着别的
 * iframe、第三方 SDK 也会往 window 上广播消息，来者不拒会把无关噪音报成预览崩溃。
 */
export function normalizeIframeMessage(
  data: unknown,
  frameId: string,
  fallbacks: PreviewSandboxErrorFallbacks = DEFAULT_ERROR_FALLBACKS,
): PreviewSandboxError | null {
  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  if (raw[PREVIEW_SANDBOX_MESSAGE_KEY] !== frameId) return null;
  const kind: PreviewSandboxErrorKind =
    raw.kind === "unhandledrejection" ? "unhandledrejection" : "error";
  return {
    source: "iframe",
    kind,
    message:
      str(raw.message) ??
      (kind === "unhandledrejection" ? fallbacks.iframeRejection : fallbacks.iframeError),
    stack: str(raw.stack),
    filename: str(raw.filename),
    lineno: num(raw.lineno),
    colno: num(raw.colno),
    componentStack: null,
    error: null,
  };
}

/** 宿主侧：把 React 错误边界捕获到的东西归一成同一形状（抛出的不一定是 Error）。 */
export function normalizeReactError(
  error: unknown,
  info?: { componentStack?: string | null },
  fallbacks: PreviewSandboxErrorFallbacks = DEFAULT_ERROR_FALLBACKS,
): PreviewSandboxError {
  const isError = error instanceof Error;
  return {
    source: "react",
    kind: "error",
    message:
      (isError ? str(error.message) : str(error)) ??
      (error == null ? fallbacks.reactEmpty : fallbacks.reactError),
    stack: isError ? str(error.stack) : null,
    filename: null,
    lineno: null,
    colno: null,
    componentStack: str(info?.componentStack),
    error: isError ? error : null,
  };
}
