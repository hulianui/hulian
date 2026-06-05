# 瀚审 HanReview AI 代码审查质检平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建一个 100% 由 @hulian/ui 搭建的「AI 代码审查质检平台」内置 demo（7 页 + login），过程中增强 code-diff、新造 4 个真缺口组件（CodeReviewThread / DiffStat / Heatmap / ScoreRing），用真实场景驱动组件库成长。

**Architecture:** 沿用 ai-workflow/crm demo 范式——`(app)/` 路由组 + AdminLayout 外壳 + `_components`/`_data`/`_lib` 分层 + 全 mock 内存态 + `output:export` 静态导出（动态 `[id]` 拆 server+client）。组件先造（TDD）再被页面 dogfood。质量分/选模型/门禁三套纯函数可单测。

**Tech Stack:** Next.js 15 App Router · TypeScript · @hulian/ui · Base UI · Tailwind(token 驱动) · vitest + @testing-library/react · lucide-react 图标。

---

## ⚠️ 全局铁律（每个 commit 都适用）

1. **共享文件 hunk 级暂存**：`packages/ui/src/index.ts`、`packages/ui/src/showcase.ts`、`apps/www/lib/manifest.ts`、`apps/www/lib/registry.tsx`、`app/demos/lib/demos.ts` 这些文件**已带其它会话未提交 WIP**（如 secret-field 的导出）。禁止 `git add <整文件>` 或 `git add -A`——会卷走别人的 WIP。提交这些文件时用 hunk 级：`git add -p <file>` 只选自己新增的 hunk，或先 `git stash` 风险高不用。**新建的整目录文件可整体 add**（如 `packages/ui/src/heatmap/`）。
2. **100% @hulian/ui，禁 demo 内 CSS 补丁/行为 hack**：demo 里要 override 才好用 = 组件缺口，回库修组件。
3. 新组件页面 import 一律走 `from "@hulian/ui"`（覆盖率脚本只认具名 import），不走深路径。
4. 组件零依赖优先、token 驱动配色（`bg-primary`/`text-success`/`text-danger`/`text-warning`/`text-muted` 等语义类）、纯几何/逻辑抽 `.ts` 文件可单测、尽量 RSC 安全（仅交互件加 `"use client"`）。
5. 中文交付。commit 用 `<type>(<scope>): <subject>`，末尾 `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`，**不 push**（本仓无 remote）。

## 新组件登记 5 处（每个新组件都要）

1. `packages/ui/src/<slug>/` 建目录：`index.ts` / `<slug>.tsx` / `<slug>.types.ts` / `<slug>.showcase.tsx` / `<slug>.test.tsx`（+ 可选纯函数 `.ts`）。
2. `packages/ui/src/index.ts` 加 `export * from "./<slug>";`（hunk 暂存）。
3. `packages/ui/src/showcase.ts` 加 `export { <name>Showcase } from "./<slug>/<slug>.showcase";`（hunk 暂存）。
4. `apps/www/lib/manifest.ts` 加 `{ slug, name, description, category, group, status: "new" }`（hunk 暂存）。
5. `apps/www/lib/registry.tsx` 加 import + `specBySlug["<slug>"] = <name>Showcase`（hunk 暂存）。

## 文件结构总览

```
packages/ui/src/
  code-diff/code-diff.tsx + .types.ts          ← 增强：annotations 行锚定槽 + gutter
  diff-stat/{index,diff-stat,diff-stat.types,diff-stat.split,diff-stat.showcase,diff-stat.test}
  score-ring/{index,score-ring,score-ring.types,score-ring.grade,score-ring.showcase,score-ring.test}
  heatmap/{index,heatmap,heatmap.types,heatmap.matrix,heatmap.showcase,heatmap.test}
  code-review-thread/{index,code-review-thread,*.types,*.severity,*.showcase,*.test}
apps/www/app/demos/hanreview/
  (app)/layout.tsx · page.tsx · reviews/page.tsx · reviews/[id]/page.tsx
  findings/page.tsx · gates/page.tsx · routing/page.tsx · settings/page.tsx
  login/page.tsx
  _components/{nav-config.ts, review-shell.tsx, + 各页子件}
  _data/{types,repos,models,reviews,findings,rules,metrics,members}.ts
  _lib/{quality-score,routing,gate}.ts (+ .test.ts) · use-review-run.ts
```

---

## Phase 0 — 增强 code-diff（承载行内批注）

### Task 0: code-diff 加 annotations 行锚定槽

**Files:**
- Modify: `packages/ui/src/code-diff/code-diff.types.ts`
- Modify: `packages/ui/src/code-diff/code-diff.tsx`
- Test: `packages/ui/src/code-diff/code-diff.test.tsx`（追加用例，保留旧测）

- [ ] **Step 1: 扩 types**

```ts
// code-diff.types.ts —— 追加
import type { ReactNode } from "react";

export interface CodeDiffAnnotation {
  /** 锚定到哪一侧的行号：new=新文件(add/context)，old=旧文件(del/context)。@default "new" */
  side?: "old" | "new";
  /** 行号（1-based，对应 oldNo/newNo）。 */
  line: number;
  /** 行号槽旁的标记（severity 圆点/图标）。 */
  gutter?: ReactNode;
  /** 在该 diff 行下方插入的整宽内容槽（放 CodeReviewThread）。 */
  content?: ReactNode;
}

export interface CodeDiffProps {
  oldText: string;
  newText: string;
  mode?: "unified" | "split";
  filename?: string;
  showLineNumbers?: boolean;
  /** 行锚定批注：在匹配行渲染 gutter 标记 + 行下方插入 content 槽。不传则行为不变。 */
  annotations?: CodeDiffAnnotation[];
  className?: string;
}
```

