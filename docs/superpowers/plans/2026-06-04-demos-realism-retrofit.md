# Demo 真实化交互态补全 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给 6 个内置 demo 补齐真实项目的完整交互生命周期（加载→空/异常→操作→反馈→二次确认），并把组件覆盖率从 48% 拉到 ≥ 60%。

**Architecture:** 先建一份共享异步基建 `demos/lib/async.ts`（`useMockData` / `usePending`），把同步内存 mock 包成带延迟的异步态，驱动 Skeleton / Spinner / ProTable loading；再逐 demo 按统一「转换配方」补 toast / Popconfirm / AlertDialog / Tooltip / Skeleton 等。每个 demo 独立可执行、独立 commit（建议各起一个 session 控成本）。

**Tech Stack:** Next 16 + React 19 + `@hulian/ui`（Base UI 桥）+ vitest/jsdom + @testing-library/react。

**执行依据：** 本计划是 `docs/superpowers/specs/2026-06-04-demos-realism-audit.md` 的落地。每个 demo 的「改什么」以报告 §6 为准，本计划给「怎么改」的配方 + Phase 0 完整代码 + CRM 完整范例。

**全局约束（每个 task 都适用）：**
- 100% dogfood，禁止手搓库里已有的东西；撞缺口回 `@hulian/ui` 修组件（记忆 `fix-component-not-demo-css-patch`）。
- 视觉验证用真实浏览器，不用 headless CLI（记忆 `www-msw-gate-blanks-headless-screenshots`）；MCP 浏览器被占起隔离 Chrome-for-Testing（记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。
- 起预览用 `pnpm --filter www dev`，不在根目录 `pnpm dev`（记忆 `hulian-pnpm-dev-killstale-kills-5514`）。
- 落盘用显式 pathspec `git add <files>`，不 `git add -A`（共享文件常带他会话 WIP）。

---

## File Structure

| 文件 | 责任 | 动作 |
|---|---|---|
| `apps/www/app/demos/lib/async.ts` | 异步 mock 基建：`useMockData` / `usePending` / `sleep` | 新建 |
| `apps/www/app/demos/lib/async.test.ts` | 上述 hook 行为测试 | 新建 |
| `apps/www/app/demos/lib/skeletons.tsx` | `TableSkeleton` / `CardSkeleton` / `ListSkeleton` 复用骨架 | 新建 |
| 各 demo `(app)/**/page.tsx`、`_components/**` | 接入加载/反馈/确认/Tooltip | 改 |

---

## Phase 0 · 共享基建（所有 demo 的前置，必须先做）

### Task 1: `useMockData` / `usePending` / `sleep`

**Files:**
- Create: `apps/www/app/demos/lib/async.ts`
- Test: `apps/www/app/demos/lib/async.test.ts`

- [ ] **Step 1: 写失败测试**

`apps/www/app/demos/lib/async.test.ts`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useMockData, usePending } from "./async";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useMockData", () => {
  it("初始 loading=true,延迟后翻 false 并给出 data", async () => {
    const { result } = renderHook(() => useMockData({ n: 1 }, { delay: 100 }));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => { await vi.advanceTimersByTimeAsync(100); });
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual({ n: 1 });
    expect(result.current.error).toBeNull();
  });

  it("failOnce:首次出 error,reload 后成功", async () => {
    const { result } = renderHook(() => useMockData("ok", { delay: 50, failOnce: true }));
    await act(async () => { await vi.advanceTimersByTimeAsync(50); });
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeNull();
    await act(async () => { result.current.reload(); await vi.advanceTimersByTimeAsync(50); });
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe("ok");
  });
});

