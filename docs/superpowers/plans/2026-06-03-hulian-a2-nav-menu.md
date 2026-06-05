# 瑚琏 A2.2 实施计划 — 导航 overlay：Menu 下拉菜单

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:test-driven-development（本次 inline TDD，因 master 有活跃并行 WIP，共享工作树竞争 → 亲自执行而非派子 agent）。
> 上游 spec: `docs/superpowers/specs/2026-06-03-hulian-a2-nav-menu-design.md`（代码/裁决在此，本 plan 给 TDD 步骤 + 确切测试）。

**Goal:** 吸取 Menu 命令式下拉菜单（Item onClick 动作 + Separator + Group/Label，default/danger），全 Base UI rc.0，守 overlay 红线，照搬 popover 的 Portal/Positioner 承载。

**Architecture:** 镜像 Popover 薄包。`MenuContent`=`Portal>Positioner>Popup`(surface 面板 +`p-1`)；`MenuItem`=Base Item + `menuItemVariants`(default/danger)，**皮肤 hook 用 `data-[highlighted]`/`data-[disabled]`（Item 渲 `<div>`，禁 hover/focus/:disabled 伪类）**；Separator/GroupLabel 贴 token 皮肤；modal 透传默认 true。

**Tech:** Base UI rc.0 `menu` · React 19 · Tailwind v4 token · CVA · vitest+jsdom · pnpm/Turbo。

## 约定速查
- token：item 高亮 `data-[highlighted]:bg-surface-hover`；danger `text-danger`+`data-[highlighted]:bg-danger/10`；面板 `bg-surface border-border shadow-xl`；圆角 item 用 `rounded-[min(var(--radius),0.375rem)]`。
- import：`import { Menu as BaseMenu } from "@base-ui-components/react/menu"`；`cn`/`motion` 同 popover。
- 门禁：`pnpm --filter @hulianui/ui exec vitest run menu`（TDD）+ commit 前 `pnpm typecheck`；接 IA 后 `pnpm typecheck && pnpm test && pnpm build --filter=www --force`。**git add 只列自己文件 + `git commit -- <pathspec>`**（并发 index 竞争防护，[[parallel-session-git-add-all-sweeps-your-staged-files]]）。trunk master 直 commit。
- jsdom：受控 open 测试传 `modal={false}`（避 modal 的 scroll-lock/focus-manager 在 jsdom 抛错；测 items 非 modality）。

---

## Task 0：基线
- [ ] `pnpm typecheck && pnpm test --filter @hulianui/ui` 用 `--force` 记录真实绿/红；红的失败文件若 ∈ 未跟踪他人 WIP → isolate 不碰（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。

## Task M1：Menu 组件（四件套 TDD）
**Files:** `packages/ui/src/menu/{menu.test.tsx,menu.tsx,menu.types.ts,menu.showcase.tsx,index.ts}` + 改 `packages/ui/src/index.ts`

- [ ] **Step 1 写测试（先红）** `menu.test.tsx`：
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { menuItemVariants, Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel } from "./menu";

describe("menuItemVariants", () => {
  it("default 用 data-[highlighted]:bg-surface-hover（非 hover/focus 伪类）+ data-[disabled]", () => {
    const c = menuItemVariants({});
    expect(c).toContain("data-[highlighted]:bg-surface-hover");
    expect(c).toContain("data-[disabled]:opacity-50");
  });
  it("danger 用 text-danger + data-[highlighted]:bg-danger/10", () => {
    const c = menuItemVariants({ variant: "danger" });
    expect(c).toContain("text-danger");
    expect(c).toContain("data-[highlighted]:bg-danger/10");
  });
});