- [ ] **Step 2: 写失败测试**

```tsx
// code-diff.test.tsx —— 追加（注意现有文件可能无 import，按需补 render/screen）
import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CodeDiff } from "./code-diff";

describe("CodeDiff annotations", () => {
  it("在匹配的 new 行下方渲染 content 槽", () => {
    const { getByText } = render(
      <CodeDiff oldText={"a\nb"} newText={"a\nB"} annotations={[{ side: "new", line: 2, content: <span>批注X</span> }]} />,
    );
    expect(getByText("批注X")).toBeTruthy();
  });
  it("不传 annotations 时不渲染任何批注容器（向后兼容）", () => {
    const { container } = render(<CodeDiff oldText="a" newText="a" />);
    expect(container.querySelector("[data-cd-annotation]")).toBeNull();
  });
  it("gutter 标记渲染在行内", () => {
    const { getByText } = render(
      <CodeDiff oldText={"a"} newText={"a\nb"} annotations={[{ side: "new", line: 2, gutter: <i>●</i>, content: <span>c</span> }]} />,
    );
    expect(getByText("●")).toBeTruthy();
  });
});
```

- [ ] **Step 3: 运行测试确认失败** — `pnpm --filter @hulian/ui test code-diff` → annotations 用例 FAIL。

- [ ] **Step 4: 实现（仅 unified 模式支持 content 下插；split 模式至少不报错）**

在 `code-diff.tsx` 顶部加 helper + 改 unified 渲染：

```tsx
// 顶部加：按行匹配 annotation
function findAnno(annos: CodeDiffAnnotation[] | undefined, r: DiffRow) {
  if (!annos) return undefined;
  return annos.find((a) => {
    const side = a.side ?? "new";
    return side === "new" ? r.newNo === a.line : r.oldNo === a.line;
  });
}
```

unified 分支每行包成 `<div>` 片段，行 div 后条件插入 content：

```tsx
{rows.map((r, i) => {
  const anno = findAnno(annotations, r);
  return (
    <div key={i}>
      <div className={cn("flex whitespace-pre px-2 leading-relaxed", ROW_BG[r.type])}>
        {showLineNumbers && (<><Gutter no={r.oldNo} /><Gutter no={r.newNo} /></>)}
        {anno?.gutter && <span className="inline-flex w-4 shrink-0 items-center justify-center">{anno.gutter}</span>}
        <span className={cn("w-4 shrink-0 select-none text-center", SIGN_COLOR[r.type])}>{SIGN[r.type]}</span>
        <span className="text-foreground">{r.text || " "}</span>
      </div>
      {anno?.content && (
        <div data-cd-annotation className="border-y border-border bg-muted/5 px-2 py-2 font-sans">{anno.content}</div>
      )}
    </div>
  );
})}
```

> 注：gutter slot 只在有 anno.gutter 时占位，避免影响无批注行对齐（无批注时不渲染该 span）。若对齐有问题，gutter span 始终渲染（空内容）保持列宽一致——实现时实测取齐。split 模式本期不插 content（YAGNI），但要保证传 annotations 不抛错。

- [ ] **Step 5: 运行测试确认通过 + 旧测不挂** — `pnpm --filter @hulian/ui test code-diff` → all PASS。

- [ ] **Step 6: commit**（code-diff 目录整体 add 安全；types/tsx/test 都在该目录内）

```bash
git add packages/ui/src/code-diff/
git commit -m "feat(ui): code-diff 增加 annotations 行锚定批注槽 + gutter 标记"
```

---

## Phase 1 — 4 个新组件（TDD）

### Task 1: DiffStat

**Files:** `packages/ui/src/diff-stat/` 全套。category `data-display` / group `info`。

- [ ] **Step 1: 纯函数 + 失败测试** `diff-stat.split.ts`

```ts
// 按增删比例把 blocks 格分配为 [绿, 红, 空]，至少各 1 格（有增/删时），和 = blocks。
export function splitBlocks(additions: number, deletions: number, blocks: number): { green: number; red: number; empty: number } {
  const total = additions + deletions;
  if (total === 0) return { green: 0, red: 0, empty: blocks };
  let green = Math.round((additions / total) * blocks);
  if (additions > 0 && green === 0) green = 1;
  let red = blocks - green;
  if (deletions > 0 && red === 0 && green > 1) { red = 1; green -= 1; }
  if (deletions === 0) red = 0;
  if (additions === 0) { green = 0; red = Math.min(blocks, blocks); }
  const empty = Math.max(0, blocks - green - red);
  return { green, red, empty };
}
```

```ts
// diff-stat.test.tsx 中先测纯函数
import { describe, it, expect } from "vitest";
import { splitBlocks } from "./diff-stat.split";
describe("splitBlocks", () => {
  it("全增满绿", () => { const r = splitBlocks(10, 0, 5); expect(r.green).toBe(5); expect(r.red).toBe(0); });
  it("增删对半", () => { const r = splitBlocks(5, 5, 4); expect(r.green + r.red).toBeLessThanOrEqual(4); expect(r.green).toBeGreaterThan(0); expect(r.red).toBeGreaterThan(0); });
  it("零改动全空", () => { expect(splitBlocks(0, 0, 5)).toEqual({ green: 0, red: 0, empty: 5 }); });
});
```

