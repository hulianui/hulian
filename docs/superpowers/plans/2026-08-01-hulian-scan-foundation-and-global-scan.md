# Hulian Scan 工具与首次全量扫描 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建仅供 HulianUI 仓库内部使用的 `hulian-scan`，在真实 Chromium 和 packed tarball 消费环境中完成全部公开组件的首轮可恢复扫描，并输出完整 inventory、findings、基线与后续源码优化计划。

**Architecture:** `packages/hulian-scan` 隔离 React Scan Lite adapter、采集、归因、预算和报告；`apps/perf-lab` 在 React 启动前安装采集器，并以 production profiling build 执行无诊断测量，对失败场景再用 development React 归因。自动 inventory 从 `@hulianui/ui` 的公开 exports、barrel 与 showcase 事实生成；workspace 用于定位，仓库外 tarball consumer 用于发布形态结论。

**Tech Stack:** React 19.2.8、React DOM profiling build、TypeScript 7、Vite 7.3.6、Tailwind CSS 4.3.3、Vitest 3、Playwright 1.62、`react-scan/lite` 0.5.7、Node 22.22.2、pnpm 8.15.5。

## Global Constraints

- 本工具只供 HulianUI 仓库内部使用；`packages/hulian-scan/package.json` 必须始终包含 `"private": true`，不得加入 `@hulianui/ui` 的 exports、dependencies 或运行时代码。
- 当前有国际化与修 Bug 两个并发会话。每个任务开始前运行 `git status --short` 和 `git log --oneline -3`；不得恢复、覆盖或暂存其他会话的文件。
- 本计划独占路径为 `packages/hulian-scan/**`、`apps/perf-lab/**`、`scripts/hulian-scan.mjs`、`scripts/performance-*.{json,sh}`、`.hulian-scan/**` 与本计划新增的性能文档。
- `package.json`、`pnpm-lock.yaml`、`.gitignore`、`.github/workflows/ci.yml` 是并发高冲突文件；修改前必须重新读取当前内容，只做最小补丁，并用显式路径 `git add`。
- 第一轮是全部公开组件的全量普查；可以分批和 checkpoint 恢复，但不得抽样、静默跳过或用 Top N 截断 findings。
- 计时阶段只使用 production profiling build；development React 与深度归因只能运行在第二阶段，其耗时不得写入基线。
- React Scan 0.5.7 的字段只能出现在 `src/adapter/**`；collector、analyzer、report 和场景不得直接导入 `react-scan` 或 Bippy 类型。
- 统计时间回归默认必须同时满足相对增长 `> 20%` 与绝对增加 `>= 2 ms`；确定性违规不依赖机器速度。
- React 19 执行完整门禁；React 18 只执行每周和发布前兼容性 smoke，不维护第二套时间基线。
- workspace 报告只作定位证据；最终发布形态结论必须来自仓库外安装 `@hulianui/tokens` 与 `@hulianui/ui` tarball 的 consumer 扫描。
- 不自动向组件批量写入 `memo`、`useMemo` 或 `useCallback`；本计划先完成扫描证据，扫描后另写精确到真实问题文件的源码优化计划。
- 每次提交前运行该任务指定测试，并检查 `git diff --cached --name-only` 只包含本任务拥有的文件。

---

## File Map

### Internal scanner package

- `packages/hulian-scan/package.json` — 私有包边界、命令与固定上游版本。
- `packages/hulian-scan/tsconfig.json` — Node 与浏览器共享的严格 TypeScript 配置。
- `packages/hulian-scan/vitest.config.ts` — scanner 单元与集成测试配置。
- `packages/hulian-scan/src/contracts.ts` — 上游无关的事件、场景、预算、finding 与报告契约。
- `packages/hulian-scan/src/adapter/react-scan-lite.ts` — 唯一的 `react-scan/lite` 适配边界。
- `packages/hulian-scan/src/collector/collector.ts` — commit、render、interaction、long-task 与 frame 样本采集。
- `packages/hulian-scan/src/analyzer/statistics.ts` — median、P95、MAD 与有限数校验。
- `packages/hulian-scan/src/analyzer/budgets.ts` — 硬门禁和相对/绝对双阈值。
- `packages/hulian-scan/src/diagnosis/compare.ts` — 有界、安全的引用与深值变化分类。
- `packages/hulian-scan/src/diagnosis/diagnose.ts` — flagged Fiber 和 owner 级联归因。
- `packages/hulian-scan/src/report/report.ts` — JSON、终端摘要和 Markdown 报告。
- `packages/hulian-scan/src/report/checkpoint.ts` — 环境绑定的 checkpoint 写入与恢复。
- `packages/hulian-scan/src/inventory/inventory.ts` — 公开入口和 showcase 的 AST inventory。
- `packages/hulian-scan/src/runner/run-scan.ts` — 两阶段浏览器编排、批次与重试。
- `packages/hulian-scan/src/cli.ts` — `scan`、`scan:ci`、`scan:update` 参数与退出码。
- `packages/hulian-scan/src/index.ts` — 仅仓库内部消费的稳定导出。

### Performance lab

- `apps/perf-lab/package.json`、`tsconfig.json`、`vite.config.ts`、`vitest.config.ts`、`index.html` — 独立 Vite 浏览器实验室。
- `apps/perf-lab/app/bootstrap.ts` — 在任何 React import 前安装 adapter。
- `apps/perf-lab/app/main.tsx`、`harness.tsx`、`window-api.ts`、`styles.css` — 单场景挂载、真实 Tailwind 样式和 Playwright 控制面。
- `apps/perf-lab/fixtures/known-good.tsx`、`known-bad.tsx` — 能证明门禁通过/失败的固定 fixture。
- `apps/perf-lab/scenarios/contract.ts`、`generic.tsx`、`generated.ts` — 场景契约、通用场景和自动生成映射。
- `apps/perf-lab/scenarios/specialized/*.tsx` — 重型、交互和持续动画的专用场景。

### Root integration and evidence

- `scripts/hulian-scan.mjs` — 根命令到私有包 CLI 的无依赖转发器。
- `scripts/performance-budgets.json` — 人工维护、只读的分类预算。
- `scripts/performance-baseline.json` — 只有 `scan:update` 可写的 React 19 packed 基线。
- `scripts/performance-consumer.sh` — 仓库外 tarball consumer 构建和扫描。
- `scripts/hulian-scan.test.mjs`、`scripts/performance-consumer.test.mjs` — 根脚本契约测试。
- `.github/workflows/ci.yml` — 独立 runtime-performance job 与 React 18 定时 smoke。
- `.gitignore` — 忽略本地 `.hulian-scan/` 原始结果，保留提交的基线和初扫报告。
- `docs/performance/hulian-scan-initial-report.md` — 首轮全量结果、覆盖率和全部 findings。
- `docs/superpowers/plans/2026-08-01-hulian-scan-component-optimizations.md` — 由真实初扫证据写出的下一份源码优化计划。

---

### Task 1: 建立私有包与稳定契约

**Files:**
- Create: `packages/hulian-scan/package.json`
- Create: `packages/hulian-scan/tsconfig.json`
- Create: `packages/hulian-scan/vitest.config.ts`
- Create: `packages/hulian-scan/src/contracts.ts`
- Create: `packages/hulian-scan/src/index.ts`
- Create: `packages/hulian-scan/src/contracts.test.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: none.
- Produces: `definePerformanceScenario(input: PerformanceScenario): PerformanceScenario`, `ScanEvent`, `ScenarioRun`, `PerformanceBudget`, `Finding`, `ScanReport`.

- [ ] **Step 1: 写失败的契约测试**

```ts
import { describe, expect, it } from "vitest";
import { definePerformanceScenario } from "./contracts";

