# 瑚琏 A2.2 反馈 overlay 实施计划 — Drawer 侧滑抽屉

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development / executing-plans。Steps 用 checkbox。

**Goal:** 吸取反馈 overlay 族 Drawer 侧滑抽屉。Base UI rc.0 无独立 Drawer primitive → **Drawer = 在 Base UI Dialog 引擎之上加「侧边定位 + translateX/Y 滑入/滑出」**，守 overlay 全 Base UI 红线（与现有 Dialog 同源、零第二套引擎），**不动现有 dialog 组件**，另起 `drawer/`。

**Architecture（含 brainstorm 裁决）:** 镜像 `dialog.tsx` 的 Portal/Backdrop/Popup 装配 + motion-token CSS 镜像过渡，仅把 Popup 由「居中 + scale 淡入」改为「贴边 + translate 滑入」：
- **`Drawer`** = 透明转发 `BaseDialog.Root`（`open`/`defaultOpen`/`modal`/`onOpenChange` 全经 `ComponentProps` 透传，同 dialog.tsx）。
- **`DrawerTrigger`** = `BaseDialog.Trigger`（re-export，支持 `render` 包按钮）。
- **`DrawerClose`** = `BaseDialog.Close`（re-export）。
- **`DrawerContent`** = `Portal` + `Backdrop`(同 Dialog 的 opacity 过渡) + `Popup`(贴边定位 + 滑入)；可选 `Title`/`Description` 作 a11y label。
- **`drawerVariants`**（CVA `side`）产出每个方向的「定位 + 尺寸 + closed-translate（落 `data-[starting/ending-style]`）+ 内边框」：
  - `right`(默认)：`inset-y-0 right-0 h-full w-[min(90vw,24rem)] border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full`
  - `left`：`inset-y-0 left-0 h-full w-[min(90vw,24rem)] border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full`
  - `top`：`inset-x-0 top-0 w-full h-[min(90vh,20rem)] border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full`
  - `bottom`：`inset-x-0 bottom-0 w-full h-[min(90vh,20rem)] border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full`
  - base：`fixed z-50 flex flex-col gap-1 bg-surface border-border p-6 text-foreground shadow-xl outline-none transition-transform`，过渡时长/曲线复用 `motionDurationCss.base`/`motionEaseCss.out`（inline style，同 dialog.tsx）。

**关键 API 事实（require.resolve `@base-ui-components/react/dialog` 实证，rc.0）:** 部件 `root/portal/backdrop/popup/title/description/trigger/close`（**无 Positioner** → Drawer 不需 Positioner，Popup 直接 `fixed` 贴边）。Root props `open`/`defaultOpen`/`modal`(boolean|'trap-focus')/`onOpenChange`/`onOpenChangeComplete`。Popup `initialFocus`/`finalFocus`/`render`。过渡钩子 `data-[starting-style]`/`data-[ending-style]`（现有 dialog.tsx 已用即证）。

**Tech Stack:** Next 16 (SSG) · React 19 · Base UI rc.0 (dialog) · Tailwind v4 (语义 token) · CVA · motion token CSS 镜像 · vitest 3.2 + jsdom + @testing-library/react。

**上游 spec:** `docs/superpowers/specs/2026-06-02-hulian-a2-absorption-batch-design.md`（§2 overlay 红线 · §3.4 feedback 含 Drawer · §10 A2.2）。

---

## File Structure

**Task E1 — Drawer 四件套**
- Create: `packages/ui/src/drawer/drawer.tsx` — Root 转发 + Portal/Backdrop/Popup 侧滑装配 + drawerVariants。
- Create: `packages/ui/src/drawer/drawer.types.ts` — DrawerProps(=Root ComponentProps) + DrawerContentProps + DrawerSide。
- Create: `packages/ui/src/drawer/drawer.showcase.tsx` — `"use client"` ShowcaseSpec（4 side trigger）。
- Create: `packages/ui/src/drawer/drawer.test.tsx` — drawerVariants 四向 + defaultOpen 渲染(title/children/role=dialog/backdrop)。
- Create: `packages/ui/src/drawer/index.ts` — 桶导出。
- Modify: `packages/ui/src/index.ts` — `export * from "./drawer"`。