- [ ] **Step 2: 运行确认失败** — `pnpm --filter @hulian/ui test diff-stat`。

- [ ] **Step 3: types + 组件**

```ts
// diff-stat.types.ts
export type DiffStatStatus = "added" | "modified" | "deleted" | "renamed";
export interface DiffStatProps {
  additions: number;
  deletions: number;
  status?: DiffStatStatus;
  blocks?: number;       // 默认 5
  showCounts?: boolean;  // 默认 true
  size?: "sm" | "md";
  className?: string;
}
```

```tsx
// diff-stat.tsx
import { cn } from "../lib/cn";
import { splitBlocks } from "./diff-stat.split";
import type { DiffStatProps, DiffStatStatus } from "./diff-stat.types";

const STATUS_LABEL: Record<DiffStatStatus, string> = { added: "新增", modified: "修改", deleted: "删除", renamed: "重命名" };
const STATUS_TONE: Record<DiffStatStatus, string> = {
  added: "text-success bg-success/10", modified: "text-warning bg-warning/10",
  deleted: "text-danger bg-danger/10", renamed: "text-info bg-info/10",
};

export function DiffStat({ additions, deletions, status, blocks = 5, showCounts = true, size = "md", className }: DiffStatProps) {
  const { green, red, empty } = splitBlocks(additions, deletions, blocks);
  const box = size === "sm" ? "size-1.5" : "size-2";
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs tabular-nums", className)}>
      {status && <span className={cn("rounded px-1 py-0.5 text-[10px] font-medium", STATUS_TONE[status])}>{STATUS_LABEL[status]}</span>}
      {showCounts && (<span className="space-x-1"><span className="text-success">+{additions}</span><span className="text-danger">−{deletions}</span></span>)}
      <span className="inline-flex gap-0.5" aria-hidden>
        {Array.from({ length: green }).map((_, i) => <span key={`g${i}`} className={cn(box, "rounded-[2px] bg-success")} />)}
        {Array.from({ length: red }).map((_, i) => <span key={`r${i}`} className={cn(box, "rounded-[2px] bg-danger")} />)}
        {Array.from({ length: empty }).map((_, i) => <span key={`e${i}`} className={cn(box, "rounded-[2px] bg-surface-hover")} />)}
      </span>
    </span>
  );
}
```

```ts
// index.ts
export { DiffStat } from "./diff-stat";
export { splitBlocks } from "./diff-stat.split";
export type { DiffStatProps, DiffStatStatus } from "./diff-stat.types";
```

- [ ] **Step 4: 补渲染测试**（追加到 diff-stat.test.tsx）

```tsx
import { render } from "@testing-library/react";
import { DiffStat } from "./diff-stat";
describe("DiffStat", () => {
  it("显示 +N −M", () => { const { container } = render(<DiffStat additions={12} deletions={3} />); expect(container.textContent).toContain("+12"); expect(container.textContent).toContain("−3"); });
  it("status 徽标", () => { const { getByText } = render(<DiffStat additions={1} deletions={0} status="added" />); expect(getByText("新增")).toBeTruthy(); });
  it("格子条总数 = blocks", () => { const { container } = render(<DiffStat additions={3} deletions={2} blocks={5} />); expect(container.querySelectorAll(".rounded-\\[2px\\]").length).toBe(5); });
});
```

- [ ] **Step 5: showcase** `diff-stat.showcase.tsx`（参照 status-dot.showcase 结构：controls + states + renderWithProps + toCode）。controls: additions(number)/deletions(number)/status(select)/blocks(number)。states: 全增 / 全删 / 混合 / 新增文件 / 删除文件。

- [ ] **Step 6: 运行测试全绿** — `pnpm --filter @hulian/ui test diff-stat`。

- [ ] **Step 7: 登记 4 处**（index.ts ✓已在目录内；showcase.ts / manifest.ts / registry.tsx 三处 hunk 暂存）
  - manifest 条目：`{ slug: "diff-stat", name: "DiffStat", description: "改动统计条 · +N −M 绿红格子条按比例填充 + A/M/D/R 状态徽标(代码审查/PR 列表刚需·纯函数 splitBlocks 可测·零依赖·RSC)", category: "data-display", group: "info", status: "new" }`

- [ ] **Step 8: commit**

```bash
git add packages/ui/src/diff-stat/
git add -p packages/ui/src/showcase.ts apps/www/lib/manifest.ts apps/www/lib/registry.tsx   # 只选自己 hunk
git commit -m "feat(ui): 新增 DiffStat 改动统计条组件"
```

### Task 2: ScoreRing

**Files:** `packages/ui/src/score-ring/` 全套。category `data-display` / group `info`。SVG 圆环用 stroke-dasharray（**禁 CSS transform 控进度**）。

- [ ] **Step 1: 纯函数 + 测试** `score-ring.grade.ts`