describe("definePerformanceScenario", () => {
  it("rejects duplicate step ids and missing interaction labels", () => {
    expect(() => definePerformanceScenario({
      id: "button/basic",
      component: "Button",
      entry: "@hulianui/ui/button",
      category: "standard",
      render: () => null,
      steps: [
        { id: "stable-parent", kind: "parent-update", run: async () => undefined },
        { id: "stable-parent", kind: "interaction", run: async () => undefined },
      ],
      budgets: {},
    })).toThrow(/duplicate step id|interaction label/);
  });
});
```

- [ ] **Step 2: 验证测试先红**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/contracts.test.ts`

Expected: FAIL because the package or `definePerformanceScenario` does not exist.

- [ ] **Step 3: 创建私有 package 与精确依赖边界**

```json
{
  "name": "@hulianui/hulian-scan",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "scan:internal": "tsx src/cli.ts"
  },
  "dependencies": {
    "playwright": "^1.62.1",
    "react-scan": "0.5.7"
  },
  "devDependencies": {
    "@types/node": "^24.0.0",
    "tsx": "^4.20.0",
    "typescript": "^7.0.2",
    "vitest": "^3.2.7"
  }
}
```

Use the repository strict base config and keep tests inside the package:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "types": ["node", "vitest/globals"] },
  "include": ["src/**/*.ts"]
}
```

```ts
import { defineConfig } from "vitest/config";
export default defineConfig({ test: { environment: "node", include: ["src/**/*.test.ts"] } });
```

- [ ] **Step 4: 定义上游无关的核心类型和构造器**

```ts
export type ScanStage = "measurement" | "diagnosis";
export type ScanEnvironment = "workspace" | "packed-consumer";
export type ScenarioCategory = "standard" | "core" | "heavy" | "animation";
export type StepKind = "mount" | "parent-update" | "props-update" | "interaction" | "stress" | "unmount";

export interface ScenarioStep {
  id: string;
  kind: StepKind;
  label?: string;
  run: () => Promise<void>;
}

export interface PerformanceBudget {
  relativeRegressionPct?: number;
  absoluteRegressionMs?: number;
  maxAvoidableRenderCount?: number;
  minAvoidableRenderMs?: number;
  minRepeatedAvoidableRenders?: number;
  maxCascadeFanout?: number;
  maxInteractionLatencyMs?: number;
  maxLongTaskMs?: number;
  maxDroppedFrameRatio?: number;
}

export interface PerformanceScenario {
  id: string;
  component: string;
  entry: string;
  category: ScenarioCategory;
  render: () => unknown;
  steps: ScenarioStep[];
  budgets: Partial<PerformanceBudget>;
}

export interface FiberRenderEvent {
  type: "fiber-render";
  commitId: number;
  fiberId?: number;
  name: string;
  ownerName?: string;
  source?: string;
  depth: number;
  actualDurationMs: number;
  selfDurationMs: number;
  changeDescription?: unknown;
}

export interface CommitEvent {
  type: "commit";
  commitId: number;
  timestampMs: number;
  durationMs: number;
}

export type ScanEvent = FiberRenderEvent | CommitEvent;

export interface ScenarioRun {
  schemaVersion: 1;
  scenarioId: string;
  stage: ScanStage;
  environment: ScanEnvironment;
  samples: Array<Record<string, number>>;
  events: ScanEvent[];
  errors: string[];
  metadata: Record<string, string | number | boolean>;
}

export interface Finding {
  id: string;
  scenarioId: string;
  component: string;
  rule: string;
  severity: "error" | "warning";
  current: number;
  baseline?: number;
  absoluteDelta?: number;
  relativeDeltaPct?: number;
  evidence: string[];
}

export interface ScanReport {
  schemaVersion: 1;
  environment: ScanEnvironment;
  runs: ScenarioRun[];
  findings: Finding[];
}

export function definePerformanceScenario(input: PerformanceScenario): PerformanceScenario {
  const ids = new Set<string>();
  for (const step of input.steps) {
    if (ids.has(step.id)) throw new Error(`duplicate step id: ${step.id}`);
    if (step.kind === "interaction" && !step.label) throw new Error(`interaction label required: ${step.id}`);
    ids.add(step.id);
  }
  return Object.freeze(input);
}
```

- [ ] **Step 5: 安装依赖并验证 package 边界**

Run: `pnpm install && pnpm --filter @hulianui/hulian-scan test && pnpm --filter @hulianui/hulian-scan typecheck`

Expected: contract test PASS; typecheck PASS; `packages/hulian-scan/package.json` remains private.

- [ ] **Step 6: 只提交本任务文件**

```bash
git add packages/hulian-scan/package.json packages/hulian-scan/tsconfig.json packages/hulian-scan/vitest.config.ts packages/hulian-scan/src/contracts.ts packages/hulian-scan/src/contracts.test.ts packages/hulian-scan/src/index.ts pnpm-lock.yaml
git diff --cached --name-only
git commit -m "feat(perf): establish hulian scan contracts"
```

### Task 2: 隔离 React Scan Lite adapter 并采集 commit

**Files:**
- Create: `packages/hulian-scan/src/adapter/react-scan-lite.ts`
- Create: `packages/hulian-scan/src/adapter/react-scan-lite.test.ts`
- Create: `packages/hulian-scan/src/collector/collector.ts`
- Create: `packages/hulian-scan/src/collector/collector.test.ts`
- Modify: `packages/hulian-scan/src/index.ts`

**Interfaces:**
- Consumes: `ScanEvent`, `ScanStage` from Task 1.
- Produces: `installReactScanAdapter(options): AdapterHandle`; `createCollector(options): ScanCollector`.

- [ ] **Step 1: 写 adapter 正常化与加载顺序失败测试**

```ts
it("normalizes Lite commit data without leaking upstream fields", () => {
  const sink: ScanEvent[] = [];
  const handle = installReactScanAdapter({
    stage: "measurement",
    sink: (event) => sink.push(event),
    instrument: (options) => {
      options.onEvent?.({ kind: "commit-start", timestamp: 10 } as never);
      options.onEvent?.({
        kind: "commit",
        timestamp: 12,
        rendererId: 1,
        tree: [{ name: "Button", depth: 0, tag: 0, actualDuration: 3, actualStartTime: 8, selfBaseDuration: 2, treeBaseDuration: 3 }],
      } as never);
      options.onEvent?.({ kind: "commit-stop", timestamp: 14 } as never);
      return { stop() {} } as never;
    },
  });
  expect(sink).toContainEqual({ type: "commit", commitId: 1, timestampMs: 10, durationMs: 4 });
  expect(sink).toContainEqual(expect.objectContaining({ type: "fiber-render", commitId: 1, name: "Button", actualDurationMs: 3 }));
  expect(JSON.stringify(sink)).not.toMatch(/fiberRoot|bippy/);
  handle.stop();
});

it("fails when React already owns the renderer hook", () => {
  expect(() => assertPreReactInstallation({ renderers: new Map([[1, {}]]) } as never))
    .toThrow(/before React/);
});
```

- [ ] **Step 2: 运行测试确认缺少实现**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/adapter/react-scan-lite.test.ts src/collector/collector.test.ts`

Expected: FAIL on missing adapter and collector modules.

- [ ] **Step 3: 实现唯一上游 adapter**

```ts
import { instrument } from "react-scan/lite";
import type { LiteEvent } from "react-scan/lite";
import type { ScanEvent, ScanStage } from "../contracts";

export interface AdapterOptions {
  stage: ScanStage;
  sink: (event: ScanEvent) => void;
  instrument?: typeof instrument;
}

export interface AdapterHandle { stop(): void }

export function assertPreReactInstallation(hook: { renderers?: Map<unknown, unknown> } | undefined): void {
  if (hook?.renderers && hook.renderers.size > 0) throw new Error("hulian-scan must install before React");
}

export function installReactScanAdapter(options: AdapterOptions): AdapterHandle {
  assertPreReactInstallation(globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ as never);
  const state = { nextCommitId: 1, startedAt: undefined as number | undefined, tree: undefined as LiteEvent["tree"] };
  const upstream = (options.instrument ?? instrument)({
    includeFiberTree: true,
    includeProfilingHooks: true,
    recordChangeDescriptions: options.stage === "diagnosis",
    includeFiberSource: options.stage === "diagnosis",
    includeFiberIdentity: true,
    includeLaneLabels: options.stage === "diagnosis",
    onEvent(event) {
      normalizeLiteEvent(event, state).forEach(options.sink);
    },
  });
  return { stop: () => upstream.stop() };
}
```

