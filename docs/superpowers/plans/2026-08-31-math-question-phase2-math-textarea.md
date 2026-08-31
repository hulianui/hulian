# 数学题件 · 阶段 2：MathTextarea（LaTeX 公式输入框）— 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 5069tk-app 的 `FormulaInput` / `formula-editing.ts` 回流成 `@hulianui/ui/math` 里的 `MathTextarea`：模板插到光标处、`$…$` 包选区、提交前语法自检（带行列）、KaTeX 解析错误定位、实时预览、可注入的可视化编辑器页签；文案全部走 Locale，英文站零中文残留。

**Architecture:** 新目录 `packages/ui/src/math-textarea/`，纯函数（`formula-editing.ts`，不引 KaTeX）与 KaTeX 探针（`katex-error.ts`）分文件；组件 `math-textarea.tsx` 是 `"use client"` 受控件，光标还原用 `pendingCaret` ref（消费方踩过的坑）。词条独立成 `math-textarea.locale.ts`（与 `question/question.locale.ts` 同一处方，`config/locale.ts` 反向引用），组件与纯函数**不许** import `config/locale.ts` 的 `zhCN`。从 `@hulianui/ui/math` 导出；目录名虽然天然是 subpath，但不对外宣传。

**Tech Stack:** TypeScript 5.9 / React 19 / vitest（unit = jsdom）/ Tailwind v4 / 既有 `Formula`（KaTeX 0.18）/ Base UI（Popover、Tabs 经库内封装）。

Spec：`docs/superpowers/specs/2026-08-31-math-question-authoring-design.md` §4.1、§7、§8。回流原型：`/Users/zhangzhiwei/Desktop/code/5069tk-app/web/lib/formula-editing.ts`、`web/components/formula-input.tsx`、`web/lib/formula-editing.test.ts`。

## Global Constraints

- 目录 `packages/ui/src/math-textarea/`（不是 `question/`：那个目录在 `scripts/gen-component-docs.mjs` 的 SKIP_DIRS 里，是纯函数域）。一切从 `packages/ui/src/math/index.ts` 导出；主 barrel `packages/ui/src/index.ts` **一个都不加**。
- 文案走 Locale：新建 `math-textarea/math-textarea.locale.ts`（`MathTextareaLocale` + `MATH_TEXTAREA_LOCALE_ZH/EN`），`config/locale.ts` 的 `ComponentLocale` 加 `mathTextarea?:`，`zhCN` / `enUS` 两份预设都要接。组件里 `useComponentLocale().mathTextarea ?? MATH_TEXTAREA_LOCALE_ZH`。**禁止**在 `math-textarea/` 任何文件 import `../config/locale`（会把 28KB 整份字典拖进 math 入口；`bash scripts/bundle-size.sh --why math` 可归因）。
- 纯函数不产出任何语言的文案：`validateFormulaSyntax` 返回结构化 `FormulaSyntaxIssue`（code + 行列），由组件按 Locale 拼句。这是相对消费方原型的刻意改动。
- 内置模板用稳定 `id`，显示名从 Locale 的 `templates[id]` / `templateGroups[id]` 取；自定义模板可直接给 `label` / `title`。Locale 的两张表类型是 `Record<BuiltinTemplateId, string>`，加模板不加词条 tsc 当场红。
- 图标：工具栏按钮的 Σ 加进 `packages/ui/src/_icons/index.tsx`（path 取自 lucide `sigma`），不在组件里 import `lucide-react`。
- 色彩/背景：预览框 `border-border bg-surface`；**不用** `bg-muted`、`text-muted-foreground`、`bg-background`、`bg-card`（后三者不是本库 token，静默回退）。
- 开发期告警用 `warnOnce`（`packages/ui/src/lib/warn-once.ts`）；本阶段没有需要告警的分支，别新加。
- **体积基线决策（需主人知悉）**：`scripts/size-limits.json` 里 `math` 现在 95.6KB / 上限 99.5KB。MathTextarea 会把 Popover + Tabs + Button + Textarea + Input + Text 带进 `@hulianui/ui/math` 的 `export *` 上界，必然超过 99.5KB。库 `sideEffects: false`，真实消费方只 import `Formula` 时 MathTextarea 会被 tree-shake，实际不付费；尺子量的是上界。因此 Task 5 在 `--why math` 归因里**确认没有 `config/locale.ts`、多出来的只是上述 UI 件**之后，用 `CI=1 bash scripts/bundle-size.sh --update` 上调基线（实测 + 15%），并在 changeset 里写明。若主人不接受，备选是让 `math-textarea/` 作独立 subpath 并单独加一条 target（spec §3.1 否决过，理由见 spec）。
- 测试：`*.test.ts(x)` 走 jsdom；本阶段不写 browser test（布局断言留到阶段 5 的 demo 实机验）。Popover 在 jsdom 里 `fireEvent.click(trigger)` + `waitFor` 能打开（`popconfirm.test.tsx:153` 先例）。
- 每个任务结束 `git add <具体文件>` 再 commit，**不许** `git add -A`（工作区 `packages/ui/src/upload/upload.tsx` 是别人的未提交改动，不要碰、不要还原）。commit message 末尾带：
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
  `Claude-Session: https://claude.ai/code/session_014GoPuBKUqqvHJSnvLAfUrT`
- 命令：单测 `cd packages/ui && npx vitest run <path>`；typecheck `pnpm --filter @hulianui/ui typecheck`；体积 `CI=1 pnpm size`（必须带 `CI=1`）。
- 分支：`git checkout -b feat/math-question-phase2` 从 master 起；全部任务完成、门禁全绿后 `git checkout master && git merge --ff-only feat/math-question-phase2`，不 push。

---

## 文件结构

| 文件 | 职责 |
|---|---|
| `packages/ui/src/_icons/index.tsx` | 新增 `Sigma` 图标 |
| `packages/ui/src/math-textarea/formula-editing.ts` | 纯函数：模板表、`mathSpans` / `isInsideMath`、`applyFormulaTemplate`、`wrapSelectionInMath`、`validateFormulaSyntax`、`textPosition`。不引 KaTeX |
| `packages/ui/src/math-textarea/katex-error.ts` | `katexErrorAt`：对每个 `$…$` 段调 `katex.__parse`，给出整串内的字符位置 |
| `packages/ui/src/math/math.tsx` | `blanksToLatex` 加 `export`（katexErrorAt 要用同一条填空槽替换，否则 `$a=___$` 会被误报） |
| `packages/ui/src/math-textarea/math-textarea.locale.ts` | `MathTextareaLocale` + 中英预设（SSOT） |
| `packages/ui/src/config/locale.ts` | `ComponentLocale.mathTextarea?` + `zhCN` / `enUS` 接线 |
| `packages/ui/src/math-textarea/math-textarea.types.ts` | `MathTextareaProps`、`MathFieldLikeProps` |
| `packages/ui/src/math-textarea/math-textarea.tsx` | 组件 |
| `packages/ui/src/math-textarea/index.ts` | 目录 barrel |
| `packages/ui/src/math/index.ts` | 转出 math-textarea 公开件 |
| `packages/ui/src/math-textarea/math-textarea.showcase.tsx` | 画廊 |
| `packages/ui/src/showcase.ts` | 注册 showcase |
| `apps/www/i18n/showcase-copy.en.json` | showcase 英文词条（exact） |
| `apps/www/generated/showcase-en/*` | `pnpm showcase:generate` 产物 |
| `packages/ui/src/math-textarea/math-textarea.md` / `.en.md` | 文档 |
| `packages/ui/src/math/math.md` / `.en.md` | 题目域段落与「相关」加 MathTextarea |
| `apps/www/lib/manifest.ts` / `apps/www/lib/registry.tsx` / `apps/www/i18n/component-meta.en.ts` | 画廊三处注册 |
| `apps/perf-lab/scenarios/generated.ts` | 重生成（不手改） |
| `scripts/size-limits.json` | math 基线上调 |
| `.changeset/math-textarea.md` | minor changeset（中英段） |
| `packages/ui/src/math-textarea/*.test.ts(x)` | 测试 |

---

### Task 0: 起分支

- [ ] **Step 1: 确认工作区只有 upload.tsx 一处改动，起分支**

```bash
cd /Users/zhangzhiwei/Desktop/code/hulian
git status --short          # 期望只有 " M packages/ui/src/upload/upload.tsx"
git checkout -b feat/math-question-phase2
```

---

### Task 1: 纯函数 `formula-editing.ts` + `Sigma` 图标

**Files:**
- Modify: `packages/ui/src/_icons/index.tsx`（在 `export const Square` 之前插入 `Sigma`）
- Create: `packages/ui/src/math-textarea/formula-editing.ts`
- Create: `packages/ui/src/math-textarea/formula-editing.test.ts`

**Interfaces:**
- Produces：
  - `interface FormulaTemplate { id: string; latex: string; sample: string; label?: string }`
  - `interface FormulaTemplateGroup { id: string; title?: string; items: readonly FormulaTemplate[] }`
  - `const FORMULA_TEMPLATE_GROUPS`（`as const satisfies readonly FormulaTemplateGroup[]`）
  - `type BuiltinTemplateGroupId`、`type BuiltinTemplateId`（从常量派生）
  - `interface MathSpan { start: number; end: number; contentStart: number; content: string; display: boolean }`
  - `mathSpans(text: string): MathSpan[]`
  - `isInsideMath(text: string, caret: number): boolean`
  - `interface TemplateInsertion { text: string; caret: number }`
  - `applyFormulaTemplate(params: { text; selectionStart; selectionEnd; latex; wrapInMath }): TemplateInsertion`
  - `wrapSelectionInMath(params: { text; selectionStart; selectionEnd; display }): TemplateInsertion`
  - `type FormulaSyntaxCode = "unclosed-math" | "unclosed-brace" | "unmatched-close-brace"`
  - `interface FormulaSyntaxIssue { code: FormulaSyntaxCode; index: number; line: number; column: number }`
  - `validateFormulaSyntax(text: string): FormulaSyntaxIssue | null`
  - `textPosition(text: string, index: number): { line: number; column: number }`

- [ ] **Step 1: 加 `Sigma` 图标**

在 `packages/ui/src/_icons/index.tsx` 里 `export const Square = ` 那一行之前插入（path 取自 lucide-react 1.28.0 `icons/sigma.mjs`，key 照抄）：

```tsx
export const Sigma = /* @__PURE__ */ createIcon("sigma", [
  [
    "path",
    {
      d: "M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2",
      key: "wuwx1p",
    },
  ],
]);
```

- [ ] **Step 2: 写表驱动测试（移植消费方 `formula-editing.test.ts`，断言改结构化）**

