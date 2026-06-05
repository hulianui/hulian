# 瑚琏 A2 Step 4 实施计划 — 导航族 Tabs

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 吸取 Tabs（Base UI 无浮层），统一成瑚琏复合 API + 明暗 token 皮肤，提供 underline / solid 两种皮肤，受控/非受控双支持，键盘可达由 Base UI 兜底。

**Architecture:** 四个薄包装（`Tabs`/`TabsList`/`TabsTab`/`TabsPanel`）镜像 dialog.tsx 范式。`Tabs`=`Tabs.Root` 纯透传；皮肤变体 `variant: underline|solid` 落在 `TabsList`，由 List 决定容器皮肤并自动内嵌一个 `Tabs.Indicator`（消费者不手写）。下划线条/solid 药丸的滑动用 Base UI Indicator 内建写到 `<span>` 的 6 个几何变量 `--active-tab-{left,right,top,bottom,width,height}` + 纯 CSS `transition` 驱动，过渡时长/曲线复用 hulian motion-token 的 CSS 镜像（`motionDurationCss`/`motionEaseCss`，与 dialog.tsx 同手法），**零 motion 运行时**（天然避 reveal 陷阱）。

**Tech Stack:** Next 16 (App Router/SSG) · React 19 · Base UI rc.0 (`@base-ui-components/react/tabs`) · Tailwind v4 (语义 token) · CVA · vitest 3.2 + jsdom + @testing-library/react（`fireEvent`，user-event 未装）· pnpm + Turborepo。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-step4-tabs-design.md`（本计划覆盖其全部 §1–§10）。

---

## Base UI Tabs rc.0 API（实读 node_modules 已定死，执行者据此写、勿凭记忆改）

| 部件 | 渲染 | 关键 |
|------|------|------|
| `Tabs.Root` | div | `value`/`defaultValue`(默认 index 0)/`orientation`('horizontal')/`onValueChange(value, details)` |
| `Tabs.List` | div(role=tablist) | `activateOnFocus`(默认 false)、`loopFocus`(默认 true)；方向键/Home/End Base UI 兜底 |
| `Tabs.Tab` | button | 激活态=**`data-active`**(非 data-selected)、`data-disabled`、`aria-selected` |
| `Tabs.Panel` | div | `value`、`keepMounted`(默认 false→隐藏即卸载) |
| `Tabs.Indicator` | span | 自身 inline 写 `--active-tab-*` 6 变量；measured 前 `hidden`；须在 List 内；无激活 tab 时渲 null；内部 ResizeObserver **有 `typeof !== 'undefined'` 守卫** → jsdom 安全无需 polyfill |

子组件经 `import { Tabs as BaseTabs } from "@base-ui-components/react/tabs"` → `BaseTabs.Root/List/Tab/Panel/Indicator`。

---

## File Structure

**Task T1 — Tabs 组件（四件套）**
- Create: `packages/ui/src/tabs/tabs.tsx` — 4 包装 + `tabsListVariants` CVA + 内嵌 Indicator（underline/solid 皮肤）。
- Create: `packages/ui/src/tabs/tabs.types.ts` — `TabsProps`/`TabsListProps`/`TabsTabProps`/`TabsPanelProps`（type-only 引 Base UI prop 类型 + className 收窄成 string）。
- Create: `packages/ui/src/tabs/tabs.showcase.tsx` — `"use client"` `tabsShowcase`（variant 控件 + 3 states）。
- Create: `packages/ui/src/tabs/tabs.test.tsx` — 变体类 + 结构/a11y + Indicator 注入 + data-active 钩子 + 受控/非受控。
- Create: `packages/ui/src/tabs/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./tabs"`。

**Task T2 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — 追加 1 条（category `navigation`，status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +1 import 名 + 1 map 行。

---

## 约定速查（执行者必读）

**可用语义 token（仅这些，无 success/warning）**：`bg-bg` `bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary` `text-primary-foreground` `bg-danger` `text-danger` 等；`ring-danger`/`border-danger` 全套自动可用；圆角 `rounded-[var(--radius)]`。