```ts
export interface Grade { min: number; label: string; tone?: string; }
export const DEFAULT_GRADES: Grade[] = [
  { min: 90, label: "A", tone: "var(--color-success)" },
  { min: 80, label: "B", tone: "var(--color-success)" },
  { min: 70, label: "C", tone: "var(--color-warning)" },
  { min: 60, label: "D", tone: "var(--color-warning)" },
  { min: 0,  label: "F", tone: "var(--color-danger)" },
];
/** 命中第一个 value>=min 的等级（grades 须按 min 降序）。 */
export function resolveGrade(value: number, grades: Grade[] = DEFAULT_GRADES): Grade {
  const sorted = [...grades].sort((a, b) => b.min - a.min);
  return sorted.find((g) => value >= g.min) ?? sorted[sorted.length - 1];
}
```

```ts
// 测试：resolveGrade(95)->A, 72->C, 40->F
```

- [ ] **Step 2-3: 运行失败 → types + 组件**

```ts
// score-ring.types.ts
import type { ReactNode } from "react";
import type { Grade } from "./score-ring.grade";
export interface ScoreRingProps {
  value: number; max?: number;       // 默认 100
  grades?: Grade[];
  size?: number;                     // px，默认 96
  thickness?: number;                // px，默认 8
  label?: ReactNode;                 // 环心副标签
  showGrade?: boolean;               // 默认 true
  className?: string;
}
```

```tsx
// score-ring.tsx —— SVG dasharray 填充（dashoffset 控进度，非 transform）
import { cn } from "../lib/cn";
import { resolveGrade, DEFAULT_GRADES } from "./score-ring.grade";
import type { ScoreRingProps } from "./score-ring.types";
export function ScoreRing({ value, max = 100, grades = DEFAULT_GRADES, size = 96, thickness = 8, label, showGrade = true, className }: ScoreRingProps) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const grade = resolveGrade(value, grades);
  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} className="stroke-surface-hover" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={thickness} strokeLinecap="round"
          stroke={grade.tone} strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div>
          <div className="text-xl font-bold tabular-nums text-foreground">{Math.round(value)}</div>
          {showGrade && <div className="mt-0.5 text-xs font-semibold" style={{ color: grade.tone }}>{grade.label}</div>}
          {label && <div className="mt-0.5 text-[11px] text-muted">{label}</div>}
        </div>
      </div>
    </div>
  );
}
```

```ts
// index.ts: export { ScoreRing }; export { resolveGrade, DEFAULT_GRADES }; export type { ScoreRingProps }; export type { Grade } from "./score-ring.grade";
```

- [ ] **Step 4: 渲染测试** —— 渲染分值文字、命中等级字、两个 circle（背景+前景）、前景 stroke-dashoffset 存在且 className 不含 transform 进度类。
- [ ] **Step 5: showcase** —— states: 95(A)/82(B)/68(C)/45(F) + 小尺寸 + 自定义 grades。
- [ ] **Step 6: 测试全绿。**
- [ ] **Step 7: 登记**（manifest: `{ slug:"score-ring", name:"ScoreRing", description:"评分环 · 半径仪表盘 + A-F 等级带(value→grade tone 映射) + 环心分值/等级(区别线性 Meter/Progress·SVG dasharray 非 transform·纯函数 resolveGrade 可测·RSC)", category:"data-display", group:"info", status:"new" }`）
- [ ] **Step 8: commit** `feat(ui): 新增 ScoreRing 评分环组件`（diff-stat 同款 hunk 暂存流程）。

### Task 3: Heatmap

**Files:** `packages/ui/src/heatmap/` 全套。category `data-display` / group `collection`。

- [ ] **Step 1: 纯函数 + 测试** `heatmap.matrix.ts`

```ts
export interface HeatCell<X = string | number, Y = string | number> { x: X; y: Y; value: number; }
/** 推导/规整行列标签 + 构建 (y,x)->value 查找。 */
export function buildMatrix(data: HeatCell[], xLabels?: (string | number)[], yLabels?: (string | number)[]) {
  const xs = xLabels ?? [...new Set(data.map((d) => d.x))];
  const ys = yLabels ?? [...new Set(data.map((d) => d.y))];
  const map = new Map<string, number>();
  for (const d of data) map.set(`${d.y}|${d.x}`, d.value);
  return { xs, ys, get: (y: string | number, x: string | number) => map.get(`${y}|${x}`) ?? 0 };
}
/** value→色阶档位 [0..scale]（0 表示无/最浅）。 */
export function bucketize(value: number, max: number, scale: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.max(1, Math.min(scale, Math.ceil((value / max) * scale)));
}
```

```ts
// 测试：buildMatrix.get 命中/缺省 0；bucketize(0,..)->0, bucketize(max,max,5)->5, 中间值落档。
```

- [ ] **Step 2-3: 失败 → types + 组件**

```ts
// heatmap.types.ts
import type { ReactNode } from "react";
import type { HeatCell } from "./heatmap.matrix";
export interface HeatmapProps {
  data: HeatCell[];
  xLabels?: (string | number)[];
  yLabels?: (string | number)[];
  colorScale?: number;   // 默认 5
  max?: number;          // 不传取数据最大
  cellSize?: number;     // px，默认 14
  gap?: number;          // px，默认 3
  showLabels?: boolean;  // 默认 true
  renderTooltip?: (cell: { x: string | number; y: string | number; value: number }) => ReactNode;
  onCellClick?: (cell: { x: string | number; y: string | number; value: number }) => void;
  className?: string;
}
```