`normalizeLiteEvent` must pair upstream `kind: "commit-start"`, `"commit"` and `"commit-stop"` in arrival order, assign its own monotonic `commitId`, emit the tree as normalized `FiberRenderEvent` records, and reject missing pairs plus negative/NaN durations. Compute actual self time from the depth-ordered tree as `max(0, fiber.actualDuration - sum(directChild.actualDuration))`; keep upstream `selfBaseDuration` out of runtime self timing because it is a baseline estimate, not the current render's self time. A `profiling-hooks-status` event with `available: false` is an infrastructure error in measurement mode. No non-adapter file may import `LiteEvent`.

- [ ] **Step 4: 实现交互窗口 collector**

```ts
export interface ScanCollector {
  accept(event: ScanEvent): void;
  beginStep(stepId: string, atMs: number): void;
  endStep(stepId: string, atMs: number): void;
  finalize(): { events: ScanEvent[]; errors: string[] };
}

export function createCollector(): ScanCollector {
  const events: ScanEvent[] = [];
  const open = new Map<string, number>();
  const errors: string[] = [];
  return {
    accept(event) { events.push(event); },
    beginStep(id, at) { if (open.has(id)) errors.push(`step already open: ${id}`); else open.set(id, at); },
    endStep(id, at) { const start = open.get(id); if (start === undefined || at < start) errors.push(`invalid step window: ${id}`); open.delete(id); },
    finalize() {
      for (const id of open.keys()) errors.push(`step not closed: ${id}`);
      if (!events.some((event) => event.type === "commit")) errors.push("no React commit captured");
      return { events: [...events], errors: [...errors] };
    },
  };
}
```

- [ ] **Step 5: 运行 adapter/collector 测试和类型检查**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/adapter src/collector && pnpm --filter @hulianui/hulian-scan typecheck`

Expected: all adapter and collector tests PASS.

- [ ] **Step 6: 提交 adapter 边界**

```bash
git add packages/hulian-scan/src/adapter packages/hulian-scan/src/collector packages/hulian-scan/src/index.ts
git diff --cached --name-only
git commit -m "feat(perf): collect React profiling commits"
```

### Task 3: 实现统计预算与安全诊断

**Files:**
- Create: `packages/hulian-scan/src/analyzer/statistics.ts`
- Create: `packages/hulian-scan/src/analyzer/statistics.test.ts`
- Create: `packages/hulian-scan/src/analyzer/budgets.ts`
- Create: `packages/hulian-scan/src/analyzer/budgets.test.ts`
- Create: `packages/hulian-scan/src/diagnosis/compare.ts`
- Create: `packages/hulian-scan/src/diagnosis/compare.test.ts`
- Create: `packages/hulian-scan/src/diagnosis/diagnose.ts`
- Modify: `packages/hulian-scan/src/index.ts`
- Create: `scripts/performance-budgets.json`

**Interfaces:**
- Consumes: `ScenarioRun`, `PerformanceBudget`, `Finding`.
- Produces: `summarize(values): Distribution`; `evaluateBudget(input): Finding[]`; `compareValues(previous, next, limits): ValueChange`; `diagnoseRun(run): Diagnosis[]`.

- [ ] **Step 1: 写双阈值和有限数失败测试**

```ts
it("fails time regression only when relative and absolute thresholds both cross", () => {
  expect(isTimeRegression({ baseline: 5, current: 7.1, relativePct: 20, absoluteMs: 2 })).toBe(true);
  expect(isTimeRegression({ baseline: 5, current: 6.9, relativePct: 20, absoluteMs: 2 })).toBe(false);
  expect(isTimeRegression({ baseline: 100, current: 119, relativePct: 20, absoluteMs: 2 })).toBe(false);
});

it.each([[], [Number.NaN], [Number.POSITIVE_INFINITY]])("rejects invalid samples", (values) => {
  expect(() => summarize(values)).toThrow(/finite sample/);
});
```

- [ ] **Step 2: 写深比较安全边界失败测试**

```ts
it("classifies equal deep values and never invokes getters", () => {
  let reads = 0;
  const left = { stable: { n: 1 }, get danger() { reads += 1; return 1; } };
  const right = { stable: { n: 1 }, get danger() { reads += 1; return 1; } };
  const change = compareValues(left, right, { maxDepth: 6, maxEntries: 200 });
  expect(change.kind).toBe("equal-by-value");
  expect(change.skipped).toContain("getter:danger");
  expect(reads).toBe(0);
});

it("terminates on cycles, Map, Set, functions and React Elements", () => {
  const value: Record<string, unknown> = {};
  value.self = value;
  expect(compareValues(value, { self: value }, { maxDepth: 6, maxEntries: 200 }).visitedEntries)
    .toBeLessThanOrEqual(200);
});
```

- [ ] **Step 3: 实现确定性统计函数**

```ts
export interface Distribution { count: number; median: number; p95: number; mad: number }

export function summarize(values: number[]): Distribution {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error("expected at least one finite sample");
  }
  const sorted = [...values].sort((a, b) => a - b);
  const percentile = (p: number) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * p) - 1)];
  const median = percentile(0.5);
  const deviations = sorted.map((value) => Math.abs(value - median)).sort((a, b) => a - b);
  return { count: sorted.length, median, p95: percentile(0.95), mad: deviations[Math.floor(deviations.length / 2)] };
}

export function isTimeRegression(input: { baseline: number; current: number; relativePct: number; absoluteMs: number }): boolean {
  return input.current - input.baseline >= input.absoluteMs
    && ((input.current - input.baseline) / input.baseline) * 100 > input.relativePct;
}
```

- [ ] **Step 4: 实现预算规则和默认预算文件**

`evaluateBudget` must emit errors for render loops, high-cost avoidable renders, excess cascade, leaks, long tasks, scenario errors, missing commits and insufficient samples. During measurement, a render inside the explicit `parent-update` window becomes a diagnosis candidate only when its median self cost is at least `0.5 ms` or it repeats at least twice. Diagnosis promotes it to an avoidable-render finding only when it is not a first mount and props, state, context and stateful hooks are unchanged or reference-different-but-deep-equal. This keeps deep comparison out of measurement while preventing a parent render alone from becoming a violation. `scripts/performance-budgets.json` starts with:

```json
{
  "schemaVersion": 1,
  "defaults": {
    "relativeRegressionPct": 20,
    "absoluteRegressionMs": 2,
    "minSamples": 5,
    "minAvoidableRenderMs": 0.5,
    "minRepeatedAvoidableRenders": 2,
    "maxLongTaskMs": 100
  },
  "categories": {
    "standard": { "maxAvoidableRenderCount": 1, "maxCascadeFanout": 30 },
    "core": { "maxAvoidableRenderCount": 0, "maxCascadeFanout": 50 },
    "heavy": { "maxAvoidableRenderCount": 1, "maxCascadeFanout": 250 },
    "animation": { "maxDroppedFrameRatio": 0.1, "maxLongTaskMs": 100 }
  },
  "scenarios": {}
}
```

- [ ] **Step 5: 实现有界比较和 owner 归因**

```ts
export interface CompareLimits { maxDepth: number; maxEntries: number }
export interface ValueChange {
  kind: "same-reference" | "equal-by-value" | "changed" | "truncated";
  visitedEntries: number;
  skipped: string[];
}

