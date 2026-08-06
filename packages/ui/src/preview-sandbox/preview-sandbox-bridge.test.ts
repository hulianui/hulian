import { describe, expect, it } from "vitest";
import {
  bootstrapScript,
  buildSrcDoc,
  normalizeIframeMessage,
  normalizeReactError,
  DEFAULT_ERROR_FALLBACKS,
  PREVIEW_SANDBOX_DEFAULT_SANDBOX,
  PREVIEW_SANDBOX_MESSAGE_KEY,
} from "./preview-sandbox-bridge";

describe("bootstrapScript", () => {
  it("带上实例 id，并监听两类错误", () => {
    const s = bootstrapScript("frame-1");
    expect(s).toContain('"frame-1"');
    expect(s).toContain("'error'");
    expect(s).toContain("'unhandledrejection'");
  });
  it("postMessage 用 '*'（不透明源 iframe 不知道宿主的源）", () => {
    expect(bootstrapScript("x")).toContain("postMessage(p,'*')");
  });
  it("error 监听不加捕获阶段（否则图片 404 会被报成运行时崩溃）", () => {
    expect(bootstrapScript("x")).not.toContain("},true)");
  });
  it("不使用模板串/箭头函数（保持 ES5，防旧解析模式）", () => {
    const s = bootstrapScript("x");
    expect(s).not.toContain("=>");
    expect(s).not.toContain("`");
  });
});