describe("Menu", () => {
  it("闭合态: 触发器在, item 不在 DOM", () => {
    render(
      <Menu>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent><MenuItem>编辑</MenuItem></MenuContent>
      </Menu>,
    );
    expect(screen.getByText("菜单")).toBeTruthy();
    expect(screen.queryByText("编辑")).toBeNull();
  });

  it("受控 open: items/group-label/separator 渲染 + surface 皮肤 + danger 红", () => {
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent>
          <MenuGroup>
            <MenuGroupLabel>操作</MenuGroupLabel>
            <MenuItem>编辑</MenuItem>
          </MenuGroup>
          <MenuSeparator />
          <MenuItem variant="danger">删除</MenuItem>
        </MenuContent>
      </Menu>,
    );
    expect(screen.getByText("编辑")).toBeTruthy();
    expect(screen.getByText("操作")).toBeTruthy();
    expect(screen.getByText("删除").className).toContain("text-danger");
    expect(document.querySelector(".bg-surface.border-border")).not.toBeNull();
    expect(document.querySelector('[role="separator"]')).not.toBeNull();
  });

  it("MenuItem onClick 触发动作", () => {
    const onClick = vi.fn();
    render(
      <Menu open modal={false}>
        <MenuTrigger render={<button>菜单</button>} />
        <MenuContent><MenuItem onClick={onClick}>编辑</MenuItem></MenuContent>
      </Menu>,
    );
    fireEvent.click(screen.getByText("编辑"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```
- [ ] **Step 2 跑确认失败** `pnpm --filter @hulianui/ui exec vitest run menu` → FAIL（`./menu` 不存在）。
- [ ] **Step 3 menu.types.ts**：
```ts
import type { MouseEventHandler, ReactNode } from "react";

export interface MenuContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
export interface MenuItemProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
  disabled?: boolean;
  /** 点击后是否关闭菜单。@default true */
  closeOnClick?: boolean;
  /** 类型筛选用文案覆盖。 */
  label?: string;
  variant?: "default" | "danger";
  className?: string;
}
```
- [ ] **Step 4 menu.tsx**（`"use client"`）：
```tsx
"use client";
import type { ComponentProps } from "react";
import { Menu as BaseMenu } from "@base-ui-components/react/menu";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import { motionDurationCss, motionEaseCss } from "../motion";
import type { MenuContentProps, MenuItemProps } from "./menu.types";

const overlayTransition = {
  transitionDuration: motionDurationCss.base,
  transitionTimingFunction: motionEaseCss.out,
} as const;

export function Menu(props: ComponentProps<typeof BaseMenu.Root>) {
  return <BaseMenu.Root {...props} />;
}
export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export function MenuContent({ children, side = "bottom", align = "start", sideOffset = 6, className }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup
          className={cn(
            "min-w-[8rem] rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none",
            "transition-[opacity,transform] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            className,
          )}
          style={overlayTransition}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

// Item 渲 <div>，高亮态 data-highlighted（键盘漫游+指针 hover 同置）、禁用 data-disabled。
export const menuItemVariants = cva(
  [
    "flex cursor-default select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors",
    "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  ],
  {
    variants: {
      variant: {
        default: "text-foreground data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
        danger: "text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function MenuItem({ variant, className, ...props }: MenuItemProps) {
  return <BaseMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />;
}

export function MenuSeparator({ className }: { className?: string }) {
  return <BaseMenu.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} />;
}
export function MenuGroupLabel({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <BaseMenu.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)}>{children}</BaseMenu.GroupLabel>;
}
```
- [ ] **Step 5 menu.showcase.tsx**（`"use client"`）：Demo = `<Menu><MenuTrigger render={<Button variant="outline">菜单</Button>}/><MenuContent side align><MenuItem>编辑</MenuItem><MenuItem>复制</MenuItem><MenuSeparator/><MenuItem variant="danger">删除</MenuItem></MenuContent></Menu>`；分组 state 用 `<MenuGroup><MenuGroupLabel>操作</MenuGroupLabel>…</MenuGroup>`；含禁用项 `<MenuItem disabled>归档</MenuItem>`；controls side/align/withGroup；`toCode` 出组合。
- [ ] **Step 6 index.ts**：
```ts
export { Menu, MenuTrigger, MenuContent, MenuItem, MenuSeparator, MenuGroup, MenuGroupLabel, menuItemVariants } from "./menu";
export type { MenuContentProps, MenuItemProps } from "./menu.types";
export { menuShowcase } from "./menu.showcase";
```
- [ ] **Step 7 主 index**（fresh 重读后 append `export * from "./menu";`）。
- [ ] **Step 8 跑测试** `vitest run menu` → PASS（若 modal=false 仍抛/role≠separator/onClick 未触发 → TDD 实测调，记录）。
- [ ] **Step 9 typecheck + commit**（`git add packages/ui/src/menu packages/ui/src/index.ts` → `git commit -- packages/ui/src/menu packages/ui/src/index.ts -m "feat(ui): Menu 组件(...)"`）。

## Task M2：接 IA + 验收
**Files:** `apps/www/lib/{manifest.ts,registry.tsx}`（fresh 重读后 append）
- [ ] manifest +1：`{ slug: "menu", name: "Menu", description: "下拉菜单 · Base UI 命令式 + Item/分隔/分组", category: "navigation", status: "new" }`。
- [ ] registry +1：import `menuShowcase` + map `menu: menuShowcase`。
- [ ] 契约 `pnpm --filter www exec vitest run manifest`（红若因他人 mid-edit → 重跑）。
- [ ] 三道门 `pnpm typecheck && pnpm test && pnpm build --filter=www --force`（test 红按文件名 isolate 他人 WIP）。
- [ ] Playwright 明暗截图（被占用启隔离 chromium [[mcp-browser-busy-launch-isolated-chromium-via-executablepath]] 或裸 CDP）：访问 `/components/menu`，**先 click「菜单」开弹层再截**，明暗各一存 cwd 根 `overlay-menu-{light,dark}.png`，Read 像素验：弹层 surface 面板、item `data-highlighted` 高亮（截图前 hover 一个 item）、separator 线、danger「删除」红、分组 label、禁用项暗。
- [ ] commit（`git commit -- apps/www/lib/manifest.ts apps/www/lib/registry.tsx -m "feat(www): Menu 接入 IA navigation"`）。

## 完成标志
左树「导航」+Menu(`new`)，`/components/menu` SSG；四件套齐、token 纯、overlay 全 BaseUI、Portal 装配；click 弹菜单 + item 高亮/separator/分组/danger/禁用/键盘/Esc 关；我 scope vitest 绿 + typecheck + `build --filter=www --force` + 契约齐；明暗像素自证；submenu/checkbox/radio item YAGNI 留痕。

## Self-Review
- spec 覆盖：§2 裁决(data-highlighted/data-disabled/modal默认/Portal)→M1 代码+测试✓；§3 API→Step3-4✓；§4 承载→Step5✓；§5 测试→Step1✓；§7 步骤→M1/M2✓。
- 占位：无 TBD。类型一致：menuItemVariants/MenuContentProps/MenuItemProps/menuShowcase 跨档一致；index 桶导出↔registry import↔manifest slug(menu) 一致。
