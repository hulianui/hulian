#!/usr/bin/env node
// props-catalog.mjs — 把手写的组件文档（packages/ui/src/<slug>/<slug>.md）里的
// Props / Events / Slots 表解析成结构化数据，供 llms-props.json 与 llms-full.txt 的类型展开使用。
//
// 存在的理由（hulianui/hulian#102 #103 #104 #105）：AI 消费方要做「受约束生成」——
// 只允许输出白名单组件与合法 props —— 就必须有机器可读的真源。此前唯一的真源是 markdown，
// 于是每个消费方都得自己去趟三个坑：
//
//   #102 类型列里的联合分隔符是 GFM 转义的 `\|`，按 line.split("|") 裸切会整行串列；
//   #103 类型列写的是别名（StackDirection），文档里没有任何地方给出它的取值；
//   #104 文档标题是展示名（`# iPhone`），与真实导出名（IPhone）不一致。
//
// 这里给出的答案：拆列认转义与代码段（splitTableRow）、别名就地展开（expandAliasType）、
// 导出名以 barrel 为真源（由 gen-llms-registry 传入）。

import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript-api";

// ------------------------------------------------------------------ 表格 --

/**
 * 拆一行 GFM 表格。
 *
 * 不能用 `line.split("|")`：类型列里的联合分隔符是**转义的** `\|`（GFM 要求表格单元格内的
 * 管道必须转义，即使在代码段里），裸切会把 `"start" \| "center"` 劈成两列，后面所有列整体串位
 * —— 枚举只剩第一个取值、默认值和说明全错（hulianui/hulian#102）。
 *
 * 反引号状态是第二道保险：即使某天有人漏写了转义，代码段内的管道也不会被当成列分隔符。
 * 返回的单元格里转义已被还原（`\|` → `|`），可直接当类型文本用。
 */
