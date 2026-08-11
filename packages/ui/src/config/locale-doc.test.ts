// docs/consuming.md §9 里那张「Locale 顶层有哪些节」的表是**手写**的 —— 全量叶子键没有写进
// 文档（那份必然腐烂），文档给的是从字典自己打的 walk 片段。但顶层这 12 个名字仍是手抄，
// 加一节 Locale 而忘了改文档不会有任何提示，于是这条把它钉死：文档漂了就红在这里。
//
// 只钉顶层。`components` 下 100+ 节按设计会持续增长，逐条钉住等于把文档变成第二份类型定义。
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { zhCN } from "./locale";

// 相对 vitest 的 cwd（= packages/ui）解析。不用 `new URL(..., import.meta.url)`：Vite 的 SSR
// 变换下 import.meta.url 不是 file: 协议，readFileSync 会直接抛 "The URL must be of scheme file"。
const DOC = "../../docs/consuming.md";

describe("consuming.md §9 的 Locale 顶层键清单", () => {
  it("与 zhCN 的真实顶层键一致（漏一个节，消费方自定义语言时就会漏译）", () => {
    const doc = readFileSync(DOC, "utf8");
    const row = doc
      .split("\n")
      .find((line) => line.includes("`Locale` 顶层") && line.trim().startsWith("|"));
    expect(row, "§9 里找不到「`Locale` 顶层」那一行表格").toBeTruthy();

    const documented = new Set([...(row as string).matchAll(/`([a-zA-Z]+)`/g)].map((m) => m[1]));
    documented.delete("Locale"); // 首列的 `Locale` 顶层 是表头文案，不是键名

    expect([...documented].sort()).toEqual(Object.keys(zhCN).sort());
  });
});
