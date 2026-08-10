#!/usr/bin/env node
// check-component-doc-props.mjs —— 组件的**类型**里有、**文档表格**里查不到的字段，就是门禁失败。
//
// 存在的理由（hulianui/hulian#150 第三条）：加一个 prop 时改 `.types.ts` 是**必须**的（不改编译不过），
// 补 md 表格是**可选**的（漏了没人知道）。这个不对称让文档必然滞后于类型，而且滞后是静默的：
// TS 不报、guard 不报、页面只是少个 label。人还会翻源码兜底，模型基本就信文档 ——
// 文档缺一行，生成的就是错代码。把它变成编译期问题是唯一不会漂的办法。
//
// 主要形态是 **item 形状的接口**：BreadcrumbItem / NavMenuItem / TabBarItem 这类通过数组 prop
// 传进去的东西。根组件的 props 表大多写得全，但「数组里每一项长什么样」是系统性缺的 ——
// 而这恰恰是消费方最需要查的：根组件的 prop 只告诉你 `items: XxxItem[]`，XxxItem 里有什么就没了下文。
//
// 判据两侧都刻意用现成的真源，不另起一套解析：
//   · 类型侧走 TypeScript AST（`typescript-api` = TS 5，TS 7 已不再暴露编译器 API）。
//     正则版实测误报 757 处：限定名 `Collapsible.open`、散文式 `NavMenuItem = { key; label }`、
//     纯文案包 Labels/Text 全会被当成字段。
//   · 文档侧复用 props-catalog 的 splitTableRow / parseNameCell —— 它们处理了 GFM 转义管道、
//     代码段内管道、必填星号、限定名（`DialogContent.title`）这些坑，与 MCP 服务出去的是同一套。
//
// 已知边界（是下界不是全量，与 #150 的口径一致）：只看 `<slug>/*.types.ts` 里 `Props` / `Item`
// 结尾的导出接口与对象类型别名。内联在 .tsx 里的类型不在范围内 —— 那类组件多为内部件，
// 且把 .tsx 纳入会让「实现细节接口」也被要求进文档表，噪音大于收益。

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript-api";

import { splitTableRow, parseNameCell } from "./props-catalog.mjs";

const UI_SRC = "packages/ui/src";

// 这些名字要么是 React/DOM 的通用出口（每个组件都有，写进表里全是噪音），
// 要么在文档里以别的形式说明。**允许**出现在表格里，只是不强制。
const UNIVERSAL = new Set([
  "children",
  "className",
  "style",
  "ref",
  "key",
  "id",
  "role",
  "asChild",
]);

/**
 * 字段级豁免。key 是 `<slug>.<字段名>`，value 是**为什么不进表**。
 * 加一条就要写清理由 —— 空着的豁免过一阵就没人知道能不能删了。
 */
const ALLOWLIST = new Map([]);

const isTableRow = (line) => /^\s*\|/.test(line) && /\|\s*$/.test(line.trim());
const isDelimiterRow = (line) => /^\s*\|(\s*:?-{2,}:?\s*\|)+\s*$/.test(line.trim());

/**
 * md 里**所有**表格的首列名字。
 *
 * 刻意不限于 Props / Events / Slots 三节：#150 第二条已经说明「归到 Slots」不该让查 props 的人
 * 漏掉字段，那条从 MCP 抽取层修了；这里是另一个方向 —— 只要作者在任何一张表里交代过这个字段，
 * 就不算「查不到」。判据放宽一档，换来的是零争议：门禁报出来的每一条都确实是一个字都没写。
 */
export function documentedNames(body) {
  const names = new Set();
  let inFence = false;
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence || !isTableRow(line) || isDelimiterRow(line)) continue;
    const cells = splitTableRow(line);
    if (cells.length < 2) continue;
    // 一格里写两个同源字段是本库既有且合理的写法：`startXOffset / startYOffset`、
    // `category / defaultCategory`、`logo / actions` —— 它们共用一句说明，拆成两行只是重复。
    // 不认这种写法的话，门禁会逼着把已经写好的文档拆散，那是拿门禁改文档而不是改代码。
    for (const part of cells[0].split("/")) {
      // 限定名取最后一段：`DialogContent.title` 与 `title` 记的是同一个字段。
      const { name } = parseNameCell(part);
      if (name) names.add(name);
    }
  }
  return names;
}

