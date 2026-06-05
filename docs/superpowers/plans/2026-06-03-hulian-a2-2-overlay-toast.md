# Toast（命令式轻提示）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 给瑚琏 `@hulianui/ui` 加第一个 imperative 组件 Toast —— `toast({title,description,tone})` 任意处触发、自动消失 + 队列堆叠 + 手动关闭，挂一个全局 `<ToastProvider/>` 即工作。

**Architecture:** Base UI rc.0 `toast`，用 `createToastManager()` 建模块级全局单例 manager（触发与渲染解耦）；`toast()` 薄函数调 `manager.add()`；`<ToastProvider/>` 自闭合组件内含 `Toast.Provider(toastManager=单例) + Toast.Viewport + 遍历 toasts 渲瑚琏皮肤 Toast.Root`，在 `apps/www/app/components/layout.tsx` 单挂一次。皮肤=抬升 surface + tone 左边条。

**Tech Stack:** React 19 + Base UI `@base-ui-components/react@1.0.0-rc.0` toast + Tailwind v4 语义 token + motion-token CSS 镜像 + vitest/RTL + Next 16(www)。

**关键事实（已 require.resolve + 读 .d.ts/.js 实证，勿凭记忆改）：**
- `import { Toast } from "@base-ui-components/react/toast"`；部件 `Toast.Provider/Viewport/Root/Title/Description/Close`，`Toast.useToastManager()`、`Toast.createToastManager()`。
- `createToastManager()` → `{ add, close, update, promise, ' subscribe' }`，框架无关、SSR 安全。
- `useToastManager()` → `{ toasts, add, close, update, promise }`，须在 `Toast.Provider` 内。
- `add(opts)`：`{ title?, description?, type?:string, timeout?:number(0=不消失,默认Provider5000), priority?:'low'|'high', id? }` → 返回 `string` id。
- `Toast.Provider` props：`timeout?`(默认5000)/`limit?`(默认3)/`toastManager?`。
- `Toast.Root` props：`toast: ToastObject`（**必传**）。
- `Toast.Title`/`Toast.Description` **无 children 时自动渲染 `toast.title`/`toast.description`**（`childrenProp ?? toast.title`，空则 `return null`）→ 列表里放空 `<Toast.Title/>`/`<Toast.Description/>` 即可。
- **不用** `Positioner/Portal/Arrow`（仅锚定 toast 用，YAGNI）；`Viewport` 自身 `position:fixed`。
- tone→token 类名（与 Alert 一致）：info→`primary`、danger→`danger`、neutral→`border`/`foreground`。

---

## File Structure

| 文件 | 责任 | 新建/改 |
|------|------|--------|
| `packages/ui/src/toast/toast.types.ts` | `ToastTone` / `ToastOptions` 类型 | 新建 |
| `packages/ui/src/toast/toast.tsx` | `"use client"`：单例 manager + `toast()` + `ToastProvider` + 内部列表/皮肤 | 新建 |
| `packages/ui/src/toast/toast.showcase.tsx` | `"use client"`：触发器 states + playground | 新建 |
| `packages/ui/src/toast/toast.test.tsx` | vitest/RTL 单测 | 新建 |
| `packages/ui/src/toast/index.ts` | 桶导出 | 新建 |
| `packages/ui/src/index.ts` | 主 barrel +`export * from "./toast"` | 改 |
| `apps/www/lib/manifest.ts` | +1 行 toast 元数据 | 改 |
| `apps/www/lib/registry.tsx` | import + map toastShowcase | 改 |
| `apps/www/app/components/layout.tsx` | 单挂 `<ToastProvider/>` | 改 |

---

## Task 1: 类型 + 桶骨架

**Files:**
- Create: `packages/ui/src/toast/toast.types.ts`
- Create: `packages/ui/src/toast/index.ts`

- [ ] **Step 1: 写类型**

`packages/ui/src/toast/toast.types.ts`:
```ts
import type { ReactNode } from "react";

/** 复用 Alert 语义 tone（无 success：token 无）。 */
export type ToastTone = "info" | "danger" | "neutral";

export interface ToastOptions {
  /** 标题（加粗主行）。 */
  title?: ReactNode;
  /** 描述（次行，恒 text-muted）。 */
  description?: ReactNode;
  /** 语调，驱动左边条 + 标题着色。默认 "neutral"。 */
  tone?: ToastTone;
  /** 自动消失毫秒数；0 = 不自动消失。缺省取 Provider 默认（5000）。 */
  timeout?: number;
}
```