export interface Diagnosis {
  fiberId?: number;
  component: string;
  ownerChain: string[];
  props: Record<string, ValueChange>;
  state: Record<string, ValueChange>;
  context: Record<string, ValueChange>;
  hooks: Record<string, ValueChange>;
}
```

Use `Object.getOwnPropertyDescriptors`, never property access for accessors; compare Map/Set by bounded entries; treat functions and React Elements as atomic identity values; track object pairs in `WeakMap`; return `truncated` at either limit.

- [ ] **Step 6: 验证 analyzer 与 diagnosis**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/analyzer src/diagnosis && pnpm --filter @hulianui/hulian-scan typecheck`

Expected: budget boundary, cycles, getters, collections, functions and truncation tests PASS.

- [ ] **Step 7: 提交分析器**

```bash
git add packages/hulian-scan/src/analyzer packages/hulian-scan/src/diagnosis packages/hulian-scan/src/index.ts scripts/performance-budgets.json
git diff --cached --name-only
git commit -m "feat(perf): analyze regressions and render causes"
```

### Task 4: 报告与环境安全 checkpoint

**Files:**
- Create: `packages/hulian-scan/src/report/report.ts`
- Create: `packages/hulian-scan/src/report/report.test.ts`
- Create: `packages/hulian-scan/src/report/checkpoint.ts`
- Create: `packages/hulian-scan/src/report/checkpoint.test.ts`
- Modify: `packages/hulian-scan/src/index.ts`

**Interfaces:**
- Consumes: `ScanReport`, `ScenarioRun`, `Finding`.
- Produces: `writeReport(report, outputDir): Promise<ReportPaths>`; `formatTerminalSummary(report): string`; `loadCheckpoint(path, fingerprint): Promise<Checkpoint>`; `saveCheckpoint(path, checkpoint): Promise<void>`.

- [ ] **Step 1: 写完整 finding 与 checkpoint 指纹测试**

```ts
it("writes every finding while ranking without truncating", async () => {
  const report = makeReportWithFindings(137);
  const paths = await writeReport(report, tempDir);
  const findings = JSON.parse(await readFile(paths.findings, "utf8"));
  expect(findings).toHaveLength(137);
  expect(formatTerminalSummary(report)).toContain("137 findings");
});

it("rejects checkpoint from another browser or git revision", async () => {
  await saveCheckpoint(file, { fingerprint: "react19/chromium-a/git-a", completed: ["button/basic"] });
  await expect(loadCheckpoint(file, "react19/chromium-b/git-a")).rejects.toThrow(/fingerprint/);
});
```

- [ ] **Step 2: 运行测试确认缺少实现**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/report`

Expected: FAIL on missing report modules.

- [ ] **Step 3: 实现原子写入和全量报告**

```ts
export interface ReportPaths {
  summary: string;
  findings: string;
  inventory: string;
  markdown: string;
}

export async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`);
  await rename(temporary, path);
}
```

`writeReport` writes `summary.json`, `findings.json`, `inventory.json`, raw per-scenario samples and Markdown. Terminal ranking may show the slowest 20, but `findings.json` and Markdown must list all findings and all uncovered entries.

- [ ] **Step 4: 实现 checkpoint 的环境绑定与合并规则**

```ts
export interface Checkpoint {
  schemaVersion: 1;
  fingerprint: string;
  completed: string[];
  runs: ScenarioRun[];
}
```

Reject duplicate scenario runs, schema mismatch, environment mismatch, non-finite samples and mixed browser/git fingerprints. Save after each completed scenario using atomic rename.

