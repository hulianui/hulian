#!/usr/bin/env node
// check-aria-owned-children.mjs — 复合 ARIA 角色的直接子元素只能是它要求的那几种角色。
//
// 为什么需要它（PR #395，首页产品线）：
//
// 首页「产品线」把竖排 tab 写成 <div role="tablist">，又把「打开 · xxx」这个 <Link> 顺手
// 塞在 tab 按钮后面当 tablist 的子元素。视觉上完全正常，typecheck / 单测 / guard 全绿，
// 直到 CI 的 a11y 门禁（要先 next build 整站再起 Chromium 跑 axe）才以 critical 级
// aria-required-children 拦下：屏幕阅读器会把那个链接当成 tablist 里一个读不出的怪成员。
// 这类错误在源码里是**静态可判**的，没必要等二十分钟后的浏览器门禁才知道。
//
// 判据与 axe 的 aria-required-children 对齐：
//   · 容器 = 写死字面量 role 的 JSX 元素，且该 role 在 OWNED 表里
//   · 直接子元素没写 role 且没有隐式角色（div / span / p / label…）→ 透明，继续往里看
//   · .map(() => <x/>) / cond && <x/> / a ? <x/> : <y/> 里返回的 JSX 同样算直接子元素
//   · 子元素写了字面量 role → 必须在允许集合里（role="presentation"/"none" 视为透明）
//   · 子元素没写 role：小写标签按隐式角色判（a=link / li=listitem / button…），
//     大写组件只认 COMPONENT_ROLE 表（<Link>=link / <Button>=button），表外组件放过
//   · {children} 这类非 JSX 表达式看不出来，放过（运行时由 a11y 门禁兜）
//
// 确属例外时在容器所在行或上一行写 `aria-owned-ok: <理由>` 注释豁免，理由必填。
//
// Run: node scripts/check-aria-owned-children.mjs [目录…]

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-api";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_DIRS = ["apps/www/app", "apps/www/components", "packages/ui/src"];

/** 容器角色 → 允许的直接子角色。取自 WAI-ARIA 1.2 Required Owned Elements。 */
export const OWNED = {
  tablist: ["tab"],
  listbox: ["option", "group"],
  menu: ["menuitem", "menuitemcheckbox", "menuitemradio", "group", "separator"],
  menubar: ["menuitem", "menuitemcheckbox", "menuitemradio", "group", "separator"],
  tree: ["treeitem", "group"],
  treegrid: ["row", "rowgroup"],
  grid: ["row", "rowgroup"],
  table: ["row", "rowgroup", "caption"],
  rowgroup: ["row"],
  row: ["cell", "columnheader", "gridcell", "rowheader"],
  list: ["listitem"],
  radiogroup: ["radio"],
  feed: ["article"],
};

const TRANSPARENT_ROLES = new Set(["presentation", "none", "generic"]);

/**
 * 小写标签的隐式角色。不在表里的标签（div / span / p / label / section…）axe 当 generic
 * 透明处理，继续往里看 —— 所以 radiogroup 里包着 radio 的 <label> 合规。
 */
const IMPLICIT_ROLE = {
  a: "link",
  button: "button",
  select: "combobox",
  textarea: "textbox",
  img: "img",
  ul: "list",
  ol: "list",
  li: "listitem",
  h1: "heading",
  h2: "heading",
  h3: "heading",
  h4: "heading",
  h5: "heading",
  h6: "heading",
  hr: "separator",
  nav: "navigation",
  table: "table",
  tr: "row",
  td: "cell",
  th: "columnheader",
  option: "option",
  article: "article",
};

/**
 * 已知会渲染出语义元素的组件。组件渲染什么静态看不出来，只认这张表 —— 表外的组件放过，
 * 交给运行时 a11y 门禁兜（全判违规会把 OptionGroup / Empty 这类无害件全拖进来）。
 * PR #395 的元凶是 <Link>。
 */