- [ ] **Step 2: 写桶导出（先占位，Task 2 后补全）**

`packages/ui/src/toast/index.ts`:
```ts
export type { ToastTone, ToastOptions } from "./toast.types";
export { toast, ToastProvider } from "./toast";
export { toastShowcase } from "./toast.showcase";
```

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/toast/toast.types.ts packages/ui/src/toast/index.ts
git commit -m "feat(ui): A2.2 Toast 起步 — ToastTone/ToastOptions 类型 + 桶骨架"
```

---

## Task 2: 核心组件（manager + toast() + ToastProvider + 列表）

**Files:**
- Create: `packages/ui/src/toast/toast.tsx`
- Test: `packages/ui/src/toast/toast.test.tsx`

- [ ] **Step 1: 写第一个失败测试（toast() 触发 → Provider 渲出 title）**

`packages/ui/src/toast/toast.test.tsx`:
```tsx
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { toast, ToastProvider } from "./toast";

describe("Toast", () => {
  afterEach(() => {
    // 清干净已弹的 toast，避免测试间串扰
    act(() => {
      // 关闭所有：再渲染一个空 Provider 不够，靠各测试自身 timeout/close；此处仅占位
    });
  });

  it("toast() 触发后 Provider 渲出 title 与 description", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存", description: "更改已成功同步。" });
    });
    expect(screen.getByText("已保存")).toBeInTheDocument();
    expect(screen.getByText("更改已成功同步。")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `cd packages/ui && pnpm vitest run src/toast/toast.test.tsx`
Expected: FAIL（`toast`/`ToastProvider` 未定义 / 模块不存在）

- [ ] **Step 3: 写实现**

`packages/ui/src/toast/toast.tsx`:
```tsx
"use client";
import { Toast } from "@base-ui-components/react/toast";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { ToastOptions, ToastTone } from "./toast.types";

// 模块级全局单例 manager：触发(toast())与渲染(<ToastProvider/>)解耦。框架无关、SSR 安全。
const hulianToastManager = Toast.createToastManager();

/** 命令式触发一条 toast。返回 toast id。页面任意处可调，只要挂了一个 <ToastProvider/>。 */
export function toast(options: ToastOptions): string {
  const { title, description, tone = "neutral", timeout } = options;
  return hulianToastManager.add({
    title,
    description,
    type: tone, // 用 Base UI type 承载瑚琏 tone，列表里据此上皮肤
    priority: tone === "danger" ? "high" : "low", // 错误 urgent 播报，其余 polite
    ...(timeout !== undefined && { timeout }),
  });
}

// tone → 左边条 + 标题着色（与 Alert 语义 token 一致；neutral 用中性 border/foreground）。
const toneBorder: Record<ToastTone, string> = {
  info: "border-l-primary",
  danger: "border-l-danger",
  neutral: "border-l-border",
};
const toneTitle: Record<ToastTone, string> = {
  info: "text-primary",
  danger: "text-danger",
  neutral: "text-foreground",
};

const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => {
    const tone = (t.type as ToastTone) ?? "neutral";
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "flex items-start gap-3 rounded-[var(--radius)] border border-l-2 border-border bg-surface p-4 shadow-lg",
          toneBorder[tone] ?? toneBorder.neutral,
          // 进出场：滑入 + 淡入，用 motion-token CSS 镜像驱动 Base UI data-* 过渡
          "transition-[opacity,transform] data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0 data-[ending-style]:translate-x-4 data-[ending-style]:opacity-0",
        )}
        style={overlayTransition}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Toast.Title className={cn("text-sm font-medium", toneTitle[tone] ?? toneTitle.neutral)} />
          <Toast.Description className="text-sm text-muted" />
        </div>
        <Toast.Close
          aria-label="关闭"
          className="shrink-0 rounded-[var(--radius)] p-0.5 text-muted outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
          </svg>
        </Toast.Close>
      </Toast.Root>
    );
  });
}

/** 单挂一次（推荐 /components 段 layout）。含 Viewport + 列表；自闭合，无需外部 children。 */
export function ToastProvider() {
  return (
    <Toast.Provider toastManager={hulianToastManager}>
      <Toast.Viewport className="fixed right-4 top-4 z-[60] flex w-[min(90vw,22rem)] flex-col gap-2 outline-none">
        <ToastList />
      </Toast.Viewport>
    </Toast.Provider>
  );
}
```

- [ ] **Step 4: 跑测试确认通过**

Run: `cd packages/ui && pnpm vitest run src/toast/toast.test.tsx`
Expected: PASS（1 passed）

- [ ] **Step 5: 提交**

```bash
git add packages/ui/src/toast/toast.tsx packages/ui/src/toast/toast.test.tsx
git commit -m "feat(ui): Toast 核心 — createToastManager 全局单例 + toast() + ToastProvider(Viewport+列表) + tone 皮肤"
```

---

## Task 3: tone 皮肤 + 结构断言

**Files:**
- Modify: `packages/ui/src/toast/toast.test.tsx`

- [ ] **Step 1: 加 tone 皮肤测试**

在 `toast.test.tsx` 的 `describe` 内追加：
```tsx
it("danger tone 上 border-l-danger + 标题 text-danger", () => {
  render(<ToastProvider />);
  act(() => {
    toast({ title: "出错了", tone: "danger" });
  });
  const title = screen.getByText("出错了");
  expect(title).toHaveClass("text-danger");
  // 容器（Toast.Root）带 danger 左边条
  const root = title.closest("[class*='border-l-danger']");
  expect(root).not.toBeNull();
});

it("info tone 上 border-l-primary + 标题 text-primary", () => {
  render(<ToastProvider />);
  act(() => {
    toast({ title: "提示", tone: "info" });
  });
  expect(screen.getByText("提示")).toHaveClass("text-primary");
});

it("默认 tone=neutral：标题 text-foreground", () => {
  render(<ToastProvider />);
  act(() => {
    toast({ title: "普通" });
  });
  expect(screen.getByText("普通")).toHaveClass("text-foreground");
});
```

- [ ] **Step 2: 跑测试确认通过**

Run: `cd packages/ui && pnpm vitest run src/toast/toast.test.tsx`
Expected: PASS（4 passed）。若 jsdom 中多条 toast 跨测试串扰（前一条未消失），在每个 `it` 用唯一 title 文案区分（已满足）。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/toast/toast.test.tsx
git commit -m "test(ui): Toast tone 皮肤断言(info/danger/neutral 左边条+标题着色)"
```

---

## Task 4: Close 关闭 + timeout 透传

**Files:**
- Modify: `packages/ui/src/toast/toast.test.tsx`

- [ ] **Step 1: 加 Close + timeout 测试**

追加（顶部 import 补 `fireEvent`、`waitForElementToBeRemoved`）：
```tsx
import { act, fireEvent, render, screen, waitForElementToBeRemoved } from "@testing-library/react";

it("点 Close 按钮后该 toast 移除", async () => {
  render(<ToastProvider />);
  act(() => {
    toast({ title: "可关闭项", timeout: 0 }); // 0=不自动消失，隔离计时干扰
  });
  const title = screen.getByText("可关闭项");
  const closeBtn = screen.getByRole("button", { name: "关闭" });
  fireEvent.click(closeBtn);
  await waitForElementToBeRemoved(() => screen.queryByText("可关闭项"));
  expect(screen.queryByText("可关闭项")).toBeNull();
});

it("timeout:0 不自动消失（用 fake timers 推进仍在）", () => {
  vi.useFakeTimers();
  try {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "常驻项", timeout: 0 });
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText("常驻项")).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});
```
> 顶部 import 补 `vi`：`import { afterEach, describe, expect, it, vi } from "vitest";`

- [ ] **Step 2: 跑测试确认通过**

Run: `cd packages/ui && pnpm vitest run src/toast/toast.test.tsx`
Expected: PASS（6 passed）。
> 若 fake timers 与 Base UI 内部 raf/transition 冲突致 flaky：降级为断言「`toast({timeout:0})` 后元素当下在文档」并删除 advanceTimersByTime 那段（保留自动消失时序给 Playwright 验）。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/toast/toast.test.tsx
git commit -m "test(ui): Toast 手动 Close 移除 + timeout:0 不自动消失"
```