**Task E2 — 接 IA + 验收**
- Modify: `apps/www/lib/manifest.ts` — +1（category `feedback`, status `new`）。
- Modify: `apps/www/lib/registry.tsx` — +1 import + 1 map。

---

## 约定速查

**语义 token**（无 success）：`bg-surface` `bg-bg` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary`；圆角 `rounded-[var(--radius)]`。Backdrop `bg-black/40`（同 Dialog）。
**import**：`import { cn } from "../lib/cn"`；`import { motionDurationCss, motionEaseCss } from "../motion"`；`import { Dialog as BaseDialog } from "@base-ui-components/react/dialog"`。
**四件套** + `"use client"`（drawer.tsx + showcase 都加，Base UI client）+ 桶导出 + 主 index export + showcase 从主 barrel 导出。
**门禁**：组件 TDD `pnpm --filter @hulianui/ui exec vitest run drawer`（先红后绿）；commit 前 `pnpm typecheck`；完整门禁只在 E2 跑 `pnpm typecheck && pnpm test && pnpm build --filter=www --force`（`--force` 拿真实态、绕并行 WIP 的 turbo cache 假象，见 [[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。
**截图只在 E2**：被占用则 CDP 自起隔离 chromium（见 [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]），存 cwd 根，**先点开 drawer 再截**，明暗两态。
**trunk-based**：master 小步 commit，`git add` **只列自己文件**（绝不 `-A`，见 [[parallel-session-git-add-all-sweeps-your-staged-files]]），不碰他人 WIP。

---

## Task 0: 绿色基线
- [ ] `cd /Users/zhangzhiwei/Desktop/code/hulian && pnpm typecheck && pnpm test && pnpm build --filter=www --force`；全绿记基线（红则先判是否他人 WIP）。

---

## Task E1: Drawer（四件套，TDD）

- [ ] **Step 1: 写测试（先红）** `packages/ui/src/drawer/drawer.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Drawer, DrawerContent } from "./drawer";
import { drawerVariants } from "./drawer";

describe("drawerVariants", () => {
  it("默认 right：贴右、border-l、滑出向右", () => {
    const c = drawerVariants({});
    expect(c).toContain("right-0");
    expect(c).toContain("inset-y-0");
    expect(c).toContain("border-l");
    expect(c).toContain("data-[ending-style]:translate-x-full");
  });
  it("left：贴左、border-r、负向滑出", () => {
    const c = drawerVariants({ side: "left" });
    expect(c).toContain("left-0");
    expect(c).toContain("border-r");
    expect(c).toContain("data-[starting-style]:-translate-x-full");
  });
  it("top：贴顶、border-b、纵向滑出", () => {
    const c = drawerVariants({ side: "top" });
    expect(c).toContain("top-0");
    expect(c).toContain("inset-x-0");
    expect(c).toContain("border-b");
    expect(c).toContain("data-[ending-style]:-translate-y-full");
  });
  it("bottom：贴底、border-t、正向纵滑", () => {
    const c = drawerVariants({ side: "bottom" });
    expect(c).toContain("bottom-0");
    expect(c).toContain("border-t");
    expect(c).toContain("data-[starting-style]:translate-y-full");
  });
  it("base 始终带 fixed + transition-transform + 语义皮肤", () => {
    const c = drawerVariants({});
    expect(c).toContain("fixed");
    expect(c).toContain("transition-transform");
    expect(c).toContain("bg-surface");
  });
});

