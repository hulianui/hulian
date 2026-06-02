# 瑚琏 A2 反馈族 Alert 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取反馈族 Alert 内联提示条，纯 CVA 皮肤 + 语义 token + 由 tone 派生的 a11y role，无 Base UI 行为 / 无浮层 / 无 Portal。

**Architecture:** 照 `badge.tsx` 纯皮肤范式：CVA base（布局）+ `tone`(info/danger/neutral)×`variant`(soft/outline) 9 条 compoundVariants（soft 用 `/12` alpha 底、outline 用 `border-{tone}`）。结构 = 可选 icon slot + 可选 title + children(description)；description 恒 `text-muted` 保正文明暗可读。role 由 tone 派生（danger→alert / 其余→status），可被 props.role 覆盖。本体纯静态无 hook → **不加 "use client"**（RSC-capable）；仅 showcase 加。

**Tech Stack:** React 19 · Tailwind v4（语义 token，无 success/warning）· CVA · vitest 3.2 + jsdom + @testing-library/react · Next 16 (www SSG) · pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-feedback-alert-design.md`。

---

## File Structure

**Task A1 — Alert 四件套（packages/ui）**
- Create: `packages/ui/src/alert/alert.tsx` — CVA `alertVariants` + `Alert` 组件（无 "use client"）。
- Create: `packages/ui/src/alert/alert.types.ts` — `AlertProps`。
- Create: `packages/ui/src/alert/alert.showcase.tsx` — `"use client"` ShowcaseSpec。
- Create: `packages/ui/src/alert/alert.test.tsx` — 变体 + role 派生 + icon/title/description 渲染 + title 不落 DOM 属性。
- Create: `packages/ui/src/alert/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./alert"`（紧跟 `./field` 之后）。

**Task A2 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — 追加 1 条（category `feedback`, status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +1 import 名 + 1 map 行。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary` `text-primary-foreground` `bg-danger` `text-danger` `text-danger-foreground` `border-primary` `border-danger`；alpha 底色 `bg-primary/12`/`bg-danger/12`（Badge 实测明暗都对）；圆角 `rounded-[var(--radius)]`。

**import 路径**：组件内 `import { cn } from "../lib/cn"`。

**四件套**：`alert.tsx`（**不加** "use client"——纯静态）+ `alert.types.ts` + `alert.showcase.tsx`（**必** "use client"）+ `alert.test.tsx` + `index.ts`（桶导出 `Alert`/`alertVariants`/`AlertProps`/`alertShowcase`）。

**门禁节奏**（沿用批次一/Step2 模式）：
- A1 的 TDD 循环：`pnpm --filter @hulian/ui exec vitest run alert`（先红后绿）；commit 前 `pnpm typecheck`。
- **完整三道门只在 A2 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（build **必** `--filter=www`，否则撞 desktop tauri beforeBuildCommand 二次 build www）。
- **Playwright 截图只在 A2**：明暗两态各一张，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（不在 .playwright-mcp/），Read 看像素（不靠 browser_evaluate 读 DOM）。桌面 app 已跑 5514 则用 5514 截图。

**trunk-based**：直接 master 小步 commit，无 remote、不 push。

---

## Task 0: 确认绿色基线

**Files:** 无（只读校验）

- [ ] **Step 1: 跑完整三道门，记录基线**

Run:
```bash
cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www
```
Expected: 全绿（Step 2 收尾态 `4e974dc`）。**若此处已红，先停下报告——是存量问题，不在本计划范围内修。** 记录结果作基线。

---

## Task A1: Alert（四件套，TDD）

**Files:**
- Create: `packages/ui/src/alert/alert.test.tsx`
- Create: `packages/ui/src/alert/alert.tsx`
- Create: `packages/ui/src/alert/alert.types.ts`
- Create: `packages/ui/src/alert/alert.showcase.tsx`
- Create: `packages/ui/src/alert/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 alert 测试（先红）**