**import 路径**：组件内 `import { cn } from "../lib/cn"`；motion CSS 镜像 `import { motionDurationCss, motionEaseCss } from "../motion"`；Base UI `import { Tabs as BaseTabs } from "@base-ui-components/react/tabs"`。

**四件套**：`x.tsx` + `x.types.ts` + `x.showcase.tsx`（必 `"use client"`）+ `x.test.tsx` + `index.ts`（桶导出组件/类型/showcase）。本体用 Base UI(client) → `tabs.tsx`/`tabs.showcase.tsx` 都加 `"use client"`。

**门禁节奏**（沿用批次一/Step2 已验证模式）：
- 组件 Task 的 TDD 循环：`pnpm --filter @hulianui/ui exec vitest run tabs`（先红后绿）。
- 组件 Task commit 前：`pnpm typecheck`（守类型/导出）。
- **完整三道门 + 生产 build 只在 T2 跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**——全包 build 会撞 desktop tauri `beforeBuildCommand` 二次 build www）。
- **Playwright 截图实测只在 T2**：明暗两态 + 两皮肤，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（**不在 .playwright-mcp/**），Read 看像素（不靠 `browser_evaluate` 读 DOM，会漏几何 bug）。

**trunk-based**：直接在 master 小步 commit，无 remote、不 push。

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

## Task T1: Tabs（四件套，TDD）

**Files:**
- Create: `packages/ui/src/tabs/tabs.test.tsx`
- Create: `packages/ui/src/tabs/tabs.tsx`
- Create: `packages/ui/src/tabs/tabs.types.ts`
- Create: `packages/ui/src/tabs/tabs.showcase.tsx`
- Create: `packages/ui/src/tabs/index.ts`
- Modify: `packages/ui/src/index.ts`

- [ ] **Step 1: 写 tabs 测试（先红）**

Create `packages/ui/src/tabs/tabs.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { tabsListVariants, Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";

describe("tabsListVariants", () => {
  it("默认 underline：下划线条 + relative 锚", () => {
    const c = tabsListVariants({});
    expect(c).toContain("relative");
    expect(c).toContain("border-b");
  });
  it("solid：分段药丸轨道", () => {
    const c = tabsListVariants({ variant: "solid" });
    expect(c).toContain("relative");
    expect(c).toContain("bg-surface-hover");
    expect(c).toContain("p-1");
  });
});

function Tree({ variant }: { variant?: "underline" | "solid" }) {
  return (
    <Tabs defaultValue="a">
      <TabsList variant={variant}>
        <TabsTab value="a">甲</TabsTab>
        <TabsTab value="b">乙</TabsTab>
        <TabsTab value="c" disabled>丙</TabsTab>
      </TabsList>
      <TabsPanel value="a">面板甲</TabsPanel>
      <TabsPanel value="b">面板乙</TabsPanel>
      <TabsPanel value="c">面板丙</TabsPanel>
    </Tabs>
  );
}

describe("Tabs 结构与 a11y（Base UI 兜底）", () => {
  it("tablist + tab 角色齐，激活 tab 有 data-active + aria-selected", () => {
    const { getByRole, getAllByRole } = render(<Tree />);
    expect(getByRole("tablist")).toBeTruthy();
    const tabs = getAllByRole("tab");
    expect(tabs.length).toBe(3);
    const active = tabs.find((t) => t.getAttribute("data-active") !== null)!;
    expect(active.textContent).toBe("甲");
    expect(active.getAttribute("aria-selected")).toBe("true");
  });

  it("TabsList 自动注入 Indicator span（在 tablist 内）", () => {
    const { container } = render(<Tree />);
    expect(container.querySelector('[role="tablist"] span')).toBeTruthy();
  });

  it("禁用 tab 带 data-disabled", () => {
    const { getByText } = render(<Tree />);
    const tab = getByText("丙").closest('[role="tab"]')!;
    expect(tab.getAttribute("data-disabled")).not.toBeNull();
  });
});

describe("Tab 皮肤钩子（防 data-active 漂移）", () => {
  it("tab className 含 data-[active]:text-foreground + text-muted + relative z-10 + 焦点环", () => {
    const { getAllByRole } = render(<Tree />);
    const cls = getAllByRole("tab")[0].className;
    expect(cls).toContain("text-muted");
    expect(cls).toContain("data-[active]:text-foreground");
    expect(cls).toContain("relative");
    expect(cls).toContain("z-10");
    expect(cls).toContain("focus-visible:ring-ring");
  });
});

describe("受控/非受控行为", () => {
  it("非受控：默认显首面板，点次 tab 切到次面板（隐藏即卸载）", () => {
    const { getByText, queryByText } = render(<Tree />);
    expect(getByText("面板甲")).toBeTruthy();
    expect(queryByText("面板乙")).toBeNull();
    fireEvent.click(getByText("乙"));
    expect(getByText("面板乙")).toBeTruthy();
    expect(queryByText("面板甲")).toBeNull();
  });

  it("受控：点 tab 触发 onValueChange 带新 value", () => {
    const onValueChange = vi.fn();
    const { getByText } = render(
      <Tabs value="a" onValueChange={onValueChange}>
        <TabsList>
          <TabsTab value="a">甲</TabsTab>
          <TabsTab value="b">乙</TabsTab>
        </TabsList>
        <TabsPanel value="a">面板甲</TabsPanel>
        <TabsPanel value="b">面板乙</TabsPanel>
      </Tabs>,
    );
    fireEvent.click(getByText("乙"));
    expect(onValueChange).toHaveBeenCalled();
    expect(onValueChange.mock.calls[0][0]).toBe("b");
  });
});
```

> **执行注记（已知风险 + 兜底）**：若末两条点击用例在 jsdom 下 `fireEvent.click` 不翻状态（Tab 主交互即点击，预期可行），改用 `fireEvent.pointerDown(tab); fireEvent.click(tab)`，或受控用 rerender 断言。若「隐藏即卸载」断言（`queryByText("面板甲")` 为 null）因 keepMounted 语义不符而红，退化为断言激活面板可见 + 用 `hidden` 属性判隐藏；核心是「点次 tab → 次面板内容出现」。先红后绿实测，按需微调。

- [ ] **Step 2: 跑确认失败**

Run: `pnpm --filter @hulianui/ui exec vitest run tabs`
Expected: FAIL —— `./tabs` 不存在。

- [ ] **Step 3: 实现 tabs.types.ts**

Create `packages/ui/src/tabs/tabs.types.ts`:
```ts
import type { VariantProps } from "class-variance-authority";
import type {
  TabsRootProps,
  TabsListProps as BaseTabsListProps,
  TabsTabProps as BaseTabsTabProps,
  TabsPanelProps as BaseTabsPanelProps,
} from "@base-ui-components/react/tabs";
import type { tabsListVariants } from "./tabs";

/** 根：透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。 */
export type TabsProps = TabsRootProps;