export function splitTableRow(line) {
  const cells = [];
  let cur = "";
  let inCode = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    // GFM 只承认「反斜杠 + ASCII 标点」是转义。这里必须照做，不能见到反斜杠就吞下一个字符：
    // 英文产物会把混进来的 CJK 写成 `\uXXXX` 文本（作为越界标记），当成转义会把它悄悄
    // 洗成 `uXXXX` —— 既毁了产物，又把本该被门禁抓住的越界抹掉。
    if (ch === "\\" && i + 1 < line.length && /[!-/:-@[-`{-~]/.test(line[i + 1])) {
      cur += line[i + 1];
      i += 1;
      continue;
    }
    if (ch === "`") {
      inCode = !inCode;
      cur += ch;
      continue;
    }
    if (ch === "|" && !inCode) {
      cells.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  cells.push(cur);
  // 行首/行尾的 `|` 会各产生一个空单元，去掉它们（中间的空单元是真列，必须留）
  if (cells.length && cells[0].trim() === "") cells.shift();
  if (cells.length && cells[cells.length - 1].trim() === "") cells.pop();
  return cells.map((c) => c.trim());
}

const isDelimiterRow = (line) => /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/.test(line.trim());
const isTableRow = (line) => line.trim().startsWith("|");

/** 去掉单元格外层的反引号，便于按名检索（类型列保留原文，名称列才用这个）。 */
const unticked = (text) => text.replace(/^`(.*)`$/s, "$1").trim();

// ------------------------------------------------------------- 类型别名 --

const literalText = (node) => {
  if (ts.isLiteralTypeNode(node)) {
    const { literal } = node;
    if (ts.isStringLiteral(literal)) return JSON.stringify(literal.text);
    if (ts.isNumericLiteral(literal)) return literal.text;
    if (literal.kind === ts.SyntaxKind.TrueKeyword) return "true";
    if (literal.kind === ts.SyntaxKind.FalseKeyword) return "false";
  }
  return null;
};

/**
 * 扫全部 `<slug>/*.types.ts`，抽出「字面量联合」别名的真实取值。
 *
 * 用编译器 AST 而不是正则：联合成员会被 prettier 折行（`type X =\n  | "a"\n  | "b"`），
 * 单行正则只抽得到其中一部分。非字面量别名（对象型的 ResponsiveDirection 之类）
 * 刻意不收 —— 展开它们只会把类型列撑爆，而 issue 要的就是字面量那部分。
 */
export function collectTypeAliases(uiSrc) {
  const aliases = new Map();
  const visitFile = (file) => {
    const sourceFile = ts.createSourceFile(
      file,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    sourceFile.forEachChild((node) => {
      if (!ts.isTypeAliasDeclaration(node)) return;
      if (!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)) return;
      const members = ts.isUnionTypeNode(node.type) ? node.type.types : [node.type];
      const values = [];
      for (const member of members) {
        const text = literalText(member);
        if (text === null) return; // 混入非字面量成员 → 整条别名不收
        values.push(text);
      }
      if (values.length) aliases.set(node.name.text, values);
    });
  };
  const walk = (dir) => {
    for (const entry of readdirSync(dir).sort()) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) {
        walk(p);
        continue;
      }
      if (entry.endsWith(".types.ts")) visitFile(p);
    }
  };
  if (existsSync(uiSrc)) walk(uiSrc);
  return aliases;
}

/** 类型文本里出现的、已知的字面量联合别名（按出现顺序、去重）。 */
export function aliasesUsedIn(typeText, aliases) {
  const used = [];
  for (const m of typeText.matchAll(/\b[A-Z][A-Za-z0-9_]*\b/g)) {
    if (aliases.has(m[0]) && !used.includes(m[0])) used.push(m[0]);
  }
  return used;
}

/**
 * 把类型文本里的字面量联合别名就地展开成真实取值（hulianui/hulian#103）。
 *
 * `maxValues` 是给 markdown 用的闸门：取值特别多的别名（图标名、地区码这类）展开进表格
 * 只会把一列撑成一屏，那种情况保留别名——完整取值在 llms-props.json 里始终有。
 */
export function expandAliasType(typeText, aliases, { maxValues = Infinity } = {}) {
  let out = typeText;
  for (const name of aliasesUsedIn(typeText, aliases)) {
    const values = aliases.get(name);
    if (values.length > maxValues) continue;
    out = out.replace(new RegExp(`\\b${name}\\b`, "g"), values.join(" | "));
  }
  return out;
}

/**
 * 按**顶层** `|` 拆联合成员。
 *
 * 不能直接 `split("|")`：`(v: "a" \| "b") => void` 这类函数类型、`Record<string, "x" \| "y">`
 * 这类泛型参数里的管道都不是顶层分隔符，裸切会把一个成员劈成两半。
 */
/**
 * 类型文本里的分隔符归一成 ASCII 管道。
 *
 * 文档里三种写法都有：全角 `｜`（72 篇）、半角 `|`、GFM 转义的 `\|`（404 篇）。
 * 结构化产物只认一种，否则 Button 的 `"solid"｜"outline"` 会被当成一个整体标识符，
 * 枚举取值凭空消失 —— 这正是 #102 在结构化侧的同一个病灶。
 */
export const normalizeUnionText = (typeText) =>
  typeText.replaceAll("｜", " | ").replace(/\s*\|\s*/g, " | ").trim();

export function splitUnion(typeText) {
  const parts = [];
  let cur = "";
  let depth = 0;
  let quote = "";
  for (const ch of typeText) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if ("([{<".includes(ch)) depth += 1;
    else if (")]}>".includes(ch)) depth -= 1;
    else if (ch === "|" && depth <= 0) {
      parts.push(cur);
      cur = "";
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

const asLiteral = (part) => {
  const quoted = part.match(/^"([^"]*)"$/) || part.match(/^'([^']*)'$/);
  if (quoted) return { value: quoted[1], numeric: false };
  if (/^-?\d+(\.\d+)?$/.test(part)) return { value: part, numeric: true };
  return null;
};

/**
 * 联合成员里的字面量取值与非字面量成员。
 *
 * 混合联合（`StackDirection | ResponsiveDirection` 展开后 = `"row" | "column" | ResponsiveDirection`）
 * 也要给出 `"row" / "column"` —— 受约束生成正是靠这份取值判合法性，
 * 「有别的形态也能传」不该让这两个已知取值一起消失。
 */
export function unionMembers(typeText) {
  const parts = splitUnion(typeText.replace(/`/g, "").trim());
  const values = [];
  const others = [];
  let numeric = 0;
  for (const part of parts) {
    const literal = asLiteral(part);
    if (literal === null) {
      others.push(part);
      continue;
    }
    values.push(literal.value);
    if (literal.numeric) numeric += 1;
  }
  // 取值全是数字时消费方要写 `level={1}` 而不是 `level="1"`，这个区别不能在 JSON 里丢掉。
  const valueType = !values.length
    ? null
    : numeric === values.length
      ? "number"
      : numeric === 0
        ? "string"
        : "mixed";
  return { values, others, valueType };
}

/** 类型文本 → 供受约束生成用的粗分类。 */
export function classifyType(typeText, { values = [], others = [] } = {}) {
  const t = typeText.replace(/`/g, "").trim();
  if (values.length) return others.length ? "union" : "enum";
  if (/^boolean$/.test(t)) return "boolean";
  if (/^number$/.test(t)) return "number";
  if (/^string$/.test(t)) return "string";
  if (/^ReactNode$/.test(t)) return "node";
  if (/=>/.test(t)) return "function";
  if (/\[\]$/.test(t) || /^Array</.test(t)) return "array";
  return "other";
}

// --------------------------------------------------------------- 文档解析 --

const SECTION_TITLES = {
  props: new Set(["Props"]),
  events: new Set(["Events", "事件"]),
  slots: new Set(["Slots", "插槽"]),
};

/**
 * 把文档正文切成 `## 小节`，每节再按 `### 子件` 分组。
 * 复合组件（Grid/GridItem、Dialog/DialogContent）的表就挂在子件小节下。
 */
function collectTables(body) {
  const lines = body.split("\n");
  const sections = [];
  let section = null;
  let owner = "";
  let table = null;
  let inFence = false;
  const flush = () => {
    if (table && table.rows.length) sections.push({ ...table });
    table = null;
  };
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      flush();
      const title = h2[1].trim();
      section = Object.keys(SECTION_TITLES).find((k) => SECTION_TITLES[k].has(title)) ?? null;
      owner = "";
      continue;
    }
    const h3 = line.match(/^###\s+(.+?)\s*$/);
    if (h3) {
      flush();
      owner = unticked(h3[1].trim());
      continue;
    }
    if (!section) continue;
    if (isDelimiterRow(line)) continue;
    if (isTableRow(line)) {
      const cells = splitTableRow(line);
      if (!table) {
        table = { section, owner, header: cells, rows: [] };
        continue;
      }
      table.rows.push(cells);
      continue;
    }
    if (line.trim() === "") continue;
    flush(); // 表被普通段落打断
  }
  flush();
  return sections;
}

/**
 * 名称单元格 → { name, owner, required }。
 * 兼容三种写法：`direction` / `events*` / `` `DialogContent.title` * ``。
 */
export function parseNameCell(cell, fallbackOwner) {
  let text = cell.trim();
  let required = false;
  const star = text.match(/^(.*?)\s*\*+\s*$/);
  if (star) {
    required = true;
    text = star[1].trim();
  }
  text = unticked(text);
  let owner = fallbackOwner || "";
  const dot = text.lastIndexOf(".");
  if (dot > 0) {
    owner = text.slice(0, dot);
    text = text.slice(dot + 1);
  }
  return { name: text, owner, required };
}

const cleanDefault = (cell) => {
  const text = unticked(cell.trim());
  return text === "" || text === "—" || text === "-" ? null : text;
};

// ------------------------------------------------------------- 产物改写 --

/** 单元格里的管道一律写成 GFM 转义形（全角 `｜` 也归一过来）。 */
const escapeCell = (text) => text.replaceAll("｜", "|").replace(/\\?\|/g, "\\|");

/**
 * 把文档正文改写成「给 AI 读的那一份」。源 md 不动（文档站照常渲染人写的版本），
 * 只有 llms-full.txt / d/<slug>.md 这些 AI 产物吃这里的结果：
 *
 * - Props / Events 表的类型列就地展开字面量联合别名（#103）
 * - 表格行统一重写成 GFM 转义的 `\|`，消掉「全角 ｜ / 半角 | / 转义 \| 三种混用」（#102）
 * - 标题下补一行真实导出名，标题是展示名（`# iPhone` / `# Chart`）时不再需要消费方
 *   去解析 `## 导入` 代码块反查（#104）
 */
export function rewriteDocForAi(body, { aliases = new Map(), exports: exported = [], locale } = {}) {
  const lines = body.split("\n");
  const out = [];
  let section = null;
  let inFence = false;
  let headingDone = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (!inFence) {
      if (!headingDone && /^#\s+/.test(line)) {
        out.push(line);
        headingDone = true;
        if (exported.length) {
          const label = locale === "en" ? "**Exports**" : "**导出**";
          const joiner = locale === "en" ? ": " : "：";
          out.push("");
          out.push(`${label}${joiner}${exported.map((n) => `\`${n}\``).join(" · ")}`);
        }
        continue;
      }
      const h2 = line.match(/^##\s+(.+?)\s*$/);
      // `### 子件` 刻意不重置：复合组件的子件表仍属当前小节（Grid / GridItem）。
      if (h2) {
        const title = h2[1].trim();
        // 只改写描述 API 面的三节。别处的表（工具函数对照、能力矩阵之类）第二列未必是类型，
        // 在那里展开别名只会制造噪音。
        section = ["props", "events", "slots"].find((k) => SECTION_TITLES[k].has(title)) ?? null;
      }
      if (section && isTableRow(line) && !isDelimiterRow(line)) {
        const cells = splitTableRow(line);
        if (cells.length >= 2) {
          cells[1] = expandAliasType(cells[1], aliases, { maxValues: 12 });
          out.push(`| ${cells.map(escapeCell).join(" | ")} |`);
          continue;
        }
      }
    }
    out.push(line);
  }
  return out.join("\n");
}

/**
 * 一份组件文档 → 结构化的 props / events / slots。
 * `aliases` 用于把类型列里的字面量联合别名展开成真实取值（#103）。
 */
export function parseComponentDoc(body, aliases = new Map()) {
  const out = { props: [], events: [], slots: [] };
  for (const table of collectTables(body)) {
    for (const cells of table.rows) {
      if (cells.length < 2) continue;
      const { name, owner, required } = parseNameCell(cells[0], table.owner);
      if (!name) continue;
      const rawType = normalizeUnionText(unticked(cells[1]));
      const expanded = expandAliasType(rawType, aliases);
      const members = unionMembers(expanded);
      const values = members.values;
      const entry = { name, ...(owner ? { owner } : {}) };
      if (table.section === "slots") {
        out.slots.push({ ...entry, type: rawType, description: (cells[2] ?? "").trim() });
        continue;
      }
      // 列数按表头定，不能写死：Props 表是「名称/类型/默认/说明」四列，
      // 而 Events 与 Slots 表是「名称/类型/说明」三列（全库 132 篇一致）。
      // 按四列硬读会把 Events 的说明当成默认值，说明列则整个变空。
      const hasDefault = table.header.length >= 4;
      const record = {
        ...entry,
        required,
        kind: classifyType(expanded, members),
        type: rawType,
        ...(expanded !== rawType ? { resolvedType: expanded } : {}),
        ...(values.length ? { values, valueType: members.valueType } : {}),
        default: hasDefault ? cleanDefault(cells[2] ?? "") : null,
        description: ((hasDefault ? cells[3] : cells[2]) ?? "").trim(),
      };
      out[table.section === "events" ? "events" : "props"].push(record);
    }
  }
  return out;
}