---

## Task 5: 主 barrel 导出 + typecheck

**Files:**
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 主 barrel 加 toast**

在 `packages/ui/src/index.ts` 的「组件」段末尾（`export * from "./drawer";` 之后）加：
```ts
export * from "./toast";
```

- [ ] **Step 2: 跑 typecheck + 全 ui 测试**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && (cd packages/ui && pnpm vitest run src/toast)`
Expected: typecheck 0 error；toast 测试全绿。
> 若全量 `pnpm test` 因并行 session untracked WIP 红 → isolate 不碰（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]），只认 toast scope 绿。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/index.ts
git commit -m "feat(ui): Toast 接主 barrel"
```

---

## Task 6: showcase（imperative 触发器承载）

**Files:**
- Create: `packages/ui/src/toast/toast.showcase.tsx`

- [ ] **Step 1: 写 showcase**

`packages/ui/src/toast/toast.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "../button/button";
import { toast } from "./toast";
import type { ToastTone } from "./toast.types";

// imperative 承载：Provider 由 /components 段 layout 单挂（见 spec §3.2），
// showcase 只放「点我弹 toast」触发按钮，绝不在此挂 Provider（ComponentDoc 双渲染 states[0] 会重复）。

export const toastShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["info", "danger", "neutral"], defaultValue: "neutral", label: "语调" },
    { prop: "title", type: "text", defaultValue: "已保存", label: "标题" },
    { prop: "description", type: "text", defaultValue: "更改已成功同步。", label: "描述" },
    { prop: "timeout", type: "number", defaultValue: 5000, label: "消失(ms,0=常驻)" },
  ],
  states: [
    {
      name: "info",
      render: () => (
        <Button variant="outline" onClick={() => toast({ tone: "info", title: "有新版本", description: "点击刷新以更新。" })}>
          弹 info
        </Button>
      ),
    },
    {
      name: "danger",
      render: () => (
        <Button variant="outline" onClick={() => toast({ tone: "danger", title: "保存失败", description: "网络异常，请重试。" })}>
          弹 danger
        </Button>
      ),
    },
    {
      name: "neutral",
      render: () => (
        <Button variant="outline" onClick={() => toast({ title: "已复制到剪贴板" })}>
          弹 neutral
        </Button>
      ),
    },
    {
      name: "常驻(timeout:0)",
      render: () => (
        <Button variant="outline" onClick={() => toast({ title: "需手动关闭", description: "timeout=0，点 × 才消失。", timeout: 0 })}>
          弹常驻
        </Button>
      ),
    },
    {
      name: "堆叠(limit 3)",
      render: () => (
        <Button
          variant="outline"
          onClick={() => {
            toast({ tone: "info", title: "第 1 条" });
            toast({ tone: "neutral", title: "第 2 条" });
            toast({ tone: "danger", title: "第 3 条" });
          }}
        >
          连发 3 条
        </Button>
      ),
    },
  ],
  renderWithProps: (p) => (
    <Button
      onClick={() =>
        toast({
          tone: p.tone as ToastTone,
          title: p.title as string,
          description: p.description as string,
          timeout: p.timeout as number,
        })
      }
    >
      弹出 toast
    </Button>
  ),
  toCode: (p) =>
    `toast({\n  tone: "${p.tone}",\n  title: "${p.title}",\n  description: "${p.description}",\n  timeout: ${p.timeout},\n})`,
};
```