/** tab 条：皮肤变体在此（underline/solid），自动内嵌 Indicator。className 收窄成 string 便于 cn()。 */
export interface TabsListProps
  extends Omit<BaseTabsListProps, "className">,
    VariantProps<typeof tabsListVariants> {
  className?: string;
}

export type TabsTabProps = Omit<BaseTabsTabProps, "className"> & { className?: string };
export type TabsPanelProps = Omit<BaseTabsPanelProps, "className"> & { className?: string };
```

- [ ] **Step 4: 实现 tabs.tsx**

Create `packages/ui/src/tabs/tabs.tsx`:
```tsx
"use client";
import type { CSSProperties } from "react";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { TabsListProps, TabsPanelProps, TabsProps, TabsTabProps } from "./tabs.types";

// 根：纯透传 Base UI Tabs.Root（value/defaultValue/onValueChange/orientation）。默认非受控。
export function Tabs(props: TabsProps) {
  return <BaseTabs.Root {...props} />;
}

// tab 条容器皮肤：underline=下划线条；solid=分段药丸轨道。relative 锚定内嵌 Indicator。
export const tabsListVariants = cva("relative inline-flex items-center gap-1", {
  variants: {
    variant: {
      underline: "border-b border-border",
      solid: "rounded-[var(--radius)] bg-surface-hover p-1",
    },
  },
  defaultVariants: { variant: "underline" },
});

