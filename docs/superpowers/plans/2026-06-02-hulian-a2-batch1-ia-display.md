# 瑚琏 A2 批次一（上半）实施计划 — 左侧组件树 IA + 展示族 4 组件

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把文档站从扁平单页升级为「manifest/registry 双文件 SSOT + 左侧分类树 + 每组件独立 SSG 页」的可扩展 IA，并吸取展示族 4 组件（Badge / Card / Skeleton / Avatar）套四件套模具。

**Architecture:** IA 数据分两文件结构性隔离 RSC 边界——`lib/manifest.ts`（纯数据，server/client 皆读）供 `generateStaticParams`/索引/左树；`lib/registry.tsx`（`"use client"`，spec 映射）只被 `ComponentDoc` client 岛读，使「server 根本 import 不到含 `render()` 的 spec」。组件吸取沿用既有四件套（`*.tsx`/`*.types.ts`/`*.showcase.tsx`/`index.ts`）+ CVA 变体 + 只消费语义 token。

**Tech Stack:** Next 16 (App Router, async params, SSG) · React 19 · Base UI rc.0 (Avatar) · Tailwind v4 (CSS 变量 token) · CVA · motion · vitest 3.2 + jsdom + @testing-library/react · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md`（本计划覆盖其 §7 的 **Step 0 + Step 1**；Step 2-4 后续各开 plan）。

---

## File Structure

**Phase A — 基线与准备**
- Modify: `packages/ui/src/button/button.showcase.tsx` — 补 `"use client"`，统一三个存量 showcase。

**Phase B — IA 骨架（spec Step 0）**
- Create: `apps/www/vitest.config.ts` — www 测试环境（jsdom）。
- Modify: `apps/www/package.json` — 加 `test` script + 测试 devDeps。
- Create: `apps/www/lib/manifest.ts` — 纯数据 IA SSOT（CategoryKey / CATEGORIES / ComponentMeta / manifest）。
- Create: `apps/www/lib/registry.tsx` — `"use client"`，`specBySlug` 映射（唯一 import `@hulianui/ui` spec 处）。
- Create: `apps/www/lib/manifest.test.ts` — manifest↔registry 契约测试（守护 SSOT 一致）。
- Create: `apps/www/components/showcase/component-doc.tsx` — `"use client"` 单组件文档岛（preview + states + playground）。
- Create: `apps/www/app/components/[slug]/page.tsx` — 动态路由 server 页（`generateStaticParams` + `generateMetadata` + 渲染 `<ComponentDoc>`）。
- Create: `apps/www/components/component-tree.tsx` — `"use client"` 左侧分类树（`usePathname` 高亮）。
- Create: `apps/www/app/components/layout.tsx` — 两栏壳（桌面左树 + 移动折叠 + ThemeToggle）。
- Modify: `apps/www/app/components/page.tsx` — 改为索引概览页（分类卡片 + 保留 faker/MSW demo）。

**Phase C — 展示族 4 组件（spec Step 1）**
- Modify: `packages/ui/src/motion/variants.ts` — 加 `shimmer` 预设。
- Modify: `packages/ui/src/motion/index.ts` — 导出 `shimmer`。
- Modify: `packages/ui/src/index.ts` — 导出 `shimmer` + 4 新组件。
- Create: `packages/ui/src/badge/{badge.tsx,badge.types.ts,badge.showcase.tsx,badge.test.tsx,index.ts}`
- Create: `packages/ui/src/card/{card.tsx,card.types.ts,card.showcase.tsx,card.test.tsx,index.ts}`
- Create: `packages/ui/src/skeleton/{skeleton.tsx,skeleton.types.ts,skeleton.showcase.tsx,skeleton.test.tsx,index.ts}`
- Create: `packages/ui/src/avatar/{avatar.tsx,avatar.types.ts,avatar.showcase.tsx,avatar.test.tsx,index.ts}`
- Modify: `apps/www/lib/manifest.ts` — 追加 4 条。
- Modify: `apps/www/lib/registry.tsx` — 追加 4 条。

---

## 约定速查（执行者必读）

**可用语义 token 工具类**（仅这些，**无 success/warning**）：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary-foreground` `hover:bg-primary-hover` `bg-danger` `text-danger-foreground` `text-primary` `text-danger` `border-primary` `border-danger`，圆角 `rounded-[var(--radius)]`。preset 用 `@theme inline` 注册了颜色，支持 `/alpha`（如 `bg-primary/12`，经 color-mix）。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；`import { pressable, shimmer } from "../motion"`；Base UI `import { X as BaseX } from "@base-ui-components/react/<x>"`。

**四件套**：`x.tsx`（实现）+ `x.types.ts`（props）+ `x.showcase.tsx`（`"use client"` + ShowcaseSpec）+ `index.ts`（桶导出三样：组件 / 类型 / showcase）。所有 `*.showcase.tsx` 必须 `"use client"`（含 `render()` 且被 client registry import）。纯展示组件本体（Badge/Card）可不加 `"use client"`；用 motion/Base UI 的（Skeleton/Avatar）本体要加。