```tsx
// heatmap.tsx —— CSS grid + 色阶 token（由浅到深用 primary 透明度档）
"use client";
import { cn } from "../lib/cn";
import { Tooltip } from "../tooltip";   // 实测 Tooltip 导出名/用法，按库实际签名调整
import { buildMatrix, bucketize } from "./heatmap.matrix";
import type { HeatmapProps } from "./heatmap.types";

// 色阶：bucket 0..scale → primary 透明度（0 用最浅 surface-hover）
const bucketStyle = (bucket: number, scale: number): string => {
  if (bucket === 0) return "var(--color-surface-hover)";
  const alpha = 0.18 + (bucket / scale) * 0.82;
  return `color-mix(in oklch, var(--color-primary) ${Math.round(alpha * 100)}%, transparent)`;
};

export function Heatmap({ data, xLabels, yLabels, colorScale = 5, max, cellSize = 14, gap = 3, showLabels = true, renderTooltip, onCellClick, className }: HeatmapProps) {
  const { xs, ys, get } = buildMatrix(data, xLabels, yLabels);
  const realMax = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className={cn("inline-block overflow-x-auto", className)}>
      <div className="inline-grid" style={{ gridTemplateColumns: `${showLabels ? "auto " : ""}repeat(${xs.length}, ${cellSize}px)`, gap }}>
        {/* 行：可选 y 标签 + 各 x 格 */}
        {ys.map((y) => (
          <div key={`row-${y}`} className="contents">
            {showLabels && <span className="pr-2 text-right text-[10px] leading-none text-muted self-center">{y}</span>}
            {xs.map((x) => {
              const v = get(y, x);
              const bucket = bucketize(v, realMax, colorScale);
              const cellEl = (
                <button type="button" key={`${y}-${x}`} onClick={onCellClick ? () => onCellClick({ x, y, value: v }) : undefined}
                  className="rounded-[2px] outline-none ring-primary focus-visible:ring-2" style={{ width: cellSize, height: cellSize, background: bucketStyle(bucket, colorScale) }}
                  aria-label={`${y} ${x}: ${v}`} />
              );
              return renderTooltip ? <Tooltip key={`${y}-${x}`} content={renderTooltip({ x, y, value: v })}>{cellEl}</Tooltip> : cellEl;
            })}
          </div>
        ))}
        {/* 底部 x 标签行（可选） */}
      </div>
    </div>
  );
}
```

> 实现注意：先查 `Tooltip` 在 @hulian/ui 的真实 API（`content` prop 还是 children 组合）。若 Tooltip 包裹增加复杂度，可先不强依赖 Tooltip，用原生 `title` 属性兜底，showcase 再演示 renderTooltip。**禁为对齐打 hack**——grid `contents` 行模式实测取齐，不行就换显式二维 grid。

- [ ] **Step 4: 渲染测试** —— 格子数 = xs*ys；value 高的格 background alpha 更高（或 bucketize 已单测，渲染只验格子数 + onCellClick 触发 + aria-label）。
- [ ] **Step 5: showcase** —— states: 贡献热力(7×N)/模块×周问题密度/覆盖率；renderWithProps 控 colorScale/cellSize。
- [ ] **Step 6: 测试全绿。**
- [ ] **Step 7: 登记**（manifest: `{ slug:"heatmap", name:"Heatmap", description:"热力图 · 网格色阶映射(value→bucket→primary 透明度档) + 行列标签 + hover tooltip + 点击下钻(代码热点/贡献活动/覆盖率·库内首个热力图·纯函数 buildMatrix/bucketize 可测)", category:"data-display", group:"collection", status:"new" }`）
- [ ] **Step 8: commit** `feat(ui): 新增 Heatmap 热力图组件`。

### Task 4: CodeReviewThread（旗舰）

**Files:** `packages/ui/src/code-review-thread/` 全套。category `data-display` / group `collection`。复用 Avatar / Tag / Button / Textarea / CodeDiff。

- [ ] **Step 1: 纯函数 + 测试** `code-review-thread.severity.ts`

```ts
export type ReviewSeverity = "critical" | "major" | "minor" | "info";
export interface SeverityStyle { label: string; tone: string; border: string; }
export const SEVERITY: Record<ReviewSeverity, SeverityStyle> = {
  critical: { label: "严重", tone: "text-danger bg-danger/10", border: "border-l-danger" },
  major:    { label: "重要", tone: "text-warning bg-warning/10", border: "border-l-warning" },
  minor:    { label: "次要", tone: "text-info bg-info/10", border: "border-l-info" },
  info:     { label: "提示", tone: "text-muted bg-muted/10", border: "border-l-border" },
};
export function severityStyle(s?: ReviewSeverity): SeverityStyle { return s ? SEVERITY[s] : SEVERITY.info; }
```

- [ ] **Step 2-3: 失败 → types + 组件**