- [ ] **Step 2: typecheck**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck`
Expected: 0 error。

- [ ] **Step 3: 提交**

```bash
git add packages/ui/src/toast/toast.showcase.tsx
git commit -m "feat(ui): Toast showcase — 触发器画廊(info/danger/neutral/常驻/堆叠)+ playground(零 Provider in state)"
```

---

## Task 7: IA 接入（manifest + registry + layout 单挂 Provider）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`
- Modify: `apps/www/app/components/layout.tsx`

- [ ] **Step 1: manifest +1 行（feedback 分类，status new）**

先 `grep -n "category: \"feedback\"" apps/www/lib/manifest.ts` 找到 feedback 组位置，在该组末尾（如 popover 那行后）加：
```ts
  { slug: "toast", name: "Toast", description: "命令式轻提示，自动消失 + 队列堆叠 + 手动关闭", category: "feedback", status: "new" },
```
> 字段名/顺序以文件现有行为准（若现有用 `status: "new"` 等，照抄结构）。

- [ ] **Step 2: registry import + map**

`apps/www/lib/registry.tsx`：在 import 段加 `toastShowcase`（与其他 showcase 同一 `from "@hulianui/ui"` 解构），在 `specBySlug` 映射加 `toast: toastShowcase,`。

- [ ] **Step 3: layout 单挂 ToastProvider**