**三道门**（每 Task 末 commit 前跑，全绿才提交）：
```bash
pnpm typecheck && pnpm test && pnpm build
```
**单包测试**（TDD 跑单文件）：`pnpm --filter @hulianui/ui exec vitest run <名>`（如 `badge`）。
**浏览器实测**：`pnpm dev`（起 www 于 5512），访问页面，右上明暗开关切换看两态。

---

## Phase A — 基线与准备

### Task A1: 记录绿色基线 + 统一 button.showcase

**Files:**
- Modify: `packages/ui/src/button/button.showcase.tsx:1`

- [ ] **Step 1: 跑改造前三道门，记录基线**

Run:
```bash
pnpm typecheck && pnpm test && pnpm build
```
Expected: 全绿（typecheck 无错、ui 现有 button 测试 PASS、`next build` 成功且含 MSW 的 `AsyncUsers` 不报错）。**若此处已红，先停下报告——这是存量问题，不在本计划范围内修。**记录结果作为基线。

- [ ] **Step 2: 给 button.showcase 补 "use client"**

`packages/ui/src/button/button.showcase.tsx` 第 1 行之前插入（使其与 switch/dialog 的 showcase 一致，避免 IA 接入后 SSG 模块图把非 client 的 showcase 当 server 处理）:

```tsx
"use client";
```

文件首部变为：
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Button } from "./button";
```

- [ ] **Step 3: 跑三道门验证仍绿**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: 全绿。

- [ ] **Step 4: Commit**

```bash
git add packages/ui/src/button/button.showcase.tsx
git commit -m "chore(ui): button.showcase 补 use client，统一三个存量 showcase

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase B — IA 骨架（spec Step 0）

### Task B1: www 测试基建 + manifest/registry 双文件 + 契约测试（TDD）

**Files:**
- Create: `apps/www/vitest.config.ts`
- Modify: `apps/www/package.json`
- Create: `apps/www/lib/manifest.ts`
- Create: `apps/www/lib/registry.tsx`
- Create: `apps/www/lib/manifest.test.ts`

- [ ] **Step 1: 给 www 装测试依赖（对齐 monorepo 版本）**

Run:
```bash
pnpm --filter www add -D vitest jsdom @testing-library/react @vitejs/plugin-react
```
Expected: 安装成功（pnpm 复用 monorepo 已有 vitest 3.2 / jsdom 25 / testing-library 16）。

- [ ] **Step 2: 创建 www vitest 配置**

Create `apps/www/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 3: 给 www package.json 加 test script**

在 `apps/www/package.json` 的 `scripts` 中加一行（与现有 `typecheck` 同级）:
```json
"test": "vitest run",
```

- [ ] **Step 4: 写契约测试（先红）**

Create `apps/www/lib/manifest.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { manifest, CATEGORIES } from "./manifest";
import { specBySlug } from "./registry";

describe("IA SSOT manifest↔registry 契约", () => {
  it("slug 唯一", () => {
    const slugs = manifest.map((m) => m.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("每个 manifest 条目的 category 合法", () => {
    const keys = new Set(CATEGORIES.map((c) => c.key));
    for (const m of manifest) expect(keys.has(m.category)).toBe(true);
  });

  it("每个 manifest 条目都有对应 spec（漏注册会在此失败）", () => {
    for (const m of manifest) expect(specBySlug[m.slug], `缺 spec: ${m.slug}`).toBeDefined();
  });

  it("registry 无 manifest 之外的孤儿 spec", () => {
    const slugs = new Set(manifest.map((m) => m.slug));
    for (const slug of Object.keys(specBySlug)) expect(slugs.has(slug), `孤儿 spec: ${slug}`).toBe(true);
  });
});
```

- [ ] **Step 5: 跑测试确认失败（模块不存在）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: FAIL —— 无法解析 `./manifest` / `./registry`。

- [ ] **Step 6: 创建 manifest.ts（纯数据 SSOT）**

Create `apps/www/lib/manifest.ts`:
```ts
// 瑚琏文档站 IA 元数据 —— 纯数据 SSOT，零 @hulianui/ui import，server / client 皆可安全读。
export type CategoryKey = "inputs" | "data-display" | "feedback" | "navigation" | "effects";

export interface ComponentMeta {
  slug: string;
  name: string;
  description: string;
  category: CategoryKey;
  status: "stable" | "new";
}

export const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "inputs", label: "表单录入" },
  { key: "data-display", label: "数据展示" },
  { key: "feedback", label: "反馈" },
  { key: "navigation", label: "导航" },
  { key: "effects", label: "动效" },
];

export const manifest: ComponentMeta[] = [
  { slug: "button", name: "Button", description: "按钮 · CVA 变体 + press 动效", category: "inputs", status: "stable" },
  { slug: "switch", name: "Switch", description: "开关 · Base UI 受控 + ARIA", category: "inputs", status: "stable" },
  { slug: "dialog", name: "Dialog", description: "对话框 · Base UI Portal + focus trap", category: "feedback", status: "stable" },
];
```

- [ ] **Step 7: 创建 registry.tsx（client spec 映射）**

Create `apps/www/lib/registry.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "@hulianui/ui";
import { buttonShowcase, switchShowcase, dialogShowcase } from "@hulianui/ui";

// 唯一 import @hulianui/ui 渲染 spec 的地方；只被 ComponentDoc client 岛 import。
export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
};
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS（4 个用例全绿）。