Create `packages/ui/src/alert/alert.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { alertVariants, Alert } from "./alert";

describe("alertVariants", () => {
  it("默认 soft + info（/12 alpha 底 + primary accent）", () => {
    const c = alertVariants({});
    expect(c).toContain("bg-primary/12");
    expect(c).toContain("text-primary");
  });
  it("variant outline 带 border", () => {
    expect(alertVariants({ variant: "outline" })).toContain("border");
  });
  it("compound: soft danger 用 danger/12 底", () => {
    expect(alertVariants({ variant: "soft", tone: "danger" })).toContain("bg-danger/12");
  });
  it("compound: outline danger 用 border-danger + text-danger", () => {
    const c = alertVariants({ variant: "outline", tone: "danger" });
    expect(c).toContain("border-danger");
    expect(c).toContain("text-danger");
  });
  it("compound: neutral 用 surface/foreground 系（不引未注册色）", () => {
    expect(alertVariants({ variant: "soft", tone: "neutral" })).toContain("bg-surface-hover");
    expect(alertVariants({ variant: "outline", tone: "neutral" })).toContain("border-border");
  });
});

describe("Alert", () => {
  it("渲染 title + description(children)", () => {
    const { getByText } = render(<Alert title="标题">正文内容</Alert>);
    expect(getByText("标题")).toBeTruthy();
    expect(getByText("正文内容")).toBeTruthy();
  });

  it("title 作 ReactNode 渲染，不落成 DOM 的 title 属性", () => {
    const { container, getByText } = render(<Alert title="提示标题">x</Alert>);
    expect(getByText("提示标题")).toBeTruthy();
    // 关键：ReactNode title 不应写成根 div 的 HTML title 属性
    expect(container.querySelector("[role]")!.hasAttribute("title")).toBe(false);
  });

  it("role 由 tone 派生：danger → alert", () => {
    const { container } = render(<Alert tone="danger">出错了</Alert>);
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it("role 由 tone 派生：默认(info) / neutral → status", () => {
    const { container: a } = render(<Alert>提示</Alert>);
    expect(a.querySelector('[role="status"]')).toBeTruthy();
    const { container: b } = render(<Alert tone="neutral">中性</Alert>);
    expect(b.querySelector('[role="status"]')).toBeTruthy();
  });

  it("props.role 可显式覆盖派生 role", () => {
    const { container } = render(
      <Alert tone="danger" role="alertdialog">
        x
      </Alert>,
    );
    expect(container.querySelector('[role="alertdialog"]')).toBeTruthy();
  });

  it("传 icon 时渲染 icon slot", () => {
    const { getByTestId } = render(
      <Alert icon={<svg data-testid="ic" />} title="带图标">
        x
      </Alert>,
    );
    expect(getByTestId("ic")).toBeTruthy();
  });

  it("不传 title / 不传 icon 时不渲染对应节点（仅 description）", () => {
    const { container } = render(<Alert>只有正文</Alert>);
    // 根容器内直接子节点只有 content 容器（无 icon span）
    expect(container.querySelector("svg")).toBeNull();
  });
});
```

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulian/ui exec vitest run alert`
Expected: FAIL —— `./alert` 不存在。

- [ ] **Step 3: 实现 alert.tsx**

Create `packages/ui/src/alert/alert.tsx`（**无 "use client"** —— 纯静态）:
```tsx
import type { ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import type { AlertProps } from "./alert.types";

// 纯皮肤（照 badge.tsx）：base 设布局；tone/variant 留空由 compound 填「底色/边框 + accent 文字色」。
// accent 作用于 icon + title；description 显式 text-muted 覆盖（正文恒中性可读，不被 tone 染色）。
export const alertVariants = cva(
  "flex w-full items-start gap-3 rounded-[var(--radius)] p-4",
  {
    variants: {
      variant: { soft: "", outline: "border" },
      tone: { info: "", danger: "", neutral: "" },
    },
    compoundVariants: [
      { variant: "soft", tone: "info", class: "bg-primary/12 text-primary" },
      { variant: "soft", tone: "danger", class: "bg-danger/12 text-danger" },
      { variant: "soft", tone: "neutral", class: "bg-surface-hover text-foreground" },
      { variant: "outline", tone: "info", class: "border-primary text-primary" },
      { variant: "outline", tone: "danger", class: "border-danger text-danger" },
      { variant: "outline", tone: "neutral", class: "border-border text-foreground" },
    ],
    defaultVariants: { variant: "soft", tone: "info" },
  },
);

export function Alert({
  className,
  variant,
  tone,
  icon,
  title,
  role,
  children,
  ...props
}: AlertProps) {
  // role 由 tone 派生：danger=需打断的错误→assertive(alert)；其余→polite(status)。props.role 可覆盖。
  const resolvedRole = role ?? (tone === "danger" ? "alert" : "status");

  return (
    <div role={resolvedRole} className={cn(alertVariants({ variant, tone }), className)} {...props}>
      {icon != null && <span className="mt-0.5 shrink-0 [&>svg]:size-5">{icon}</span>}
      <div className="flex min-w-0 flex-col gap-1">
        {title != null && <div className="text-sm font-medium">{title}</div>}
        {children != null && <div className="text-sm text-muted">{children}</div>}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 实现 alert.types.ts**

Create `packages/ui/src/alert/alert.types.ts`:
```ts
import type { HTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { alertVariants } from "./alert";

export interface AlertProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">, // 避开 HTML title 属性与 ReactNode title 冲突
    VariantProps<typeof alertVariants> {
  /** 可选图标 slot（调用方自带 SVG/emoji；设计系统不绑图标库）。 */
  icon?: ReactNode;
  /** 标题（可选）；children 为正文 description。 */
  title?: ReactNode;
}
```

- [ ] **Step 5: 实现 alert.showcase.tsx**

Create `packages/ui/src/alert/alert.showcase.tsx`:
```tsx
"use client";
import type { ReactNode } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Alert } from "./alert";

// showcase 内联三个极简图标（零依赖），按 tone 取用。
const InfoIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v4a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z"
      clipRule="evenodd"
    />
  </svg>
);
const DangerIcon = (
  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);
const iconByTone: Record<string, ReactNode> = {
  info: InfoIcon,
  danger: DangerIcon,
  neutral: InfoIcon,
};

export const alertShowcase: ShowcaseSpec = {
  controls: [
    { prop: "tone", type: "select", options: ["info", "danger", "neutral"], defaultValue: "info" },
    { prop: "variant", type: "select", options: ["soft", "outline"], defaultValue: "soft" },
    { prop: "title", type: "text", defaultValue: "提示", label: "标题" },
    { prop: "description", type: "text", defaultValue: "这是一条提示信息。", label: "正文" },
    { prop: "withIcon", type: "boolean", defaultValue: true, label: "显示图标" },
  ],
  states: [
    {
      name: "info / soft",
      render: () => (
        <Alert icon={InfoIcon} title="信息提示" className="w-80">
          这是一条普通信息提示。
        </Alert>
      ),
    },
    {
      name: "danger / soft",
      render: () => (
        <Alert tone="danger" icon={DangerIcon} title="出错了" className="w-80">
          表单提交失败，请检查后重试。
        </Alert>
      ),
    },
    {
      name: "neutral / soft",
      render: () => (
        <Alert tone="neutral" title="中性提示" className="w-80">
          这是一条中性背景的提示。
        </Alert>
      ),
    },
    {
      name: "info / outline",
      render: () => (
        <Alert variant="outline" icon={InfoIcon} title="描边信息" className="w-80">
          描边变体，透明底靠边框划界。
        </Alert>
      ),
    },
    {
      name: "danger / outline",
      render: () => (
        <Alert variant="outline" tone="danger" icon={DangerIcon} title="描边错误" className="w-80">
          描边错误态。
        </Alert>
      ),
    },
    {
      name: "仅正文（无 title 无 icon）",
      render: () => <Alert className="w-80">只有一行正文的精简提示。</Alert>,
    },
    {
      name: "仅 title + icon（无正文）",
      render: () => <Alert icon={InfoIcon} title="只有标题的提示" className="w-80" />,
    },
  ],
  renderWithProps: (p) => (
    <Alert
      tone={p.tone as "info" | "danger" | "neutral"}
      variant={p.variant as "soft" | "outline"}
      icon={p.withIcon ? iconByTone[p.tone as string] : undefined}
      title={(p.title as string) || undefined}
      className="w-80"
    >
      {(p.description as string) || undefined}
    </Alert>
  ),
  toCode: (p) =>
    `<Alert tone="${p.tone}" variant="${p.variant}"${p.withIcon ? " icon={<Icon />}" : ""}${
      p.title ? ` title="${p.title}"` : ""
    }>${p.description ?? ""}</Alert>`,
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/alert/index.ts`:
```ts
export { Alert, alertVariants } from "./alert";
export type { AlertProps } from "./alert.types";
export { alertShowcase } from "./alert.showcase";
```

- [ ] **Step 7: 主 index 导出 alert**

在 `packages/ui/src/index.ts` 组件区加（紧跟 `export * from "./field";` 之后）:
```ts
export * from "./alert";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulian/ui exec vitest run alert`
Expected: PASS（全部用例绿，含 role 派生 + title 不落 DOM 属性 + neutral 不引未注册色）。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/alert packages/ui/src/index.ts
git commit -m "feat(ui): Alert 组件(纯 CVA 皮肤 + tone×variant 矩阵 + tone 派生 a11y role)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task A2: 接 IA + 验收（manifest + registry + 三道门 + Playwright）

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 追加 1 条**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组末尾追加（`category:"feedback"`,`status:"new"`）:
```ts
  { slug: "alert", name: "Alert", description: "提示条 · tone×variant 皮肤 + a11y role", category: "feedback", status: "new" },
```

- [ ] **Step 2: registry 追加 1 import + 1 map**

修改 `apps/www/lib/registry.tsx`——在 import 块加 `alertShowcase`、map 加 `alert: alertShowcase`:
```tsx
import {
  buttonShowcase,
  switchShowcase,
  dialogShowcase,
  badgeShowcase,
  cardShowcase,
  skeletonShowcase,
  avatarShowcase,
  inputShowcase,
  textareaShowcase,
  fieldShowcase,
  alertShowcase,
} from "@hulian/ui";

export const specBySlug: Record<string, ShowcaseSpec> = {
  button: buttonShowcase,
  switch: switchShowcase,
  dialog: dialogShowcase,
  badge: badgeShowcase,
  card: cardShowcase,
  skeleton: skeletonShowcase,
  avatar: avatarShowcase,
  input: inputShowcase,
  textarea: textareaShowcase,
  field: fieldShowcase,
  alert: alertShowcase,
};
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 11 个 slug 双边齐全、无孤儿/缺失。

- [ ] **Step 4: 跑完整三道门**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: 全绿；SSG 生成 `/components` + 11 个 `/components/[slug]`（含 alert）。

- [ ] **Step 5: 浏览器实测（Playwright 截图明暗两态 + 像素 Read）**

确认 www 已起（桌面 app 跑则 5514，否则 `pnpm dev` 起 5512）。用 Playwright 访问 `/components/alert`，**明暗两态各截一张**，存 `/Users/zhangzhiwei/Desktop/code/hulian/alert-light.png` / `alert-dark.png`，并 **Read 每张图看像素**逐项确认：
- 左树「反馈」分组新增 Alert（带 `new` 标记）；
- **soft 三 tone**：info 淡蓝/品牌色 `/12` 底、danger 淡红 `/12` 底、neutral 灰底——明暗下底色都有可见但柔和的色块（不透明、不刺眼）；
- **outline 两 tone**：透明底 + 对应 tone 边框，明暗下边框可见；
- **icon 顶对齐首行 title**、SVG 尺寸约 20px、accent 色与 title 一致；
- **danger accent + 正文 muted**：danger 态标题/图标红、正文是中性灰（不是整块红字）；
- 「仅正文」「仅 title+icon」两态布局不塌；
- 右上明暗开关切换三 tone 同步换肤、无白闪。

> 若 `/12` alpha 底在某态透明/不显色：回查 Badge soft 同写法是否正常（同源），并 `grep -rn "color-danger\|color-primary" packages/tokens/src/preset.css` 确认 token 注册。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Alert 接入 IA(feedback 分类 +1)，A2 反馈族 Alert 收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志

- Alert 四件套齐（本体无 "use client"、showcase 有）、只消费语义 token（无 success/warning）、tone×variant 9 组合皮肤明暗自适应、role 由 tone 派生且可覆盖。
- 左树「反馈」分组新增 Alert（`new` 标记），`/components/alert` 独立 SSG 页。
- 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 11 slug 双边齐全；Playwright 明暗两态像素自证（重点 `/12` alpha 底色明暗都对、icon/title 对齐、danger 正文 muted 不染色）。
- `ShowcaseSpec` 类型未动、未引新依赖；registry/manifest 双文件隔离不破。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §2 tone 集合(info/danger/neutral) → A1 alertVariants tone + 测试 neutral 不引未注册色 ✓
- spec §2 variant(soft/outline) → A1 compoundVariants 6 条 + 测试 ✓
- spec §2 icon ReactNode 传入 → A1 types icon + showcase 内联 SVG ✓
- spec §2 role 派生(danger=alert/其余=status)+可覆盖 → A1 resolvedRole + 3 条 role 测试 ✓
- spec §2 本体不加 "use client" → A1 alert.tsx 无 "use client" + 注记 ✓
- spec §3 dismissible 不做 → 全程无 dismissible（YAGNI）✓
- spec §4.1 结构(icon slot/title/description) → A1 alert.tsx JSX ✓
- spec §4.2 CVA 9 条 + description 恒 muted → A1 compoundVariants + `text-muted` ✓
- spec §4.3 Props Omit<,"title"> → A1 types + 测试「title 不落 DOM 属性」✓
- spec §5 四件套 + IA 接入 + showcase 零改 ShowcaseSpec → A1/A2 ✓
- spec §6 token/变体收敛/a11y/三道门/Playwright → 约定速查 + A2 Step4/5 ✓
- spec §7 YAGNI(无 dismissible/size/solid/图标库/新依赖) → 全程不出现 ✓

**2. Placeholder scan**：无 TBD/TODO；每个 code step 含完整可跑代码。✓

**3. Type consistency**：`alertVariants`/`Alert`/`AlertProps`/`alertShowcase` 跨 Task 命名一致；registry import 名与 index.ts 桶导出名一致；manifest slug(`alert`) 与 registry map key 一致；`Omit<HTMLAttributes<HTMLDivElement>, "title">` 与组件 destructure 的 `title`/`role`/`...props` 自洽。✓
