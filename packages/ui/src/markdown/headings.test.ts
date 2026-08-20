import { describe, expect, it } from "vitest";

import { slugifyHeading, extractHeadings } from "./headings";

describe("slugifyHeading", () => {
  it("中文标题原样保留（本库文档的 h2 绝大多数是中文）", () => {
    expect(slugifyHeading("安装")).toBe("安装");
    expect(slugifyHeading("接入 CSS（Tailwind v4）")).toBe("接入-csstailwind-v4");
  });

  it("英文转小写、空白折成连字符", () => {
    expect(slugifyHeading("Getting  Started")).toBe("getting-started");
  });

  it("剥掉行内标记后再取 slug —— 加粗某个词不该换掉锚点", () => {
    expect(slugifyHeading("**铁律**（请严格遵守）")).toBe("铁律请严格遵守");
    expect(slugifyHeading("用 `parseBlocks` 拿 AST")).toBe("用-parseblocks-拿-ast");
    expect(slugifyHeading("见 [Prose](../prose/prose.md)")).toBe("见-prose");
  });

  it("标点与符号被剔除，连字符不重复、不留首尾", () => {
    expect(slugifyHeading("  A, B — C!  ")).toBe("a-b-c");
    expect(slugifyHeading("--- 边界 ---")).toBe("边界");
    expect(slugifyHeading("emoji 🎉 也不进 id")).toBe("emoji-也不进-id");
  });

  it("空标题与纯符号标题回落到通用 id（空串等于没有锚点）", () => {
    expect(slugifyHeading("")).toBe("section");
    expect(slugifyHeading("   ")).toBe("section");
    expect(slugifyHeading("???")).toBe("section");
  });
});

describe("extractHeadings", () => {
  it("按文档顺序抽出各级标题", () => {
    expect(extractHeadings("# 一\n\n正文\n\n## 二\n\n### 三")).toEqual([
      { level: 1, text: "一", plainText: "一", id: "一" },
      { level: 2, text: "二", plainText: "二", id: "二" },
      { level: 3, text: "三", plainText: "三", id: "三" },
    ]);
  });

  it("plainText 剥掉行内标记供目录标签直接用，text 保留原文", () => {
    const [h] = extractHeadings('## 跟随容器的 `tone="current"`');
    expect(h.text).toBe('跟随容器的 `tone="current"`');
    expect(h.plainText).toBe('跟随容器的 tone="current"');
  });

  it("同名标题按出现顺序追加 -1 / -2", () => {
    expect(extractHeadings("## 示例\n\n## 示例\n\n## 示例").map((h) => h.id)).toEqual([
      "示例",
      "示例-1",
      "示例-2",
    ]);
  });

  it("去重后缀撞上字面写着该后缀的标题时继续后移", () => {
    expect(extractHeadings("## foo\n\n## foo-1\n\n## foo").map((h) => h.id)).toEqual([
      "foo",
      "foo-1",
      "foo-2",
    ]);
  });

  it("多个空标题也各自可达", () => {
    expect(extractHeadings("## ??\n\n## !!").map((h) => h.id)).toEqual(["section", "section-1"]);
  });

  it("prefix 把整批 id 关进自己的命名空间（去重后缀仍按前缀后的完整 id 算）", () => {
    expect(extractHeadings("## Props\n\n## Props", "doc-").map((h) => h.id)).toEqual([
      "doc-props",
      "doc-props-1",
    ]);
  });

  it("代码块里的 # 不算标题", () => {
    expect(extractHeadings("```md\n# 假标题\n```\n\n## 真标题").map((h) => h.text)).toEqual([
      "真标题",
    ]);
  });
});