describe("usePending", () => {
  it("run 期间 pending=true,结束后 false 并执行 fn", async () => {
    const fn = vi.fn();
    const { result } = renderHook(() => usePending());
    let p: Promise<void>;
    act(() => { p = result.current[1](fn); });
    expect(result.current[0]).toBe(true);
    await act(async () => { await vi.advanceTimersByTimeAsync(800); await p; });
    expect(result.current[0]).toBe(false);
    expect(fn).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter www test -- async.test`
Expected: FAIL（`async.ts` 不存在 / 无导出）

- [ ] **Step 3: 写实现**

`apps/www/app/demos/lib/async.ts`（jitter 用固定上界，避免 fake timer 不确定；测试传显式 delay）:

```tsx
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/** demo 用：模拟网络延迟，让 loading/skeleton 等真实态有戏。 */
export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const jitter = (min = 350, max = 800) => min + Math.floor(Math.random() * (max - min));

/** 初始加载态：seed 延迟返回，驱动 Skeleton / ProTable.loading。failOnce 模拟一次失败 + reload 重试。 */
export function useMockData<T>(seed: T, opts?: { delay?: number; failOnce?: boolean }) {
  const seedRef = useRef(seed);
  seedRef.current = seed;
  const failedRef = useRef(false);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    await sleep(opts?.delay ?? jitter());
    if (opts?.failOnce && !failedRef.current) {
      failedRef.current = true;
      setError("加载失败，请重试（demo 模拟）");
      setLoading(false);
      return;
    }
    setData(seedRef.current);
    setLoading(false);
  }, [opts?.delay, opts?.failOnce]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}

/** 提交/动作 pending：包一层延迟 + try/finally，配 Spinner + disabled。 */
export function usePending() {
  const [pending, setPending] = useState(false);
  const run = useCallback(async (fn: () => void | Promise<void>) => {
    setPending(true);
    try {
      await sleep(jitter(300, 600));
      await fn();
    } finally {
      setPending(false);
    }
  }, []);
  return [pending, run] as const;
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `pnpm --filter www test -- async.test`
Expected: PASS（5 个用例全绿）

- [ ] **Step 5: Commit**

```bash
git add apps/www/app/demos/lib/async.ts apps/www/app/demos/lib/async.test.ts
git commit -m "feat(demo): 共享异步 mock 基建 useMockData/usePending + 测试"
```

### Task 2: 复用骨架组件

**Files:**
- Create: `apps/www/app/demos/lib/skeletons.tsx`

- [ ] **Step 1: 实现（基于 @hulian/ui 的 Skeleton，无需测试——纯展示，靠浏览器验）**

```tsx
import { Skeleton } from "@hulian/ui";

/** 表格加载骨架：rows×cols 个灰块。配 ProTable 外或独立列表用。 */
export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="加载中">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="加载中">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border p-4">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="加载中">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: typecheck + commit**

Run: `pnpm --filter www typecheck`
Expected: 无新增错误

```bash
git add apps/www/app/demos/lib/skeletons.tsx
git commit -m "feat(demo): 复用骨架组件 TableSkeleton/CardSkeleton/ListSkeleton"
```

---

## 转换配方（Phase 1-6 共用，CRM 任务给完整范例，其余 demo 套用）

每个 demo 执行前**先 Read 该 demo 的目标文件**，再按下表替换：

| 缺口 | 现状反模式 | 替换为 |
|---|---|---|
| 列表加载态 | `const [rows] = useState(seed)` | `const { data, loading, reload } = useMockData(seed); const rows = data ?? []` → `<ProTable loading={loading} ... />`；非 ProTable 列表用 `{loading ? <ListSkeleton/> : ...}` |
| 卡片/详情加载态 | 同步渲染 | `{loading ? <CardSkeleton/> : <真实内容>}` |
| 加载失败 | 无 | `useMockData(seed,{failOnce:true})` 的页加 `{error && <Alert tone="danger" action={<Button onClick={reload}>重试</Button>}>{error}</Alert>}` |
| 操作反馈 | 静默 `setRows(...)` | 动作后 `toast({ title:"已保存", tone:"info" })`；失败 `tone:"danger"` |
| 提交中 | 同步 | `const [pending, run] = usePending()` → `onClick={() => run(() => 真实改)}`，按钮 `disabled={pending}` + `{pending ? <Spinner size="sm"/> : "保存"}` |
| 行内删除确认 | 直接删 / 无 | `<Popconfirm onConfirm={...}>` 包删除钮（照 crm/customers:176 范式） |
| 重操作确认 | 无 | 清空/批量删/注销用 `<AlertDialog>`（trigger + 危险确认） |
| 纯图标钮 | 裸 `<Button size="iconSm"><Icon/></Button>` | `<Tooltip><TooltipTrigger render={<Button.../>}/><TooltipContent>删除</TooltipContent></Tooltip>` |

**API 速查**（已核实，见报告 §5）：`ProTable` 内置 `loading` prop；`toast({title,description?,tone})`；`Spinner size="sm|md|lg"`；`Skeleton className`。

---

## Phase 1 · CRM（完整范例 · 其余 demo 照此套配方）

报告 §6.F。**Files:** `(app)/{customers,opportunities,orders}/page.tsx`、`_components/customer-detail.tsx`。

### Task 3: CRM 三个列表页加载态 + 失败重试

- [ ] **Step 1: Read** `apps/www/app/demos/crm/(app)/customers/page.tsx` 全文，定位 `const [rows, setRows] = useState<Customer[]>(seed)`。

- [ ] **Step 2: 接入 useMockData**（customers 为例，opportunities/orders 同样处理）

把：
```tsx
const [rows, setRows] = useState<Customer[]>(seed);
```
改为：
```tsx
const { data, loading, error, reload } = useMockData(seed);
const [rows, setRows] = useState<Customer[]>([]);
useEffect(() => { if (data) setRows(data); }, [data]);
```
import 顶部加：`import { useEffect } from "react";`（若未引）、`import { useMockData } from "../../../lib/async";`、`Alert`、`Spinner` 从 `@hulian/ui`。
给 `<ProTable ... />` 加 `loading={loading}`。
表格上方插失败条：
```tsx
{error && (
  <Alert tone="danger" className="mb-3">
    {error} <Button size="sm" variant="ghost" onClick={reload}>重试</Button>
  </Alert>
)}
```

- [ ] **Step 3: 验证（真实浏览器）**

起 `pnpm --filter www dev`，开隔离 Chrome 访问 `http://localhost:5512/demos/crm/customers`，**录到首屏骨架/loading 帧**（≥300ms 可见），列表随后出现。截图存档。

- [ ] **Step 4: Commit**

```bash
git add "apps/www/app/demos/crm/(app)/customers/page.tsx" "apps/www/app/demos/crm/(app)/opportunities/page.tsx" "apps/www/app/demos/crm/(app)/orders/page.tsx"
git commit -m "feat(demo/crm): 列表页接 useMockData 加载态 + 失败重试 Alert"
```

### Task 4: CRM 图标钮 Tooltip + 提交 pending + 高危 AlertDialog

- [ ] **Step 1:** customers 行内删除（`Popconfirm` 已有）旁的编辑/查看纯图标钮 → 包 `Tooltip`（配方表第 8 行）。

- [ ] **Step 2:** `ModalForm` 提交从同步 `setRows` 改 `const [pending, run] = usePending()`，提交按钮 `disabled={pending}` + Spinner；成功 `toast`。

- [ ] **Step 3:** 若有「批量删除/清空」入口，用 `AlertDialog` 二次确认；无则在 settings 加一个「重置演示数据」走 AlertDialog 演示该件。

- [ ] **Step 4:** 浏览器验证 hover 出 Tooltip、提交转圈、AlertDialog 弹出 → 截图。

- [ ] **Step 5: Commit**

```bash
git add "apps/www/app/demos/crm/(app)/customers/page.tsx" "apps/www/app/demos/crm/(app)/settings/page.tsx"
git commit -m "feat(demo/crm): 图标钮 Tooltip + 提交 pending + 高危 AlertDialog 确认"
```

### Task 5: CRM 氛围件 Watermark + BackTop

- [ ] **Step 1:** `(app)/layout.tsx` 外层包 `Watermark`（content 如「瑚琏 CRM · 演示」）；长内容区底加 `BackTop`。
- [ ] **Step 2:** 浏览器验证水印铺满、滚动出现回顶钮 → 截图。
- [ ] **Step 3: Commit**

```bash
git add "apps/www/app/demos/crm/(app)/layout.tsx"
git commit -m "feat(demo/crm): Watermark 水印 + BackTop 回顶"
```

---

## Phase 2 · projects（报告 §6.B · 现 0 toast，最优先补反馈）

**Files:** `(app)/{tracking,quotes,invoices,checkout,photos}/page.tsx`、`_components/{quote-editor,checkout-cashier,project-detail}.tsx`。

### Task 6: projects 加载态 + 全操作 toast

- [ ] **Step 1: Read** 上述各 page + components，列出所有 `onClick` mutation（报告 §2.2 计 9 个）与 8 个图标钮位置。
- [ ] **Step 2:** tracking/quotes/invoices 列表接 `useMockData` + `loading`（配方表第 1 行）。
- [ ] **Step 3:** 每个 mutation（报价保存、生成单据、开票、作废、收款、上传照片）后补 `toast`（成功 info / 失败 danger），消除全部静默。
- [ ] **Step 4:** 报价生成器保存 / 生成单据用 `usePending` + Spinner。收银台轮询支付态用 Spinner「等待支付」+ 成功 toast。
- [ ] **Step 5:** 浏览器逐操作验证有 toast → 截图。`pnpm --filter www demos:coverage` 看覆盖率升。
- [ ] **Step 6: Commit**（显式列 projects 下改动文件）`git commit -m "feat(demo/projects): 列表加载态 + 全操作 toast 反馈 + 提交 pending"`

### Task 7: projects 二次确认 + Tooltip + 氛围件

- [ ] **Step 1:** 删报价行、作废发票、取消收款 → `Popconfirm`/`AlertDialog`。
- [ ] **Step 2:** 8 个图标钮（打印/预览/删除行/收银等）全包 `Tooltip`。
- [ ] **Step 3:** `(app)/layout.tsx` 加 `Watermark` + `BackTop`。
- [ ] **Step 4:** 逾期回款处加 `Alert` 告警条。
- [ ] **Step 5:** 浏览器验证 → 截图。
- [ ] **Step 6: Commit** `git commit -m "feat(demo/projects): 危险操作二次确认 + 图标钮 Tooltip + Watermark/BackTop/Alert"`

---

## Phase 3 · ai-workflow（报告 §6.A · 现 0 toast + 独家 Tour）

**Files:** `_components/canvas/{run-panel,inspector,palette,node-card}.tsx`、`(app)/{templates,gallery,profile}/page.tsx`、`_lib/use-flow-run.ts`、`_components/studio-shell.tsx`。

### Task 8: ai-workflow 运行反馈 + 加载态

- [ ] **Step 1: Read** `studio-shell.tsx`、`use-flow-run.ts`、canvas 子件。
- [ ] **Step 2:** 运行流水线：ShimmerButton 触发后 `pending` + Spinner + 禁用；`use-flow-run` 每节点完成/失败发 `toast`，整体完成成功 toast。
- [ ] **Step 3:** templates/gallery 进入接 `useMockData` → 上方 `CardSkeleton`/`TableSkeleton` 占位。
- [ ] **Step 4:** 模板灌画布、产物下载/删除补 `toast`。
- [ ] **Step 5:** 浏览器验证运行中转圈 + 逐节点 toast + 画廊骨架 → 截图。
- [ ] **Step 6: Commit** `git commit -m "feat(demo/ai-workflow): 运行/节点/产物 toast 反馈 + 模板画廊加载骨架"`

### Task 9: ai-workflow 节点确认 + Tooltip + 首进 Tour

- [ ] **Step 1:** 删节点 / 清空画布 → `AlertDialog` 确认 + toast。
- [ ] **Step 2:** 画布节点连桩 / 工具栏图标钮 → `Tooltip`。
- [ ] **Step 3:** 首次进画布加 `Tour` 引导（高亮 Palette→画布→运行钮，本 demo 独家示范该件）。
- [ ] **Step 4:** 浏览器验证 Tour 走查 + 确认框 → 截图。
- [ ] **Step 5: Commit** `git commit -m "feat(demo/ai-workflow): 节点删除 AlertDialog + 桩位 Tooltip + 首进 Tour 引导"`

---

## Phase 4 · customer-service（报告 §6.C）

**Files:** `_components/workbench/*`、`_components/ticket-detail.tsx`、`(app)/{tickets,knowledge,analytics}/page.tsx`。

### Task 10: customer-service 加载态 + 确认 + HoverCard/Tooltip

- [ ] **Step 1:** 会话工作台进线/加载历史 → `Skeleton`/`Spinner`；工单 ProTable → `loading`。
- [ ] **Step 2:** 转接/关闭工单/删除知识 → `Popconfirm` + toast（补齐每个 mutation）。
- [ ] **Step 3:** 坐席头像/客户名 → `HoverCard` 资料卡预览；工具栏图标钮 → `Tooltip`。
- [ ] **Step 4:** layout 加 `Watermark`；进线告警用 `Alert` 条。
- [ ] **Step 5:** 浏览器验证 → 截图。
- [ ] **Step 6: Commit** `git commit -m "feat(demo/customer-service): 加载态 + 结单二次确认 + HoverCard/Tooltip + Watermark"`

---

## Phase 5 · ai-chat（报告 §6.D · 已较好，补异步+帮助）

**Files:** `page.tsx`、`use-chat-stream.ts`。

### Task 11: ai-chat 会话骨架 + 删除确认 + Tooltip/Kbd

- [ ] **Step 1:** 新建/切换会话加载历史 → `ListSkeleton` 气泡占位。
- [ ] **Step 2:** 删除会话 → `Popconfirm`。
- [ ] **Step 3:** MessageActions 图标钮补 `Tooltip`；引用来源加 `HoverCard` 预览；快捷键提示用 `Kbd`。
- [ ] **Step 4:** 浏览器验证 → 截图。
- [ ] **Step 5: Commit** `git commit -m "feat(demo/ai-chat): 会话加载骨架 + 删除 Popconfirm + Tooltip/HoverCard/Kbd"`

---

## Phase 6 · website（报告 §6.E · 补转化态 + 设备外壳）

**Files:** `_components/contact-form.tsx`、`_components/sections/*`、`_components/pricing-*.tsx`。

### Task 12: website 表单完整态 + Tooltip + 设备外壳 mockups

- [ ] **Step 1:** 联系表单提交 → `usePending` + Spinner + 成功 `toast` / 失败 `Alert`（演完整表单态）。
- [ ] **Step 2:** 顶栏导航/定价项加 `Tooltip` 解释；可选顶栏 `Command` ⌘K 站内搜索。
- [ ] **Step 3:** 产品展示区用设备外壳（`Safari`/`iPhone`/`Android`/`Tablet`）套真实截图，覆盖 mockups 类。
- [ ] **Step 4:** 长落地页底加 `BackTop`。
- [ ] **Step 5:** 浏览器验证 → 截图。
- [ ] **Step 6: Commit** `git commit -m "feat(demo/website): 表单提交完整态 + Tooltip + 设备外壳多端预览 + BackTop"`

---

## 收尾 · Task 13: 覆盖率与全局验收

- [ ] **Step 1:** `pnpm --filter www demos:coverage` —— 确认覆盖率 ≥ 60%（从 48% 升），打印剩余盲区。
- [ ] **Step 2:** `pnpm --filter www test` 全绿；`pnpm --filter @hulian/ui test` 全绿（若动过组件）。
- [ ] **Step 3:** 逐 demo 真实浏览器跑一遍，确认报告 §7 六条验收全满足、零 console error。
- [ ] **Step 4:** mobile 整类盲区确认仍记在 README §7 backlog（本轮不做）。
- [ ] **Step 5:** 若覆盖率未及 60%，从剩余盲区里挑自然场景的件补到现有 demo（不堆砌），再验。

---

## Self-Review 记录

- **Spec 覆盖：** 报告 §3 交互态 → Phase 0 基建 + 各 demo task；§5 API → 配方表；§6.A-F → Phase 1-6 一一对应；§9.2 mobile → 记 backlog（Task 13 Step 4）；§9.3 设备外壳 → Task 12 Step 3；覆盖率门禁 → Task 13 Step 1。无遗漏。
- **类型一致：** `useMockData` 返回 `{data,loading,error,reload}`、`usePending` 返回 `[pending, run]`——Phase 0 定义与各 demo 调用一致。
- **无占位：** Phase 0 给完整代码 + 测试；per-demo task 因需逐文件 Read 后改，统一用配方表 + CRM 完整范例驱动，每步有明确文件/动作/验证/commit。