- [ ] **Step 9: Commit**

```bash
git add apps/www/vitest.config.ts apps/www/package.json apps/www/lib/manifest.ts apps/www/lib/registry.tsx apps/www/lib/manifest.test.ts pnpm-lock.yaml
git commit -m "feat(www): IA SSOT — manifest/registry 双文件(结构性隔离 RSC) + 契约测试 + www vitest 基建

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task B2: ComponentDoc 文档岛 + [slug] 动态路由

**Files:**
- Create: `apps/www/components/showcase/component-doc.tsx`
- Create: `apps/www/app/components/[slug]/page.tsx`

- [ ] **Step 1: 创建 ComponentDoc（client 岛）**

Create `apps/www/components/showcase/component-doc.tsx`:
```tsx
"use client";
import { notFound } from "next/navigation";
import type { ShowcaseSpec } from "@hulianui/ui";
import { manifest } from "../../lib/manifest";
import { specBySlug } from "../../lib/registry";
import { ComponentPreview } from "./component-preview";
import { StatesGallery } from "./states-gallery";
import { Playground } from "./playground";

function defaultProps(spec: ShowcaseSpec) {
  return Object.fromEntries(spec.controls.map((c) => [c.prop, c.defaultValue]));
}

export function ComponentDoc({ slug }: { slug: string }) {
  const meta = manifest.find((m) => m.slug === slug);
  const spec = specBySlug[slug];
  if (!meta || !spec) notFound();

  return (
    <article className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">{meta.name}</h1>
        <p className="mt-1 text-sm text-muted">{meta.description}</p>
      </header>

      <ComponentPreview code={spec.toCode(defaultProps(spec))}>
        {spec.states[0].render()}
      </ComponentPreview>

      <section>
        <h2 className="mb-3 text-sm font-medium text-muted">全状态</h2>
        <StatesGallery states={spec.states} />
      </section>

      {spec.controls.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-medium text-muted">Playground</h2>
          <Playground spec={spec} />
        </section>
      )}
    </article>
  );
}
```

- [ ] **Step 2: 创建 [slug] 动态路由页（server，async params）**

Create `apps/www/app/components/[slug]/page.tsx`:
```tsx
import type { Metadata } from "next";
import { manifest } from "../../../lib/manifest";
import { ComponentDoc } from "../../../components/showcase/component-doc";

export function generateStaticParams() {
  return manifest.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = manifest.find((m) => m.slug === slug);
  return { title: meta ? `${meta.name} · 瑚琏 Hulian` : "组件 · 瑚琏 Hulian" };
}

export default async function ComponentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ComponentDoc slug={slug} />;
}
```

- [ ] **Step 3: 跑 build 验证 SSG（链路通 + RSC 边界正确）**

Run: `pnpm --filter www build`
Expected: 成功；输出中 `/components/[slug]` 生成 3 个静态页（`/components/button`、`/components/switch`、`/components/dialog`）。若报 server→client 序列化/模块图错误，说明 registry 被 server 误 import——回查 [slug]/page 是否只 import 了 manifest（不 import registry）。

- [ ] **Step 4: Commit**

```bash
git add apps/www/components/showcase/component-doc.tsx apps/www/app/components/\[slug\]/page.tsx
git commit -m "feat(www): 单组件动态路由页 + ComponentDoc client 岛(SSG 按 manifest 生成)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task B3: 左侧组件树 + components layout

**Files:**
- Create: `apps/www/components/component-tree.tsx`
- Create: `apps/www/app/components/layout.tsx`

- [ ] **Step 1: 创建 ComponentTree（client，按分类分组 + 高亮）**

Create `apps/www/components/component-tree.tsx`:
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { manifest, CATEGORIES } from "../lib/manifest";