describe("buildSrcDoc", () => {
  const opts = { frameId: "fid" };

  it("有 <head> 时注入到 head 开标签之后", () => {
    const out = buildSrcDoc("<html><head><title>t</title></head><body>x</body></html>", opts);
    expect(out.indexOf("<script>")).toBe("<html><head>".length);
  });
  it("不会把 <header> 误认成 <head>", () => {
    const out = buildSrcDoc("<body><header>顶栏</header></body>", opts);
    expect(out.startsWith("<script>")).toBe(true);
    expect(out).toContain("<header>顶栏</header>");
  });
  it("没有 head 时退到 <html> 之后", () => {
    const out = buildSrcDoc("<html><body>x</body></html>", opts);
    expect(out.indexOf("<script>")).toBe("<html>".length);
  });
  it("只有 doctype 时注到 doctype 之后，绝不前置（前置会进怪异模式）", () => {
    const out = buildSrcDoc("<!DOCTYPE html><body>x</body>", opts);
    expect(out.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(out.indexOf("<script>")).toBe("<!DOCTYPE html>".length);
  });
  it("裸片段直接前置", () => {
    const out = buildSrcDoc("<p>hi</p>", opts);
    expect(out.startsWith("<script>")).toBe(true);
  });
  it("instrument=false 一个字符都不加", () => {
    const html = "<html><head></head><body>x</body></html>";
    expect(buildSrcDoc(html, { frameId: "fid", instrument: false })).toBe(html);
  });
  it("reloadNonce 让字符串变化（同一 iframe 节点重新载入文档）", () => {
    const html = "<p>x</p>";
    const a = buildSrcDoc(html, { frameId: "fid", instrument: false, reloadNonce: 0 });
    const b = buildSrcDoc(html, { frameId: "fid", instrument: false, reloadNonce: 1 });
    const c = buildSrcDoc(html, { frameId: "fid", instrument: false, reloadNonce: 2 });
    expect(a).toBe(html);
    expect(b).not.toBe(a);
    expect(c).not.toBe(b);
  });
});

describe("normalizeIframeMessage", () => {
  const ok = {
    [PREVIEW_SANDBOX_MESSAGE_KEY]: "fid",
    kind: "error",
    message: "boom",
    filename: "about:srcdoc",
    lineno: 12,
    colno: 3,
    stack: "Error: boom",
  };

  it("认领自家消息并归一成统一形状", () => {
    expect(normalizeIframeMessage(ok, "fid")).toEqual({
      source: "iframe",
      kind: "error",
      message: "boom",
      stack: "Error: boom",
      filename: "about:srcdoc",
      lineno: 12,
      colno: 3,
      componentStack: null,
      error: null,
    });
  });
  it("id 对不上 / 没标记 / 不是对象 → null（页面上别的 postMessage 噪音不算预览崩溃）", () => {
    expect(normalizeIframeMessage(ok, "other")).toBeNull();
    expect(normalizeIframeMessage({ kind: "error", message: "boom" }, "fid")).toBeNull();
    expect(normalizeIframeMessage("boom", "fid")).toBeNull();
    expect(normalizeIframeMessage(null, "fid")).toBeNull();
  });
  it("Promise 拒绝保留 kind", () => {
    const e = normalizeIframeMessage(
      { [PREVIEW_SANDBOX_MESSAGE_KEY]: "fid", kind: "unhandledrejection", message: "nope" },
      "fid",
    );
    expect(e?.kind).toBe("unhandledrejection");
    expect(e?.lineno).toBeNull();
  });
  it("message 缺失时给可展示的兜底文案，不留空串", () => {
    const e = normalizeIframeMessage({ [PREVIEW_SANDBOX_MESSAGE_KEY]: "fid", kind: "error" }, "fid");
    expect(e?.message.length).toBeGreaterThan(0);
  });
  it("非法 lineno 归一成 null", () => {
    const e = normalizeIframeMessage(
      { [PREVIEW_SANDBOX_MESSAGE_KEY]: "fid", message: "x", lineno: "12" },
      "fid",
    );
    expect(e?.lineno).toBeNull();
  });
});

describe("normalizeReactError", () => {
  it("Error 实例：保留原对象与栈，source=react", () => {
    const err = new Error("render failed");
    const e = normalizeReactError(err, { componentStack: "\n at Boom" });
    expect(e.source).toBe("react");
    expect(e.kind).toBe("error");
    expect(e.message).toBe("render failed");
    expect(e.error).toBe(err);
    expect(e.componentStack).toBe("\n at Boom");
    expect(e.filename).toBeNull();
  });
  it("抛字符串也能用：message 拿到值，error 为 null", () => {
    const e = normalizeReactError("kaboom");
    expect(e.message).toBe("kaboom");
    expect(e.error).toBeNull();
  });
  it("抛 null 也有可展示文案", () => {
    expect(normalizeReactError(null).message.length).toBeGreaterThan(0);
  });
});

describe("默认 sandbox", () => {
  it("只给 allow-scripts，刻意不给 allow-same-origin", () => {
    expect(PREVIEW_SANDBOX_DEFAULT_SANDBOX).toBe("allow-scripts");
    expect(PREVIEW_SANDBOX_DEFAULT_SANDBOX).not.toContain("allow-same-origin");
  });
});

// 兜底文案由调用方喂进来（组件那侧接的是 ConfigProvider 的 locale）。不这样做的话，
// 换成英文 locale 后错误态的标题是英文、正文却是中文 —— 这条锁住那个不一致。
describe("兜底文案随 locale 走", () => {
  const en = {
    iframeError: "unknown runtime error",
    iframeRejection: "unhandled promise rejection",
    reactError: "subtree failed",
    reactEmpty: "subtree threw empty",
  };

  it("iframe 消息没带 message 时用传入的兜底，而不是内置中文", () => {
    const err = normalizeIframeMessage({ [PREVIEW_SANDBOX_MESSAGE_KEY]: "f1", kind: "error" }, "f1", en);
    expect(err?.message).toBe(en.iframeError);
    const rejected = normalizeIframeMessage(
      { [PREVIEW_SANDBOX_MESSAGE_KEY]: "f1", kind: "unhandledrejection" },
      "f1",
      en,
    );
    expect(rejected?.message).toBe(en.iframeRejection);
  });

  it("React 抛出物没有 message 时用传入的兜底", () => {
    expect(normalizeReactError({}, undefined, en).message).toBe(en.reactError);
    expect(normalizeReactError(null, undefined, en).message).toBe(en.reactEmpty);
  });

  it("不传兜底时保持原有中文默认值（直接调纯函数的消费方不受影响）", () => {
    expect(normalizeReactError(null).message).toBe(DEFAULT_ERROR_FALLBACKS.reactEmpty);
  });
});