// Indicator 过渡：复用 motion-token 的 CSS 镜像，手感同 Dialog/Button，零 motion 运行时。
const indicatorTransition: CSSProperties = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
};

// Indicator 绑 Base UI 测好的 6 个几何变量 → 纯 CSS 平滑滑动。
// underline 只动 width + translateX；solid 动 width/height + translate(x,y)。
const indicatorByVariant: Record<"underline" | "solid", { className: string; style: CSSProperties }> = {
  underline: {
    className: "pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-primary",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width",
      width: "var(--active-tab-width)",
      transform: "translateX(var(--active-tab-left))",
    },
  },
  solid: {
    className: "pointer-events-none absolute left-0 top-0 rounded-[calc(var(--radius)-0.25rem)] bg-surface shadow-sm",
    style: {
      ...indicatorTransition,
      transitionProperty: "transform, width, height",
      width: "var(--active-tab-width)",
      height: "var(--active-tab-height)",
      transform: "translate(var(--active-tab-left), var(--active-tab-top))",
    },
  },
};

export function TabsList({ className, variant, children, ...props }: TabsListProps) {
  const v = variant ?? "underline";
  const ind = indicatorByVariant[v];
  return (
    <BaseTabs.List {...props} className={cn(tabsListVariants({ variant: v }), className)}>
      <BaseTabs.Indicator className={ind.className} style={ind.style} />
      {children}
    </BaseTabs.List>
  );
}

// Tab：皮肤无关。text-muted→data-[active]:text-foreground；relative z-10 让文字盖在 solid 药丸之上。
const tabsTabClasses = cn(
  "relative z-10 cursor-pointer select-none rounded-[var(--radius)] px-3 py-1.5 text-sm font-medium",
  "text-muted transition-colors hover:text-foreground data-[active]:text-foreground",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
);

export function TabsTab({ className, ...props }: TabsTabProps) {
  return <BaseTabs.Tab {...props} className={cn(tabsTabClasses, className)} />;
}

export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      {...props}
      className={cn(
        "mt-3 rounded-[var(--radius)] text-sm text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        className,
      )}
    />
  );
}
```

- [ ] **Step 5: 实现 tabs.showcase.tsx**

Create `packages/ui/src/tabs/tabs.showcase.tsx`:
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Tabs, TabsList, TabsTab, TabsPanel } from "./tabs";

function Demo({ variant }: { variant: "underline" | "solid" }) {
  return (
    <Tabs defaultValue="account" className="w-80">
      <TabsList variant={variant}>
        <TabsTab value="account">账户</TabsTab>
        <TabsTab value="password">密码</TabsTab>
        <TabsTab value="team" disabled>团队</TabsTab>
      </TabsList>
      <TabsPanel value="account">管理你的账户资料与偏好设置。</TabsPanel>
      <TabsPanel value="password">在这里修改登录密码。</TabsPanel>
      <TabsPanel value="team">邀请成员、分配角色。</TabsPanel>
    </Tabs>
  );
}

export const tabsShowcase: ShowcaseSpec = {
  controls: [
    {
      prop: "variant",
      type: "select",
      options: ["underline", "solid"],
      defaultValue: "underline",
      label: "皮肤",
    },
  ],
  states: [
    { name: "underline", render: () => <Demo variant="underline" /> },
    { name: "solid", render: () => <Demo variant="solid" /> },
    {
      name: "disabled tab",
      render: () => (
        <Tabs defaultValue="a" className="w-80">
          <TabsList>
            <TabsTab value="a">可用</TabsTab>
            <TabsTab value="b" disabled>禁用</TabsTab>
            <TabsTab value="c">可用</TabsTab>
          </TabsList>
          <TabsPanel value="a">第一个面板。</TabsPanel>
          <TabsPanel value="b">不可达。</TabsPanel>
          <TabsPanel value="c">第三个面板。</TabsPanel>
        </Tabs>
      ),
    },
  ],
  renderWithProps: (p) => <Demo variant={(p.variant as "underline" | "solid") ?? "underline"} />,
  toCode: (p) =>
    `<Tabs defaultValue="account">\n  <TabsList variant="${p.variant ?? "underline"}">\n    <TabsTab value="account">账户</TabsTab>\n    <TabsTab value="password">密码</TabsTab>\n  </TabsList>\n  <TabsPanel value="account">…</TabsPanel>\n  <TabsPanel value="password">…</TabsPanel>\n</Tabs>`,
};
```