```ts
// code-review-thread.types.ts
import type { ReactNode } from "react";
import type { ReviewSeverity } from "./code-review-thread.severity";
export interface ReviewComment {
  id: string;
  author: { name: string; avatar?: string; kind: "ai" | "human" };
  severity?: ReviewSeverity;
  body: ReactNode;
  time?: ReactNode;
  suggestion?: { oldText?: string; newText: string };
}
export type ReviewThreadStatus = "open" | "resolved" | "wontfix";
export interface CodeReviewThreadProps {
  comments: ReviewComment[];
  status?: ReviewThreadStatus;
  onStatusChange?: (s: ReviewThreadStatus) => void;
  onReply?: (text: string) => void;
  onAdoptSuggestion?: (commentId: string) => void;
  replyable?: boolean;          // 默认 true
  defaultCollapsed?: boolean;
  collapsed?: boolean;          // 受控
  onCollapsedChange?: (v: boolean) => void;
  className?: string;
}
```

组件要点（`"use client"`）：
- severity 左边色条（`border-l-4` + severityStyle.border）。
- 每条评论：Avatar + 作者名 + AI 作者带机器人标(Tag tone=info "AI")+ time + severity Tag + body。
- `suggestion` 渲染内嵌建议 diff：`<CodeDiff oldText={suggestion.oldText ?? ""} newText={suggestion.newText} />` + 「采纳建议」Button → onAdoptSuggestion(comment.id)。
- 顶部右侧 status 操作：open 显「标记已解决」「标记误报」；resolved/wontfix 显状态 Tag + 「重新打开」。
- 折叠：collapsed 时只显首条摘要 + 展开按钮（受控 collapsed 优先，否则内部 useState(defaultCollapsed)）。
- 回复：replyable && !collapsed 时底部 Textarea + 「回复」Button → onReply(text) 后清空（内部 useState 管输入）。
- **复用既有组件**，先 grep 确认 Avatar/Tag/Button/Textarea 的真实 props（如 Tag 的 tone 取值集），按实际签名写。

- [ ] **Step 4: 测试**（severity 纯函数测 + 组件：渲染 N 条评论、suggestion diff、点采纳触发 onAdoptSuggestion、点已解决触发 onStatusChange("resolved")、折叠态只显首条、回复输入+提交触发 onReply）。用 `@testing-library/user-event` 或 fireEvent（看现有测试用哪个，diff-stat 同步）。
- [ ] **Step 5: showcase** —— states: 单条AI严重批注带建议 / 多条对话 / 已解决态 / 折叠态 / 人类+AI 混合。
- [ ] **Step 6: 测试全绿。**
- [ ] **Step 7: 登记**（manifest: `{ slug:"code-review-thread", name:"CodeReviewThread", description:"代码审查评论线程 · 行锚定批注卡(severity 左边色条+四级语气) + AI/人类作者 + 内嵌建议修改 diff 可采纳 + 回复/标记已解决·误报 + 折叠(嵌 code-diff annotations 槽或独立用·复用 Avatar/Tag/CodeDiff)", category:"data-display", group:"collection", status:"new" }`）
- [ ] **Step 8: commit** `feat(ui): 新增 CodeReviewThread 代码审查评论线程组件（旗舰）`。

- [ ] **Phase 1 收尾：跑全量组件测试** `pnpm --filter @hulian/ui test` 全绿（含旧测无回归）。

---

## Phase 2 — Mock 数据 + _lib 纯函数

### Task 5: 类型 + 纯函数（quality-score / routing / gate）+ 单测

**Files:** `app/demos/hanreview/_data/types.ts` + `_lib/{quality-score,routing,gate}.ts` + 各 `.test.ts`。
> demo 内 `_lib` 测试放 demo 旁，跑 `pnpm --filter www test`（确认 www 有 vitest；若无，则纯函数测试放进对应方式——先查 `apps/www/package.json` test 脚本）。

- [ ] **Step 1: types.ts** —— 定义 `Repo / ReviewModel / Review / ChangedFile / Finding / RoutingRule / GateRule` 等接口（字段见 spec §5）。`Finding`: `{ id; severity; type; rule; file; line; reviewId; status; firstSeen }`。`Review`: `{ id; repo; branch; title; author; files: ChangedFile[]; score; gate; modelId; cost; status; createdAt }`。
- [ ] **Step 2: quality-score.ts + 测试**

```ts
import type { ReviewSeverity } from "@hulian/ui"; // 若未导出该类型则本地定义同名联合
const WEIGHT: Record<string, number> = { critical: 25, major: 10, minor: 4, info: 1 };
export function qualityScore(counts: Record<string, number>): number {
  const penalty = Object.entries(counts).reduce((s, [k, n]) => s + (WEIGHT[k] ?? 0) * n, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}
// 测试：无问题=100；1 critical=75；超额 clamp 0。
```

- [ ] **Step 3: routing.ts + 测试** —— 输入文件特征 → 命中规则 → 选模型 + 理由 + 预估成本。

```ts
export interface FileFeature { lang: string; lines: number; securitySensitive: boolean; isTestOrConfig: boolean; }
export interface RouteDecision { modelId: string; reason: string; estCost: number; }
export function routeFile(f: FileFeature, opts: { costCap: number }): RouteDecision {
  if (f.isTestOrConfig) return { modelId: "haiku", reason: "测试/配置文件 → 经济模型", estCost: 0.002 };
  if (f.securitySensitive) return { modelId: "opus", reason: "安全敏感 → 最强模型", estCost: 0.04 };
  if (f.lines > 300) return { modelId: "sonnet", reason: "大文件 → 均衡模型", estCost: 0.012 };
  return { modelId: "sonnet", reason: "默认 → 均衡模型", estCost: 0.01 };
}
// 测试：测试文件→haiku；安全敏感→opus；大文件→sonnet。
```