/**
 * 一段 TS 源码里，`Props` / `Item` 结尾的**导出**接口 / 对象类型别名的自有字段。
 *
 * 只取自有成员：`extends` 来的（如 HTMLAttributes 的几百个属性）不该逼着文档逐条列出，
 * 文档里一句「继承原生 <input> 属性」就够了。反过来说，只要作者在自己的接口里显式写了某个字段
 * —— 哪怕是为了收窄或加注释而重声明的 —— 那就是这个组件的 API 面，必须能查到。
 */
export function declaredFields(source, fileName = "x.ts") {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const fields = new Map(); // name -> 声明它的接口名
  const isExported = (node) =>
    node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;

  const takeMembers = (typeName, members) => {
    for (const member of members) {
      // 属性签名与方法签名都算；索引签名 / 调用签名没有名字，跳过。
      if (!ts.isPropertySignature(member) && !ts.isMethodSignature(member)) continue;
      const nameNode = member.name;
      if (!nameNode) continue;
      const name = ts.isIdentifier(nameNode)
        ? nameNode.text
        : ts.isStringLiteral(nameNode)
          ? nameNode.text
          : null;
      if (!name || name.startsWith("_")) continue;
      if (!fields.has(name)) fields.set(name, typeName);
    }
  };

  sourceFile.forEachChild((node) => {
    if (ts.isInterfaceDeclaration(node) && isExported(node) && /(Props|Item)$/.test(node.name.text)) {
      takeMembers(node.name.text, node.members);
      return;
    }
    // `export type XxxItem = { … }`：与 interface 等价的写法，不该因为语法形式漏掉。
    // 联合 / 交叉类型不展开 —— 它们的字段归属得靠类型检查器才算得准，超出静态扫描的可信范围。
    if (
      ts.isTypeAliasDeclaration(node) &&
      isExported(node) &&
      /(Props|Item)$/.test(node.name.text) &&
      ts.isTypeLiteralNode(node.type)
    ) {
      takeMembers(node.name.text, node.type.members);
    }
  });
  return fields;
}

export function scanComponents(uiSrc = UI_SRC) {
  const rows = [];
  for (const slug of readdirSync(uiSrc).sort()) {
    const dir = join(uiSrc, slug);
    if (!statSync(dir).isDirectory()) continue;
    const md = join(dir, `${slug}.md`);
    if (!existsSync(md)) continue;
    const typeFiles = readdirSync(dir).filter((f) => f.endsWith(".types.ts"));
    if (!typeFiles.length) continue;

    const declared = new Map();
    for (const file of typeFiles) {
      for (const [name, owner] of declaredFields(readFileSync(join(dir, file), "utf8"), file)) {
        if (!declared.has(name)) declared.set(name, owner);
      }
    }
    if (!declared.size) continue;

    const documented = documentedNames(readFileSync(md, "utf8"));
    const missing = [...declared]
      .filter(([name]) => !UNIVERSAL.has(name) && !documented.has(name))
      .filter(([name]) => !ALLOWLIST.has(`${slug}.${name}`))
      .map(([name, owner]) => ({ name, owner }));
    if (missing.length) rows.push({ slug, missing });
  }
  return rows;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const rows = scanComponents();
  const total = rows.reduce((sum, r) => sum + r.missing.length, 0);
  if (!total) {
    console.log("[doc-props] PASS · 类型字段全部能在文档表格里查到");
    process.exit(0);
  }
  console.error(`[doc-props] FAIL · ${rows.length} 个组件、共 ${total} 个字段在文档表格里查不到\n`);
  for (const { slug, missing } of rows) {
    console.error(
      `  ${slug.padEnd(26)} ${String(missing.length).padStart(2)}  ` +
        missing.map((m) => `${m.owner}.${m.name}`).join(", "),
    );
  }
  console.error(
    "\n把这些字段补进对应 md 的表格（item 形状的接口另起一张 `### XxxItem` 表）。" +
      "\n确实不该进表的，加进本脚本的 ALLOWLIST 并写明理由。",
  );
  process.exit(1);
}