const COMPONENT_ROLE = {
  Link: "link",
  NextLink: "link",
  Button: "button",
  IconButton: "button",
};

function tagName(node) {
  return (ts.isJsxElement(node) ? node.openingElement.tagName : node.tagName).getText();
}

function attributes(node) {
  return ts.isJsxElement(node) ? node.openingElement.attributes : node.attributes;
}

/** <input> 的隐式角色随 type 变；type 不是字面量时返回 undefined（看不出来）。 */
const INPUT_TYPE_ROLE = {
  radio: "radio",
  checkbox: "checkbox",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  button: "button",
  submit: "button",
  reset: "button",
  image: "button",
  hidden: "none",
};

function inputRole(node) {
  for (const prop of attributes(node).properties) {
    if (!ts.isJsxAttribute(prop) || prop.name.getText() !== "type") continue;
    const init = prop.initializer;
    const text =
      init && ts.isStringLiteral(init)
        ? init.text
        : init &&
          ts.isJsxExpression(init) &&
          init.expression &&
          ts.isStringLiteralLike(init.expression)
        ? init.expression.text
        : undefined;
    return text === undefined ? undefined : INPUT_TYPE_ROLE[text] ?? "textbox";
  }
  return "textbox";
}

/** 字面量 role 的值；没写返回 null；写了但不是字面量（表达式）返回 undefined = 看不出来。 */
function literalRole(node) {
  for (const prop of attributes(node).properties) {
    if (!ts.isJsxAttribute(prop) || prop.name.getText() !== "role") continue;
    const init = prop.initializer;
    if (!init) return undefined;
    if (ts.isStringLiteral(init)) return init.text;
    if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLike(init.expression)) {
      return init.expression.text;
    }
    return undefined;
  }
  return null;
}

/** 把一个 JSX 子节点展开成「实际会渲染出的直接子 JSX 元素」列表。 */
function expandChild(child, out) {
  if (ts.isJsxText(child)) return;
  if (ts.isJsxElement(child) || ts.isJsxSelfClosingElement(child)) {
    out.push(child);
    return;
  }
  if (ts.isJsxFragment(child)) {
    for (const c of child.children) expandChild(c, out);
    return;
  }
  if (ts.isJsxExpression(child) && child.expression) expandExpression(child.expression, out);
}

function expandExpression(expr, out) {
  if (ts.isParenthesizedExpression(expr)) return expandExpression(expr.expression, out);
  if (ts.isJsxElement(expr) || ts.isJsxSelfClosingElement(expr) || ts.isJsxFragment(expr)) {
    return expandChild(expr, out);
  }
  if (ts.isBinaryExpression(expr)) {
    const op = expr.operatorToken.kind;
    if (op === ts.SyntaxKind.AmpersandAmpersandToken) return expandExpression(expr.right, out);
    if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken) {
      expandExpression(expr.left, out);
      return expandExpression(expr.right, out);
    }
    return;
  }
  if (ts.isConditionalExpression(expr)) {
    expandExpression(expr.whenTrue, out);
    return expandExpression(expr.whenFalse, out);
  }
  // xs.map(cb) / xs.flatMap(cb)：看回调返回了什么
  if (ts.isCallExpression(expr) && ts.isPropertyAccessExpression(expr.expression)) {
    const method = expr.expression.name.getText();
    const cb = expr.arguments[0];
    if ((method === "map" || method === "flatMap") && cb && ts.isFunctionLike(cb)) {
      expandFunctionReturns(cb, out);
    }
  }
}