- [ ] **Step 4: gate.ts + 测试**

```ts
export interface GateThreshold { minScore: number; maxCritical: number; minCoverage: number; }
export interface GateInput { score: number; criticalCount: number; coverage: number; }
export function evalGate(t: GateThreshold, x: GateInput): { pass: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (x.score < t.minScore) reasons.push(`质量分 ${x.score} 低于门禁 ${t.minScore}`);
  if (x.criticalCount > t.maxCritical) reasons.push(`严重问题 ${x.criticalCount} 超过上限 ${t.maxCritical}`);
  if (x.coverage < t.minCoverage) reasons.push(`覆盖率 ${x.coverage}% 低于 ${t.minCoverage}%`);
  return { pass: reasons.length === 0, reasons };
}
// 测试：全达标 pass；分低于阈值 block + reason；多项失败聚合 reasons。
```

- [ ] **Step 5: 跑 _lib 测试全绿。**
- [ ] **Step 6: mock 数据文件**（repos/models/reviews/findings/rules/metrics/members）—— 真实感数据：
  - 3-4 个仓库、5-6 个审查模型（Haiku/Sonnet/Opus/DeepSeek，带 grounded 价位）。
  - 8-12 条审查记录，至少 2 条 detail 用：每条带 2-4 个 ChangedFile（真实 TS/JS/Py diff 文本 + 锚定行批注 + suggestion）、score（用 qualityScore 算）、gate（用 evalGate 算）、modelId、cost、AI 过程帧（tool-call eslint/jest 结果 + thinking 文本）。
  - findings 30-40 条覆盖各 severity/type/status。
  - metrics：30 日质量分序列 + 模块×周问题密度矩阵（喂 Heatmap）+ severity 分布。
- [ ] **Step 7: commit** `feat(www): hanreview demo mock 数据 + 质量分/路由/门禁纯函数`（demo 目录整体 add，无共享文件污染）。

---

## Phase 3 — Demo 外壳 + 7 页 + login

> 外壳先行，再分页 dogfood。页面间弱耦合，**可并行派 ≤3 subagent**（注意 CLAUDE.md agent 预算；或单会话顺序建）。每页建完用 CDP 实机截图验证零 console error。

### Task 6: 外壳 + 导航 + login

**Files:** `_components/nav-config.ts`、`_components/review-shell.tsx`、`(app)/layout.tsx`、`login/page.tsx`。
- [ ] nav-config.ts：`ROOT="/demos/hanreview"` + NAV（概览/审查队列/问题中心/质量门禁/智能路由/设置）+ activeKey（照 ai-workflow，详情页 `/reviews/[id]` 归属审查队列）。
- [ ] review-shell.tsx：用 `AdminLayout`（照 `app/demos/crm/_components/crm-shell.tsx` 范式：把 AdminLayout 受控 selected/tabs 绑 Next 路由 router.push）。品牌「瀚审 HanReview」。先读 crm-shell 全文照搬骨架。
- [ ] layout.tsx：`(app)` 组 layout 包 ReviewShell。
- [ ] login/page.tsx：复用 LoginForm 组件（照其它 demo 的 login 页）。
- [ ] CDP 截图 login + 任一空页验证外壳渲染。
- [ ] commit `feat(www): hanreview 外壳 + 导航 + 登录页`。

### Task 7: 概览 Dashboard `(app)/page.tsx`
组件：Stat/NumberTicker/ScoreRing(迷你)/Chart/**Heatmap**/StatusDot/List/Banner/meter。内容见 spec §3.1。
- [ ] 建页 + 子件（KPI 卡组 / 趋势图 / severity 分布 / 热点 Heatmap / 成本卡 / 最近审查流 / 预算 Banner）。
- [ ] CDP 截图验证（亮+暗）零 error。commit。

### Task 8: 审查队列 `reviews/page.tsx`
组件：ProTable/**DiffStat**/Tag/**ScoreRing**(迷你)/StatusDot/Avatar/Segmented/SearchForm。
- [ ] ProTable 列含 DiffStat 改动规模、ScoreRing 迷你分、模型+成本；顶部 Segmented 分段筛选；行「查看详情」跳 `/reviews/[id]`。
- [ ] CDP 截图 + commit。

### Task 9: 审查详情 `reviews/[id]/page.tsx`（旗舰，server + client 拆分）
> `output:export` 动态路由：`page.tsx` 为 server 组件，`export function generateStaticParams()` 返回所有 review id，渲染 client 子件 `_components/review-detail.tsx`。
组件：FileTree/**DiffStat**/增强 **CodeDiff(annotations)** + **CodeReviewThread**/agent-plan/tool-call/thinking-block/streaming-text/**ScoreRing**(大)/Banner/List/Spin。
- [ ] server page：generateStaticParams + 取 mock review 传给 client 子件。
- [ ] client review-detail：三栏（左文件树+DiffStat / 中 CodeDiff 嵌 CodeReviewThread 到 annotations.content / 右 AI 过程 + ScoreRing + 问题汇总）+ 顶部门禁 Banner。
- [ ] use-review-run.ts：mock 审查中拓扑推进点亮右栏过程帧（可选，详情页若展示"审查中"态）。
- [ ] CDP 截图 + 交互（展开批注、采纳建议）零 error。commit。

### Task 10: 问题中心 `findings/page.tsx`
组件：ProTable/StatusDot/Tag/code-block/Drawer/code-diff(suggestion)/Checkbox(批量)。
- [ ] ProTable + 查询区 + 行 Drawer（问题代码 code-block 行高亮 + 规则说明 + 建议 code-diff + 处理动作）+ 批量操作 + 顶部 severity 统计条。
- [ ] CDP 截图 + commit。

### Task 11: 质量门禁 `gates/page.tsx`
组件：Form/Switch/NumberField/Slider/**ScoreRing**/FormDialog/Card。
- [ ] 门禁规则卡 + 规则集开关 + **门禁模拟器**（Slider 拖阈值 → evalGate 重算"最近 N 次会阻断 M 次"）+ 新建/编辑 FormDialog。
- [ ] CDP 截图 + commit。