- [ ] **Step 6: 实现 index.ts 桶导出**

Create `packages/ui/src/tabs/index.ts`:
```ts
export { Tabs, TabsList, TabsTab, TabsPanel, tabsListVariants } from "./tabs";
export type { TabsProps, TabsListProps, TabsTabProps, TabsPanelProps } from "./tabs.types";
export { tabsShowcase } from "./tabs.showcase";
```

- [ ] **Step 7: 主 index 导出 tabs**

在 `packages/ui/src/index.ts` 组件区加一行（紧跟 `export * from "./field";` 之后）:
```ts
export * from "./tabs";
```

- [ ] **Step 8: 跑测试确认通过**

Run: `pnpm --filter @hulianui/ui exec vitest run tabs`
Expected: PASS（变体类 + 结构/a11y + Indicator 注入 + data-active 钩子 + 受控/非受控全绿）。若点击用例红，按 Step 1 注记兜底微调后再绿。

- [ ] **Step 9: typecheck + Commit**

Run: `pnpm typecheck`
Expected: 无错。
```bash
git add packages/ui/src/tabs packages/ui/src/index.ts
git commit -m "feat(ui): Tabs 组件(Base UI Tabs 无浮层 + underline/solid 皮肤 + Indicator CSS 变量驱动滑块)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task T2: 接 IA + Step 4 验收

**Files:**
- Modify: `apps/www/lib/manifest.ts`
- Modify: `apps/www/lib/registry.tsx`

- [ ] **Step 1: manifest 追加 1 条（首个 navigation 条目）**

在 `apps/www/lib/manifest.ts` 的 `manifest` 数组末尾、`field` 条目后追加:
```ts
  { slug: "tabs", name: "Tabs", description: "选项卡 · Base UI 无浮层 + underline/solid 滑块", category: "navigation", status: "new" },
```

- [ ] **Step 2: registry 追加 1 import + 1 map**

修改 `apps/www/lib/registry.tsx`——在 import 块加 `tabsShowcase`、map 加 `tabs` 行:
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
  tabsShowcase,
} from "@hulianui/ui";

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
  tabs: tabsShowcase,
};
```

- [ ] **Step 3: 跑契约测试（验证 manifest↔registry 一致）**

Run: `pnpm --filter www exec vitest run manifest`
Expected: PASS —— 11 个 slug 双边齐全、无孤儿/缺失、navigation category 合法。

- [ ] **Step 4: 跑完整三道门**

Run: `pnpm typecheck && pnpm test && pnpm build --filter=www`
Expected: 全绿；SSG 生成 `/components` + 11 个 `/components/[slug]`（含 tabs）。

- [ ] **Step 5: 浏览器实测（Playwright 截图明暗两态 + 像素 Read）**

启动 www（5512）或复用桌面 app 的 5514 实例。用 Playwright 访问 `/components/tabs`，**明暗两态各截一张**（两皮肤都要在画面里——showcase 的 states 区已含 underline + solid + disabled tab 三块），存到 `/Users/zhangzhiwei/Desktop/code/hulian/`（如 `step4-tabs-light.png` / `step4-tabs-dark.png`），并 **Read 每张图看像素**逐项确认：
- 左树**新增「导航」分组**，内含 Tabs（带 `new` 标记）；
- **underline 皮肤**：下划线条在当前 tab 正下方、宽度≈tab 宽、对齐；活动 tab 文字 `text-foreground`、其余 `text-muted`；
- **solid 皮肤**：药丸（`bg-surface` + 圆角 + 浅阴影）在活动 tab 之下作底、文字在药丸之上清晰可读；
- **disabled tab**：暗化（opacity-50）；
- 用 Playwright 点不同 tab（或键盘方向键）后再截一张，验证**滑块平滑滑到新 tab 且对齐、panel 内容随之切换**；
- 焦点：Tab 键聚焦某 tab 时焦点环可见；
- 右上明暗开关切换，两皮肤同步换肤、无白闪。
- 桌面 app(5514)：确认壳内加载 `/components/tabs` 正常。