describe("Drawer (defaultOpen 渲染)", () => {
  it("Portal 挂载 popup：title + 内容 + role=dialog 出现", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="设置面板">抽屉内容X</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("设置面板")).toBeTruthy();
    expect(screen.getByText("抽屉内容X")).toBeTruthy();
  });
  it("side 默认 right 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="t">x</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });
  it("side=left 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent side="left" title="t">x</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("left-0");
  });
  it("无 title 不渲染 heading 也能挂载", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>仅内容</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("仅内容")).toBeTruthy();
  });
});
```

- [ ] **Step 2: 跑确认失败** `pnpm --filter @hulianui/ui exec vitest run drawer` → FAIL（模块不存在）。

- [ ] **Step 3: drawer.types.ts**
```ts
import type { ComponentProps, ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";

export type DrawerSide = "left" | "right" | "top" | "bottom";

export type DrawerProps = ComponentProps<typeof BaseDialog.Root>;

export interface DrawerContentProps {
  side?: DrawerSide;
  title?: ReactNode; // 提供则渲 Dialog.Title 作 a11y label
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}
```

- [ ] **Step 4: drawer.tsx**
```tsx
"use client";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { cva } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { DrawerContentProps } from "./drawer.types";

// 同 dialog.tsx：overlay 自管 mount/unmount，用 motion token CSS 镜像驱动原生过渡，零 motion 运行时。
const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

// side 决定贴边定位 + 尺寸 + 内边框 + 关闭态 translate（落在 starting/ending-style）。
export const drawerVariants = cva(
  [
    "fixed z-50 flex flex-col gap-1 bg-surface border-border p-6 text-foreground shadow-xl outline-none",
    "transition-transform",
  ],
  {
    variants: {
      side: {
        right:
          "inset-y-0 right-0 h-full w-[min(90vw,24rem)] border-l data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
        left:
          "inset-y-0 left-0 h-full w-[min(90vw,24rem)] border-r data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full",
        top:
          "inset-x-0 top-0 w-full h-[min(90vh,20rem)] border-b data-[starting-style]:-translate-y-full data-[ending-style]:-translate-y-full",
        bottom:
          "inset-x-0 bottom-0 w-full h-[min(90vh,20rem)] border-t data-[starting-style]:translate-y-full data-[ending-style]:translate-y-full",
      },
    },
    defaultVariants: { side: "right" },
  },
);

export function Drawer(props: ComponentProps<typeof BaseDialog.Root>) {
  return <BaseDialog.Root {...props} />;
}

export const DrawerTrigger = BaseDialog.Trigger;
export const DrawerClose = BaseDialog.Close;

export function DrawerContent({
  side = "right",
  title,
  description,
  children,
  className,
}: DrawerContentProps) {
  return (
    <BaseDialog.Portal>
      <BaseDialog.Backdrop
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
        style={overlayTransition}
      />
      <BaseDialog.Popup className={cn(drawerVariants({ side }), className)} style={overlayTransition}>
        {title && <BaseDialog.Title className="text-lg font-semibold">{title}</BaseDialog.Title>}
        {description && (
          <BaseDialog.Description className="text-sm text-muted">{description}</BaseDialog.Description>
        )}
        <div className="mt-2 flex-1">{children}</div>
      </BaseDialog.Popup>
    </BaseDialog.Portal>
  );
}
```

- [ ] **Step 5: drawer.showcase.tsx**
```tsx
"use client";
import type { ShowcaseSpec } from "../showcase/types";
import { Drawer, DrawerTrigger, DrawerClose, DrawerContent } from "./drawer";
import type { DrawerSide } from "./drawer.types";
import { Button } from "../button/button";

function Demo({ side }: { side: DrawerSide }) {
  return (
    <Drawer>
      <DrawerTrigger render={<Button variant="outline">{`打开 ${side} 抽屉`}</Button>} />
      <DrawerContent
        side={side}
        title="设置面板"
        description="Esc / 点遮罩 / 关闭按钮均可收起；焦点锁在抽屉内。"
      >
        <div className="mt-auto flex justify-end gap-2 pt-4">
          <DrawerClose render={<Button variant="ghost">取消</Button>} />
          <DrawerClose render={<Button>保存</Button>} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const drawerShowcase: ShowcaseSpec = {
  controls: [
    { prop: "side", type: "select", options: ["left", "right", "top", "bottom"], defaultValue: "right", label: "side" },
  ],
  states: [
    { name: "right（默认）", render: () => <Demo side="right" /> },
    { name: "left", render: () => <Demo side="left" /> },
    { name: "top", render: () => <Demo side="top" /> },
    { name: "bottom", render: () => <Demo side="bottom" /> },
  ],
  renderWithProps: (p) => <Demo side={(p.side as DrawerSide) ?? "right"} />,
  toCode: (p) =>
    `<Drawer>\n  <DrawerTrigger render={<Button>打开</Button>} />\n  <DrawerContent side="${p.side}" title="设置面板">\n    {/* 内容 */}\n  </DrawerContent>\n</Drawer>`,
};
```

- [ ] **Step 6: index.ts**
```ts
export { Drawer, DrawerTrigger, DrawerClose, DrawerContent, drawerVariants } from "./drawer";
export type { DrawerProps, DrawerContentProps, DrawerSide } from "./drawer.types";
export { drawerShowcase } from "./drawer.showcase";
```

- [ ] **Step 7: 主 index** 加 `export * from "./drawer";`（紧跟现有 overlay 族导出之后，自己一行；用 Edit 防 clobber）。

- [ ] **Step 8: 跑测试绿** `pnpm --filter @hulianui/ui exec vitest run drawer` → PASS。

- [ ] **Step 9: typecheck + commit（只列自己文件）**
```bash
pnpm typecheck
git add packages/ui/src/drawer packages/ui/src/index.ts
git commit -m "feat(ui): Drawer 组件(Base UI Dialog 引擎 + side 贴边 translate 滑入, 守 overlay 红线)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task E2: 接 IA + 验收

- [ ] **Step 1: manifest +1**（feedback/new，Edit 防 clobber）:
```ts
  { slug: "drawer", name: "Drawer", description: "抽屉 · Base UI Dialog 引擎 + 四向侧滑", category: "feedback", status: "new" },
```
- [ ] **Step 2: registry +1** import `drawerShowcase` + map `drawer: drawerShowcase`（Edit 防 clobber）。
- [ ] **Step 3: 契约测试** `pnpm --filter www exec vitest run manifest` → PASS（双边齐全）。
- [ ] **Step 4: 完整门禁** `pnpm typecheck && pnpm test && pnpm build --filter=www --force` → 全绿，SSG 出 `/components/drawer`。
- [ ] **Step 5: 截图明暗两态（先点开 drawer）** —— 5514 已跑则用 5514；MCP 浏览器被占用则 CDP 自起隔离 chromium，注入 `hulian-theme` 切明暗，导航 `/components/drawer` → 点 trigger 打开 → 等 `role=dialog` 出现 → 截全屏。逐项 Read 验：四向滑入到位（right/left 贴边竖条、top/bottom 横条）、遮罩半透明压住背景、内容不溢出抽屉、明暗换肤、文字对比足。至少截 right 明 + right 暗（+ 可选 left/top/bottom 各一）。
- [ ] **Step 6: commit（只列自己文件）**
```bash
git add apps/www/lib/manifest.ts apps/www/lib/registry.tsx
git commit -m "feat(www): Drawer 接入 IA(feedback 分组) + registry 注册

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完成标志
- `drawer/` 四件套齐、`"use client"`、桶导出 + 主 index + registry/manifest 接入；**未碰现有 dialog 组件**。
- 只消费语义 token；overlay 全 Base UI（Dialog 引擎，无第二套/无 React Aria/无 Positioner）。
- 四向 `side` 贴边 + translate 滑入/滑出；Backdrop 遮罩；focus-trap/Esc/点外关闭由 Base UI 兜底。
- 门禁全绿（typecheck + test + `build --filter=www --force`）；契约双边齐；明暗两态截图像素自证 drawer 打开滑入到位。
- 记忆更新 + claudeception（Dialog→Drawer 复用 + 侧滑过渡方向）。
</content>