### Task 12: 智能路由 `routing/page.tsx`（中等占位，复用 Flow）
组件：Grid/meter/Choicebox/List/**Flow**(复用)/Chart/Table/Tag。
- [ ] 模型池卡 + 路由策略列表(routeFile 驱动) + **Flow 分发流向**(文件类型节点→路由器→模型节点，受控只读) + 路由决策回放(选一次审查逐文件 Table + 成本vs质量 Chart 散点)。
- [ ] 先读 `app/demos/ai-workflow` 里 Flow 的真实用法（nodes/edges 受控 props）照搬。
- [ ] CDP 截图 + commit。

### Task 13: 设置 `settings/page.tsx`
组件：Form/**SecretField**(复用，已在库)/List/Avatar/Tag/Switch/Choicebox/NumberField/meter。
- [ ] 接入仓库(SecretField 掩码 token + 仓库 List+StatusDot) + 团队成员 + 通知 + AI 预算(NumberField + meter + 超额策略)。
- [ ] CDP 截图 + commit。

---

## Phase 4 — 注册 + 验证 + 收尾

### Task 14: 注册 demo + 全量验证
- [ ] **demos.ts 加 hanreview 条目**（hunk 暂存，文件带他会话 WIP）：

```ts
{
  slug: "hanreview",
  title: "瀚审 HanReview AI 代码审查质检平台",
  description: "PR/提交进来 → AI 审查员(带智能选模型)逐文件审 → 行内批注问题、给质量分、跑质量门禁 —— 100% 由 @hulian/ui 搭建的研发质量中枢。点亮全新 CodeReviewThread 行内批注线程、Heatmap 代码热点、ScoreRing 质量分环、DiffStat 改动条，并增强 code-diff 行锚定批注，含审查过程回放、门禁模拟器与智能路由分发流向。",
  href: "/demos/hanreview",
  category: "中后台",
  status: "done",
  tags: ["CodeReviewThread", "code-diff", "Heatmap", "ScoreRing", "代码审查", "质量门禁"],
},
```

- [ ] **组件全量测试** `pnpm --filter @hulian/ui test` 全绿。
- [ ] **类型检查/构建**：`pnpm --filter @hulian/ui build`（或 typecheck）+ `pnpm --filter www build`（确认 output:export 通过、generateStaticParams 正确）。
- [ ] **覆盖率** `node apps/www/scripts/demos-coverage.mjs` —— 确认 4 新组件 + code-diff 被点亮、覆盖率不降（理想升）。
- [ ] **画廊 doc 页**：起 `pnpm --filter www dev`，CDP 访问 4 新组件 doc 页（/components/diff-stat 等）零 console error。
- [ ] **demo 实机像素自证**：CDP 隔离 Chrome-for-Testing 逐页截图（7 页 + login，亮/暗）+ 关键交互（批注展开/采纳、门禁滑块、路由回放、Heatmap hover、ScoreRing 等级）零 console error。
  - 用独立 chromium executablePath 避 MCP 争用 + 避免反复起新 profile 弹钥匙串（见 memory）。
  - 若 headless 截图全空白，走真实浏览器/Playwright MCP（见 memory：www-msw-gate-blanks）。
- [ ] commit `feat(www): 注册瀚审 HanReview demo + 覆盖率验证`（demos.ts hunk 暂存）。

### Task 15: 收尾
- [ ] 复查无 demo 内 CSS 补丁/hack；无 `from "@hulian/ui/..."` 深路径 import。
- [ ] 更新 memory（hulian-phase-status 追加本 demo + 4 组件）。
- [ ] 汇总通知用户：建了什么、新增组件、覆盖率变化、自证截图、未 push。

---

## 自检（spec 覆盖）

- spec §3 七页 → Task 6-13 ✓
- spec §4.0 code-diff 增强 → Task 0 ✓
- spec §4.1-4.4 四组件 → Task 1-4 ✓
- spec §5 mock + 纯函数 → Task 5 ✓
- spec §6 验证策略 → Task 14 ✓
- spec §7 实现顺序 → Phase 0-4 顺序一致 ✓
- 类型一致性：splitBlocks / resolveGrade / buildMatrix·bucketize / severityStyle / qualityScore / routeFile / evalGate 签名在引用处一致 ✓
- 风险点已标注：Tooltip 真实 API、Tag/Avatar/Textarea 真实 props、Flow 受控用法、www 是否有 vitest、AdminLayout 受控绑路由——均要求"先 grep/读真实签名再写"，不臆造。
```