```ts
// packages/ui/src/math-textarea/formula-editing.test.ts
import { describe, expect, it } from "vitest";
import { splitMathSegments } from "../math/math.parse";
import {
  applyFormulaTemplate,
  FORMULA_TEMPLATE_GROUPS,
  isInsideMath,
  mathSpans,
  textPosition,
  validateFormulaSyntax,
  wrapSelectionInMath,
} from "./formula-editing";

describe("mathSpans", () => {
  it("给出每个闭合 $…$ / $$…$$ 段在整串里的位置", () => {
    expect(mathSpans("已知 $x$ 与 $$y$$")).toEqual([
      { start: 3, end: 6, contentStart: 4, content: "x", display: false },
      { start: 9, end: 14, contentStart: 11, content: "y", display: true },
    ]);
  });

  it("转义的 \\$ 不参与配对；未闭合的开分隔符不算段", () => {
    expect(mathSpans("售价 \\$5 元")).toEqual([]);
    expect(mathSpans("定价 $100 元")).toEqual([]);
  });
});

describe("isInsideMath", () => {
  it.each([
    ["公式外", "已知 $x$ 求解", 2, false],
    ["公式内", "已知 $x$ 求解", 4, true],
    ["闭合符之前仍在公式内", "已知 $x$ 求解", 5, true],
    ["闭合之后", "已知 $x$ 求解", 9, false],
    ["块级公式内", "$$x + y$$", 4, true],
    ["块级公式后", "$$x$$ 后面", 6, false],
    ["转义美元不参与配对", "售价 \\$5 元", 8, false],
    ["未闭合的 $ 之后一律算公式内", "$x + ", 5, true],
    ["空串", "", 0, false],
  ])("%s", (_name, text, caret, expected) => {
    expect(isInsideMath(text, caret)).toBe(expected);
  });
});

describe("applyFormulaTemplate", () => {
  it("没选中：插入模板并把光标放进第一个空槽", () => {
    const r = applyFormulaTemplate({
      text: "已知 ",
      selectionStart: 3,
      selectionEnd: 3,
      latex: "\\frac{}{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("已知 $\\frac{}{}$");
    expect(r.text.slice(r.caret)).toBe("}{}$");
  });

  it("有选中：选中的内容进第一个空槽，光标跳到分母", () => {
    const r = applyFormulaTemplate({
      text: "求 x 的值",
      selectionStart: 2,
      selectionEnd: 3,
      latex: "\\frac{}{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("求 $\\frac{x}{}$ 的值");
    expect(r.text.slice(r.caret)).toBe("}$ 的值");
  });

  it("已经在公式里就不再套一层 $：结果仍是一段公式", () => {
    const r = applyFormulaTemplate({
      text: "$x + $",
      selectionStart: 5,
      selectionEnd: 5,
      latex: "\\sqrt{}",
      wrapInMath: false,
    });
    expect(r.text).toBe("$x + \\sqrt{}$");
    expect(splitMathSegments(r.text).filter((s) => s.type === "math")).toHaveLength(1);
  });

  it("没有落点的符号模板：选中内容留在前面，光标落在符号之后", () => {
    const r = applyFormulaTemplate({
      text: "a b",
      selectionStart: 0,
      selectionEnd: 1,
      latex: "\\leq ",
      wrapInMath: true,
    });
    expect(r.text).toBe("$a\\leq $ b");
    expect(r.caret).toBe(r.text.indexOf("$ b"));
  });

  it("n 次根的方括号也是落点", () => {
    const r = applyFormulaTemplate({
      text: "",
      selectionStart: 0,
      selectionEnd: 0,
      latex: "\\sqrt[]{}",
      wrapInMath: true,
    });
    expect(r.text).toBe("$\\sqrt[]{}$");
    expect(r.text.slice(r.caret)).toBe("]{}$");
  });

  it("集合模板里的 \\{ 不会被当成落点", () => {
    const r = applyFormulaTemplate({
      text: "",
      selectionStart: 0,
      selectionEnd: 0,
      latex: "\\{  \\}",
      wrapInMath: true,
    });
    expect(r.text).toBe("$\\{  \\}$");
  });

  it("选区越界会被夹回文本范围", () => {
    const r = applyFormulaTemplate({
      text: "ab",
      selectionStart: -3,
      selectionEnd: 99,
      latex: "\\pi ",
      wrapInMath: true,
    });
    expect(r.text).toBe("$ab\\pi $");
  });

  it("每个内置模板插进空输入框后都是一段合法的、可被切出来的公式", () => {
    for (const group of FORMULA_TEMPLATE_GROUPS) {
      for (const template of group.items) {
        const r = applyFormulaTemplate({
          text: "",
          selectionStart: 0,
          selectionEnd: 0,
          latex: template.latex,
          wrapInMath: true,
        });
        expect(validateFormulaSyntax(r.text), `${group.id}/${template.id}`).toBeNull();
        expect(
          splitMathSegments(r.text).filter((s) => s.type === "math"),
          `${group.id}/${template.id}`,
        ).toHaveLength(1);
      }
    }
  });

  it("内置模板 id 全局唯一（Locale 表按 id 查名字）", () => {
    const ids = FORMULA_TEMPLATE_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("wrapSelectionInMath", () => {
  it("把选中的内容框成行内公式，光标落在闭合符之前", () => {
    const r = wrapSelectionInMath({
      text: "求 x+1 的值",
      selectionStart: 2,
      selectionEnd: 5,
      display: false,
    });
    expect(r.text).toBe("求 $x+1$ 的值");
    expect(r.text.slice(r.caret)).toBe("$ 的值");
  });

  it("块级用 $$", () => {
    const r = wrapSelectionInMath({ text: "x", selectionStart: 0, selectionEnd: 1, display: true });
    expect(r.text).toBe("$$x$$");
    expect(r.caret).toBe(3);
  });
});

describe("validateFormulaSyntax", () => {
  it.each([
    ["纯文本", "两点之间线段最短。"],
    ["闭合的行内公式", "已知 $x^{2}$ 求解"],
    ["闭合的块级公式", "$$\\frac{a}{b}$$"],
    ["中文与多段公式混排", "当 $a>0$ 时，$\\sqrt{a}$ 有意义"],
    ["转义的美元与花括号", "售价 \\$5，集合 $\\{1,2\\}$"],
    ["空串（题干为空由别的校验管）", ""],
  ])("%s：不报错", (_name, text) => {
    expect(validateFormulaSyntax(text)).toBeNull();
  });

  it("未闭合的 $ 报出位置与行列", () => {
    expect(validateFormulaSyntax("第一行\n定价 $100 元")).toEqual({
      code: "unclosed-math",
      index: 7,
      line: 2,
      column: 4,
    });
  });

  it("花括号少一个右括号：指向最里层没闭合的那个 {", () => {
    expect(validateFormulaSyntax("$\\frac{a}{b$")).toEqual({
      code: "unclosed-brace",
      index: 9,
      line: 1,
      column: 10,
    });
  });

  it("多一个右花括号", () => {
    expect(validateFormulaSyntax("$x}$")).toEqual({
      code: "unmatched-close-brace",
      index: 2,
      line: 1,
      column: 3,
    });
  });
});

describe("textPosition", () => {
  it("行列都从 1 数；列是该行内第几个字符", () => {
    expect(textPosition("ab\ncd", 0)).toEqual({ line: 1, column: 1 });
    expect(textPosition("ab\ncd", 3)).toEqual({ line: 2, column: 1 });
    expect(textPosition("ab\ncd", 4)).toEqual({ line: 2, column: 2 });
  });
});
```

- [ ] **Step 3: 跑测试确认失败（模块不存在）**

```bash
cd packages/ui && npx vitest run src/math-textarea/formula-editing.test.ts
```
期望：FAIL，`Failed to resolve import "./formula-editing"`。

- [ ] **Step 4: 实现**

