// adoption-signals 是 audit tool（单项目纵深）与 scripts/agent-adoption-scan（跨项目
// 横比）的共同事实来源。这里锁的是「两边必须读出同一个数」的那部分：曾经各存一份时，
// 同一个项目在两处报出的数字是不一样的。

import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  RISK_RULES,
  buildSymbolIndex,
  collectHulianImports,
  maskComments,
  walkCodeFiles,
} from "../src/adoption-signals.mjs";

function scratch(files) {
  const dir = mkdtempSync(join(tmpdir(), "hulian-signals-"));
  for (const [rel, content] of Object.entries(files)) {
    const full = join(dir, rel);
    mkdirSync(join(full, ".."), { recursive: true });
    writeFileSync(full, content);
  }
  return dir;
}

// ------------------------------------------------------- collectHulianImports --

test("类型导入不算使用 —— 整体 type 与逐项 type 两种写法都要挡", () => {
  const names = collectHulianImports(`
    import type { ButtonProps } from "@hulianui/ui";
    import { type CardProps, Card } from "@hulianui/ui";
  `);
  assert.deepEqual(names, ["Card"]);
});

test("as 别名取原名 —— 注册表认导出名，不认消费方起的名字", () => {
  assert.deepEqual(collectHulianImports(`import { Button as Btn } from "@hulianui/ui";`), ["Button"]);
});

test("只认 @hulianui/ 的导入，同文件里的 react 导入不计", () => {
  const names = collectHulianImports(`
    import { useState, useEffect } from "react";
    import { Dialog } from "@hulianui/ui";
  `);
  assert.deepEqual(names, ["Dialog"]);
});

// 这是 IMPORT_RE 用 [^{}] 而非 [\s\S] 的原因：贪婪跨过上一条 import 的收尾花括号，
// 会把 react 的 hooks 一并算成瑚琏组件，让采用率凭空虚高。
test("正则不跨过上一条 import 的收尾花括号", () => {
  const names = collectHulianImports(`
    import { useState } from "react";
    import { Table } from "@hulianui/ui";
  `);
  assert.ok(!names.includes("useState"), `不该把 useState 算成组件，实际：${names.join()}`);
  assert.deepEqual(names, ["Table"]);
});

test("同一 symbol 多次导入按次数返回 —— 计数由调用方决定", () => {
  const names = collectHulianImports(`
    import { Button } from "@hulianui/ui";
    import { Button, Card } from "@hulianui/ui/button";
  `);
  assert.deepEqual(names, ["Button", "Button", "Card"]);
});

test("没提到瑚琏的文件直接返回空", () => {
  assert.deepEqual(collectHulianImports(`import { Button } from "@other/ui";`), []);
});

// ----------------------------------------------------------- buildSymbolIndex --

test("symbol→slug 先到先得，重名不静默覆盖", () => {
  const { symbolToSlug, slugMeta, ui } = buildSymbolIndex({
    items: [
      { type: "registry:ui", name: "table", meta: { exports: ["Table", "TableRow"] } },
      { type: "registry:ui", name: "pro-table", meta: { exports: ["Table", "ProTable"] } },
      { type: "registry:block", name: "block-login", meta: { exports: ["LoginBlock"] } },
    ],
  });
  assert.equal(symbolToSlug.get("Table"), "table");
  assert.equal(symbolToSlug.get("ProTable"), "pro-table");
  assert.equal(symbolToSlug.has("LoginBlock"), false, "block 不该进组件索引");
  assert.equal(ui.length, 2);
  assert.equal(slugMeta.get("table").name, "table");
});

test("registry 缺失或为空不炸", () => {
  for (const input of [undefined, null, {}, { items: [] }]) {
    const { ui, symbolToSlug } = buildSymbolIndex(input);
    assert.equal(ui.length, 0);
    assert.equal(symbolToSlug.size, 0);
  }
});

// -------------------------------------------------------------- walkCodeFiles --