export function ComponentTree() {
  const pathname = usePathname();
  return (
    <nav className="space-y-6">
      {CATEGORIES.map((cat) => {
        const items = manifest.filter((m) => m.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <h3 className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted">
              {cat.label}
            </h3>
            <ul className="space-y-0.5">
              {items.map((m) => {
                const href = `/components/${m.slug}`;
                const active = pathname === href;
                return (
                  <li key={m.slug}>
                    <Link
                      href={href}
                      className={`flex items-center justify-between rounded-[var(--radius)] px-2 py-1.5 text-sm transition-colors ${
                        active
                          ? "bg-surface-hover font-medium text-foreground"
                          : "text-muted hover:bg-surface-hover hover:text-foreground"
                      }`}
                    >
                      {m.name}
                      {m.status === "new" && (
                        <span className="rounded border border-primary px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          new
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: 创建 components layout（桌面左树 + 移动折叠）**

Create `apps/www/app/components/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import Link from "next/link";
import { ComponentTree } from "../../components/component-tree";
import { ThemeToggle } from "../../components/theme-toggle";

export default function ComponentsLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      {/* 移动端顶部：bar + 可展开树 */}
      <div className="md:hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Link href="/" className="text-sm font-semibold">
            瑚琏 Hulian
          </Link>
          <ThemeToggle />
        </div>
        <details className="border-b border-border">
          <summary className="cursor-pointer px-4 py-2 text-sm text-muted">组件导航</summary>
          <div className="p-3">
            <ComponentTree />
          </div>
        </details>
      </div>

      {/* 桌面：两栏 */}
      <div className="mx-auto flex max-w-7xl">
        <aside className="hidden w-60 shrink-0 border-r border-border md:block">
          <div className="sticky top-0 flex h-dvh flex-col">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <Link href="/" className="text-sm font-semibold">
                瑚琏 Hulian
              </Link>
              <ThemeToggle />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <ComponentTree />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-10">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 跑 build 验证**

Run: `pnpm --filter www build`
Expected: 成功（layout 是 server component，内嵌 client 的 ComponentTree/ThemeToggle，无边界错误）。

- [ ] **Step 4: Commit**

```bash
git add apps/www/components/component-tree.tsx apps/www/app/components/layout.tsx
git commit -m "feat(www): 左侧组件树(分类分组+高亮) + components 两栏 layout(桌面/移动)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task B4: 索引页改造 + Step 0 验收

**Files:**
- Modify: `apps/www/app/components/page.tsx`（整文件替换）

- [ ] **Step 1: 用索引概览页替换扁平单页**

Replace 整个 `apps/www/app/components/page.tsx` with:
```tsx
import Link from "next/link";
import { manifest, CATEGORIES } from "../../lib/manifest";
import { SampleTable } from "../../components/showcase/sample-table";
import { AsyncUsers } from "../../components/showcase/async-users";

export default function ComponentsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header>
        <h1 className="text-2xl font-semibold">组件</h1>
        <p className="mt-1 text-sm text-muted">瑚琏吸取式聚合组件库 · 博采众长</p>
      </header>

      {CATEGORIES.map((cat) => {
        const items = manifest.filter((m) => m.category === cat.key);
        if (items.length === 0) return null;
        return (
          <section key={cat.key} className="space-y-3">
            <h2 className="text-sm font-medium text-muted">{cat.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((m) => (
                <Link
                  key={m.slug}
                  href={`/components/${m.slug}`}
                  className="rounded-[var(--radius)] border border-border bg-surface p-4 transition-colors hover:bg-surface-hover"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{m.name}</span>
                    {m.status === "new" && (
                      <span className="rounded border border-primary px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        new
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {/* 数据层 mock 能力总览（保留 P1 的 faker / MSW 演示可达）*/}
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted">真实样例数据（faker）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <SampleTable />
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-muted">异步加载 + 分页（MSW）</h2>
        <div className="rounded-[var(--radius)] border border-border p-4">
          <AsyncUsers />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: 跑三道门**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: 全绿。`/components` 与 3 个 `/components/[slug]` 均 SSG 生成。

- [ ] **Step 3: 浏览器实测 Step 0**

Run: `pnpm dev`，浏览器开 `http://localhost:5512/components`。逐项确认：
- 左侧树按「表单录入 / 反馈」分组，列出 Button/Switch/Dialog；
- 点击进入 `/components/button` 等，当前项高亮，右侧渲染 preview + 全状态 + playground；
- 右上明暗开关切换，左树与内容同步换肤、无白闪；
- 索引页底部 faker 表 + MSW 分页 demo 正常；
- 桌面 app：另开终端 `pnpm app`（5514），确认壳内加载新 IA 正常。

- [ ] **Step 4: Commit**

```bash
git add apps/www/app/components/page.tsx
git commit -m "feat(www): /components 改为分类索引概览页(取代扁平单页)，Step 0 IA 骨架收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Phase C — 展示族 4 组件（spec Step 1）

### Task C1: motion shimmer 预设（TDD）

**Files:**
- Modify: `packages/ui/src/motion/variants.ts`
- Modify: `packages/ui/src/motion/index.ts`
- Test: `packages/ui/src/motion/variants.test.ts`（新建）

- [ ] **Step 1: 写 shimmer 测试（先红）**

Create `packages/ui/src/motion/variants.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { shimmer } from "./variants";

describe("shimmer 预设", () => {
  it("无限循环 + 线性", () => {
    expect(shimmer.transition.repeat).toBe(Infinity);
    expect(shimmer.transition.ease).toBe("linear");
  });
  it("backgroundPosition 来回扫动", () => {
    expect(Array.isArray(shimmer.animate.backgroundPosition)).toBe(true);
    expect(shimmer.animate.backgroundPosition.length).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: 跑测试确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run variants`
Expected: FAIL —— `shimmer` 未导出。

- [ ] **Step 3: 加 shimmer 预设**

在 `packages/ui/src/motion/variants.ts` 末尾追加:
```ts
// shimmer：循环高光扫过的占位动效，给 Skeleton 用。配渐变背景 + backgroundSize:200%。
export const shimmer = {
  animate: { backgroundPosition: ["200% 0", "-200% 0"] as string[] },
  transition: { repeat: Infinity, duration: 1.4, ease: "linear" as const },
};
```

- [ ] **Step 4: 从 motion 桶导出 shimmer**

修改 `packages/ui/src/motion/index.ts` 末行:
```ts
export { pressable, fadeScale, shimmer } from "./variants";
```

- [ ] **Step 5: 从主 index 导出 shimmer**

在 `packages/ui/src/index.ts` 的动效导出块里加 `shimmer`:
```ts
export {
  motionDuration,
  motionDurationCss,
  motionEase,
  motionEaseCss,
  pressable,
  fadeScale,
  shimmer,
} from "./motion";
```

- [ ] **Step 6: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run variants`
Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add packages/ui/src/motion/variants.ts packages/ui/src/motion/variants.test.ts packages/ui/src/motion/index.ts packages/ui/src/index.ts
git commit -m "feat(ui): motion 加 shimmer 预设(Skeleton 占位高光)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task C2: Badge（四件套，TDD）

**Files:**
- Create: `packages/ui/src/badge/badge.tsx`
- Create: `packages/ui/src/badge/badge.types.ts`
- Create: `packages/ui/src/badge/badge.showcase.tsx`
- Create: `packages/ui/src/badge/badge.test.tsx`
- Create: `packages/ui/src/badge/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 badge 变体测试（先红）**

Create `packages/ui/src/badge/badge.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { badgeVariants } from "./badge";

describe("badgeVariants", () => {
  it("默认 = solid brand md", () => {
    const c = badgeVariants({});
    expect(c).toContain("bg-primary");
    expect(c).toContain("h-6");
  });
  it("solid danger 换 danger 底", () => {
    expect(badgeVariants({ variant: "solid", tone: "danger" })).toContain("bg-danger");
  });
  it("outline neutral 用边框", () => {
    expect(badgeVariants({ variant: "outline", tone: "neutral" })).toContain("border");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run badge`
Expected: FAIL —— `./badge` 不存在。

- [ ] **Step 3: 实现 badge.tsx**

Create `packages/ui/src/badge/badge.tsx`:
```tsx
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { BadgeProps } from "./badge.types";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
  {
    variants: {
      variant: { solid: "", soft: "", outline: "border" },
      tone: { brand: "", danger: "", neutral: "" },
      size: {
        sm: "h-5 px-2 text-[11px]",
        md: "h-6 px-2.5 text-xs",
      },
    },
    compoundVariants: [
      { variant: "solid", tone: "brand", class: "bg-primary text-primary-foreground" },
      { variant: "solid", tone: "danger", class: "bg-danger text-danger-foreground" },
      { variant: "solid", tone: "neutral", class: "bg-surface-hover text-foreground" },
      { variant: "soft", tone: "brand", class: "bg-primary/12 text-primary" },
      { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
      { variant: "soft", tone: "neutral", class: "bg-surface-hover text-muted" },
      { variant: "outline", tone: "brand", class: "border-primary text-primary" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
    ],
    defaultVariants: { variant: "solid", tone: "brand", size: "md" },
  },
);

export function Badge({ className, variant, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, tone, size }), className)} {...props} />;
}
```

- [ ] **Step 4: 实现 badge.types.ts**

Create `packages/ui/src/badge/badge.types.ts`:
```ts
import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "./badge";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}
```

- [ ] **Step 5: 实现 badge.showcase.tsx**

Create `packages/ui/src/badge/badge.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Badge } from "./badge";

export const badgeShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["solid", "soft", "outline"], defaultValue: "solid" },
    { prop: "tone", type: "select", options: ["brand", "danger", "neutral"], defaultValue: "brand" },
    { prop: "size", type: "select", options: ["sm", "md"], defaultValue: "md" },
    { prop: "children", type: "text", defaultValue: "标签", label: "文案" },
  ],
  states: [
    { name: "solid", render: () => <Badge>品牌</Badge> },
    { name: "soft", render: () => <Badge variant="soft">柔和</Badge> },
    { name: "outline", render: () => <Badge variant="outline">描边</Badge> },
    { name: "danger", render: () => <Badge tone="danger">危险</Badge> },
    { name: "neutral", render: () => <Badge tone="neutral">中性</Badge> },
    { name: "sm", render: () => <Badge size="sm">小号</Badge> },
  ],
  renderWithProps: (p) => (
    <Badge
      variant={p.variant as "solid" | "soft" | "outline"}
      tone={p.tone as "brand" | "danger" | "neutral"}
      size={p.size as "sm" | "md"}
    >
      {p.children as string}
    </Badge>
  ),
  toCode: (p) =>
    `<Badge variant="${p.variant}" tone="${p.tone}" size="${p.size}">${p.children}</Badge>`,
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/badge/index.ts`:
```ts
export { Badge } from "./badge";
export type { BadgeProps } from "./badge.types";
export { badgeShowcase } from "./badge.showcase";
```

- [ ] **Step 7: 主 index 导出 badge**

在 `packages/ui/src/index.ts` 组件区加一行（在 `export * from "./dialog";` 后）:
```ts
export * from "./badge";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run badge`
Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/badge packages/ui/src/index.ts
git commit -m "feat(ui): Badge 组件(solid/soft/outline × brand/danger/neutral × sm/md)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task C3: Card（四件套 + 子组件，TDD）

**Files:**
- Create: `packages/ui/src/card/card.tsx`
- Create: `packages/ui/src/card/card.types.ts`
- Create: `packages/ui/src/card/card.showcase.tsx`
- Create: `packages/ui/src/card/card.test.tsx`
- Create: `packages/ui/src/card/index.ts`
- Modify: `packages/ui/src/index.ts`

> 工程注记：spec §4 写 Card hover 微阴影「用 motion」，本计划改用 CSS `transition-shadow hover:shadow-md`——`box-shadow` 过渡是 CSS 强项、与 Button 的 `hover:shadow` 一致，motion 留给 transform/opacity 类交互。属对 spec 的合理细化（同 Avatar 注脚口径）。

- [ ] **Step 1: 写 card 变体测试（先红）**

Create `packages/ui/src/card/card.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { cardVariants } from "./card";

describe("cardVariants", () => {
  it("默认 outline 带边框", () => {
    expect(cardVariants({})).toContain("border-border");
  });
  it("elevated 带 hover 阴影", () => {
    expect(cardVariants({ variant: "elevated" })).toContain("hover:shadow-md");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run card`
Expected: FAIL。

- [ ] **Step 3: 实现 card.tsx（Card + Header/Body/Footer）**

Create `packages/ui/src/card/card.tsx`:
```tsx
import type { HTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { CardProps } from "./card.types";

export const cardVariants = cva("rounded-[var(--radius)] bg-surface text-foreground transition-shadow", {
  variants: {
    variant: {
      outline: "border border-border",
      elevated: "border border-border shadow-sm hover:shadow-md",
    },
  },
  defaultVariants: { variant: "outline" },
});

export function Card({ className, variant, ...props }: CardProps) {
  return <div className={cn(cardVariants({ variant }), className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-border px-5 py-3 font-medium", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 text-sm", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-border px-5 py-3 text-sm text-muted", className)} {...props} />;
}
```

- [ ] **Step 4: 实现 card.types.ts**

Create `packages/ui/src/card/card.types.ts`:
```ts
import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { cardVariants } from "./card";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}
```

- [ ] **Step 5: 实现 card.showcase.tsx**

Create `packages/ui/src/card/card.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Card, CardHeader, CardBody, CardFooter } from "./card";

function Demo(props: { variant?: "outline" | "elevated"; withFooter?: boolean }) {
  return (
    <Card variant={props.variant} className="w-64">
      <CardHeader>瑚琏卡片</CardHeader>
      <CardBody>宗庙玉器，至美又大用。颜值 + 好用是第一生产力。</CardBody>
      {props.withFooter && <CardFooter>footer 区</CardFooter>}
    </Card>
  );
}

export const cardShowcase: ShowcaseSpec = {
  controls: [
    { prop: "variant", type: "select", options: ["outline", "elevated"], defaultValue: "outline" },
    { prop: "withFooter", type: "boolean", defaultValue: true, label: "显示 footer" },
  ],
  states: [
    { name: "outline", render: () => <Demo variant="outline" withFooter /> },
    { name: "elevated", render: () => <Demo variant="elevated" withFooter /> },
    { name: "无 footer", render: () => <Demo variant="outline" withFooter={false} /> },
  ],
  renderWithProps: (p) => (
    <Demo variant={p.variant as "outline" | "elevated"} withFooter={p.withFooter as boolean} />
  ),
  toCode: (p) =>
    `<Card variant="${p.variant}">\n  <CardHeader>瑚琏卡片</CardHeader>\n  <CardBody>...</CardBody>${
      p.withFooter ? "\n  <CardFooter>footer 区</CardFooter>" : ""
    }\n</Card>`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/card/index.ts`:
```ts
export { Card, CardHeader, CardBody, CardFooter } from "./card";
export type { CardProps } from "./card.types";
export { cardShowcase } from "./card.showcase";
```

- [ ] **Step 7: 主 index 导出 card**

在 `packages/ui/src/index.ts` 组件区加:
```ts
export * from "./card";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run card`
Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/card packages/ui/src/index.ts
git commit -m "feat(ui): Card 组件(outline/elevated + Header/Body/Footer 插槽 + CSS hover 阴影)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task C4: Skeleton（四件套 + shimmer，TDD）

**Files:**
- Create: `packages/ui/src/skeleton/skeleton.tsx`
- Create: `packages/ui/src/skeleton/skeleton.types.ts`
- Create: `packages/ui/src/skeleton/skeleton.showcase.tsx`
- Create: `packages/ui/src/skeleton/skeleton.test.tsx`
- Create: `packages/ui/src/skeleton/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 skeleton 变体测试（先红）**

Create `packages/ui/src/skeleton/skeleton.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { skeletonVariants } from "./skeleton";

describe("skeletonVariants", () => {
  it("默认 text 形态", () => {
    expect(skeletonVariants({})).toContain("rounded");
  });
  it("circle 形态全圆", () => {
    expect(skeletonVariants({ shape: "circle" })).toContain("rounded-full");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run skeleton`
Expected: FAIL。

- [ ] **Step 3: 实现 skeleton.tsx（motion shimmer）**

Create `packages/ui/src/skeleton/skeleton.tsx`:
```tsx
"use client";
import { motion, type HTMLMotionProps } from "motion/react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { shimmer } from "../motion";
import type { SkeletonProps } from "./skeleton.types";

export const skeletonVariants = cva("bg-surface-hover", {
  variants: {
    shape: {
      text: "h-4 w-full rounded",
      circle: "rounded-full",
      rect: "rounded-[var(--radius)]",
    },
  },
  defaultVariants: { shape: "text" },
});

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <motion.div
      aria-hidden
      className={cn(skeletonVariants({ shape }), "relative overflow-hidden", className)}
      style={{
        backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-surface) 50%, transparent 100%)",
        backgroundSize: "200% 100%",
        backgroundRepeat: "no-repeat",
      }}
      animate={shimmer.animate}
      transition={shimmer.transition}
      {...(props as HTMLMotionProps<"div">)}
    />
  );
}
```

- [ ] **Step 4: 实现 skeleton.types.ts**

Create `packages/ui/src/skeleton/skeleton.types.ts`:
```ts
import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { skeletonVariants } from "./skeleton";

export interface SkeletonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "style">,
    VariantProps<typeof skeletonVariants> {}
```

- [ ] **Step 5: 实现 skeleton.showcase.tsx**

Create `packages/ui/src/skeleton/skeleton.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Skeleton } from "./skeleton";

export const skeletonShowcase: ShowcaseSpec = {
  controls: [
    { prop: "shape", type: "select", options: ["text", "circle", "rect"], defaultValue: "text" },
  ],
  states: [
    { name: "text", render: () => <Skeleton className="w-32" /> },
    { name: "circle", render: () => <Skeleton shape="circle" className="size-10" /> },
    { name: "rect", render: () => <Skeleton shape="rect" className="h-16 w-32" /> },
    {
      name: "卡片骨架",
      render: () => (
        <div className="flex w-48 items-center gap-3">
          <Skeleton shape="circle" className="size-10" />
          <div className="flex-1 space-y-2">
            <Skeleton className="w-3/4" />
            <Skeleton className="w-1/2" />
          </div>
        </div>
      ),
    },
  ],
  renderWithProps: (p) => <Skeleton shape={p.shape as "text" | "circle" | "rect"} className="h-12 w-32" />,
  toCode: (p) => `<Skeleton shape="${p.shape}" />`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/skeleton/index.ts`:
```ts
export { Skeleton } from "./skeleton";
export type { SkeletonProps } from "./skeleton.types";
export { skeletonShowcase } from "./skeleton.showcase";
```

- [ ] **Step 7: 主 index 导出 skeleton**

在 `packages/ui/src/index.ts` 组件区加:
```ts
export * from "./skeleton";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run skeleton`
Expected: PASS。

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/skeleton packages/ui/src/index.ts
git commit -m "feat(ui): Skeleton 组件(text/circle/rect + motion shimmer 高光)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task C5: Avatar（四件套 + Base UI，TDD）

**Files:**
- Create: `packages/ui/src/avatar/avatar.tsx`
- Create: `packages/ui/src/avatar/avatar.types.ts`
- Create: `packages/ui/src/avatar/avatar.showcase.tsx`
- Create: `packages/ui/src/avatar/avatar.test.tsx`
- Create: `packages/ui/src/avatar/index.ts`
- Modify: `packages/ui/src/index.ts`

> Base UI Avatar API（已查证 rc.0）：`Avatar.Root` / `Avatar.Image` / `Avatar.Fallback`（同 Radix 风格，Image 加载失败自动让 Fallback 显示）。

- [ ] **Step 1: 写 avatar 测试（变体 + fallback 渲染，先红）**

Create `packages/ui/src/avatar/avatar.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { avatarVariants, Avatar } from "./avatar";

describe("Avatar", () => {
  it("尺寸变体", () => {
    expect(avatarVariants({ size: "lg" })).toContain("size-12");
  });
  it("无 src 时渲染 fallback 文本", () => {
    const { container } = render(<Avatar fallback="ZS" />);
    expect(container.textContent).toContain("ZS");
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run avatar`
Expected: FAIL。

- [ ] **Step 3: 实现 avatar.tsx（Base UI Avatar）**

Create `packages/ui/src/avatar/avatar.tsx`:
```tsx
"use client";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AvatarProps } from "./avatar.types";

export const avatarVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-surface-hover align-middle text-muted",
  {
    variants: {
      size: {
        sm: "size-8 text-xs",
        md: "size-10 text-sm",
        lg: "size-12 text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export function Avatar({ className, size, src, alt, fallback }: AvatarProps) {
  return (
    <BaseAvatar.Root className={cn(avatarVariants({ size }), className)}>
      {src && <BaseAvatar.Image src={src} alt={alt} className="size-full object-cover" />}
      <BaseAvatar.Fallback className="font-medium">{fallback}</BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
```

- [ ] **Step 4: 实现 avatar.types.ts**

Create `packages/ui/src/avatar/avatar.types.ts`:
```ts
import type { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { avatarVariants } from "./avatar";

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: ReactNode;
  className?: string;
}
```

- [ ] **Step 5: 实现 avatar.showcase.tsx**

Create `packages/ui/src/avatar/avatar.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Avatar } from "./avatar";

const IMG = "https://i.pravatar.cc/100?img=12";

export const avatarShowcase: ShowcaseSpec = {
  controls: [
    { prop: "size", type: "select", options: ["sm", "md", "lg"], defaultValue: "md" },
    { prop: "src", type: "text", defaultValue: IMG, label: "图片 URL" },
    { prop: "fallback", type: "text", defaultValue: "ZS", label: "fallback" },
  ],
  states: [
    { name: "图片", render: () => <Avatar src={IMG} alt="demo" fallback="ZS" /> },
    { name: "fallback", render: () => <Avatar fallback="瑚" /> },
    { name: "sm", render: () => <Avatar size="sm" fallback="S" /> },
    { name: "lg", render: () => <Avatar size="lg" fallback="L" /> },
  ],
  renderWithProps: (p) => (
    <Avatar
      size={p.size as "sm" | "md" | "lg"}
      src={(p.src as string) || undefined}
      alt="demo"
      fallback={p.fallback as string}
    />
  ),
  toCode: (p) => `<Avatar size="${p.size}" src="${p.src}" fallback="${p.fallback}" />`,
};
```

- [ ] **Step 6: 实现 index.ts**

Create `packages/ui/src/avatar/index.ts`:
```ts
export { Avatar } from "./avatar";
export type { AvatarProps } from "./avatar.types";
export { avatarShowcase } from "./avatar.showcase";
```

- [ ] **Step 7: 主 index 导出 avatar**

在 `packages/ui/src/index.ts` 组件区加:
```ts
export * from "./avatar";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run avatar`
Expected: PASS（含 jsdom 下 fallback 文本渲染）。

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/avatar packages/ui/src/index.ts
git commit -m "feat(ui): Avatar 组件(Base UI Root/Image/Fallback + sm/md/lg)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

### Task C6: 4 组件接入 IA + Step 1 验收

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 追加 4 条**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组里、`dialog` 条目后追加（4 个均标 `"new"`，分类 `data-display`）:
```ts
  { slug: "badge", name: "Badge", description: "徽标 · solid/soft/outline × tone", category: "data-display", status: "new" },
  { slug: "card", name: "Card", description: "卡片 · Header/Body/Footer 插槽", category: "data-display", status: "new" },
  { slug: "skeleton", name: "Skeleton", description: "骨架屏 · shimmer 高光占位", category: "data-display", status: "new" },
  { slug: "avatar", name: "Avatar", description: "头像 · Base UI 图片+fallback", category: "data-display", status: "new" },
```

- [ ] **Step 2: registry 追加 4 条映射**

修改 `apps/www/lib/registry.tsx`——更新 import 与映射:
```tsx
"use client";
import type { ShowcaseSpec } from "@hulianui/ui";
import {
  buttonShowcase,
  switchShowcase,
  dialogShowcase,
  badgeShowcase,
  cardShowcase,
  skeletonShowcase,
  avatarShowcase,
} from "@hulianui/ui";

export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
  badge: badgeShowcase,
  card: cardShowcase,
  skeleton: skeletonShowcase,
  avatar: avatarShowcase,
};
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 7 个 slug 双边齐全，无孤儿/缺失。

- [ ] **Step 4: 跑全量三道门**

Run: `pnpm typecheck && pnpm test && pnpm build`
Expected: 全绿；SSG 生成 `/components` + 7 个 `/components/[slug]`（含 badge/card/skeleton/avatar）。

- [ ] **Step 5: 浏览器实测 Step 1（明暗两态 + 四 mock 适配）**

Run: `pnpm dev`，逐个访问 `http://localhost:5512/components/{badge,card,skeleton,avatar}`，确认：
- 左树「数据展示」分组出现 4 个组件、带 `new` 标记；
- **Badge**：preview + 全状态（solid/soft/outline × tone）+ Playground 可调；**重点验 soft 变体的 `/12` alpha 底色在明暗下都正确**（验证 Tailwind v4 `@theme` color-mix + CSS 变量）。**若 soft 底色异常（透明/纯黑）**：回退把 `bg-primary/12`→`bg-surface-hover`、`bg-danger/12`→`bg-surface-hover`，重跑本步。
- **Card**：outline/elevated 两态，elevated hover 见阴影渐变；
- **Skeleton**：shimmer 高光循环扫动，明暗两态底色正确；
- **Avatar**：图片正常显示；把 `src` 改成无效 URL → 显示 fallback 文本；
- 全程右上明暗开关切换，4 组件同步换肤、无白闪。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): 展示族 4 组件(Badge/Card/Skeleton/Avatar)接入 IA，Step 1 收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志（本计划 = spec Step 0 + Step 1）

- 左侧组件树按 5 分类组织（本批实际出现「表单录入 / 数据展示 / 反馈」3 类）、高亮当前、`new` 标记、明暗开关在位、窄屏可折叠。
- `/components` 索引概览页 + 7 个 `/components/[slug]` 独立页全部 SSG 生成。
- 展示族 4 组件四件套齐、只消费语义 token、明暗自适应、文档页（真实样例/全状态/Playground 三项标配，API mock 不适用）亮。
- manifest↔registry 契约测试守护 SSOT；三道门全绿；桌面 app(5514) 加载正常。
- 后续 Step 2-4（表单录入族 / 选择族 / Tabs）与 A2.2+ 各自再开 plan。