`apps/www/app/components/layout.tsx`：
1. 顶部 import 加：`import { ToastProvider } from "@hulianui/ui";`
2. 在最外层 `<div>` 内、与两栏结构并列处加一行自闭合 `<ToastProvider />`（放在 return 的根 `<div>` 内末尾即可）：
```tsx
  return (
    <div>
      {/* 移动端顶部... 桌面两栏... 保持不动 */}
      ...
      <ToastProvider />
    </div>
  );
```
> 只加这两行（import + `<ToastProvider/>`），不动既有树结构（守"只加你那一处、别动别人的"）。

- [ ] **Step 4: 跑三道门（--force）**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm build --filter=www --force`
Expected: typecheck 0 error；www build 成功，SSG 页数 +1（含 /components/toast）。
> 必 `--filter=www`（避 desktop 二次 build）；`--force` 绕 turbo cache。

- [ ] **Step 5: 提交**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/app/components/layout.tsx
git commit -m "feat(www): Toast 接入 IA(feedback 分组)+ registry 注册 + layout 单挂 ToastProvider"
```

---

## Task 8: 三道门全绿 + Playwright/CDP 明暗两态像素自证

**Files:** 无（验证 + 截图）

- [ ] **Step 1: 完整三道门**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && (cd packages/ui && pnpm vitest run src/toast) && pnpm build --filter=www --force`
Expected: 三者全绿。toast scope 6 测试通过。

- [ ] **Step 2: 起 www / 复用桌面 app 5514**

确认 5514（桌面 app www 实例）或起 5512 dev：`grep` 进程或 `curl -s localhost:5514 >/dev/null`。优先复用已跑实例（[[nextjs-16-dev-server-dedupes-by-project-dir-not-port]]）。

- [ ] **Step 3: 截图（先触发再截，明暗两态）**

用 chrome-devtools / playwright MCP 导航 `/components/toast`；若 MCP 浏览器被并行 session 占用，自起隔离 chromium（[[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）。流程：
1. 注入 localStorage `hulian-theme=light` → 导航 `/components/toast` → 等 hydration（body 含「弹 info」文案）
2. **点「连发 3 条」按钮** → 等 toast 出现 → `captureScreenshot` 存 `toast-light.png`
3. 切 dark（注入 `hulian-theme=dark` 或点 ThemeToggle）→ 点触发 → 存 `toast-dark.png`
存 cwd 根，Read 看像素（[[ui-layout-verify-needs-screenshot-not-dom-eval]]）。

- [ ] **Step 4: 像素验收清单**

Read 两张图核对：① toast 出现在右上角；② 多条**堆叠**（gap 间距）；③ tone 左边条配色（info=primary/danger=danger/neutral=border）明暗都对；④ Close × 按钮在位；⑤ 暗色 token 换肤后 surface/border/文字对比足。

- [ ] **Step 5: 全量回归（隔离判定）**

Run: `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm test -- --force`
Expected: 含 toast 的全量通过；若红，确认红测试是否属并行 session untracked WIP（非 toast scope）→ isolate 不碰（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。

---

## Self-Review（写完核对，本节非任务）

- **Spec 覆盖**：§2 API 实证→Task2 实现；§3 manager 解耦+单挂→Task2/7；§4 API+皮肤→Task2/3；§5 showcase 承载→Task6；§6 四件套+IA→Task1/5/6/7；§7 测试→Task2/3/4；§8 门禁→Task7/8；§10 验收→Task8。无遗漏。
- **类型一致**：`ToastOptions`(title/description/tone/timeout)、`ToastTone`(info/danger/neutral)、`toast():string`、`ToastProvider():JSX` 全 Task 一致；`toneBorder`/`toneTitle` 键 = `ToastTone`。
- **token 名校准**：info→primary、danger→danger、neutral→border/foreground（同 Alert，非臆造 `info` token）。
- **承载红线**：Provider 仅 layout 单挂；showcase states 零 Provider（防 ComponentDoc 双渲染重复）。
- **无 placeholder**：各步均有完整代码/命令/预期。