- [ ] **Step 5: 运行报告测试**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/report && pnpm --filter @hulianui/hulian-scan typecheck`

Expected: all report/checkpoint tests PASS and no finding is dropped.

- [ ] **Step 6: 提交报告层**

```bash
git add packages/hulian-scan/src/report packages/hulian-scan/src/index.ts
git diff --cached --name-only
git commit -m "feat(perf): persist complete scan evidence"
```

### Task 5: 建立 profiling perf-lab 与已知好坏 fixture

**Files:**
- Create: `apps/perf-lab/package.json`
- Create: `apps/perf-lab/tsconfig.json`
- Create: `apps/perf-lab/vite.config.ts`
- Create: `apps/perf-lab/vitest.config.ts`
- Create: `apps/perf-lab/index.html`
- Create: `apps/perf-lab/app/bootstrap.ts`
- Create: `apps/perf-lab/app/main.tsx`
- Create: `apps/perf-lab/app/harness.tsx`
- Create: `apps/perf-lab/app/window-api.ts`
- Create: `apps/perf-lab/app/styles.css`
- Create: `apps/perf-lab/fixtures/known-good.tsx`
- Create: `apps/perf-lab/fixtures/known-bad.tsx`
- Create: `apps/perf-lab/app/harness.browser.test.ts`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Consumes: `installReactScanAdapter`, `PerformanceScenario`.
- Produces: browser `window.__HULIAN_SCAN_LAB__` with `ready`, `list()`, `run(id, options)`, `result(id)`.

- [ ] **Step 1: 写浏览器加载顺序与 fixture 失败测试**

```ts
test("adapter starts before React and known bad produces avoidable renders", async ({ page }) => {
  await page.goto("/?scenario=fixture/known-bad&stage=measurement");
  const result = await page.evaluate(async () => {
    await window.__HULIAN_SCAN_LAB__.ready;
    return window.__HULIAN_SCAN_LAB__.run("fixture/known-bad", { samples: 5, warmups: 1 });
  });
  expect(result.metadata.adapterInstalledBeforeReact).toBe(true);
  expect(result.events.filter((event) => event.type === "commit").length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: 创建完整且私有的 perf-lab manifest**

```json
{
  "name": "@hulianui/perf-lab",
  "private": true,
  "type": "module",
  "scripts": {
    "build:measurement": "vite build --mode measurement",
    "build:diagnosis": "vite build --mode diagnosis",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@hulianui/hulian-scan": "workspace:*",
    "@hulianui/tokens": "workspace:*",
    "@hulianui/ui": "workspace:*",
    "react": "19.2.8",
    "react-dom": "19.2.8"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.3.3",
    "@types/react": "^19.2.18",
    "@types/react-dom": "^19.2.4",
    "@vitejs/plugin-react": "^4.7.0",
    "@vitest/browser": "^3.2.7",
    "jsdom": "^25.0.0",
    "playwright": "^1.62.1",
    "tailwindcss": "^4.3.3",
    "typescript": "^7.0.2",
    "vite": "7.3.6",
    "vitest": "^3.2.7"
  }
}
```

Create `vitest.config.ts` with separate jsdom and Chromium projects:

```ts
import { playwright } from "@vitest/browser/providers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    projects: [
      { test: { name: "unit", environment: "jsdom", include: ["**/*.test.{ts,tsx}"], exclude: ["**/*.browser.test.ts"] } },
      { test: { name: "browser", include: ["**/*.browser.test.ts"], browser: { enabled: true, provider: playwright(), instances: [{ browser: "chromium" }] } } },
    ],
  },
});
```

- [ ] **Step 3: 配置真实样式与 exact React DOM profiling alias**

```ts
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^@hulianui\/ui-internal\/(.+)$/, replacement: fileURLToPath(new URL("../../packages/ui/src/$1", import.meta.url)) },
      ...(mode === "measurement"
        ? [{ find: /^react-dom\/client$/, replacement: "react-dom/profiling" }]
        : []),
    ],
  },
  server: { port: 5513, strictPort: true },
  define: { __HULIAN_SCAN_STAGE__: JSON.stringify(mode === "measurement" ? "measurement" : "diagnosis") },
}));
```

Create `app/styles.css` with the same token and source contract as the real site:

```css
@import "tailwindcss";
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset.css";
@source "../../../packages/ui/src/**/*.{ts,tsx}";
```

- [ ] **Step 4: 保证 bootstrap 不静态导入 React**

```ts
import { installReactScanAdapter } from "@hulianui/hulian-scan";

const events = [];
const adapter = installReactScanAdapter({ stage: __HULIAN_SCAN_STAGE__, sink: (event) => events.push(event) });
globalThis.__HULIAN_SCAN_EVENTS__ = events;
globalThis.__HULIAN_SCAN_ADAPTER__ = adapter;
await import("./main");
```

Verify the Vite output chunk graph shows `bootstrap` as the HTML entry and React only behind the dynamic `main` import.

- [ ] **Step 5: 创建已知失败与已知通过 fixture**

`known-bad.tsx` must render an expensive child with stable semantic props after five parent updates. `known-good.tsx` must move the changing state below the child boundary so the same five updates do not re-render the expensive child. Both fixtures use identical visible DOM and interaction steps.

```tsx
function ExpensiveChild({ config }: { config: { rows: number } }) {
  let checksum = 0;
  for (let i = 0; i < config.rows * 500; i += 1) checksum += i % 7;
  return <output data-checksum={checksum}>{config.rows}</output>;
}

export function KnownBad() {
  const [tick, setTick] = useState(0);
  return <><button onClick={() => setTick((n) => n + 1)}>{tick}</button><ExpensiveChild config={{ rows: 200 }} /></>;
}
```

- [ ] **Step 6: 实现实验室 window API 和错误边界**

The API must return a serializable `ScenarioRun`, mark timeouts and render errors in `errors`, expose no props values, and refuse a second concurrent run.

- [ ] **Step 7: 运行真实 Chromium compatibility spike**

Run: `pnpm --filter @hulianui/perf-lab exec playwright install chromium && pnpm --filter @hulianui/perf-lab test`

Expected: React 19.2.8 profiling build captures commits; known-bad has more expensive renders than known-good; adapter timing assertion passes. If the exact alias does not expose `createRoot`, inspect the resolved `react-dom` export and adjust only `vite.config.ts`, preserving profiling mode.

- [ ] **Step 8: 类型检查并提交 perf-lab**

```bash
pnpm --filter @hulianui/perf-lab typecheck
git add apps/perf-lab pnpm-lock.yaml
git diff --cached --name-only
git commit -m "feat(perf): add React profiling lab fixtures"
```

### Task 6: 浏览器编排、重试和根 CLI

**Files:**
- Create: `packages/hulian-scan/src/runner/run-scan.ts`
- Create: `packages/hulian-scan/src/runner/run-scan.test.ts`
- Create: `packages/hulian-scan/src/cli.ts`
- Create: `packages/hulian-scan/src/cli.test.ts`
- Create: `scripts/hulian-scan.mjs`
- Create: `scripts/hulian-scan.test.mjs`
- Modify: `packages/hulian-scan/src/index.ts`

**Interfaces:**
- Consumes: lab window API, collector, analyzer, diagnosis, report/checkpoint.
- Produces: `runScan(options): Promise<ScanReport>` and root CLI flags `--scenario`, `--full`, `--ci`, `--update`, `--resume`, `--environment`, `--react`, `--smoke`, `--inventory-only`, `--diagnose-findings`, `--from`, `--from-baseline`, `--output`, `--report-only`.

- [ ] **Step 1: 写两阶段和单次崩溃重试测试**

```ts
it("diagnoses only measurement failures and retries chromium once", async () => {
  const browser = fakeBrowser({ crashFirstLaunch: true });
  const report = await runScan({ scenarioIds: ["fixture/known-good", "fixture/known-bad"], browser });
  expect(browser.launchCount).toBe(2);
  expect(browser.runs("fixture/known-good", "diagnosis")).toBe(0);
  expect(browser.runs("fixture/known-bad", "diagnosis")).toBe(1);
});

it.each(["no commit", "NaN sample", "insufficient samples", "scenario timeout"])(
  "treats %s as infrastructure failure",
  async (fault) => expect(runFault(fault)).rejects.toThrow(),
);
```

- [ ] **Step 2: 实现确定性 runner 生命周期**

```ts
export interface RunScanOptions {
  scenarioIds: string[];
  environment: ScanEnvironment;
  samples: number;
  warmups: number;
  checkpointPath: string;
  outputDir: string;
  resume: boolean;
}

export interface RunDependencies {
  runStage(stage: ScanStage, scenarioIds: string[], options: RunScanOptions): Promise<ScenarioRun[]>;
  analyze(runs: ScenarioRun[]): Finding[];
  attachDiagnosis(findings: Finding[], runs: ScenarioRun[]): Finding[];
  write(report: ScanReport, outputDir: string): Promise<void>;
}

async function runWithOneCrashRetry<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/browser.*(?:closed|crash|disconnect)/i.test(message)) throw error;
    return operation();
  }
}

export async function runScan(options: RunScanOptions, deps: RunDependencies): Promise<ScanReport> {
  const measurement = await runWithOneCrashRetry(() => deps.runStage("measurement", options.scenarioIds, options));
  const initialFindings = deps.analyze(measurement);
  const flaggedIds = [...new Set(initialFindings.map((finding) => finding.scenarioId))];
  const diagnosis = flaggedIds.length === 0
    ? []
    : await runWithOneCrashRetry(() => deps.runStage("diagnosis", flaggedIds, options));
  const report: ScanReport = {
    schemaVersion: 1,
    environment: options.environment,
    runs: measurement,
    findings: deps.attachDiagnosis(initialFindings, diagnosis),
  };
  await deps.write(report, options.outputDir);
  return report;
}
```

`runWithOneCrashRetry` catches only Playwright browser-disconnected/crashed errors and performs at most two attempts; scenario assertion, timeout, missing commit and invalid metric errors are never retried. The default `runStage` starts the matching Vite preview and launches Chromium with viewport `1280x900`, device scale factor `1`, locale `zh-CN`, timezone `Asia/Shanghai`, light color scheme and the pinned Playwright Chromium revision. It waits for `document.fonts.ready`; standard/core/heavy modes inject a rule that disables unrelated CSS transitions and animations, while animation scenarios keep their real loop. It runs warmups without retaining samples, collects five valid samples, saves the checkpoint after every scenario, and closes browser plus preview in `finally`. `attachDiagnosis` copies cause evidence only and rejects diagnosis timing fields.

- [ ] **Step 3: 实现 CLI 参数与写基线保护**

`--update` is the only mode that writes `scripts/performance-baseline.json`; it accepts a complete `--from <summary.json>`, prints old, new, absolute delta and percentage for every changed scenario, then atomically replaces the file. `--ci` never updates baseline and exits `1` on findings or infrastructure failure. `--report-only` still exits nonzero on infrastructure failure but does not use performance findings as its exit code. `--inventory-only` performs no browser launch. `--diagnose-findings <findings.json>` requires `--output` and runs only diagnosis. `--smoke --react 18` selects the fixed compatibility subset and cannot update the React 19 baseline. `--full` rejects any `--scenario` filter; `--from-baseline` is read-only.

- [ ] **Step 4: 创建无依赖根转发器**

```js
#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const result = spawnSync(
  "pnpm",
  ["--filter", "@hulianui/hulian-scan", "run", "scan:internal", "--", ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exitCode = result.status ?? 1;
```

- [ ] **Step 5: 验证 known-good/known-bad 端到端**

Run: `node scripts/hulian-scan.mjs --scenario fixture/known-good --environment workspace`

Expected: exit 0, five samples, non-empty commits.

Run: `node scripts/hulian-scan.mjs --scenario fixture/known-bad --environment workspace --ci`

Expected: exit 1 with an avoidable-render finding and a diagnosis owner chain.

- [ ] **Step 6: 运行 runner、CLI 和根脚本测试**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/runner src/cli && node --test scripts/hulian-scan.test.mjs`

Expected: retry exactly once, bad fixture fails, good fixture passes, infrastructure faults never report success.

- [ ] **Step 7: 提交编排器**

```bash
git add packages/hulian-scan/src/runner packages/hulian-scan/src/cli.ts packages/hulian-scan/src/cli.test.ts packages/hulian-scan/src/index.ts scripts/hulian-scan.mjs scripts/hulian-scan.test.mjs
git diff --cached --name-only
git commit -m "feat(perf): orchestrate two-stage browser scans"
```

### Task 7: 从公开运行时事实生成 inventory

**Files:**
- Create: `packages/hulian-scan/src/inventory/inventory.ts`
- Create: `packages/hulian-scan/src/inventory/inventory.test.ts`
- Create: `packages/hulian-scan/src/inventory/generate.ts`
- Create: `apps/perf-lab/scenarios/generated.ts`
- Create: `apps/perf-lab/scenarios/non-rendering.json`
- Modify: `packages/hulian-scan/src/index.ts`

**Interfaces:**
- Consumes: `packages/ui/package.json`, `packages/ui/src/index.ts`, `packages/ui/src/showcase.ts`, `packages/ui/src/*/index.ts`, `packages/ui/src/*/*.md`, `apps/www/public/registry.json` as read-only inputs.
- Produces: `buildInventory(paths): Promise<InventoryEntry[]>`; generated `scenarioLoaders: Record<string, () => Promise<ShowcaseSpec>>`.

- [ ] **Step 1: 写新增、别名和非渲染入口测试**

```ts
it("requires every public renderable export to map to a scenario", async () => {
  const inventory = await buildInventory(fixturePaths({
    packageExports: { ".": "./src/index.ts", "./*": "./src/*/index.ts", "./vite": "./vite.js" },
    rootIndex: 'export { Button } from "./button"; export { button as ButtonAlias } from "./button";',
    showcase: 'export { buttonShowcase } from "./button/button.showcase";',
    nonRendering: [{ entry: "@hulianui/ui/vite", reason: "Vite plugin, no React render export" }],
  }));
  expect(inventory.filter((entry) => entry.kind === "renderable")).toHaveLength(1);
  expect(inventory[0].aliases).toContain("ButtonAlias");
  expect(inventory.find((entry) => entry.entry.endsWith("/vite"))?.reason).toMatch(/Vite plugin/);
});
```

- [ ] **Step 2: 运行 inventory 测试确认缺少实现**

Run: `pnpm --filter @hulianui/hulian-scan test -- src/inventory`

Expected: FAIL on missing inventory module.

- [ ] **Step 3: 用 TypeScript AST 解析 exports 和 barrels**

```ts
export interface InventoryEntry {
  id: string;
  entry: string;
  source: string;
  exports: string[];
  aliases: string[];
  kind: "renderable" | "non-rendering";
  categories: string[];
  animated: boolean;
  webgl: boolean;
  documentation?: string;
  scenarioId?: string;
  reason?: string;
}
```

Expand `./*` only to existing `src/*/index.ts`; follow named re-exports one level into the component directory; deduplicate aliases by resolved source; cross-check each renderable directory against `src/showcase.ts`, its Markdown file, and the matching `registry.json` item. Copy `meta.group`/`categories`, `meta.animated`, `meta.webgl` and `meta.docLocal` into the inventory; report disagreement as a coverage error instead of trusting one generated source. Require an explicit reason for `vitest-preset`, `vite`, hooks-only and utility-only entries.

- [ ] **Step 4: 生成按 slug 动态 import 的映射**

Generated entries must have the exact form below so loading one scenario never imports the entire showcase barrel:

```ts
export const scenarioLoaders = {
  button: async () => (await import("@hulianui/ui-internal/button/button.showcase")).buttonShowcase,
  table: async () => (await import("@hulianui/ui-internal/table/table.showcase")).tableShowcase,
} satisfies Record<string, () => Promise<ShowcaseSpec>>;
```

Configure the workspace-only alias `@hulianui/ui-internal/* -> packages/ui/src/*` in `apps/perf-lab/vite.config.ts`; never add it to `packages/ui/package.json`. Packed consumer generation in Task 10 must transform the matching showcase module so all component imports resolve through public `@hulianui/ui/<slug>` entries and must reject any remaining `ui-internal` or repository path.

- [ ] **Step 5: 生成当前完整 inventory 并验证零静默缺口**

Run: `pnpm --filter @hulianui/hulian-scan exec tsx src/inventory/generate.ts --check`

Expected: every public renderable entry has a generated loader or explicit non-rendering reason; zero unclassified entries.

- [ ] **Step 6: 提交 inventory**

```bash
git add packages/hulian-scan/src/inventory packages/hulian-scan/src/index.ts apps/perf-lab/scenarios/generated.ts apps/perf-lab/scenarios/non-rendering.json
git diff --cached --name-only
git commit -m "feat(perf): inventory every public UI entry"
```

### Task 8: 用 showcase 构建所有普通组件的通用场景

**Files:**
- Create: `apps/perf-lab/scenarios/contract.ts`
- Create: `apps/perf-lab/scenarios/generic.tsx`
- Create: `apps/perf-lab/scenarios/generic.test.tsx`
- Create: `apps/perf-lab/scenarios/index.ts`
- Modify: `apps/perf-lab/app/harness.tsx`

**Interfaces:**
- Consumes: generated loader map, `ShowcaseSpec`, `definePerformanceScenario`.
- Produces: `createGenericScenario(entry): Promise<PerformanceScenario>` and `loadScenario(id)`.

- [ ] **Step 1: 写 examples/states 回退与稳定父更新测试**

```tsx
it("uses first example, otherwise first state, and performs stable parent update", async () => {
  const exampleRender = vi.fn(() => <button>example</button>);
  const scenario = await createGenericScenario(fakeEntry({ examples: [{ title: "basic", code: "<Button />", render: exampleRender }] }));
  expect(scenario.steps.map((step) => step.kind)).toEqual([
    "mount", "parent-update", "props-update", "interaction", "stress", "unmount",
  ]);
  expect(exampleRender).toHaveBeenCalled();
});
```

- [ ] **Step 2: 运行测试确认通用生成器缺失**

Run: `pnpm --filter @hulianui/perf-lab test -- scenarios/generic.test.tsx`

Expected: FAIL on missing generator.

- [ ] **Step 3: 实现通用场景六步生命周期**

Use `examples?.[0]?.render()` first and `states[0].render()` as fallback. Wrap the returned React node in a parent with its own counter so `parent-update` changes only the wrapper; use first control with a distinct valid value for `props-update`; click the first enabled button/input/select for `interaction`; repeat the legal update ten times for `stress`; unmount and observe 250 ms for leaks. If no legal prop or interaction exists, run a named no-op step that still asserts the component remains mounted and records why the action is inapplicable.

- [ ] **Step 4: 校验每个 renderable inventory 项都有可加载场景**

Run: `node scripts/hulian-scan.mjs --inventory-only --full`

Expected: renderable coverage `100%`, unclassified `0`, duplicate scenario ids `0`, and every loader resolves without importing the global showcase barrel.

- [ ] **Step 5: 运行通用场景测试和代表性浏览器批次**

Run: `pnpm --filter @hulianui/perf-lab test && node scripts/hulian-scan.mjs --scenario button/basic --scenario input/basic --scenario dialog/basic --environment workspace`

Expected: all three scenarios complete with commits and no infrastructure error.

- [ ] **Step 6: 提交通用覆盖**

```bash
git add apps/perf-lab/scenarios apps/perf-lab/app/harness.tsx
git diff --cached --name-only
git commit -m "feat(perf): cover standard components generically"
```

### Task 9: 为重型、交互与动画组件加入专用场景

**Files:**
- Create: `apps/perf-lab/scenarios/specialized/table.tsx`
- Create: `apps/perf-lab/scenarios/specialized/pro-table.tsx`
- Create: `apps/perf-lab/scenarios/specialized/tree.tsx`
- Create: `apps/perf-lab/scenarios/specialized/virtual-list.tsx`
- Create: `apps/perf-lab/scenarios/specialized/select.tsx`
- Create: `apps/perf-lab/scenarios/specialized/dialog.tsx`
- Create: `apps/perf-lab/scenarios/specialized/form.tsx`
- Create: `apps/perf-lab/scenarios/specialized/chart.tsx`
- Create: `apps/perf-lab/scenarios/specialized/markdown-editor.tsx`
- Create: `apps/perf-lab/scenarios/specialized/animation.tsx`
- Create: `apps/perf-lab/scenarios/specialized/specialized.test.tsx`
- Modify: `apps/perf-lab/scenarios/index.ts`
- Modify: `apps/perf-lab/app/harness.tsx`
- Modify: `apps/perf-lab/app/window-api.ts`

**Interfaces:**
- Consumes: scenario contract and public `@hulianui/ui/<slug>` entries.
- Produces: specialized scenario map that overrides generic ids for named components.

- [ ] **Step 1: 写数据规模、交互和动画预算测试**

```ts
it("registers fixed stress sizes and animation lifecycle", () => {
  expect(specialized.table.parameters.rows).toBe(1000);
  expect(specialized.tree.parameters.nodes).toBe(1000);
  expect(specialized.virtualList.parameters.items).toBe(10000);
  expect(specialized.markdownEditor.parameters.characters).toBe(20000);
  expect(specialized.animation.steps.map((step) => step.id)).toEqual(["start", "sample-frames", "stop", "unmount-observe"]);
});
```

- [ ] **Step 2: 创建固定规模的专用场景**

- Table/ProTable: 1,000 rows, sort, filter, select a row, replace one row, stable parent update.
- Tree: 1,000 nodes, expand/collapse a 100-node branch, select, stable parent update.
- VirtualList: 10,000 items, scroll start/middle/end, replace one visible item, assert bounded mounted DOM.
- Select: 1,000 options, open, keyboard search, choose, close, reopen.
- Dialog/Form: open/close cycles, field typing, validation, reset and unmount cleanup.
- Chart: 500 points, one-series update, tooltip interaction and resize observer cleanup.
- MarkdownEditor: 20,000 characters, insert 20 characters, toggle formatting, undo and destroy editor.
- Animation: include every inventory component classified as continuous canvas/WebGL/animation; sample 120 frames, stop, unmount and observe 500 ms.

- [ ] **Step 3: 记录浏览器事件和帧指标**

Add `PerformanceObserver` for `longtask`, `requestAnimationFrame` delta samples for animation scenarios, and `performance.mark/measure` around every scenario step. Emit `interactionLatencyMs`, `longTaskCount`, `longestTaskMs`, `droppedFrameRatio` and `longestFrameMs`; clear all observers and RAF ids in `finally`.

- [ ] **Step 4: 运行专用场景小批次**

Run: `node scripts/hulian-scan.mjs --scenario table/stress --scenario tree/stress --scenario virtual-list/scroll --scenario animation/frame-budget --environment workspace`

Expected: all scenarios complete, metric fields are finite, animation fields exist only for animation scenarios, and no observer/RAF survives unmount.

- [ ] **Step 5: 运行专用场景测试并提交**

```bash
pnpm --filter @hulianui/perf-lab test -- scenarios/specialized
git add apps/perf-lab/scenarios/specialized apps/perf-lab/scenarios/index.ts apps/perf-lab/app/harness.tsx apps/perf-lab/app/window-api.ts
git diff --cached --name-only
git commit -m "feat(perf): add heavy and animation scenarios"
```

### Task 10: 建立仓库外 packed consumer 扫描

**Files:**
- Create: `scripts/performance-consumer.sh`
- Create: `scripts/performance-consumer.test.mjs`
- Modify: `packages/hulian-scan/src/cli.ts`

**Interfaces:**
- Consumes: `@hulianui/tokens` and `@hulianui/ui` tarballs, perf-lab scenario sources, scanner CLI.
- Produces: packed-consumer `ScenarioRun` files under caller-supplied `PERFORMANCE_CONSUMER_DIR`.

- [ ] **Step 1: 写拒绝 workspace 泄漏和扫描器入业务 bundle 的测试**

```js
test("consumer script requires an external explicit directory", () => {
  const result = spawnSync("bash", ["scripts/performance-consumer.sh"], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /PERFORMANCE_CONSUMER_DIR/);
});

test("bundle metafile rejects internal scanner modules", () => {
  const directory = mkdtempSync(join(tmpdir(), "hulian-scan-meta-"));
  const metafile = join(directory, "meta.json");
  writeFileSync(metafile, JSON.stringify({ inputs: { "node_modules/react-scan/dist/index.js": {} } }));
  const result = spawnSync("bash", ["scripts/performance-consumer.sh", "--check-metafile", metafile], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /react-scan/);
});
```

- [ ] **Step 2: 实现显式、仓库外 consumer 目录校验**

```sh
: "${PERFORMANCE_CONSUMER_DIR:?PERFORMANCE_CONSUMER_DIR must point outside the repository}"
repo_root="$(cd "$(dirname "$0")/.." && pwd -P)"
consumer_root="$(mkdir -p "$PERFORMANCE_CONSUMER_DIR" && cd "$PERFORMANCE_CONSUMER_DIR" && pwd -P)"
case "$consumer_root" in "$repo_root"|"$repo_root"/*) echo "consumer directory must be outside repository" >&2; exit 2;; esac
```

The script may remove only validated children `app`, `store` and `artifacts` inside `consumer_root`; it must never delete the caller directory itself.

- [ ] **Step 3: pack、安装和断开 workspace 捷径**

Pack tokens and UI into `consumer_root/artifacts`; create a Vite React app in `consumer_root/app`; install only tarballs plus explicit React/Vite/runtime peers; set `node-linker=isolated`; assert `readlink` for installed UI does not resolve into the repository; search lockfile and source maps for `workspace:` and the repository absolute path. Rewrite the copied `styles.css` source line to `@source "./node_modules/@hulianui/ui/src/**/*.{ts,tsx}"` so packed layout uses the same generated utilities without reading workspace source.

For each selected generic scenario, read its packaged `node_modules/@hulianui/ui/src/<slug>/<slug>.showcase.tsx`, copy it into `consumer_root/app/scenarios`, and rewrite only imports whose resolved target stays inside that component directory: the component's own `./<slug>` or `./index` import becomes `@hulianui/ui/<slug>`; local helper files are copied beside the showcase and retain relative imports. Resolve the transformed module with TypeScript before running and fail if any import contains `ui-internal`, points outside the consumer directory, or bypasses the package's public component entry.

- [ ] **Step 4: 分开 instrumentation bundle 与业务 bundle 断言**

Build the scan harness with instrumentation for measurement. Separately build a minimal `consumer-entry.tsx` that imports the same UI public entries but does not import scanner code. Implement `--check-metafile <path>` as a side-effect-free script mode that reads `inputs`, prints every forbidden path, and exits `1`; fail if the business bundle contains `hulian-scan`, `react-scan`, `bippy`, `why-did-you-render`, or a repository absolute path.

- [ ] **Step 5: 运行 packed 代表性扫描**

Run: `PERFORMANCE_CONSUMER_DIR="$(mktemp -d)" bash scripts/performance-consumer.sh --scenario button/basic --scenario table/stress`

Expected: tarball install succeeds, both scenarios produce commits, business bundle has zero forbidden modules, and result environment is `packed-consumer`.

- [ ] **Step 6: 运行脚本测试并提交**

```bash
node --test scripts/performance-consumer.test.mjs
git add scripts/performance-consumer.sh scripts/performance-consumer.test.mjs packages/hulian-scan/src/cli.ts
git diff --cached --name-only
git commit -m "feat(perf): scan packed UI consumers"
```

### Task 11: 接入根命令、基线保护与独立 CI job

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Modify: `.github/workflows/ci.yml`
- Modify: `pnpm-lock.yaml` only if the concurrent current manifest requires lock refresh
- Create: `scripts/performance-baseline.json`
- Create: `packages/hulian-scan/src/private-boundary.test.ts`

**Interfaces:**
- Consumes: root CLI and packed consumer script.
- Produces: `pnpm scan`, `pnpm scan:ci`, `pnpm scan:update`, `runtime-performance` CI job.

- [ ] **Step 1: 重新读取所有共享文件并写边界测试**

Run: `git status --short && git log --oneline -3 && sed -n '1,180p' package.json && sed -n '1,280p' .github/workflows/ci.yml && sed -n '1,220p' .gitignore`

Write a test that parses `packages/ui/package.json`, root lockfile and scanner manifest; assert scanner is private and UI has no dependency or export containing `hulian-scan`, `react-scan`, `bippy` or `why-did-you-render`.

- [ ] **Step 2: 增加根命令和空 schema 基线**

```json
{
  "scan": "node scripts/hulian-scan.mjs --full --environment workspace",
  "scan:ci": "node scripts/hulian-scan.mjs --ci --environment packed-consumer",
  "scan:update": "node scripts/hulian-scan.mjs --update --full --environment packed-consumer"
}
```

Merge only these keys into the current root `scripts`. Initialize baseline as `{"schemaVersion":1,"react":"19.2.8","environment":"packed-consumer","scenarios":{}}`; ordinary scan commands must refuse an empty baseline in CI mode, while Task 12 `scan:update` populates it explicitly.

- [ ] **Step 3: 忽略原始本地结果但保留证据文档**

Append only:

```gitignore
# Hulian Scan local raw samples, traces and screenshots
.hulian-scan/
```

- [ ] **Step 4: 增加独立 runtime-performance job**

Add a job with checkout, pinned pnpm/node, frozen install, Chromium install, inventory check, affected/core scan, packed consumer scan and artifact upload. Add `schedule: [{ cron: "17 19 * * 3" }]` to `on`; the scheduled job runs `PERFORMANCE_REACT_VERSION=18 pnpm scan:ci -- --react 18 --smoke`, while push/PR uses React 19.2.8. Upload `.hulian-scan/reports`, traces, screenshots and browser logs with `if: always()`.

The affected scan must use `git diff --name-only` plus generated inventory source mapping; changes under scanner, tokens, root dependency files or shared primitives trigger all core/heavy scenarios. Baseline rebuilds and releases use `--full`.

- [ ] **Step 5: 验证命令、私有边界和 CI YAML**

Run: `pnpm --filter @hulianui/hulian-scan test && node --test scripts/hulian-scan.test.mjs scripts/performance-consumer.test.mjs && pnpm scan -- --inventory-only`

Expected: all tests PASS; inventory coverage 100%; `scan:ci` refuses the intentionally empty baseline with an explicit baseline error rather than a false pass.

- [ ] **Step 6: 仅暂存共享文件中的本任务补丁**

```bash
git add package.json .gitignore .github/workflows/ci.yml scripts/performance-baseline.json packages/hulian-scan/src/private-boundary.test.ts
git add pnpm-lock.yaml
git diff --cached --name-only
git diff --cached --check
git commit -m "ci(perf): gate packed runtime performance"
```

If any listed shared file contains concurrent edits at this point, unstage it, re-read the new HEAD, reapply only the Hulian Scan hunk, rerun its owning session's relevant check, then stage it again.

### Task 12: 执行首次全量扫描并冻结完整证据

**Files:**
- Modify: `scripts/performance-baseline.json`
- Create: `docs/performance/hulian-scan-initial-report.md`
- Create: `docs/superpowers/plans/2026-08-01-hulian-scan-component-optimizations.md`

**Interfaces:**
- Consumes: completed scanner, all inventory scenarios, packed consumer path.
- Produces: full React 19 packed baseline, complete first-scan report, exact data-driven component optimization plan.

- [ ] **Step 1: 在最新并发 HEAD 上做执行前全仓验证**

Run: `git status --short && git log --oneline -5 && pnpm typecheck && pnpm test && pnpm test:scripts`

Expected: existing repository checks PASS. If a concurrent session is still modifying files, do not stage or rewrite them; run the scan against the current filesystem snapshot and record exact `git rev-parse HEAD` plus dirty paths in metadata.

- [ ] **Step 2: 运行 workspace 全量测量并使用 checkpoint**

Run: `pnpm scan -- --resume --output .hulian-scan/workspace-initial`

Expected: every renderable inventory entry completes at least one scenario, no unclassified entry, no missing commit, and interruption can resume without mixing environment fingerprints.

- [ ] **Step 3: 对全部失败场景完成 diagnosis**

Run: `node scripts/hulian-scan.mjs --diagnose-findings .hulian-scan/workspace-initial/findings.json --output .hulian-scan/workspace-initial-diagnosis`

Expected: every measurement finding has component/source, step, Fiber evidence, owner chain and props/state/context/hooks change summary; diagnosis timings are absent from baseline candidates.

- [ ] **Step 4: 在仓库外运行完整 packed consumer 扫描**

Run: `PERFORMANCE_CONSUMER_DIR="$(mktemp -d)" bash scripts/performance-consumer.sh --full --resume --output .hulian-scan/packed-initial`

Expected: all public scenarios run from tarballs, workspace path assertions pass, the ordinary consumer bundle contains no scanner, and no result is silently missing.

- [ ] **Step 5: 显式写入首版基线**

Run: `node scripts/hulian-scan.mjs --update --from .hulian-scan/packed-initial/summary.json`

Expected: terminal prints every old/new/delta line; `scripts/performance-baseline.json` contains all eligible React 19 packed scenarios; hard violations and incomplete scenarios are excluded and remain findings rather than becoming accepted baseline values.

- [ ] **Step 6: 生成不截断的首扫报告**

Generate `docs/performance/hulian-scan-initial-report.md` with exact git revision, dirty-path note, Chromium/Node/React versions, inventory totals, category coverage, workspace and packed columns, every hard violation, every statistical finding, all infrastructure failures, and links to raw artifact paths. Ranking can appear first, but the appendix must contain all scenarios and findings.

- [ ] **Step 7: 用真实 findings 编写组件优化计划**

Create `docs/superpowers/plans/2026-08-01-hulian-scan-component-optimizations.md` using the writing-plans skill. For each hard violation and high-impact finding, name the exact component source/test/scenario files, reproduce the pre-fix metric, write a failing regression test, specify the smallest evidence-supported code change, rerun the same workspace and packed scenario, and record the required before/after table. Order work by total interaction cost and cascade impact, not by terminal Top N truncation; every hard violation must have an owning task.

- [ ] **Step 8: 自审首次扫描的完成性**

Run:

```bash
node scripts/hulian-scan.mjs --full --environment packed-consumer --from-baseline scripts/performance-baseline.json --report-only
pnpm --filter @hulianui/hulian-scan test
pnpm --filter @hulianui/perf-lab test
pnpm typecheck
pnpm test
pnpm test:scripts
pnpm size
```

Expected: report-only scan completes all scenarios and prints the real finding count without converting findings to exit-zero claims; scanner fixtures prove known-bad is caught and known-good passes; inventory is 100%; packed consumer infrastructure passes; existing checks do not regress. Component hard violations found by the initial scan remain explicit red findings owned by tasks in the newly generated optimization plan, so this foundation plan is complete but Hulian Scan v1 is not declared complete until that optimization plan clears them.

- [ ] **Step 9: 提交只含基线、报告和优化计划的证据**

```bash
git add scripts/performance-baseline.json docs/performance/hulian-scan-initial-report.md docs/superpowers/plans/2026-08-01-hulian-scan-component-optimizations.md
git diff --cached --name-only
git diff --cached --check
git commit -m "perf: record initial HulianUI global scan"
```

---

## Completion Boundary

This plan is complete when the internal tool, 100% public inventory, generic and specialized scenarios, two-stage runner, packed consumer, CI gate, first full scan, initial baseline and data-driven optimization plan all exist and have passed their stated checks. It deliberately does not claim Hulian Scan v1 completion: the approved design's final conditions—zero deterministic violations and measured component source optimizations—are completed by `2026-08-01-hulian-scan-component-optimizations.md`, whose exact targets can only be named after Task 12 supplies real evidence.