test("跳过依赖与构建产物 —— 计入会让覆盖率分母失去意义", () => {
  const dir = scratch({
    "src/app.tsx": "",
    "node_modules/pkg/index.js": "",
    "dist/bundle.js": "",
    "src-tauri/main.js": "",
    "public/vendor.js": "",
    ".next/build.js": "",
  });
  try {
    assert.deepEqual(walkCodeFiles(dir), ["src/app.tsx"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("跳过隐藏目录，跳过 .d.ts，认 .mjs", () => {
  const dir = scratch({
    "src/a.mjs": "",
    "src/types.d.ts": "",
    ".hidden/b.ts": "",
    "src/c.jsx": "",
    "README.md": "",
  });
  try {
    assert.deepEqual(walkCodeFiles(dir).sort(), ["src/a.mjs", "src/c.jsx"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("maxFiles 截断在上限处停住，调用方据此报 truncated", () => {
  const dir = scratch(Object.fromEntries([...Array(10)].map((_, i) => [`src/f${i}.ts`, ""])));
  try {
    assert.equal(walkCodeFiles(dir, { maxFiles: 4 }).length, 4);
    assert.equal(walkCodeFiles(dir).length, 10, "不传上限时不截断");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("返回相对 base 的 posix 路径", () => {
  const dir = scratch({ "src/nested/deep/a.ts": "" });
  try {
    assert.deepEqual(walkCodeFiles(dir), ["src/nested/deep/a.ts"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

// ------------------------------------------------------------------ RISK_RULES --

test("规则 id 唯一 —— 两侧都按 id 聚合，重复会静默合并成一条", () => {
  const ids = RISK_RULES.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("每条规则都带 baseConfidence 与 why —— 缺了就成了「一律标红」", () => {
  for (const r of RISK_RULES) {
    assert.ok(["high", "medium", "low"].includes(r.baseConfidence), `${r.id} 缺 baseConfidence`);
    assert.ok(r.why && r.should, `${r.id} 缺 why / should`);
  }
});

// 下面两条是收敛前两侧真实分叉的地方：脚本侧的正则更宽 / 更窄，同一份代码在两处
// 报出的数字不一样，而两处都自称在测采用率。
test("handmade-overlay 限定在 className 内，不命中注释与任意字符串", () => {
  const rule = RISK_RULES.find((r) => r.id === "handmade-overlay");
  assert.equal(`// 这里以前用 fixed inset-0 手搓过`.match(rule.re), null);
  assert.equal(`<div className="fixed inset-0 bg-black/50" />`.match(rule.re).length, 1);
});

test("hardcoded-color 认 fill / stroke —— 图标的写死颜色一样不跟随主题", () => {
  const rule = RISK_RULES.find((r) => r.id === "hardcoded-color");
  assert.equal(`<svg className="fill-[#ff0000] stroke-[#00f]" />`.match(rule.re).length, 2);
  assert.equal(`<div className="text-[#123456]" />`.match(rule.re).length, 1);
  assert.equal(`<div className="text-primary" />`.match(rule.re), null);
});

test("全局正则可被两侧反复消费，不残留 lastIndex", () => {
  const rule = RISK_RULES.find((r) => r.id === "bare-button");
  const src = `<button /><button />`;
  assert.equal(src.match(rule.re).length, 2);
  assert.equal([...src.matchAll(rule.re)].length, 2, "matchAll 之后再匹配仍应从头开始");
  assert.equal(src.match(rule.re).length, 2);
});

// —— 注释不算手搓（#266）——

test("maskComments：三种注释里的裸标签都不再命中", () => {
  const bare = RISK_RULES.find((r) => r.id === "bare-table");
  const src = [
    "// 行为按原手写 <table> 1:1 复刻：同样 7 列。",
    "/* minWidth 落在 <table> 本体上，外壳照常横滚。 */",
    "{/* 这里以前是 <table> */}",
    "<Table columns={columns} data={rows} />",
  ].join("\n");
  assert.equal(src.match(bare.re).length, 3, "抹之前：三条注释全是误报");
  assert.equal(maskComments(src).match(bare.re), null);
});

test("maskComments：真的 JSX 原生标签照旧命中", () => {
  const bare = RISK_RULES.find((r) => r.id === "bare-table");
  const src = "// 换掉了手写 <table>\n<table><tbody /></table>";
  assert.equal(maskComments(src).match(bare.re).length, 1);
});

test("maskComments：不碰字符串字面量 —— 遮罩与写死颜色恰恰住在里面", () => {
  const overlay = RISK_RULES.find((r) => r.id === "handmade-overlay");
  const color = RISK_RULES.find((r) => r.id === "hardcoded-color");
  const src = '<div className="fixed inset-0 text-[#123456]" />';
  assert.equal(maskComments(src).match(overlay.re).length, 1);
  assert.equal(maskComments(src).match(color.re).length, 1);
});

test("maskComments：字符串里的 // 不是注释（URL 后面的代码不能被抹掉）", () => {
  const bare = RISK_RULES.find((r) => r.id === "bare-input");
  const src = 'const doc = "https://example.com/a"; <input name="x" />';
  assert.equal(maskComments(src).match(bare.re).length, 1);
});

test("maskComments：长度与换行逐字保留，行号算得准", () => {
  const src = "const a = 1; // <table>\n<input />\n";
  const masked = maskComments(src);
  assert.equal(masked.length, src.length);
  assert.equal(masked.split("\n").length, src.split("\n").length);
  const bare = RISK_RULES.find((r) => r.id === "bare-input");
  const index = masked.match(bare.re) ? masked.search(bare.re) : -1;
  assert.equal(src.slice(0, index).split("\n").length, 2, "命中仍落在第 2 行");
});

test("maskComments：未闭合的块注释吃到文件尾，不抛", () => {
  const bare = RISK_RULES.find((r) => r.id === "bare-table");
  assert.equal(maskComments("/* 忘了闭合 <table>").match(bare.re), null);
});
