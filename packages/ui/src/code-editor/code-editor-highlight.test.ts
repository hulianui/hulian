import { describe, it, expect } from "vitest";
import {
  splitTokensByLine,
  tokenizeCss,
  tokenizeEditorCode,
  type CodeToken,
} from "./code-editor-highlight";

const typesOf = (tokens: CodeToken[], value: string) =>
  tokens.filter((t) => t.value === value).map((t) => t.type);
const joined = (tokens: CodeToken[]) => tokens.map((t) => t.value).join("");

describe("tokenizeCss", () => {
  const css = `/* 主题 */
.card, a:hover {
  --gap: 8px;
  color: #ff0000;
  padding: 1.5rem 0;
  border: 1px solid red !important;
}
@media (min-width: 40rem) { .card { display: none } }`;
  const tokens = tokenizeCss(css);

  it("无损：token 拼回去等于原文", () => expect(joined(tokens)).toBe(css));
  it("注释整段吞掉", () => expect(typesOf(tokens, "/* 主题 */")).toEqual(["comment"]));
  it("块外的选择器着 tag 色", () => expect(typesOf(tokens, "card")).toContain("tag"));
  it("块内冒号前是属性名", () => expect(typesOf(tokens, "color")).toEqual(["attr"]));
  it("块外伪类不会被误判成属性名（a:hover 的 a 仍是选择器）", () => {
    expect(typesOf(tokens, "a")).toEqual(["tag"]);
    expect(typesOf(tokens, "hover")).toEqual(["tag"]);
  });
  it("十六进制颜色与带单位数值着 number 色", () => {
    expect(typesOf(tokens, "#ff0000")).toEqual(["number"]);
    expect(typesOf(tokens, "1.5rem")).toEqual(["number"]);
  });
  it("@规则与 !important 着 keyword 色", () => {
    expect(typesOf(tokens, "@media")).toEqual(["keyword"]);
    expect(typesOf(tokens, "!important")).toEqual(["keyword"]);
  });
  it("值里的标识符保持 plain（不冒充关键字）", () => {
    expect(typesOf(tokens, "solid")).toEqual(["plain"]);
  });
  it("自定义属性名也识别", () => expect(typesOf(tokens, "--gap")).toEqual(["attr"]));
  it("未闭合的块注释不吃死循环，整段吞到末尾", () => {
    const t = tokenizeCss("a { /* x");
    expect(joined(t)).toBe("a { /* x");
    expect(t.at(-1)!.type).toBe("comment");
  });
  it("空串产出空数组", () => expect(tokenizeCss("")).toEqual([]));
});

describe("tokenizeEditorCode", () => {
  it("css 走 CSS 扫描器（属性名能着色，tokenizeCode 做不到）", () => {
    expect(typesOf(tokenizeEditorCode(".a { color: red }", "css"), "color")).toEqual(["attr"]);
  });
  it("tsx 仍走 code-block 的 JS 着色器", () => {
    expect(typesOf(tokenizeEditorCode("const a = 1", "tsx"), "const")).toEqual(["keyword"]);
  });
  it("bash 走 Shell 分支", () => {
    expect(typesOf(tokenizeEditorCode("pnpm build", "bash"), "pnpm")).toEqual(["command"]);
  });
  it("未知语言按 JS 家族兜底", () => {
    expect(typesOf(tokenizeEditorCode("return 1", "rust"), "return")).toEqual(["keyword"]);
  });
});

describe("splitTokensByLine", () => {
  it("行数恒等于 code.split(\"\\n\").length", () => {
    const code = "a\n\nb\nc\n";
    expect(splitTokensByLine(tokenizeEditorCode(code, "tsx")).length).toBe(code.split("\n").length);
  });
  it("跨行 token（块注释）被切开且不含换行符", () => {
    const lines = splitTokensByLine(tokenizeEditorCode("/* a\nb */\nx", "tsx"));
    expect(lines.length).toBe(3);
    expect(lines[0].map((t) => t.value)).toEqual(["/* a"]);
    expect(lines[1].map((t) => t.value)).toEqual(["b */"]);
    expect(lines.flat().every((t) => !t.value.includes("\n"))).toBe(true);
  });
  it("空行是空数组", () => {
    expect(splitTokensByLine(tokenizeEditorCode("a\n\nb", "tsx"))[1]).toEqual([]);
  });
  it("逐行内容拼回去等于原文", () => {
    const code = "const s = `x\ny`;\n\nconst n = 1;";
    const lines = splitTokensByLine(tokenizeEditorCode(code, "tsx"));
    expect(lines.map((l) => l.map((t) => t.value).join("")).join("\n")).toBe(code);
  });
});

describe("tokenizeCss 嵌套", () => {
  const nested = "@media (min-width: 40rem) {\n  .panel:hover { color: red }\n}\n.x { top: 0 }";
  const t = tokenizeCss(nested);
  it("条件组规则内部仍是选择器语境（.panel 不被当成属性名）", () => {
    expect(typesOf(t, "panel")).toEqual(["tag"]);
    expect(typesOf(t, "hover")).toEqual(["tag"]);
  });
  it("条件组内层块里的属性名照常识别", () => {
    expect(typesOf(t, "color")).toEqual(["attr"]);
  });
  it("出了嵌套块回到选择器语境", () => {
    expect(typesOf(t, "x")).toEqual(["tag"]);
    expect(typesOf(t, "top")).toEqual(["attr"]);
  });
  it("@import 以分号收尾，不会污染后面的块", () => {
    const s = tokenizeCss('@import "a.css";\n.b { color: red }');
    expect(typesOf(s, "color")).toEqual(["attr"]);
  });
  it("多余的 } 不把状态带崩", () => {
    const s = tokenizeCss("} .a { color: red }");
    expect(typesOf(s, "color")).toEqual(["attr"]);
  });
});