function expandFunctionReturns(fn, out) {
  if (!fn.body) return;
  if (!ts.isBlock(fn.body)) return expandExpression(fn.body, out);
  const visit = (node) => {
    if (ts.isFunctionLike(node)) return; // 嵌套函数的 return 不算
    if (ts.isReturnStatement(node) && node.expression) expandExpression(node.expression, out);
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(fn.body, visit);
}

function directChildren(element) {
  const out = [];
  if (ts.isJsxElement(element)) for (const c of element.children) expandChild(c, out);
  return out;
}

/** 收集容器在 axe 眼里的「直接拥有」子元素（穿透透明的 div/span/presentation）。 */
function ownedChildren(container) {
  const owned = [];
  const queue = directChildren(container);
  while (queue.length) {
    const child = queue.shift();
    const role = literalRole(child);
    const tag = tagName(child);
    const isComponent = /^[A-Z]/.test(tag) || tag.includes(".");
    if (role === null && isComponent) {
      const known = COMPONENT_ROLE[tag];
      if (known) owned.push({ child, role: known, tag, implicit: true });
      continue; // 表外组件静态看不出来
    }
    const effective =
      role !== null ? role : tag === "input" ? inputRole(child) : IMPLICIT_ROLE[tag];
    if (role === null && tag === "input" && effective === undefined) continue; // type 是表达式
    const transparent =
      (role === null && effective === undefined) ||
      (typeof role === "string" && TRANSPARENT_ROLES.has(role));
    if (transparent) queue.push(...directChildren(child));
    else owned.push({ child, role: effective, tag, implicit: role === null });
  }
  return owned;
}

function waived(sourceFile, node) {
  const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  const lines = sourceFile.text.split("\n");
  return [lines[line - 1] ?? "", lines[line] ?? ""].some((l) => /aria-owned-ok:\s*\S/.test(l));
}

/**
 * 纯函数：给源码返回违规列表。
 * @returns {{ line: number, containerRole: string, child: string, reason: string }[]}
 */
export function findViolations(source, fileName = "file.tsx") {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const violations = [];
  const visit = (node) => {
    if (ts.isJsxElement(node)) {
      const role = literalRole(node);
      const allowed = typeof role === "string" ? OWNED[role] : undefined;
      if (allowed && !waived(sf, node)) {
        for (const { child, role: childRole, tag, implicit } of ownedChildren(node)) {
          if (childRole === undefined) continue; // role 是表达式，静态看不出来
          if (allowed.includes(childRole)) continue;
          const reason = implicit
            ? `没写 role，自带角色 ${childRole} 不在允许集合 [${allowed.join(", ")}] 里`
            : `role="${childRole}" 不在允许集合 [${allowed.join(", ")}] 里`;
          const { line } = sf.getLineAndCharacterOfPosition(child.getStart(sf));
          violations.push({ line: line + 1, containerRole: role, child: `<${tag}>`, reason });
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return violations;
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (name.endsWith(".tsx") && !/\.(test|spec)\.tsx$/.test(name)) out.push(full);
  }
  return out;
}

function main() {
  const dirs = process.argv.slice(2);
  const files = (dirs.length ? dirs : DEFAULT_DIRS).flatMap((d) => walk(join(ROOT, d), []));
  const problems = [];
  for (const file of files) {
    for (const v of findViolations(readFileSync(file, "utf8"), file)) {
      problems.push(
        `  ${relative(ROOT, file)}:${v.line}  role="${v.containerRole}" 里的 ${v.child}：${
          v.reason
        }`,
      );
    }
  }
  if (problems.length === 0) {
    console.log(`✓ 复合 ARIA 角色的直接子元素全部合规（扫了 ${files.length} 个 .tsx）`);
    return;
  }
  console.error(
    [
      `复合 ARIA 角色里混进了不允许的直接子元素（${problems.length} 处）。`,
      "axe 会按 critical 级 aria-required-children 拦下，屏幕阅读器会把它们读成容器里的怪成员。\n",
      ...problems,
      "\n修法：把这些元素挪到容器外面做兄弟（例如 tablist 外再包一层 div），或给它补上合规的 role。",
      "确属例外：在容器那一行或上一行写 `aria-owned-ok: <理由>` 注释。",
    ].join("\n"),
  );
  process.exit(1);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