> **端口**：www=5512、桌面 app devUrl=5514。**若桌面 app 已在 5514 跑 www 实例，直接用 5514 截图**（Next 16 按项目目录去重，别另起 5512 撞 dir-guard）。
> **若 underline 条/solid 药丸不显形或不滑动**：F12 看 Indicator `<span>` 是否拿到 `--active-tab-width`>0 且无 `hidden` 属性；若 width=0，多半是 List 非 `relative` 或 Indicator 不在 List 内——回查 tabs.tsx 结构。

- [ ] **Step 6: Commit**

```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): 导航族 Tabs 接入 IA(首个 navigation 分组) + Step4 收口

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志（本计划 = spec §1–§10）

- 左侧组件树**首次出现「导航」分组**，内含 Tabs（`new` 标记），`/components/tabs` 独立 SSG 页。
- Tabs 四件套齐、只消费语义 token、`"use client"` 正确、a11y（role/aria/键盘）由 Base UI 兜底。
- **underline 下划线条 + solid 分段药丸双皮肤**，活动指示条用 Base UI Indicator 的 `--active-tab-*` 变量 + CSS 过渡平滑滑动对齐当前 tab（Playwright 像素自证）；受控/非受控双通；禁用 tab 暗化且键盘跳过。
- 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 11 slug 双边齐全；桌面 app(5514) 正常。
- 未引新依赖、未改 `ShowcaseSpec` 类型。

---

## Self-Review（plan 对 spec 的覆盖核查）

**1. Spec coverage**：
- spec §2 API 防漂移 → 本计划顶部 API 表 + types.ts type-only 引 Base UI prop 类型 ✓
- spec §3 裁决1(variant 落 List) → T1 tabs.tsx `TabsList` ✓；裁决2(Indicator CSS 变量+CSS 过渡, 零 motion 运行时) → `indicatorByVariant` ✓；裁决3(默认非受控) → `Tabs` 透传 + showcase `defaultValue` ✓；裁决4(states 承载, ShowcaseSpec 不动) → showcase `states` + 仅 variant 控件 ✓
- spec §4 组件形态/类型收窄 className → types.ts `Omit<…,"className"> & {className?:string}` ✓
- spec §4.1 underline/solid 皮肤 token → tabsListVariants + indicatorByVariant + tabsTabClasses ✓
- spec §5 showcase → tabs.showcase.tsx ✓
- spec §6 硬约束(token/a11y/CVA/四件套/motion 镜像/trunk) → 各 Task + 约定速查 ✓
- spec §7 测试计划 7 条 → tabs.test.tsx 七组用例 ✓（含 data-active 漂移守护 + Indicator 注入 + 受控/非受控）
- spec §8 三道门 --filter=www + Playwright 明暗两态 → T2 Step4/Step5 ✓
- spec §9 YAGNI(不 renderBeforeHydration/不 Context/不新依赖/不改 ShowcaseSpec) → 实现未涉及 ✓
- spec §10 接 IA(manifest+1/registry+1, 首 navigation) + 契约测试 → T2 Step1-3 ✓

**2. Placeholder scan**：无 TBD/TODO；每个 code step 含完整可跑代码。✓

**3. Type consistency**：`tabsListVariants`/`Tabs`/`TabsList`/`TabsTab`/`TabsPanel`/`TabsProps`/`TabsListProps`/`TabsTabProps`/`TabsPanelProps`/`tabsShowcase` 跨 Task 命名一致；index.ts 桶导出名与 registry import 名(`tabsShowcase`)一致；manifest slug(`tabs`) 与 registry map key 一致。✓