```ts
// packages/ui/src/math-textarea/formula-editing.ts
/**
 * 公式输入的编辑期纯函数：模板插入的落点、光标上下文、提交前的语法自检。
 *
 * 边界：**不排版、不解析**。排版是 `Formula`（KaTeX），分隔符切段的权威口径是
 * `splitMathSegments`。这里只回答三个编辑器的问题：「插进去之后光标落哪」「光标现在
 * 在不在公式里」「这串还没闭合的地方在哪」。不引 KaTeX，服务端脚本也能单独引。
 *
 * 一切插入都产出 `$…$` / `$$…$$`，与库内既有写法一致，不引入新的公式表示。
 *
 * 不产出任何语言的文案：问题以 code + 位置返回，由组件按 Locale 拼句。
 */

/** 一个可点击的公式模板。
 *
 * `latex` 里的**第一个空花括号 / 空方括号**是光标落点；有选中文本时，选中的内容会被放进
 * 那一对括号里，光标再跳到下一对空括号（没有就落在整段之后）。「选中 x 点分式」得到
 * `\frac{x}{}` 且光标在分母，这是老师真正想要的动作。
 */
export interface FormulaTemplate {
  /** 稳定标识。内置模板的显示名从 Locale 的 `templates[id]` 取。 */
  id: string;
  latex: string;
  /** 面板上的示例渲染（`$` 包好，直接喂 Formula）。 */
  sample: string;
  /** 显示名。不给则查 Locale（内置模板），再查不到就显示 id。自定义模板直接给。 */
  label?: string;
}

export interface FormulaTemplateGroup {
  id: string;
  /** 分组标题。不给则查 Locale 的 `templateGroups[id]`。 */
  title?: string;
  items: readonly FormulaTemplate[];
}

/** 默认模板：上下标、分式、根式、括号、绝对值、集合、不等号、希腊字母、求和/积分。
 *  `as const` 让 id 成为字面量类型，Locale 的两张名字表据此钉死：加模板不加词条 tsc 当场红。 */
export const FORMULA_TEMPLATE_GROUPS = [
  {
    id: "scripts",
    items: [
      { id: "superscript", latex: "{}^{}", sample: "$x^{2}$" },
      { id: "subscript", latex: "{}_{}", sample: "$a_{n}$" },
      { id: "fraction", latex: "\\frac{}{}", sample: "$\\frac{a}{b}$" },
      { id: "sqrt", latex: "\\sqrt{}", sample: "$\\sqrt{x}$" },
      { id: "nthRoot", latex: "\\sqrt[]{}", sample: "$\\sqrt[3]{x}$" },
    ],
  },
  {
    id: "brackets",
    items: [
      { id: "parentheses", latex: "\\left( \\right)", sample: "$\\left( x \\right)$" },
      { id: "absolute", latex: "\\left| \\right|", sample: "$\\left| x \\right|$" },
      { id: "set", latex: "\\{  \\}", sample: "$\\{ 1, 2, 3 \\}$" },
    ],
  },
  {
    id: "relations",
    items: [
      { id: "leq", latex: "\\leq ", sample: "$a \\leq b$" },
      { id: "geq", latex: "\\geq ", sample: "$a \\geq b$" },
      { id: "neq", latex: "\\neq ", sample: "$a \\neq b$" },
      { id: "approx", latex: "\\approx ", sample: "$a \\approx b$" },
      { id: "in", latex: "\\in ", sample: "$x \\in A$" },
      { id: "subseteq", latex: "\\subseteq ", sample: "$A \\subseteq B$" },
      { id: "cup", latex: "\\cup ", sample: "$A \\cup B$" },
      { id: "cap", latex: "\\cap ", sample: "$A \\cap B$" },
    ],
  },
  {
    id: "greek",
    items: [
      { id: "alpha", latex: "\\alpha ", sample: "$\\alpha$" },
      { id: "beta", latex: "\\beta ", sample: "$\\beta$" },
      { id: "theta", latex: "\\theta ", sample: "$\\theta$" },
      { id: "pi", latex: "\\pi ", sample: "$\\pi$" },
      { id: "delta", latex: "\\Delta ", sample: "$\\Delta$" },
      { id: "degree", latex: "^{\\circ}", sample: "$60^{\\circ}$" },
    ],
  },
  {
    id: "calculus",
    items: [
      { id: "sum", latex: "\\sum_{}^{}", sample: "$\\sum_{i=1}^{n} i$" },
      { id: "integral", latex: "\\int_{}^{}", sample: "$\\int_{a}^{b} f(x)\\,dx$" },
      { id: "limit", latex: "\\lim_{}", sample: "$\\lim_{x \\to 0} f(x)$" },
    ],
  },
] as const satisfies readonly FormulaTemplateGroup[];

export type BuiltinTemplateGroupId = (typeof FORMULA_TEMPLATE_GROUPS)[number]["id"];
export type BuiltinTemplateId = (typeof FORMULA_TEMPLATE_GROUPS)[number]["items"][number]["id"];

/** 一段闭合的 `$…$` / `$$…$$` 在整串里的位置。`end` 是闭合符之后的下标（半开区间）。 */
export interface MathSpan {
  start: number;
  end: number;
  /** 公式正文的起点（开分隔符之后）。KaTeX 报的 position 加上它就是整串里的位置。 */
  contentStart: number;
  content: string;
  display: boolean;
}

interface MathScan {
  spans: MathSpan[];
  /** 第一个没闭合的开分隔符位置；全部闭合则为 null。 */
  openAt: number | null;
}

/** 与 `splitMathSegments` 保持一致的两条规则：`\$`（以及任何 `\x`）整体跳过不参与配对；`$$` 优先于 `$`。
 *  只认 `$` 系：编辑器产出永远是 `$` 系，`\(` / `\[` 不在这里处理。 */
function scanMath(text: string): MathScan {
  const spans: MathSpan[] = [];
  let i = 0;
  while (i < text.length) {
    if (text[i] === "\\") {
      i += 2;
      continue;
    }
    if (text[i] !== "$") {
      i += 1;
      continue;
    }
    const fence = text[i + 1] === "$" ? "$$" : "$";
    const contentStart = i + fence.length;
    let j = contentStart;
    let close = -1;
    while (j < text.length) {
      if (text[j] === "\\") {
        j += 2;
        continue;
      }
      if (text.startsWith(fence, j)) {
        close = j;
        break;
      }
      j += 1;
    }
    if (close === -1) return { spans, openAt: i };
    spans.push({
      start: i,
      end: close + fence.length,
      contentStart,
      content: text.slice(contentStart, close),
      display: fence === "$$",
    });
    i = close + fence.length;
  }
  return { spans, openAt: null };
}

/** 整串里每个闭合的公式段。给 `katexErrorAt` 这类「要知道第 N 个字符落在哪一段」的调用方。 */
export function mathSpans(text: string): MathSpan[] {
  return scanMath(text).spans;
}

/**
 * 光标此刻在不在公式内部。只用来决定「插进去的片段要不要自己带一对 `$`」，不是渲染口径。
 *
 * 落在开分隔符之后、闭合符之前（含紧贴闭合符）算在里面；落在未闭合的 `$` 之后一律算在里面。
 */
export function isInsideMath(text: string, caret: number): boolean {
  const at = Math.max(0, Math.min(caret, text.length));
  const { spans, openAt } = scanMath(text);
  if (spans.some((s) => at > s.start && at <= s.end - (s.display ? 2 : 1))) return true;
  return openAt !== null && at > openAt;
}

export interface TemplateInsertion {
  text: string;
  /** 插入后光标应落的位置。 */
  caret: number;
}

/** 空花括号 / 空方括号（模板里的落点标记）。`\{` 是集合的花括号，不是落点。 */
const EMPTY_SLOT_RE = /(?<!\\)\{\}|(?<!\\)\[\]/u;

function clampRange(text: string, selectionStart: number, selectionEnd: number) {
  const start = Math.max(0, Math.min(selectionStart, text.length));
  const end = Math.max(start, Math.min(selectionEnd, text.length));
  return { start, end };
}

/**
 * 把一个模板插到输入框里，并算出光标该落哪。纯函数，与 DOM 无关。
 *
 * `wrapInMath` 由调用方按 `isInsideMath` 决定：已经在公式里就不能再套一层 `$`
 * （套出来的 `$x$$y$` 会把中间那段变成正文）。
 */
export function applyFormulaTemplate(params: {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  latex: string;
  wrapInMath: boolean;
}): TemplateInsertion {
  const { text, latex, wrapInMath } = params;
  const { start, end } = clampRange(text, params.selectionStart, params.selectionEnd);
  const selected = text.slice(start, end);

  let snippet = latex;
  let caretInSnippet: number;

  const firstSlot = EMPTY_SLOT_RE.exec(snippet);
  if (firstSlot === null) {
    // 没有落点的模板（`\leq ` 这类符号）：选中的内容原样留在前面，光标落在符号之后。
    snippet = selected + snippet;
    caretInSnippet = snippet.length;
  } else if (selected === "") {
    caretInSnippet = firstSlot.index + 1;
  } else {
    // 有选中：选中的内容进第一个空槽，光标跳到下一个空槽（没有就落在末尾）。
    snippet =
      snippet.slice(0, firstSlot.index + 1) +
      selected +
      snippet.slice(firstSlot.index + firstSlot[0].length - 1);
    const afterFilled = firstSlot.index + selected.length + 2;
    const nextSlot = EMPTY_SLOT_RE.exec(snippet.slice(afterFilled));
    caretInSnippet = nextSlot === null ? snippet.length : afterFilled + nextSlot.index + 1;
  }

  if (wrapInMath) {
    snippet = `$${snippet}$`;
    caretInSnippet += 1;
  }

  return {
    text: text.slice(0, start) + snippet + text.slice(end),
    caret: start + caretInSnippet,
  };
}

/** 用行内 / 块级公式把选中的内容框起来（没选中就插一对空的，光标落中间）。 */
export function wrapSelectionInMath(params: {
  text: string;
  selectionStart: number;
  selectionEnd: number;
  display: boolean;
}): TemplateInsertion {
  const { text, display } = params;
  const { start, end } = clampRange(text, params.selectionStart, params.selectionEnd);
  const fence = display ? "$$" : "$";
  const selected = text.slice(start, end);
  return {
    text: `${text.slice(0, start)}${fence}${selected}${fence}${text.slice(end)}`,
    caret: start + fence.length + selected.length,
  };
}

export type FormulaSyntaxCode = "unclosed-math" | "unclosed-brace" | "unmatched-close-brace";

/** 提交前自检发现的问题。`index` 是整串下标，`line` / `column` 从 1 数。文案由组件按 Locale 拼。 */
export interface FormulaSyntaxIssue {
  code: FormulaSyntaxCode;
  index: number;
  line: number;
  column: number;
}

/** 「第 N 行第 M 个字符」：只报位置，不截原文（题干可能很长，截出来反而看不懂）。 */
export function textPosition(text: string, index: number): { line: number; column: number } {
  const before = text.slice(0, index);
  return { line: before.split("\n").length, column: index - before.lastIndexOf("\n") };
}

function issueAt(code: FormulaSyntaxCode, text: string, index: number): FormulaSyntaxIssue {
  return { code, index, ...textPosition(text, index) };
}

/**
 * 提交前的语法自检。返回 `null` = 没发现问题。
 *
 * **刻意只查两件能确定说错的事**：分隔符不闭合、花括号不配对。这两条的判据是形式的，
 * 不会误伤；「这个命令拼错了没有」要靠 KaTeX 才知道，那件事由 `katexErrorAt` 承担。
 */
export function validateFormulaSyntax(text: string): FormulaSyntaxIssue | null {
  const stack: number[] = [];
  let openAt: number | null = null;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      // 转义序列整体跳过：`\$` `\{` `\}` `\\` 都不参与配对。
      i += 2;
      continue;
    }
    if (ch === "$") {
      openAt = openAt === null ? i : null;
      i += text[i + 1] === "$" ? 2 : 1;
      continue;
    }
    if (ch === "{") stack.push(i);
    if (ch === "}") {
      if (stack.length === 0) return issueAt("unmatched-close-brace", text, i);
      stack.pop();
    }
    i += 1;
  }
  if (openAt !== null) return issueAt("unclosed-math", text, openAt);
  const lastOpen = stack[stack.length - 1];
  if (lastOpen !== undefined) return issueAt("unclosed-brace", text, lastOpen);
  return null;
}
```

- [ ] **Step 5: 跑测试确认通过 + typecheck**

```bash
cd packages/ui && npx vitest run src/math-textarea/formula-editing.test.ts && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS；typecheck 0 错误。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/_icons/index.tsx packages/ui/src/math-textarea/formula-editing.ts packages/ui/src/math-textarea/formula-editing.test.ts
git commit -m "feat(ui/math): 公式编辑期纯函数 formula-editing（模板落点/光标上下文/语法自检）+ Sigma 图标"
```

---

### Task 2: KaTeX 解析错误定位 `katex-error.ts`

**Files:**
- Modify: `packages/ui/src/math/math.tsx`（`function blanksToLatex` 加 `export`）
- Create: `packages/ui/src/math-textarea/katex-error.ts`
- Create: `packages/ui/src/math-textarea/katex-error.test.ts`

**Interfaces:**
- Consumes：`mathSpans`（Task 1）、`blanksToLatex(src, blankWidth)`（math.tsx）。
- Produces：`interface KatexParseIssue { index: number; message: string }`、`katexErrorAt(text: string, options?: { macros?: Record<string, string> }): KatexParseIssue | null`。`index` 是整串 0 基下标；`message` 是 KaTeX 的 `rawMessage`（不含 KaTeX 自己拼的「at position N」尾巴）。

- [ ] **Step 1: 写测试**

```ts
// packages/ui/src/math-textarea/katex-error.test.ts
import { describe, expect, it } from "vitest";
import { katexErrorAt } from "./katex-error";

describe("katexErrorAt", () => {
  it.each([
    ["纯文本", "两点之间线段最短。"],
    ["合法公式", "已知 $x^{2}$ 与 $$\\frac{a}{b}$$"],
    ["段内填空槽与 Formula 同一条替换，不误报", "$a=___$"],
    ["数学模式里的中文不报错（strict 已关）", "$x>0 时$"],
  ])("%s：null", (_name, text) => {
    expect(katexErrorAt(text)).toBeNull();
  });

  it("未定义命令：位置指向整串里该命令的起点", () => {
    const text = "已知 $\\foo{x}$";
    const issue = katexErrorAt(text);
    expect(issue).not.toBeNull();
    expect(issue!.index).toBe(text.indexOf("\\foo"));
    expect(issue!.message).toContain("Undefined control sequence");
    expect(issue!.message).not.toContain("at position");
  });

  it("只报第一段的第一个错", () => {
    const issue = katexErrorAt("$\\foo$ 与 $\\bar$");
    expect(issue!.index).toBe(1);
  });

  it("macros 透传：自定义宏不算错，且不改动调用方传入的对象", () => {
    const macros = { "\\RR": "\\mathbb{R}" };
    expect(katexErrorAt("$x \\in \\RR$", { macros })).toBeNull();
    expect(katexErrorAt("$x \\in \\RR$")).not.toBeNull();
    expect(macros).toEqual({ "\\RR": "\\mathbb{R}" });
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/math-textarea/katex-error.test.ts
```
期望：FAIL，模块不存在。

- [ ] **Step 3: `math.tsx` 导出 `blanksToLatex`**

把 `packages/ui/src/math/math.tsx` 里 `function blanksToLatex(src: string, blankWidth: number): string {` 改为 `export function blanksToLatex(src: string, blankWidth: number): string {`，并在其文档注释末尾追加一行：

```
 * 导出给 math-textarea 的 `katexErrorAt`：探针必须走同一条替换，否则 `$a=___$` 会被误报成解析错误。
```

- [ ] **Step 4: 实现**

```ts
// packages/ui/src/math-textarea/katex-error.ts
import katex from "katex";
import { blanksToLatex } from "../math/math";
import { mathSpans } from "./formula-editing";

/** KaTeX 解析不了的那一处。`index` 是整串 0 基下标，`message` 是 KaTeX 的原始错误信息。 */
export interface KatexParseIssue {
  index: number;
  message: string;
}

// `__parse` 是 KaTeX 的公开-但-未声明类型的入口（katex.d.ts 没有它，运行时一直有）。
// 只解析不排版，比 renderToString 便宜，且 throwOnError 默认 true 才拿得到 ParseError.position。
interface KatexParseSettings {
  macros?: Record<string, string>;
  strict?: "ignore" | "warn" | "error";
}
const parseOnly = (
  katex as unknown as { __parse: (tex: string, settings?: KatexParseSettings) => unknown }
).__parse;

interface KatexParseError {
  position?: number;
  rawMessage?: string;
  message?: string;
}

/**
 * 找出整串里第一处 KaTeX 解析不了的位置。`Formula` 用 `throwOnError:false` 把坏公式标红显示，
 * 但老师对着一行红色源码找不到错在哪；这里把 KaTeX 的 position 换算回整串下标，配上原始信息。
 *
 * - 只查闭合的 `$…$` / `$$…$$` 段（`mathSpans`）；未闭合由 `validateFormulaSyntax` 负责。
 * - 段内填空槽 `___` 先过与 `Formula` 同一条 `blanksToLatex`，否则合法题面会被误报。
 *   替换会改变长度，落在填空槽之后的位置会有几个字符的偏差，只影响提示不影响判定。
 * - `strict:"ignore"` 与 `Formula` 一致：数学模式里的中文不该刷 console.warn。
 * - `macros` 浅拷贝：KaTeX 把它当可变宏表写回（与 renderMath 同一个坑）。
 */
export function katexErrorAt(
  text: string,
  options: { macros?: Record<string, string> } = {},
): KatexParseIssue | null {
  for (const span of mathSpans(text)) {
    try {
      parseOnly(blanksToLatex(span.content, 2.5), {
        strict: "ignore",
        macros: options.macros ? { ...options.macros } : undefined,
      });
    } catch (error) {
      const e = error as KatexParseError;
      const offset = typeof e.position === "number" ? e.position : 0;
      return {
        index: span.contentStart + offset,
        message: e.rawMessage ?? e.message ?? String(error),
      };
    }
  }
  return null;
}
```

- [ ] **Step 5: 跑测试确认通过；顺带确认 math 既有测试没被 export 改动影响**

```bash
cd packages/ui && npx vitest run src/math-textarea src/math
```
期望：全部 PASS。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/math/math.tsx packages/ui/src/math-textarea/katex-error.ts packages/ui/src/math-textarea/katex-error.test.ts
git commit -m "feat(ui/math): katexErrorAt 把 KaTeX 解析错误换算回整串位置（填空槽走 Formula 同一条替换）"
```

---

### Task 3: Locale 词条 + 类型文件

**Files:**
- Create: `packages/ui/src/math-textarea/math-textarea.locale.ts`
- Create: `packages/ui/src/math-textarea/math-textarea.types.ts`
- Modify: `packages/ui/src/config/locale.ts`（三处：import、`ComponentLocale`、`zhCN` / `enUS`）
- Create: `packages/ui/src/math-textarea/math-textarea.locale.test.ts`

**Interfaces:**
- Consumes：`BuiltinTemplateGroupId` / `BuiltinTemplateId` / `FormulaSyntaxCode` / `FormulaTemplateGroup`（Task 1，仅 `import type`）。
- Produces：`interface MathTextareaLocale`、`MATH_TEXTAREA_LOCALE_ZH`、`MATH_TEXTAREA_LOCALE_EN`、`interface MathFieldLikeProps`、`interface MathTextareaProps`。

- [ ] **Step 1: 写 Locale 文件**

```ts
// packages/ui/src/math-textarea/math-textarea.locale.ts
// MathTextarea 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
import type {
  BuiltinTemplateGroupId,
  BuiltinTemplateId,
  FormulaSyntaxCode,
} from "./formula-editing";

export interface MathTextareaLocale {
  /** 工具栏按钮，如「公式」。 */
  insertFormula: string;
  panelTitle: string;
  panelDescription: string;
  /** 面板里「把选中的内容框成公式」小标题。 */
  wrapHeading: string;
  wrapInline: string;
  wrapDisplay: string;
  /** 模板按钮的无障碍名，如 ("分式") → "插入分式"。 */
  insertTemplate: (label: string) => string;
  /** 输入里还没有 `$` 时的一句提示。 */
  hint: string;
  previewLabel: string;
  /** 预览下方说明：红色源码 = KaTeX 解析不了。 */
  previewNote: string;
  sourceTab: string;
  visualTab: string;
  visualInsert: string;
  visualHint: string;
  /** 位置前缀，如 (2, 4) → "第 2 行第 4 个字符处"。与 `syntax[code]` 直接拼接。 */
  position: (line: number, column: number) => string;
  /** 三种语法问题的句尾，键必须齐。 */
  syntax: Record<FormulaSyntaxCode, string>;
  /** KaTeX 解析错误，index 从 1 数。 */
  katexError: (index: number, message: string) => string;
  templateGroups: Record<BuiltinTemplateGroupId, string>;
  templates: Record<BuiltinTemplateId, string>;
}

export const MATH_TEXTAREA_LOCALE_ZH: MathTextareaLocale = {
  insertFormula: "公式",
  panelTitle: "插入公式",
  panelDescription: "点一下插到光标处；先选中一段文字再点，会把它放进模板里。",
  wrapHeading: "把选中的内容框成公式",
  wrapInline: "行内公式 $…$",
  wrapDisplay: "独立公式 $$…$$",
  insertTemplate: (label) => `插入${label}`,
  hint: "公式用 $…$ 包起来，如 $x^{2}$",
  previewLabel: "预览（与题目展示用同一套排版）",
  previewNote: "预览里出现红色源码，说明这段公式 KaTeX 解析不了，请检查命令拼写。",
  sourceTab: "源码",
  visualTab: "可视化输入",
  visualInsert: "插入到光标处",
  visualHint: "在上方编辑好公式后插入，结果仍是 $…$。",
  position: (line, column) => `第 ${line} 行第 ${column} 个字符处`,
  syntax: {
    "unclosed-math": "的「$」没有闭合，公式要写成 $…$（独立成行用 $$…$$）",
    "unclosed-brace": "的「{」没有闭合",
    "unmatched-close-brace": "多了一个「}」，没有与之配对的「{」",
  },
  katexError: (index, message) => `第 ${index} 个字符附近：${message}`,
  templateGroups: {
    scripts: "上下标与分式",
    brackets: "括号与绝对值",
    relations: "不等号与集合关系",
    greek: "希腊字母",
    calculus: "求和与积分",
  },
  templates: {
    superscript: "上标",
    subscript: "下标",
    fraction: "分式",
    sqrt: "根式",
    nthRoot: "n 次根",
    parentheses: "圆括号",
    absolute: "绝对值",
    set: "集合",
    leq: "小于等于",
    geq: "大于等于",
    neq: "不等于",
    approx: "约等于",
    in: "属于",
    subseteq: "包含于",
    cup: "并集",
    cap: "交集",
    alpha: "α",
    beta: "β",
    theta: "θ",
    pi: "π",
    delta: "Δ",
    degree: "度",
    sum: "求和",
    integral: "积分",
    limit: "极限",
  },
};

export const MATH_TEXTAREA_LOCALE_EN: MathTextareaLocale = {
  insertFormula: "Formula",
  panelTitle: "Insert formula",
  panelDescription: "Click to insert at the caret. Select text first to place it inside the template.",
  wrapHeading: "Wrap the selection as a formula",
  wrapInline: "Inline $…$",
  wrapDisplay: "Display $$…$$",
  insertTemplate: (label) => `Insert ${label}`,
  hint: "Wrap formulas in $…$, e.g. $x^{2}$",
  previewLabel: "Preview (same typesetting as the question display)",
  previewNote: "Red source in the preview means KaTeX cannot parse that formula. Check the command spelling.",
  sourceTab: "Source",
  visualTab: "Visual input",
  visualInsert: "Insert at caret",
  visualHint: "Build the formula above, then insert it. The result is still $…$.",
  position: (line, column) => `Line ${line}, character ${column}: `,
  syntax: {
    "unclosed-math": "this “$” is never closed. Write formulas as $…$ ($$…$$ for display)",
    "unclosed-brace": "this “{” is never closed",
    "unmatched-close-brace": "extra “}” with no matching “{”",
  },
  katexError: (index, message) => `Near character ${index}: ${message}`,
  templateGroups: {
    scripts: "Scripts and fractions",
    brackets: "Brackets and absolute value",
    relations: "Relations and sets",
    greek: "Greek letters",
    calculus: "Sums and integrals",
  },
  templates: {
    superscript: "Superscript",
    subscript: "Subscript",
    fraction: "Fraction",
    sqrt: "Square root",
    nthRoot: "nth root",
    parentheses: "Parentheses",
    absolute: "Absolute value",
    set: "Set",
    leq: "Less than or equal",
    geq: "Greater than or equal",
    neq: "Not equal",
    approx: "Approximately equal",
    in: "Element of",
    subseteq: "Subset of",
    cup: "Union",
    cap: "Intersection",
    alpha: "alpha",
    beta: "beta",
    theta: "theta",
    pi: "pi",
    delta: "Delta",
    degree: "Degree",
    sum: "Sum",
    integral: "Integral",
    limit: "Limit",
  },
};
```

- [ ] **Step 2: 写类型文件**

```ts
// packages/ui/src/math-textarea/math-textarea.types.ts
import type { ComponentType, ReactNode } from "react";
import type { FormulaTemplateGroup } from "./formula-editing";

/**
 * 可视化公式编辑器的最小契约。阶段 5 的 `MathField`（`@hulianui/ui/math-field`）满足它；
 * 任何满足此形状的组件都能通过 `visualEditor` 注入，`@hulianui/ui/math` 自身零 MathLive。
 */
export interface MathFieldLikeProps {
  /** LaTeX（不带 `$`）。 */
  value: string;
  onChange: (latex: string) => void;
  /** 回车 / 确认。MathTextarea 把它接到「插入到光标处」同一条路径。 */
  onSubmit?: (latex: string) => void;
  "aria-label"?: string;
  className?: string;
}

export interface MathTextareaProps {
  /** 受控值：含 `$…$` 的普通字符串，与题干 / 选项 / 解析的存储格式一致。 */
  value: string;
  onChange: (next: string) => void;
  /** 多行（题干 / 解析 / 参考答案）用 Textarea；单行（选项 / 每空答案）用 Input。@default false */
  multiline?: boolean;
  /** 多行时的初始行数（autoResize 随内容长高）。@default 3 */
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  /** 紧凑形态：预览只占一行、不带说明文字。给选项与每空答案用。@default false */
  compact?: boolean;
  /** 覆盖默认模板组（高中加向量 / 数集，初中去积分）。@default FORMULA_TEMPLATE_GROUPS */
  templates?: readonly FormulaTemplateGroup[];
  /** 自定义预览渲染。默认 `<Formula>`；QuestionEditor 传带图渲染。 */
  renderPreview?: (value: string) => ReactNode;
  /** 注入可视化公式编辑器；给了才出「可视化输入」页签。 */
  visualEditor?: ComponentType<MathFieldLikeProps>;
  /** 透传给默认预览与 KaTeX 探针的宏表；自定义宏不该被报成「未定义命令」。 */
  macros?: Record<string, string>;
  /** 无障碍名。单行控件必给：选项那一栏靠它区分「选项 A」和「选项 B」。 */
  "aria-label"?: string;
  className?: string;
}
```

- [ ] **Step 3: 接进 `config/locale.ts`**

三处，用 grep 定位：

```bash
grep -n "question/question.locale\|question?: QuestionLocale\|question: QUESTION_LOCALE_ZH\|question: QUESTION_LOCALE_EN" packages/ui/src/config/locale.ts
```

1. 顶部 import 行（第 3 行附近）之后加：
   ```ts
   import {
     MATH_TEXTAREA_LOCALE_EN,
     MATH_TEXTAREA_LOCALE_ZH,
     type MathTextareaLocale,
   } from "../math-textarea/math-textarea.locale";
   ```
2. `ComponentLocale` 里 `question?: QuestionLocale;` 之后加：
   ```ts
     /** 公式输入框词条，SSOT 在 math-textarea/math-textarea.locale.ts（同 question 的理由）。 */
     mathTextarea?: MathTextareaLocale;
   ```
3. `zhCN` 里 `question: QUESTION_LOCALE_ZH,` 之后加 `mathTextarea: MATH_TEXTAREA_LOCALE_ZH,`；`enUS` 里 `question: QUESTION_LOCALE_EN,` 之后加 `mathTextarea: MATH_TEXTAREA_LOCALE_EN,`。

- [ ] **Step 4: 写词条测试（两份预设通过内置字典可达；英文预设零 CJK）**

```ts
// packages/ui/src/math-textarea/math-textarea.locale.test.ts
import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { FORMULA_TEMPLATE_GROUPS } from "./formula-editing";
import { MATH_TEXTAREA_LOCALE_EN, MATH_TEXTAREA_LOCALE_ZH } from "./math-textarea.locale";

const CJK = /[㐀-䶿一-鿿]/u;

describe("MathTextarea locale", () => {
  it("内置字典反向引用本文件的两份预设", () => {
    expect(zhCN.components.mathTextarea).toBe(MATH_TEXTAREA_LOCALE_ZH);
    expect(enUS.components.mathTextarea).toBe(MATH_TEXTAREA_LOCALE_EN);
  });

  it("每个内置模板与分组都有名字（两种语言）", () => {
    for (const group of FORMULA_TEMPLATE_GROUPS) {
      expect(MATH_TEXTAREA_LOCALE_ZH.templateGroups[group.id]).toBeTruthy();
      expect(MATH_TEXTAREA_LOCALE_EN.templateGroups[group.id]).toBeTruthy();
      for (const item of group.items) {
        expect(MATH_TEXTAREA_LOCALE_ZH.templates[item.id]).toBeTruthy();
        expect(MATH_TEXTAREA_LOCALE_EN.templates[item.id]).toBeTruthy();
      }
    }
  });

  it("英文预设没有任何中文（含函数产出）", () => {
    const L = MATH_TEXTAREA_LOCALE_EN;
    const texts = [
      ...Object.values(L).filter((v): v is string => typeof v === "string"),
      ...Object.values(L.syntax),
      ...Object.values(L.templateGroups),
      ...Object.values(L.templates),
      L.insertTemplate("Fraction"),
      L.position(2, 4),
      L.katexError(3, "Undefined control sequence"),
    ];
    for (const t of texts) expect(t).not.toMatch(CJK);
  });

  it("中文句子拼得通：位置前缀 + 句尾", () => {
    const L = MATH_TEXTAREA_LOCALE_ZH;
    expect(`${L.position(2, 4)}${L.syntax["unclosed-math"]}`).toContain("第 2 行第 4 个字符处的「$」没有闭合");
  });
});
```

- [ ] **Step 5: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/math-textarea src/config && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS；typecheck 0 错误。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/math-textarea/math-textarea.locale.ts packages/ui/src/math-textarea/math-textarea.locale.test.ts packages/ui/src/math-textarea/math-textarea.types.ts packages/ui/src/config/locale.ts
git commit -m "feat(ui/math): MathTextarea 词条（独立 locale 文件，config/locale 反向引用）与 Props / MathFieldLike 契约"
```

---

### Task 4: 组件 `math-textarea.tsx`

**Files:**
- Create: `packages/ui/src/math-textarea/math-textarea.tsx`
- Create: `packages/ui/src/math-textarea/math-textarea.test.tsx`

**Interfaces:**
- Consumes：Task 1 全部纯函数、Task 2 `katexErrorAt`、Task 3 Locale 与类型；库内 `Button`（`../button`，`size="sm"`，`variant="outline" | "ghost"`）、`Input`（`../input`，forwardRef 到真正的 input）、`Textarea`（`../textarea`，`autoResize` + `rows`，ref 转发）、`Popover / PopoverTrigger / PopoverContent`（`../popover`，`open` / `onOpenChange`，`PopoverContent` 有 `title` / `description` / `align`）、`Tabs / TabsList / TabsTab / TabsPanel`（`../tabs`，受控 `value` / `onValueChange(value, details)`）、`Text`（`../text`，`size="xs" | "sm"`，`tone="muted" | "danger"`）、`Formula`（`../math/math`，接受 `macros`）、`Sigma`（`../_icons`）、`cn`（`../lib/cn`）、`useComponentLocale`（`../config/locale-context`）。
- Produces：`export function MathTextarea(props: MathTextareaProps): JSX.Element`。DOM 钩子：根 `data-slot="math-textarea"`，语法错误 `data-slot="math-textarea-error"`，预览框 `data-slot="math-textarea-preview"`，KaTeX 错误 `data-slot="math-textarea-katex-error"`。

- [ ] **Step 1: 写 jsdom 测试**

```tsx
// packages/ui/src/math-textarea/math-textarea.test.tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { MathTextarea } from "./math-textarea";
import type { MathFieldLikeProps, MathTextareaProps } from "./math-textarea.types";

const CJK = /[㐀-䶿一-鿿]/u;

function Harness({
  initial,
  onValue,
  ...rest
}: { initial: string; onValue?: (v: string) => void } & Omit<MathTextareaProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <MathTextarea
      {...rest}
      value={value}
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

function FakeMathField({ value, onChange, "aria-label": ariaLabel }: MathFieldLikeProps) {
  return <input aria-label={ariaLabel ?? "fake"} data-testid="fake-field" value={value} onChange={(e) => onChange(e.target.value)} />;
}

async function openPanel() {
  fireEvent.click(screen.getByRole("button", { name: "公式" }));
  return screen.findByRole("button", { name: "插入分式" });
}

describe("MathTextarea", () => {
  it("默认单行渲染 Input；multiline 渲染 Textarea", () => {
    const { rerender } = render(<Harness initial="" aria-label="选项 A" />);
    expect(screen.getByLabelText("选项 A").tagName).toBe("INPUT");
    rerender(<Harness initial="" aria-label="题干" multiline />);
    expect(screen.getByLabelText("题干").tagName).toBe("TEXTAREA");
  });

  it("模板插到光标处，重渲染后光标落回第一个空槽", async () => {
    const onValue = vi.fn();
    render(<Harness initial="已知 " aria-label="题干" multiline onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLTextAreaElement;
    el.setSelectionRange(3, 3);
    const fraction = await openPanel();
    fireEvent.click(fraction);
    expect(onValue).toHaveBeenLastCalledWith("已知 $\\frac{}{}$");
    await waitFor(() => expect(el.selectionStart).toBe(10));
    expect(document.activeElement).toBe(el);
  });

  it("选中一段再点模板：选中内容进第一个槽", async () => {
    const onValue = vi.fn();
    render(<Harness initial="求 x 的值" aria-label="题干" multiline onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLTextAreaElement;
    el.setSelectionRange(2, 3);
    fireEvent.click(await openPanel());
    expect(onValue).toHaveBeenLastCalledWith("求 $\\frac{x}{}$ 的值");
  });

  it("光标已在公式内：模板不再套一层 $", async () => {
    const onValue = vi.fn();
    render(<Harness initial="$x + $" aria-label="题干" onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLInputElement;
    el.setSelectionRange(5, 5);
    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "插入根式" }));
    expect(onValue).toHaveBeenLastCalledWith("$x + \\sqrt{}$");
  });

  it("「行内公式」把选区框成 $…$；「独立公式」用 $$", async () => {
    const onValue = vi.fn();
    render(<Harness initial="求 x+1 的值" aria-label="题干" onValue={onValue} />);
    const el = screen.getByLabelText("题干") as HTMLInputElement;
    el.setSelectionRange(2, 5);
    await openPanel();
    fireEvent.click(screen.getByRole("button", { name: "行内公式 $…$" }));
    expect(onValue).toHaveBeenLastCalledWith("求 $x+1$ 的值");
  });

  it("没有 $ 时显示写法提示；有 $ 后提示消失", () => {
    const { rerender } = render(<Harness initial="纯文本" aria-label="题干" />);
    expect(screen.getByText("公式用 $…$ 包起来，如 $x^{2}$")).toBeTruthy();
    rerender(<Harness initial="$x$" aria-label="题干" />);
    expect(screen.queryByText("公式用 $…$ 包起来，如 $x^{2}$")).toBeNull();
  });

  it("语法错误：报行列，不渲染预览", () => {
    const { container } = render(<Harness initial={"第一行\n定价 $100 元"} aria-label="题干" multiline />);
    const error = container.querySelector('[data-slot="math-textarea-error"]');
    expect(error?.textContent).toContain("第 2 行第 4 个字符处的「$」没有闭合");
    expect(container.querySelector('[data-slot="math-textarea-preview"]')).toBeNull();
    expect(container.querySelector(".katex")).toBeNull();
  });

  it("合法公式：预览走 KaTeX，带说明文字", () => {
    const { container } = render(<Harness initial="已知 $x^{2}$" aria-label="题干" />);
    const preview = container.querySelector('[data-slot="math-textarea-preview"]');
    expect(preview?.querySelector(".katex")).not.toBeNull();
    expect(screen.getByText("预览（与题目展示用同一套排版）")).toBeTruthy();
    expect(container.querySelector('[data-slot="math-textarea-katex-error"]')).toBeNull();
  });

  it("KaTeX 解析不了：预览照渲染（标红）+ 给出字符位置与错误信息", () => {
    const { container } = render(<Harness initial="已知 $\\foo{x}$" aria-label="题干" />);
    expect(container.querySelector('[data-slot="math-textarea-preview"] .katex-error')).not.toBeNull();
    const err = container.querySelector('[data-slot="math-textarea-katex-error"]');
    expect(err?.textContent).toContain("第 5 个字符附近");
    expect(err?.textContent).toContain("Undefined control sequence");
  });

  it("compact：预览无说明文字", () => {
    render(<Harness initial="$\\frac{5}{9}$" aria-label="选项 A" compact />);
    expect(screen.queryByText("预览（与题目展示用同一套排版）")).toBeNull();
    expect(screen.queryByText(/红色源码/)).toBeNull();
  });

  it("renderPreview 替换默认预览", () => {
    render(<Harness initial="$x$" aria-label="题干" renderPreview={(v) => <em data-testid="custom">{v.length}</em>} />);
    expect(screen.getByTestId("custom").textContent).toBe("3");
  });

  it("templates 覆盖默认模板组：用自定义 title / label", async () => {
    const onValue = vi.fn();
    render(
      <Harness
        initial=""
        aria-label="题干"
        onValue={onValue}
        templates={[{ id: "vectors", title: "向量", items: [{ id: "vec", label: "向量", latex: "\\vec{}", sample: "$\\vec{a}$" }] }]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "公式" }));
    const vec = await screen.findByRole("button", { name: "插入向量" });
    expect(screen.queryByRole("button", { name: "插入分式" })).toBeNull();
    fireEvent.click(vec);
    expect(onValue).toHaveBeenLastCalledWith("$\\vec{}$");
  });

  it("disabled：公式按钮禁用", () => {
    render(<Harness initial="" aria-label="题干" disabled />);
    expect((screen.getByRole("button", { name: "公式" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("没给 visualEditor 就没有页签；给了才出「可视化输入」", () => {
    const { rerender } = render(<Harness initial="" aria-label="题干" />);
    expect(screen.queryByRole("tab")).toBeNull();
    rerender(<Harness initial="" aria-label="题干" visualEditor={FakeMathField} />);
    expect(screen.getByRole("tab", { name: "可视化输入" })).toBeTruthy();
  });

  it("可视化页签里编辑好 LaTeX 后插入：走同一条插入路径，产出 $…$，并切回源码页签", async () => {
    const onValue = vi.fn();
    render(<Harness initial="面积 " aria-label="题干" multiline visualEditor={FakeMathField} onValue={onValue} />);
    fireEvent.click(screen.getByRole("tab", { name: "可视化输入" }));
    const field = await screen.findByTestId("fake-field");
    fireEvent.change(field, { target: { value: "\\sqrt{2}" } });
    fireEvent.click(screen.getByRole("button", { name: "插入到光标处" }));
    expect(onValue).toHaveBeenLastCalledWith("面积 $\\sqrt{2}$");
    await waitFor(() => expect(screen.getByLabelText("题干")).toBeTruthy());
  });

  it("enUS：按钮 / 提示 / 错误全部英文，整棵树零中文", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Harness initial="price $100" aria-label="stem" />
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Formula" })).toBeTruthy();
    expect(container.querySelector('[data-slot="math-textarea-error"]')?.textContent).toContain("Line 1, character 7");
    expect(container.textContent).not.toMatch(CJK);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/math-textarea/math-textarea.test.tsx
```
期望：FAIL，模块不存在。

- [ ] **Step 3: 实现组件**

```tsx
// packages/ui/src/math-textarea/math-textarea.tsx
"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Sigma } from "../_icons";
import { Button } from "../button";
import { useComponentLocale } from "../config/locale-context";
import { Input } from "../input";
import { cn } from "../lib/cn";
import { Formula } from "../math/math";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { Tabs, TabsList, TabsPanel, TabsTab } from "../tabs";
import { Text } from "../text";
import { Textarea } from "../textarea";
import {
  applyFormulaTemplate,
  FORMULA_TEMPLATE_GROUPS,
  isInsideMath,
  validateFormulaSyntax,
  wrapSelectionInMath,
  type FormulaTemplate,
  type FormulaTemplateGroup,
} from "./formula-editing";
import { katexErrorAt } from "./katex-error";
import { MATH_TEXTAREA_LOCALE_ZH, type MathTextareaLocale } from "./math-textarea.locale";
import type { MathTextareaProps } from "./math-textarea.types";

/**
 * 带公式工具栏与实时预览的 LaTeX 输入框。
 *
 * 题干 / 选项 / 答案 / 解析都是「含 `$…$` 的普通字符串」，普通输入框写着「可含公式」却没有
 * 任何地方说明那指的是什么，也没法在提交前确认排出来长什么样。老师要么去外面复制粘贴，
 * 要么把平方直接打成 `x2`，存进去之后题库详情、组卷预览、学生端、导出四个地方一起错，且没人报错。
 *
 * 三件事缺一不可：模板插在光标处（`applyFormulaTemplate`）、实时预览用消费端同一个 `Formula`
 * （预览对了实际就对）、提交前自检只查能确定说错的两件事并报行列（`validateFormulaSyntax`），
 * 命令拼错这类要靠 KaTeX 才知道的交给 `katexErrorAt` 定位。存储格式一个字节不变。
 *
 * 受控件。插入之后要把光标放回去：受控重渲染会把光标推到末尾，不还原的话连点两次模板，
 * 第二次就插到了整段文字的最后面（消费方踩过的坑）。
 */
type EditableElement = HTMLTextAreaElement | HTMLInputElement;
type EditorTab = "source" | "visual";

function templateLabel(item: FormulaTemplate, L: MathTextareaLocale): string {
  return item.label ?? (L.templates as Record<string, string | undefined>)[item.id] ?? item.id;
}

function groupTitle(group: FormulaTemplateGroup, L: MathTextareaLocale): string {
  return group.title ?? (L.templateGroups as Record<string, string | undefined>)[group.id] ?? group.id;
}

export function MathTextarea({
  value,
  onChange,
  multiline = false,
  rows = 3,
  placeholder,
  disabled = false,
  compact = false,
  templates = FORMULA_TEMPLATE_GROUPS,
  renderPreview,
  visualEditor: VisualEditor,
  macros,
  "aria-label": ariaLabel,
  className,
}: MathTextareaProps) {
  const L = useComponentLocale().mathTextarea ?? MATH_TEXTAREA_LOCALE_ZH;
  const editorRef = useRef<EditableElement | null>(null);
  // 切到可视化页签后源码输入框会卸载，选区靠这份快照；插入时读它而不是「插在末尾」。
  const selectionRef = useRef<{ start: number; end: number } | null>(null);
  const pendingCaret = useRef<number | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [tab, setTab] = useState<EditorTab>("source");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const caret = pendingCaret.current;
    const el = editorRef.current;
    if (caret === null || el === null) return;
    pendingCaret.current = null;
    el.focus();
    el.setSelectionRange(caret, caret);
  });

  const attachEditor = (el: EditableElement | null) => {
    editorRef.current = el;
  };

  const rememberSelection = () => {
    const el = editorRef.current;
    if (el === null || el.selectionStart === null || el.selectionEnd === null) return;
    selectionRef.current = { start: el.selectionStart, end: el.selectionEnd };
  };

  const selection = () => {
    const el = editorRef.current;
    if (el !== null && el.selectionStart !== null && el.selectionEnd !== null) {
      return { start: el.selectionStart, end: el.selectionEnd };
    }
    return selectionRef.current ?? { start: value.length, end: value.length };
  };

  const commit = (next: { text: string; caret: number }) => {
    pendingCaret.current = next.caret;
    selectionRef.current = { start: next.caret, end: next.caret };
    onChange(next.text);
  };

  const insertLatex = (latex: string) => {
    const { start, end } = selection();
    commit(
      applyFormulaTemplate({
        text: value,
        selectionStart: start,
        selectionEnd: end,
        latex,
        // 已经在公式里就不能再套一层 `$`：套出来的 `$x$$y$` 会把中间那段变成正文。
        wrapInMath: !isInsideMath(value, start),
      }),
    );
  };

  const insertTemplate = (latex: string) => {
    insertLatex(latex);
    setPanelOpen(false);
  };

  const wrapMath = (display: boolean) => {
    const { start, end } = selection();
    commit(wrapSelectionInMath({ text: value, selectionStart: start, selectionEnd: end, display }));
    setPanelOpen(false);
  };

  const insertVisual = (latex: string = draft) => {
    const trimmed = latex.trim();
    if (trimmed === "") return;
    setTab("source");
    setDraft("");
    insertLatex(trimmed);
  };

  const issue = validateFormulaSyntax(value);
  const hasMath = value.includes("$");
  const showPreview = hasMath && issue === null;
  const parseIssue = showPreview ? katexErrorAt(value, { macros }) : null;

  const editorProps = {
    className: "w-full",
    placeholder,
    value,
    disabled,
    "aria-label": ariaLabel,
    onChange: (e: ChangeEvent<EditableElement>) => onChange(e.target.value),
    onSelect: rememberSelection,
    onKeyUp: rememberSelection,
    onBlur: rememberSelection,
  };

  const editor = multiline ? (
    <Textarea ref={attachEditor} autoResize rows={rows} {...editorProps} />
  ) : (
    <Input ref={attachEditor} {...editorProps} />
  );

  const toolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <Popover open={panelOpen} onOpenChange={setPanelOpen}>
        <PopoverTrigger
          render={
            <Button size="sm" variant="outline" disabled={disabled}>
              <Sigma className="size-4" aria-hidden />
              {L.insertFormula}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="w-[min(92vw,26rem)]"
          title={L.panelTitle}
          description={L.panelDescription}
        >
          <div className="space-y-3">
            <div>
              <Text size="xs" tone="muted" className="block">
                {L.wrapHeading}
              </Text>
              {/* 比任何模板都常用：老师已经打好了 x^2，缺的只是那对 `$`。这两个按钮就是那句说明。 */}
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Button size="sm" variant="outline" onClick={() => wrapMath(false)}>
                  {L.wrapInline}
                </Button>
                <Button size="sm" variant="outline" onClick={() => wrapMath(true)}>
                  {L.wrapDisplay}
                </Button>
              </div>
            </div>
            {templates.map((group) => (
              <div key={group.id}>
                <Text size="xs" tone="muted" className="block">
                  {groupTitle(group, L)}
                </Text>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant="ghost"
                      onClick={() => insertTemplate(item.latex)}
                      // 无障碍名带上模板名：读屏只念排版结果说不清插进去的是什么。
                      aria-label={L.insertTemplate(templateLabel(item, L))}
                    >
                      <Formula>{item.sample}</Formula>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      {!hasMath && (
        <Text size="xs" tone="muted">
          {L.hint}
        </Text>
      )}
    </div>
  );

  const sourcePane = (
    <div className="space-y-2">
      {editor}
      {toolbar}
    </div>
  );

  const body = VisualEditor ? (
    <Tabs value={tab} onValueChange={(next) => setTab(next as EditorTab)}>
      <TabsList size="sm">
        <TabsTab value="source">{L.sourceTab}</TabsTab>
        <TabsTab value="visual">{L.visualTab}</TabsTab>
      </TabsList>
      <TabsPanel value="source" className="pt-2">
        {sourcePane}
      </TabsPanel>
      <TabsPanel value="visual" className="space-y-2 pt-2">
        <VisualEditor value={draft} onChange={setDraft} onSubmit={insertVisual} aria-label={L.visualTab} />
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => insertVisual()} disabled={disabled || draft.trim() === ""}>
            {L.visualInsert}
          </Button>
          <Text size="xs" tone="muted">
            {L.visualHint}
          </Text>
        </div>
      </TabsPanel>
    </Tabs>
  ) : (
    sourcePane
  );

  return (
    <div data-slot="math-textarea" className={cn("space-y-2", className)}>
      {body}

      {issue !== null && (
        <div data-slot="math-textarea-error">
          <Text size="xs" tone="danger">
            {L.position(issue.line, issue.column)}
            {L.syntax[issue.code]}
          </Text>
        </div>
      )}

      {showPreview && (
        <div
          data-slot="math-textarea-preview"
          className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2"
        >
          {!compact && (
            <Text size="xs" tone="muted" className="block">
              {L.previewLabel}
            </Text>
          )}
          <div className={cn(!compact && "mt-1", compact && "truncate")}>
            {renderPreview ? (
              renderPreview(value)
            ) : (
              <Text size="sm" className="block whitespace-pre-wrap">
                <Formula macros={macros}>{value}</Formula>
              </Text>
            )}
          </div>
          {/* KaTeX 解析不了时 Formula 把原文标红显示（throwOnError:false），不说明的话老师只会觉得「预览坏了」。 */}
          {parseIssue !== null ? (
            <div data-slot="math-textarea-katex-error" className="mt-1">
              <Text size="xs" tone="danger">
                {L.katexError(parseIssue.index + 1, parseIssue.message)}
              </Text>
            </div>
          ) : (
            !compact && (
              <Text size="xs" tone="muted" className="mt-1 block">
                {L.previewNote}
              </Text>
            )
          )}
        </div>
      )}
    </div>
  );
}
```

实现时的核对点（都是既有 API，不确定就 grep 源码而不是猜）：
- `Textarea` / `Input` 的 `ref` 是 `forwardRef`；回调 ref `(el: EditableElement | null) => void` 对两者都可赋值。
- `Text` 是否把 `data-*` 透传不重要：`data-slot` 都挂在外层 `div` 上。
- `TabsList` 有 `size="sm"`（`tabs.types.ts`）。若 `TabsPanel` 默认卸载非激活面板，`selection()` 会落到 `selectionRef` 快照，这正是设计意图。
- 若 `Popover` 的 `onOpenChange` 类型不接受 `setPanelOpen`（多一个 details 形参），改写成 `onOpenChange={(open) => setPanelOpen(open)}`。

- [ ] **Step 4: 跑测试确认通过 + typecheck**

```bash
cd packages/ui && npx vitest run src/math-textarea && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS；typecheck 0 错误。若「KaTeX 解析不了」用例里 `.katex-error` 选择器找不到，先 `console.log(preview.innerHTML)` 看 KaTeX 0.18 给错误 span 的实际 class（应为 `katex-error`），按实际改断言，不要删用例。

- [ ] **Step 5: Commit**

```bash
git add packages/ui/src/math-textarea/math-textarea.tsx packages/ui/src/math-textarea/math-textarea.test.tsx
git commit -m "feat(ui/math): MathTextarea 公式输入框（模板插到光标处/选区包 \$/行列自检/KaTeX 错误定位/可注入可视化页签）"
```

---

### Task 5: 导出面 + 体积基线

**Files:**
- Create: `packages/ui/src/math-textarea/index.ts`
- Modify: `packages/ui/src/math/index.ts`（末尾追加）
- Create: `packages/ui/src/math-textarea/exports.test.ts`
- Modify: `scripts/size-limits.json`（经 `--update`）

**Interfaces:**
- Produces：`@hulianui/ui/math` 新增导出 `MathTextarea`、`FORMULA_TEMPLATE_GROUPS`、`applyFormulaTemplate`、`wrapSelectionInMath`、`isInsideMath`、`mathSpans`、`validateFormulaSyntax`、`textPosition`、`katexErrorAt`、`MATH_TEXTAREA_LOCALE_ZH` / `_EN`，以及类型 `MathTextareaProps`、`MathFieldLikeProps`、`FormulaTemplate`、`FormulaTemplateGroup`、`BuiltinTemplateGroupId`、`BuiltinTemplateId`、`TemplateInsertion`、`FormulaSyntaxCode`、`FormulaSyntaxIssue`、`MathSpan`、`KatexParseIssue`、`MathTextareaLocale`。

- [ ] **Step 1: 写导出面测试**

```ts
// packages/ui/src/math-textarea/exports.test.ts
import { describe, expect, it } from "vitest";
import * as mathEntry from "../math";
import * as rootEntry from "../index";

describe("math-textarea 导出面", () => {
  it("从 @hulianui/ui/math 可达", () => {
    for (const name of [
      "MathTextarea",
      "FORMULA_TEMPLATE_GROUPS",
      "applyFormulaTemplate",
      "wrapSelectionInMath",
      "isInsideMath",
      "mathSpans",
      "validateFormulaSyntax",
      "textPosition",
      "katexErrorAt",
      "MATH_TEXTAREA_LOCALE_ZH",
      "MATH_TEXTAREA_LOCALE_EN",
    ]) {
      expect((mathEntry as Record<string, unknown>)[name], name).toBeDefined();
    }
  });

  it("主 barrel 一个都不带（KaTeX 不进 @hulianui/ui）", () => {
    expect((rootEntry as Record<string, unknown>).MathTextarea).toBeUndefined();
    expect((rootEntry as Record<string, unknown>).katexErrorAt).toBeUndefined();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

```bash
cd packages/ui && npx vitest run src/math-textarea/exports.test.ts
```
期望：第一条 FAIL（`MathTextarea` undefined）。

- [ ] **Step 3: 写目录 barrel 与 math 转出**

```ts
// packages/ui/src/math-textarea/index.ts
// 公式输入框。**不是对外 subpath**：从 @hulianui/ui/math 转出（预览内部就是 Formula，独立入口省不掉 KaTeX）。
export { MathTextarea } from "./math-textarea";
export type { MathTextareaProps, MathFieldLikeProps } from "./math-textarea.types";
export {
  FORMULA_TEMPLATE_GROUPS,
  applyFormulaTemplate,
  wrapSelectionInMath,
  isInsideMath,
  mathSpans,
  validateFormulaSyntax,
  textPosition,
} from "./formula-editing";
export type {
  FormulaTemplate,
  FormulaTemplateGroup,
  BuiltinTemplateGroupId,
  BuiltinTemplateId,
  TemplateInsertion,
  FormulaSyntaxCode,
  FormulaSyntaxIssue,
  MathSpan,
} from "./formula-editing";
export { katexErrorAt } from "./katex-error";
export type { KatexParseIssue } from "./katex-error";
export { MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN } from "./math-textarea.locale";
export type { MathTextareaLocale } from "./math-textarea.locale";
```

`packages/ui/src/math/index.ts` 末尾追加：

```ts
// 公式输入框（阶段 2）。预览内部就是 Formula，所以同住此路径。
export * from "../math-textarea";
```

- [ ] **Step 4: 跑测试 + typecheck**

```bash
cd packages/ui && npx vitest run src/math-textarea src/question && cd ../.. && pnpm --filter @hulianui/ui typecheck
```
期望：全部 PASS。

- [ ] **Step 5: 量体积并归因**

```bash
CI=1 pnpm size 2>&1 | tail -20
CI=1 bash scripts/bundle-size.sh --why math 2>&1 | grep -n "locale\|popover\|tabs\|math-textarea" | head -20
```
判据：
- `--why math` 输出里**不得出现** `config/locale.ts`（出现 = 某处 import 了 zhCN，回去改成只引 `math-textarea.locale.ts`）。
- 多出来的应是 `popover/`、`tabs/`、`button/`、`textarea/`、`input/`、`text/`、`@base-ui/react/...` 与 `math-textarea/`。
- math 大概率超 99.5KB。确认上面两条后执行基线上调：

```bash
CI=1 bash scripts/bundle-size.sh --update
git diff scripts/size-limits.json
```
期望：只有 `math` 一条明显上调（其余条目微动或不动）；把新的 math 实测值与 limit 记下来，Task 7 的 changeset 要写。若 `--update` 顺带把别的入口基线**下调**了，接受（那是基线的设计：省下的空间不留给下次回归）。

- [ ] **Step 6: Commit**

```bash
git add packages/ui/src/math-textarea/index.ts packages/ui/src/math/index.ts packages/ui/src/math-textarea/exports.test.ts scripts/size-limits.json
git commit -m "feat(ui/math): 从 @hulianui/ui/math 转出 MathTextarea 与公式编辑纯函数；math 体积基线随组件上调"
```

---

### Task 6: showcase + 英文词条 + 注册

**Files:**
- Create: `packages/ui/src/math-textarea/math-textarea.showcase.tsx`
- Modify: `packages/ui/src/showcase.ts`（`questionCardShowcase` 那行附近加一行）
- Modify: `apps/www/i18n/showcase-copy.en.json`（`exact` 加词条）
- Generated: `apps/www/generated/showcase-en/math-textarea.showcase.tsx`、`apps/www/generated/showcase-en/index.ts`
- Modify: `apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`、`apps/www/i18n/component-meta.en.ts`
- Generated: `apps/perf-lab/scenarios/generated.ts`

**Interfaces:**
- Consumes：`MathTextarea`、`FORMULA_TEMPLATE_GROUPS`（Task 5 导出）、`QuestionCard`（`../question-card/question-card`）、`Input`（`../input`）。
- Produces：`mathTextareaShowcase: ShowcaseSpec`。

- [ ] **Step 1: 写 showcase**

```tsx
// packages/ui/src/math-textarea/math-textarea.showcase.tsx
"use client";
import { useState } from "react";
import { Input } from "../input";
import { QuestionCard } from "../question-card/question-card";
import type { ShowcaseSpec } from "../showcase/types";
import { FORMULA_TEMPLATE_GROUPS } from "./formula-editing";
import { MathTextarea } from "./math-textarea";
import type { MathFieldLikeProps, MathTextareaProps } from "./math-textarea.types";

const STEM = "已知 $x^{2}-5x+6=0$，求 $x$ 的值。";

function Demo({ initial, ...rest }: { initial: string } & Omit<MathTextareaProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return <MathTextarea {...rest} value={value} onChange={setValue} />;
}

// 阶段 5 的 MathField 满足 MathFieldLikeProps；这里用普通输入框模拟注入点，画廊不必装 mathlive。
function FakeMathField({ value, onChange, onSubmit, "aria-label": ariaLabel }: MathFieldLikeProps) {
  return (
    <Input
      aria-label={ariaLabel}
      placeholder="\\sqrt{2}"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit?.(value);
      }}
    />
  );
}

const SENIOR_TEMPLATES = [
  {
    id: "vectors",
    title: "向量与数集",
    items: [
      { id: "vec", label: "向量", latex: "\\vec{}", sample: "$\\vec{a}$" },
      { id: "reals", label: "实数集", latex: "\\mathbb{R}", sample: "$\\mathbb{R}$" },
    ],
  },
  ...FORMULA_TEMPLATE_GROUPS.filter((g) => g.id !== "calculus"),
];

export const mathTextareaShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description: "多行题干：模板插到光标处，含 $ 且语法正确时在下方实时预览。",
      code: `<MathTextarea
  multiline
  aria-label="题干"
  placeholder="请输入题干"
  value={value}
  onChange={setValue}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial={STEM} multiline aria-label="题干" placeholder="请输入题干" />
        </div>
      ),
    },
    {
      title: "单行紧凑",
      description: "选项与每空答案用 compact：预览只留一行、不带说明文字，八个选项也不会把表单撑长。",
      code: `<MathTextarea compact aria-label="选项 A" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-sm">
          <Demo initial="$\\frac{5}{9}$" compact aria-label="选项 A" />
        </div>
      ),
    },
    {
      title: "语法自检",
      description: "$ 未闭合、花括号不配对时报出行列，预览不渲染。",
      code: `<MathTextarea multiline aria-label="题干" value={"定价 $100 元"} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="定价 $100 元" multiline aria-label="题干" />
        </div>
      ),
    },
    {
      title: "KaTeX 解析错误定位",
      description: "命令拼错只有 KaTeX 才知道：预览里标红源码，下方给出字符位置与错误信息。",
      code: `<MathTextarea aria-label="题干" value={"$\\\\frac{a}{b} + \\\\foo{x}$"} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="$\\frac{a}{b} + \\foo{x}$" aria-label="题干" />
        </div>
      ),
    },
    {
      title: "自定义模板组",
      description: "templates 覆盖默认模板组：高中加向量与数集，去掉求和积分。自定义模板直接给 label。",
      code: `<MathTextarea templates={SENIOR_TEMPLATES} aria-label="题干" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="" templates={SENIOR_TEMPLATES} aria-label="题干" />
        </div>
      ),
    },
    {
      title: "注入可视化编辑器",
      description: "visualEditor 给了才出「可视化输入」页签；这里用普通输入框模拟，MathField 满足同一契约。",
      code: `<MathTextarea multiline visualEditor={MathField} aria-label="题干" value={value} onChange={setValue} />`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo initial="面积 " multiline visualEditor={FakeMathField} aria-label="题干" />
        </div>
      ),
    },
    {
      title: "自定义预览",
      description: "renderPreview 换掉默认的 Formula 预览：这里直接预览成题目卡片。",
      code: `<MathTextarea
  multiline
  aria-label="题干"
  renderPreview={(v) => <QuestionCard stem={v} type="blank" />}
  value={value}
  onChange={setValue}
/>`,
      render: () => (
        <div className="w-full max-w-xl">
          <Demo
            initial="将 $\\frac{3}{8}$ 化成小数为____。"
            multiline
            aria-label="题干"
            renderPreview={(v) => <QuestionCard stem={v} type="blank" />}
          />
        </div>
      ),
    },
  ],
  controls: [
    { prop: "multiline", type: "boolean", defaultValue: true },
    { prop: "compact", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
    { prop: "placeholder", type: "text", defaultValue: "请输入题干" },
  ],
  states: [
    { name: "default", render: () => <Demo initial={STEM} multiline aria-label="题干" /> },
    { name: "compact", render: () => <Demo initial="$\\frac{5}{9}$" compact aria-label="选项 A" /> },
    { name: "error", render: () => <Demo initial="定价 $100 元" aria-label="题干" /> },
    { name: "disabled", render: () => <Demo initial={STEM} multiline disabled aria-label="题干" /> },
  ],
  renderWithProps: (props) => (
    <div className="w-full max-w-xl">
      <Demo
        initial={STEM}
        multiline={Boolean(props.multiline)}
        compact={Boolean(props.compact)}
        disabled={Boolean(props.disabled)}
        placeholder={String(props.placeholder ?? "")}
        aria-label="题干"
      />
    </div>
  ),
  toCode: (props) =>
    `<MathTextarea${props.multiline ? " multiline" : ""}${props.compact ? " compact" : ""}${
      props.disabled ? " disabled" : ""
    } placeholder="${String(props.placeholder ?? "")}" aria-label="题干" value={value} onChange={setValue} />`,
};
```

- [ ] **Step 2: 注册 showcase**

`packages/ui/src/showcase.ts` 里 `export { questionCardShowcase } ...` 那一行之后加：

```ts
export { mathTextareaShowcase } from "./math-textarea/math-textarea.showcase";
```

- [ ] **Step 3: SSR 守卫先过**

```bash
cd packages/ui && npx vitest run src/showcase/ssr-safety.test.tsx
```
期望：PASS（`useState` 的 Demo 在 `renderToStaticMarkup` 下没问题；Popover 闭合态不渲染面板）。

- [ ] **Step 4: 补英文词条并生成**

先跑一次看缺什么（每次只报第一条缺失，要循环）：

```bash
pnpm showcase:generate 2>&1 | grep "missing English copy"
```

用下面的脚本把词条并进 `apps/www/i18n/showcase-copy.en.json` 的 `exact`（文件本身键不排序，追加即可）；脚本里的表是按上面 showcase 里的每一个中文字符串 / `code` 的每一行 CJK 行（去首尾空白）列的，跑完 `showcase:generate` 若还报缺，把报的那个 key 原样加进表再跑：

```bash
node - <<'EOF'
const fs = require("node:fs");
const path = "apps/www/i18n/showcase-copy.en.json";
const copy = JSON.parse(fs.readFileSync(path, "utf8"));
const add = {
  "多行题干：模板插到光标处，含 $ 且语法正确时在下方实时预览。": "Multi-line stem: templates insert at the caret; once the value contains $ and parses, a live preview renders below.",
  "aria-label=\"题干\"": "aria-label=\"Stem\"",
  "placeholder=\"请输入题干\"": "placeholder=\"Enter the stem\"",
  "请输入题干": "Enter the stem",
  "题干": "Stem",
  "单行紧凑": "Single-line compact",
  "选项与每空答案用 compact：预览只留一行、不带说明文字，八个选项也不会把表单撑长。": "Use compact for options and per-blank answers: a one-line preview with no helper text, so eight options do not stretch the form.",
  "<MathTextarea compact aria-label=\"选项 A\" value={value} onChange={setValue} />": "<MathTextarea compact aria-label=\"Option A\" value={value} onChange={setValue} />",
  "选项 A": "Option A",
  "语法自检": "Syntax check",
  "$ 未闭合、花括号不配对时报出行列，预览不渲染。": "An unclosed $ or unbalanced braces report line and column; the preview is not rendered.",
  "<MathTextarea multiline aria-label=\"题干\" value={\"定价 $100 元\"} onChange={setValue} />": "<MathTextarea multiline aria-label=\"Stem\" value={\"price $100\"} onChange={setValue} />",
  "定价 $100 元": "price $100",
  "KaTeX 解析错误定位": "Locating KaTeX parse errors",
  "命令拼错只有 KaTeX 才知道：预览里标红源码，下方给出字符位置与错误信息。": "Only KaTeX knows a command is misspelled: the preview shows the source in red and the character position and message appear below.",
  "<MathTextarea aria-label=\"题干\" value={\"$\\\\frac{a}{b} + \\\\foo{x}$\"} onChange={setValue} />": "<MathTextarea aria-label=\"Stem\" value={\"$\\\\frac{a}{b} + \\\\foo{x}$\"} onChange={setValue} />",
  "自定义模板组": "Custom template groups",
  "templates 覆盖默认模板组：高中加向量与数集，去掉求和积分。自定义模板直接给 label。": "templates replaces the default groups: senior high adds vectors and number sets and drops sums and integrals. Custom templates provide their own label.",
  "<MathTextarea templates={SENIOR_TEMPLATES} aria-label=\"题干\" value={value} onChange={setValue} />": "<MathTextarea templates={SENIOR_TEMPLATES} aria-label=\"Stem\" value={value} onChange={setValue} />",
  "向量与数集": "Vectors and number sets",
  "向量": "Vector",
  "实数集": "Real numbers",
  "注入可视化编辑器": "Injecting a visual editor",
  "visualEditor 给了才出「可视化输入」页签；这里用普通输入框模拟，MathField 满足同一契约。": "The Visual input tab appears only when visualEditor is provided; a plain input stands in here, and MathField satisfies the same contract.",
  "<MathTextarea multiline visualEditor={MathField} aria-label=\"题干\" value={value} onChange={setValue} />": "<MathTextarea multiline visualEditor={MathField} aria-label=\"Stem\" value={value} onChange={setValue} />",
  "面积 ": "Area ",
  "自定义预览": "Custom preview",
  "renderPreview 换掉默认的 Formula 预览：这里直接预览成题目卡片。": "renderPreview replaces the default Formula preview; here the value previews as a question card.",
  "将 $\\frac{3}{8}$ 化成小数为____。": "Write $\\frac{3}{8}$ as a decimal: ____.",
  "已知 $x^{2}-5x+6=0$，求 $x$ 的值。": "Given $x^{2}-5x+6=0$, find $x$.",
};
copy.exact ??= {};
for (const [k, v] of Object.entries(add)) if (!Object.hasOwn(copy.exact, k)) copy.exact[k] = v;
fs.writeFileSync(path, JSON.stringify(copy, null, 2) + "\n");
EOF
pnpm showcase:generate 2>&1 | grep -E "missing English copy|unused" ; pnpm showcase:check
```

注意：
- 「基础用法」这类通用标题多半已在 `exact` 里，脚本不会覆盖既有键。
- 生成器对 `code` 字符串是**逐行**取词条，键是该行去首尾空白后的整行；对 JSX 文本 / 属性字符串是整串原样。
- `showcase:check` 报 `unused` 表示某个新增键没被消费（拼写与源码不一致），删掉或改对，不要留着。
- 英文里不许有 CJK，也不许有 em-dash。

- [ ] **Step 5: 画廊三处注册 + perf-lab 重生成**

`apps/www/lib/manifest.ts`：在 `slug: "question-card"` 那一行之后加：

```ts
  { slug: "math-textarea", name: "MathTextarea", shortName: "公式输入框", description: "带公式模板与实时预览的 LaTeX 输入框，产出仍是含 $…$ 的普通字符串", category: "forms", group: "advanced", status: "new" },
```

`apps/www/lib/registry.tsx`：import 列表里 `questionCardShowcase,` 之后加 `mathTextareaShowcase,`；映射表里 `"question-card": questionCardShowcase,` 之后加 `"math-textarea": mathTextareaShowcase,`。

`apps/www/i18n/component-meta.en.ts`：`"question-card": {...},` 之后加：

```ts
  "math-textarea": {
    shortName: "MathTextarea",
    description:
      "LaTeX input with formula templates, live KaTeX preview, syntax checks with line and column, and an injectable visual editor tab.",
    keywords: ["math", "latex", "formula", "textarea", "forms", "katex"],
  },
```

perf-lab：

```bash
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check
```
期望：第二条 rc=0。

- [ ] **Step 6: 跑 www 侧元数据覆盖测试**

```bash
pnpm --filter www exec vitest run i18n/meta-coverage.test.ts
```
期望：PASS（每个 manifest slug 恰有一条英文元数据）。若 www 包没有 vitest 直跑脚本，用 `cd apps/www && npx vitest run i18n/meta-coverage.test.ts`。

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/math-textarea/math-textarea.showcase.tsx packages/ui/src/showcase.ts apps/www/i18n/showcase-copy.en.json apps/www/generated/showcase-en/math-textarea.showcase.tsx apps/www/generated/showcase-en/index.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/i18n/component-meta.en.ts apps/perf-lab/scenarios/generated.ts
git commit -m "feat(www): MathTextarea 画廊示例、英文词条与四处注册（manifest/registry/英文元数据/perf-lab）"
```

---

### Task 7: 文档（中英）、math.md 链接、changeset、全量门禁、合回 master

**Files:**
- Create: `packages/ui/src/math-textarea/math-textarea.md`
- Create: `packages/ui/src/math-textarea/math-textarea.en.md`
- Modify: `packages/ui/src/math/math.md`、`packages/ui/src/math/math.en.md`
- Create: `.changeset/math-textarea.md`
- Generated（`pnpm docs:all`）：`apps/www/public/registry.json`、`apps/www/public/llms-props.json`、`apps/www/public/conventions.json`、`apps/www/public/r/*.json` 等

- [ ] **Step 1: 写中文文档**

````markdown
---
slug: math-textarea
name: MathTextarea
category: forms
group: advanced
tags: []
exports: [MathTextarea, FORMULA_TEMPLATE_GROUPS, applyFormulaTemplate, wrapSelectionInMath, isInsideMath, mathSpans, validateFormulaSyntax, textPosition, katexErrorAt, MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN]
status: enriched
---

# MathTextarea

> 公式输入框 · 录题用的 LaTeX 输入框：模板插到光标处、选区一键包成 $…$、提交前自检报行列、KaTeX 解析错误定位、实时预览与消费端同一套排版 · 可注入可视化公式编辑器（MathField）出第二个页签 · 产出仍是含 $…$ 的普通字符串 · 走 @hulianui/ui/math 主包不付 KaTeX 体积 · forms/advanced

## 何时用

题干、选项、每空答案、参考答案、解析，凡是「一段可以含公式的文字」都用它，而不是裸 `Textarea` 加一句「可含公式」。它解决三件事：老师不知道公式要写成 `$…$`（工具栏的两个按钮就是那句说明）、不会写 LaTeX（模板插到光标处，选中 `x` 点分式得到 `\frac{x}{}` 且光标在分母）、提交前看不到排出来长什么样（预览用的就是展示端的 [Formula](../math/math.md)，预览对了实际就对）。

只展示不编辑用 [Formula](../math/math.md)；整道题的结构化编辑用 QuestionEditor（阶段 3，内部就是本件）。

## 导入

```ts
import { MathTextarea } from "@hulianui/ui/math"
```

住 `@hulianui/ui/math` 而不是主包：预览内部就是 Formula，也就带着 KaTeX；不排数学的消费者不该付这 86KB gzip。

## 用法

```tsx
const [stem, setStem] = useState("已知 $x^{2}-5x+6=0$，求 $x$ 的值。");

<MathTextarea multiline aria-label="题干" placeholder="请输入题干" value={stem} onChange={setStem} />
```

选项与每空答案用单行紧凑形态：

```tsx
<MathTextarea compact aria-label="选项 A" value={optionA} onChange={setOptionA} />
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | 受控值：含 `$…$` 的普通字符串，与题干 / 选项 / 解析的存储格式一致 |
| onChange | `(next: string) => void` | - | 值变化（键入、插入模板、包选区、可视化插入都走它） |
| multiline | `boolean` | `false` | 多行（题干 / 解析 / 参考答案）用 Textarea；单行（选项 / 每空答案）用 Input |
| rows | `number` | `3` | 多行时的初始行数；随内容自动长高 |
| placeholder | `string` | - | 占位 |
| disabled | `boolean` | `false` | 禁用输入与工具栏 |
| compact | `boolean` | `false` | 紧凑形态：预览只占一行、不带说明文字。给选项与每空答案用 |
| templates | `readonly FormulaTemplateGroup[]` | `FORMULA_TEMPLATE_GROUPS` | 覆盖默认模板组。自定义模板给 `label` / 分组给 `title`，内置模板的名字从 Locale 取 |
| renderPreview | `(value: string) => ReactNode` | - | 自定义预览渲染；默认 `<Formula>`。题干带图时由 QuestionEditor 传带图渲染 |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | 注入可视化公式编辑器；**给了才出「可视化输入」页签**。`@hulianui/ui/math-field` 的 MathField 满足此契约 |
| macros | `Record<string, string>` | - | 透传给默认预览与 KaTeX 探针的宏表；自定义宏不该被报成「未定义命令」 |
| aria-label | `string` | - | 无障碍名。单行控件必给：选项那一栏靠它区分「选项 A」和「选项 B」 |
| className | `string` | - | 透传到根节点 |

### MathFieldLikeProps（`visualEditor` 的契约）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | LaTeX（不带 `$`） |
| onChange | `(latex: string) => void` | - | 编辑中回写 |
| onSubmit | `(latex: string) => void` | - | 回车 / 确认；MathTextarea 把它接到「插入到光标处」同一条路径 |
| aria-label | `string` | - | 由 MathTextarea 传入（页签名） |
| className | `string` | - | 样式透传 |

### FormulaTemplate / FormulaTemplateGroup

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id | `string` | - | 稳定标识。内置模板 / 分组的显示名从 Locale 的 `templates[id]` / `templateGroups[id]` 取 |
| latex | `string` | - | 插入的片段。**第一个空 `{}` / `[]` 是光标落点**；有选中文本时选中内容进第一个槽、光标跳到下一个槽 |
| sample | `string` | - | 面板上的示例渲染，`$` 包好直接喂 Formula |
| label | `string` | - | 模板显示名；自定义模板给它，内置模板不给（走 Locale） |
| title | `string` | - | 分组标题；自定义分组给它 |
| items | `readonly FormulaTemplate[]` | - | 分组里的模板 |

## Events

| 名称 | 参数 | 说明 |
|------|------|------|
| onChange | `(next: string)` | 值变化。插入类动作会在下一帧把光标放回插入点（受控重渲染会把光标推到末尾，不还原连点两次模板第二次就插到了末尾） |

## 国际化

全部文案走 Locale 的 `components.mathTextarea`（`MathTextareaLocale`，SSOT 在 `math-textarea.locale.ts`，`zhCN` / `enUS` 已接）。内置模板与分组的名字也在词条表里（`templates` / `templateGroups`，键与 `FORMULA_TEMPLATE_GROUPS` 的 `id` 一一对应，类型钉死）。

## 配套纯函数

都从 `@hulianui/ui/math` 导出，不引 KaTeX 的可在服务端脚本里单独用：

- `applyFormulaTemplate({ text, selectionStart, selectionEnd, latex, wrapInMath })` → `{ text, caret }`：模板插到选区处并算光标落点。
- `wrapSelectionInMath({ text, selectionStart, selectionEnd, display })` → `{ text, caret }`：把选区框成 `$…$` / `$$…$$`。
- `isInsideMath(text, caret)` → `boolean`：光标在不在公式里（决定插入片段要不要自己带 `$`）。
- `mathSpans(text)` → `MathSpan[]`：每个闭合 `$…$` / `$$…$$` 段在整串里的位置（`start` / `end` / `contentStart`）。
- `validateFormulaSyntax(text)` → `FormulaSyntaxIssue | null`：只查 `$` 未闭合与 `{}` 不配对，返回 `code` + `index` + `line` / `column`，**不产出文案**。
- `textPosition(text, index)` → `{ line, column }`：下标换行列（从 1 数）。
- `katexErrorAt(text, { macros })` → `KatexParseIssue | null`：整串里第一处 KaTeX 解析不了的位置与原始信息。引 KaTeX。

## 禁忌 / 坑

- **不要用 `display:none` 藏它再靠 required 拦**：它不是原生表单控件，空值校验由外层 Field / 表单做（与 QuestionEditor 的 `validateQuestion` 一致）。
- **预览出现红色源码不是组件坏了**：那是 KaTeX 解析不了这段公式（`throwOnError:false`），下方会给出「第 N 个字符附近：<原因>」。修命令拼写即可。
- **`\(…\)` / `\[…\]` 写法不做语法自检与错误定位**：编辑器产出永远是 `$` 系；这两种写法 Formula 照样能排，只是这里的两条探针不看它们。
- **段内填空槽 `___` 不会被报成解析错误**：探针走与 Formula 同一条 `blanksToLatex` 替换。落在填空槽之后的错误位置会有几个字符偏差，只影响提示不影响判定。
- **`templates` 里自定义模板必须给 `label`**：不给就显示 `id`。内置模板不用给（Locale 里有）。
- **`visualEditor` 注入的是组件不是元素**：传 `MathField` 本身，不是 `<MathField />`。

## 相关

- [Formula](../math/math.md) —— 预览与展示端同一个排版件；`@hulianui/ui/math` 的其余纯函数（切段、转朴素文本）
- [QuestionCard](../question-card/question-card.md) —— `renderPreview` 里最常见的目标
- [Textarea](../textarea/textarea.md) / [Input](../input/input.md) —— 底下的输入控件
````

- [ ] **Step 2: 写英文文档（结构同上，零 CJK；示例文本也换英文）**

````markdown
---
slug: math-textarea
name: MathTextarea
category: forms
group: advanced
tags: []
exports: [MathTextarea, FORMULA_TEMPLATE_GROUPS, applyFormulaTemplate, wrapSelectionInMath, isInsideMath, mathSpans, validateFormulaSyntax, textPosition, katexErrorAt, MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN]
status: enriched
---

# MathTextarea

> Formula input for question authoring: templates insert at the caret, one click wraps the selection in $…$, pre-submit checks report line and column, KaTeX parse errors are located, and the live preview uses the same typesetting as the display side. An injectable visual formula editor (MathField) adds a second tab. The output stays a plain string containing $…$. Lives in @hulianui/ui/math so the main package never pays for KaTeX. forms/advanced

## When to use

Use it for any text that may contain formulas: stems, options, per-blank answers, reference answers, explanations. It replaces a bare Textarea with a "formulas allowed" note and solves three things: authors do not know formulas must be written as `$…$` (the two toolbar buttons are that explanation), they cannot write LaTeX (templates insert at the caret; selecting `x` and clicking Fraction yields `\frac{x}{}` with the caret in the denominator), and they cannot see the result before submitting (the preview is the display side's [Formula](../math/math.en.md), so a correct preview means correct output).

For display only use [Formula](../math/math.en.md); for structured editing of a whole question use QuestionEditor (phase 3, built on this component).

## Import

```ts
import { MathTextarea } from "@hulianui/ui/math"
```

It lives in `@hulianui/ui/math` rather than the main package: the preview is Formula, which brings KaTeX, and consumers who never typeset math should not pay those 86KB gzip.

## Usage

```tsx
const [stem, setStem] = useState("Given $x^{2}-5x+6=0$, find $x$.");

<MathTextarea multiline aria-label="Stem" placeholder="Enter the stem" value={stem} onChange={setStem} />
```

Single-line compact form for options and per-blank answers:

```tsx
<MathTextarea compact aria-label="Option A" value={optionA} onChange={setOptionA} />
```

## Props

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | Controlled value: a plain string containing `$…$`, the same storage format as stems, options, and explanations |
| onChange | `(next: string) => void` | - | Value change (typing, template insertion, wrapping, visual insertion all go through it) |
| multiline | `boolean` | `false` | Multi-line (stem / explanation / reference answer) renders a Textarea; single-line (options / per-blank answers) renders an Input |
| rows | `number` | `3` | Initial rows in multi-line mode; grows with content |
| placeholder | `string` | - | Placeholder |
| disabled | `boolean` | `false` | Disables input and toolbar |
| compact | `boolean` | `false` | Compact form: one-line preview with no helper text. For options and per-blank answers |
| templates | `readonly FormulaTemplateGroup[]` | `FORMULA_TEMPLATE_GROUPS` | Replaces the default template groups. Custom templates provide `label` and groups provide `title`; built-in names come from the locale |
| renderPreview | `(value: string) => ReactNode` | - | Custom preview; defaults to `<Formula>`. QuestionEditor passes a figure-aware renderer for stems |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | Injects a visual formula editor; **the Visual input tab appears only when provided**. MathField from `@hulianui/ui/math-field` satisfies the contract |
| macros | `Record<string, string>` | - | Macro table passed to the default preview and the KaTeX probe so custom macros are not reported as undefined commands |
| aria-label | `string` | - | Accessible name. Required for single-line controls: it is how option A and option B are told apart |
| className | `string` | - | Applied to the root |

### MathFieldLikeProps (the `visualEditor` contract)

| Name | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | - | LaTeX without `$` |
| onChange | `(latex: string) => void` | - | Called while editing |
| onSubmit | `(latex: string) => void` | - | Enter / confirm; MathTextarea routes it to the same "Insert at caret" path |
| aria-label | `string` | - | Provided by MathTextarea (the tab name) |
| className | `string` | - | Style passthrough |

### FormulaTemplate / FormulaTemplateGroup

| Name | Type | Default | Description |
|------|------|---------|-------------|
| id | `string` | - | Stable id. Built-in template and group names come from the locale's `templates[id]` / `templateGroups[id]` |
| latex | `string` | - | Snippet to insert. **The first empty `{}` / `[]` is the caret slot**; with a selection, the selected text fills the first slot and the caret moves to the next |
| sample | `string` | - | Rendered example on the panel, wrapped in `$` and fed to Formula |
| label | `string` | - | Display name; provide it for custom templates, omit for built-ins (locale) |
| title | `string` | - | Group heading; provide it for custom groups |
| items | `readonly FormulaTemplate[]` | - | Templates in the group |

## Events

| Name | Arguments | Description |
|------|-----------|-------------|
| onChange | `(next: string)` | Value change. Insertion actions restore the caret to the insertion point on the next frame (a controlled re-render would otherwise push it to the end, so a second template click would land at the end of the text) |

## Localization

All copy comes from the locale's `components.mathTextarea` (`MathTextareaLocale`, source of truth in `math-textarea.locale.ts`; `zhCN` and `enUS` are wired). Built-in template and group names are in the same table (`templates` / `templateGroups`, keyed by the `id`s in `FORMULA_TEMPLATE_GROUPS`, enforced by the type).

## Companion pure functions

All exported from `@hulianui/ui/math`; those that do not import KaTeX can run in server-side scripts:

- `applyFormulaTemplate({ text, selectionStart, selectionEnd, latex, wrapInMath })` → `{ text, caret }`: insert a template at the selection and compute the caret.
- `wrapSelectionInMath({ text, selectionStart, selectionEnd, display })` → `{ text, caret }`: wrap the selection in `$…$` / `$$…$$`.
- `isInsideMath(text, caret)` → `boolean`: whether the caret is inside a formula (decides whether an inserted snippet brings its own `$`).
- `mathSpans(text)` → `MathSpan[]`: position of every closed `$…$` / `$$…$$` span (`start` / `end` / `contentStart`).
- `validateFormulaSyntax(text)` → `FormulaSyntaxIssue | null`: checks only unclosed `$` and unbalanced `{}`; returns `code` + `index` + `line` / `column`, **no copy**.
- `textPosition(text, index)` → `{ line, column }`: index to 1-based line and column.
- `katexErrorAt(text, { macros })` → `KatexParseIssue | null`: the first position KaTeX cannot parse, with the raw message. Imports KaTeX.

## Pitfalls

- **Do not hide it with `display:none` and rely on `required`**: it is not a native form control. Empty-value validation belongs to the surrounding Field or form (QuestionEditor uses `validateQuestion`).
- **Red source in the preview is not a broken component**: KaTeX cannot parse that formula (`throwOnError:false`); the line below says "Near character N: <reason>". Fix the command spelling.
- **`\(…\)` / `\[…\]` are not syntax-checked or located**: the editor always emits the `$` family. Formula still renders those forms; only the two probes here ignore them.
- **In-formula blanks `___` are not reported as parse errors**: the probe applies the same `blanksToLatex` replacement as Formula. Error positions after a blank may be off by a few characters; this affects the hint, not the verdict.
- **Custom templates must provide `label`**: otherwise the `id` is shown. Built-ins do not need it (locale).
- **`visualEditor` takes a component, not an element**: pass `MathField` itself, not `<MathField />`.

## Related

- [Formula](../math/math.en.md): the same typesetting component used for preview and display; the other pure functions in `@hulianui/ui/math`
- [QuestionCard](../question-card/question-card.en.md): the most common `renderPreview` target
- [Textarea](../textarea/textarea.en.md) / [Input](../input/input.en.md): the underlying inputs
````

- [ ] **Step 3: `math.md` / `math.en.md` 各补两处**

`packages/ui/src/math/math.md` 的 `### 题目域（与 QuestionCard 同住此路径）` 那一段末尾（`- \`answerText\`：…` 之后）加一行：

```markdown
- `MathTextarea`：录题用的公式输入框（模板 / 自检 / 预览），见 [MathTextarea](../math-textarea/math-textarea.md)。
```

`## 相关` 列表加：

```markdown
- [MathTextarea](../math-textarea/math-textarea.md) —— 公式输入框，预览内部就是本组件；同住 `@hulianui/ui/math`
```

`math.en.md` 对应位置（用 `grep -n "answerText\|^## Related" packages/ui/src/math/math.en.md` 定位）加英文版：

```markdown
- `MathTextarea`: the formula input for authoring (templates / checks / preview), see [MathTextarea](../math-textarea/math-textarea.en.md).
```
```markdown
- [MathTextarea](../math-textarea/math-textarea.en.md): formula input whose preview is this component; also lives in `@hulianui/ui/math`
```

- [ ] **Step 4: changeset**

```markdown
---
"@hulianui/ui": minor
---

`@hulianui/ui/math` 新增 `MathTextarea`：录题用的 LaTeX 输入框。模板插到光标处（选中 `x` 点分式得到 `\frac{x}{}` 且光标在分母）、选区一键包成 `$…$` / `$$…$$`、提交前只查 `$` 未闭合与 `{}` 不配对并报行列、KaTeX 解析错误换算回整串位置、实时预览与展示端同一个 `Formula`。`visualEditor` 可注入满足 `MathFieldLikeProps` 的可视化编辑器（阶段 5 的 MathField），给了才出「可视化输入」页签。文案走 Locale（新增 `mathTextarea` 词条，含内置模板名）。配套纯函数 `applyFormulaTemplate` / `wrapSelectionInMath` / `isInsideMath` / `mathSpans` / `validateFormulaSyntax` / `textPosition` / `katexErrorAt` 一并导出。

体积：`@hulianui/ui/math` 的 `export *` 上界从 95.6KB 升到 <实测>KB（Popover / Tabs / 表单控件进入该入口），基线相应上调；库 `sideEffects:false`，只用 `Formula` 的消费方经 tree-shaking 不受影响。

<!-- changelog-en:start -->
`@hulianui/ui/math` gains `MathTextarea`, a LaTeX input for question authoring. Templates insert at the caret (select `x`, click Fraction, get `\frac{x}{}` with the caret in the denominator), one click wraps the selection in `$…$` / `$$…$$`, the pre-submit check reports only unclosed `$` and unbalanced `{}` with line and column, KaTeX parse errors are mapped back to a position in the whole string, and the live preview is the same `Formula` used for display. `visualEditor` injects any component satisfying `MathFieldLikeProps` (MathField in phase 5); the Visual input tab appears only when provided. Copy comes from the locale (new `mathTextarea` entries, including built-in template names). Companion pure functions `applyFormulaTemplate` / `wrapSelectionInMath` / `isInsideMath` / `mathSpans` / `validateFormulaSyntax` / `textPosition` / `katexErrorAt` are exported alongside.

Size: the `export *` upper bound of `@hulianui/ui/math` rises from 95.6KB to <measured>KB (Popover, Tabs, and form controls now live behind this entry) and the baseline is raised accordingly; the package is `sideEffects:false`, so consumers importing only `Formula` are unaffected after tree-shaking.
<!-- changelog-en:end -->
```

把 `<实测>` / `<measured>` 换成 Task 5 记下的数字。

- [ ] **Step 5: 生成产物 + 全量门禁**

```bash
pnpm docs:all
git status --short      # 只该多出 apps/www/public/**、apps/www/generated/** 与 docs 相关产物；upload.tsx 仍是别人的，不动
pnpm showcase:check && pnpm conventions:check && pnpm docs:check:props && pnpm docs:i18n:check && pnpm check:remote-assets
cd packages/ui && npx vitest run && cd ../..
pnpm typecheck
pnpm test:scripts
CI=1 pnpm size
pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check
```
期望：全部 rc=0；ui 单测全绿（含 `ssr-safety`、`form-control-passthrough`）。任一门禁红：按报错修，**不要**跳过。`docs:check:props` 若报 `math-textarea.<字段>` 缺表，是 md 表漏行，补表不加豁免。

- [ ] **Step 6: Commit 并合回 master**

```bash
git add packages/ui/src/math-textarea/math-textarea.md packages/ui/src/math-textarea/math-textarea.en.md packages/ui/src/math/math.md packages/ui/src/math/math.en.md .changeset/math-textarea.md
git add $(git status --short | awk '$1=="M"||$1=="??"{print $2}' | grep -E "^apps/www/(public|generated)/|^apps/www/out/|^docs/|^README" )
git status --short      # 确认 packages/ui/src/upload/upload.tsx 没被暂存
git commit -m "docs(ui/math): MathTextarea 中英文档、math.md 链接、changeset 与生成产物"
git checkout master && git merge --ff-only feat/math-question-phase2 && git branch -d feat/math-question-phase2
git log --oneline -8
```

不 push。

---

## 自查记录（写完计划后对照 spec §4.1 / §7 / §8）

- §4.1 接口：`value / onChange / multiline / rows / placeholder / disabled / compact / templates / renderPreview / visualEditor / aria-label / className` 全部在 Task 3 类型里；额外加了 `macros`（否则自定义宏会被 `katexErrorAt` 误报，与 `Formula` 的 `macros` 对齐）。
- §4.1 行为：模板插在光标处 + `pendingCaret` 还原（Task 1 / 4）；两个包选区按钮放在模板之前（Task 4 toolbar）；实时预览 + `katexErrorAt`「第 N 个字符附近」（Task 2 / 4）；`validateFormulaSyntax` 只查两件事并报行列（Task 1）；文案走 Locale、英文站零中文（Task 3 词条 + Task 4 enUS 测试 + Task 6 英文词条）；可视化页签走 `applyFormulaTemplate` 同一条路径、产出 `$…$`（Task 4 `insertVisual` → `insertLatex`）。
- §7 错误处理：语法错误预览不渲染改显行列提示；KaTeX 错误预览照渲染（标红）+ 位置提示（Task 4 两个分支 + 测试）。
- §8.1 测试：纯函数表驱动（Task 1 / 2）、jsdom 光标还原与插入（Task 4）、`ssr-safety`（Task 6 Step 3）、showcase 英文词表两头（Task 6 Step 4）、`docs:check:props`、`conventions`、bundle-size（Task 5 / 7）。browser test 按 Global Constraints 留到阶段 5。
- §8.2 文档与注册：中英 md（Task 7）、`math.md` 更新（Task 7 Step 3）、六处注册（Task 5 `math/index.ts`、Task 6 showcase / manifest / registry / 英文元数据 / perf-lab）。`docs/consuming-math.md` 与 demo 按 spec 属阶段 5。
- 偏离 spec 且已在文中写明：`katexErrorAt` 独立成 `katex-error.ts`（不让纯函数文件引 KaTeX）；`validateFormulaSyntax` 返回结构化结果而非文案；模板用 `id` + Locale 表；math 体积基线上调（Global Constraints 有决策说明与备选）。
- 类型一致性：`FormulaSyntaxIssue { code, index, line, column }` 在 Task 1 定义、Task 3 Locale 的 `syntax: Record<FormulaSyntaxCode, string>` 与 Task 4 `L.syntax[issue.code]` 一致；`MathSpan.contentStart` 在 Task 1 定义、Task 2 使用；`MathFieldLikeProps` 的 `onSubmit?: (latex) => void` 与 Task 4 `insertVisual(latex = draft)` 一致；`TabsList size="sm"` 来自 `tabs.types.ts`。
- 占位扫描：无 TBD / TODO；`<实测>` 是 Task 5 产出的数字，Task 7 Step 4 已注明替换。
