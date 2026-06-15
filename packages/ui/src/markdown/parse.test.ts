import { describe, it, expect } from "vitest";
import { parseBlocks } from "./parse";

describe("parseBlocks", () => {
  it("段落 + 围栏代码块 + 段落", () => {
    const src = "下面是代码：\n\n```js\nconst a = 1;\n```\n\n说明文字。";
    const blocks = parseBlocks(src);
    expect(blocks.map((b) => b.type)).toEqual(["para", "code", "para"]);
    const code = blocks[1];
    expect(code.type === "code" && code.lang).toBe("js");
    expect(code.type === "code" && code.code).toBe("const a = 1;");
  });

  it("标题级别", () => {
    const blocks = parseBlocks("# 一级\n## 二级\n### 三级");
    expect(blocks).toEqual([
      { type: "heading", level: 1, text: "一级" },
      { type: "heading", level: 2, text: "二级" },
      { type: "heading", level: 3, text: "三级" },
    ]);
  });

  it("无序 / 有序列表", () => {
    const ul = parseBlocks("- 甲\n- 乙");
    expect(ul[0]).toEqual({ type: "list", ordered: false, items: ["甲", "乙"] });
    const ol = parseBlocks("1. 第一\n2. 第二");
    expect(ol[0]).toEqual({ type: "list", ordered: true, items: ["第一", "第二"] });
  });

  it("引用块合并连续行", () => {
    const blocks = parseBlocks("> 第一行\n> 第二行");
    expect(blocks[0]).toEqual({ type: "quote", text: "第一行 第二行" });
  });

  it("代码块内的 # 和 - 不被当作标题/列表", () => {
    const src = "```sh\n# 注释\n- 不是列表\n```";
    const blocks = parseBlocks(src);
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe("code");
    expect(blocks[0].type === "code" && blocks[0].code).toBe("# 注释\n- 不是列表");
  });

  it("GFM 表格：表头 + 数据行", () => {
    const src = "| 名称 | 类型 |\n|------|------|\n| size | number |";
    const t = parseBlocks(src)[0];
    expect(t.type).toBe("table");
    expect(t.type === "table" && t.header).toEqual(["名称", "类型"]);
    expect(t.type === "table" && t.rows).toEqual([["size", "number"]]);
  });

  it("表格单元格内转义管道 \\| 不被当作列分隔（联合类型）", () => {
    const src = '| 名称 | 类型 | 默认 |\n|---|---|---|\n| orientation | `"left" \\| "right"` | `"left"` |';
    const t = parseBlocks(src)[0];
    expect(t.type === "table" && t.rows[0]).toEqual(["orientation", '`"left" | "right"`', '`"left"`']);
  });

  it("表格单元格内反引号代码段里的裸管道不被切列", () => {
    const src = "| a | b |\n|---|---|\n| `x | y` | 末列 |";
    const t = parseBlocks(src)[0];
    expect(t.type === "table" && t.rows[0]).toEqual(["`x | y`", "末列"]);
  });

  it("空输入返回空数组", () => {
    expect(parseBlocks("")).toEqual([]);
    expect(parseBlocks("\n\n")).toEqual([]);
  });
});
