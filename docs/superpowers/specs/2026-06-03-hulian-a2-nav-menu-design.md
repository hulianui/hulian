# 瑚琏 Hulian A2.2 设计文档 — 导航 overlay：Menu 下拉菜单

- **日期**: 2026-06-03
- **状态**: 设计已定（自主 `/goal`：作者代用户拍板，理由留痕，收尾复核）
- **覆盖范围**: A2.2 导航 overlay 的 **Menu**（命令式下拉菜单：item 触发 onClick 动作）。**与 Select（值选择表单控件）不同形态/不同 primitive**，本 spec 不含 Select。
- **上游依据**: `2026-06-02-hulian-a2-absorption-batch-design.md`（§2 overlay 红线 · §3.4 navigation 含 Menu · §10 A2.2 · §6 硬约束）；overlay 地基已由 Tooltip/Popover 落地（`2026-06-02-hulian-a2-2-overlay-tooltip-popover-design.md`）+ skill [[base-ui-overlay-positioner-requires-portal]]。
- **前置**: overlay 承载约定（交互触发器）+ Portal/Positioner 装配已成熟，本批**照搬 popover 不重造**。`packages/ui/src/select/` 目前为空（并行 session 仅写了 Select spec 未实现），故兄弟参照 = 已落地的 `tooltip/` `popover/`。

---

## 1. 定义与边界

**Menu = 动作/命令菜单**：点击触发器弹出一列 `Item`，每个 Item 是一个动作（`onClick`），点击后默认关闭菜单。区别于 Select（受控 `value` 的表单选择控件）。

- **做**：`Menu`(Root 薄包) + `MenuTrigger` + `MenuContent`(Portal>Positioner>Popup) + `MenuItem`(onClick 动作, default/danger 变体) + `MenuSeparator` + `MenuGroup` + `MenuGroupLabel`。键盘漫游/类型筛选/碰撞翻转全 Base UI。
- **不做（YAGNI·后议）**：`SubmenuRoot/SubmenuTrigger`（子菜单）、`CheckboxItem/RadioItem/RadioGroup`（带选中态的项——那是 Select/Menu 交叉形态，单开 spec）、`Arrow`（下拉菜单不用箭头）、`Backdrop`（不做视觉遮罩）。

---

## 2. 关键裁决（require.resolve + 读 .d.ts/源 实证，非记忆）

| 决策点 | 裁决 | 依据 |
|--------|------|------|
| 子组件清单 | `@base-ui-components/react/menu` 导出 `Root/Trigger/Portal/Positioner/Popup/Item/Separator/Group/GroupLabel`（+ Arrow/Backdrop/Checkbox/Radio/Submenu/Handle，本批不用） | index.parts.js 实证 |
| **Positioner 必裹 Portal** | 装配 `Trigger → Portal → Positioner → Popup → Items`，无 `portal` 开关 | [[base-ui-overlay-positioner-requires-portal]]（Tooltip/Popover/Select 已踩） |
| **Item 高亮态属性** | **`data-highlighted`**（键盘漫游 + 指针 hover 都置位，因 `highlightItemOnHover` 默认 true）→ 皮肤 hook = `data-[highlighted]:bg-surface-hover`，**禁写 `hover:`/`focus:` 伪类** | grep MenuItem 渲 `data-highlighted`/`data-disabled`；`MenuItemState={disabled,highlighted}` |
| **Item 禁用** | Item 渲 `<div>`（非 button）→ 禁用用 **`data-[disabled]`** 非 `:disabled` | MenuItem.d.ts「Renders a `<div>`」（同 checkbox/radio span 坑） |
| Item 行为 props | `onClick`(动作)、`disabled`(默认 false)、`closeOnClick`(默认 true)、`label`(类型筛选覆盖文案) 全透传 | MenuItem.d.ts |
| **modal 默认 true** | **透传不改**（守 Switch/Dialog/Tabs/Accordion 薄包家风「不偷改 Base UI 默认」）。modal=true → 开菜单锁页滚动 + 拦外部指针（菜单常规行为）；消费者可传 `modal={false}` | MenuRoot.d.ts `@default true` |
| 皮肤 | Popup = 抬升 surface 面板（同 Popover）`bg-surface border-border shadow-xl`，`p-1` 给 item 边距；Item = `data-[highlighted]:bg-surface-hover`；**danger item = `text-danger` + `data-[highlighted]:bg-danger/10`** | 只消费语义 token（无 success） |
| 默认朝向 | side `bottom` / align **`start`**（菜单贴触发器起始边，非居中）/ sideOffset 6 | 菜单视觉惯例 |
| 承载 | 交互触发器（click 开），照 popover.showcase；`ShowcaseSpec` 零改 | overlay 承载约定 |

> 第一性原理：Menu 的命脉是「键盘可达 + 类型筛选 + 漫游焦点 + 碰撞翻转」，全由 Base UI 兜底，瑚璉只贴 token 皮肤 + 守 Portal 装配。modal=true 的滚动锁对小下拉略重，但「薄包不偷改默认」是本设计系统反复确立的家风（破坏一致性的代价 > 滚动锁的轻微突兀），消费者一行 `modal={false}` 即可降级。

---

## 3. API 设计（`packages/ui/src/menu/`，镜像 Popover）

```tsx
// menu.tsx —— "use client"
export function Menu(props: ComponentProps<typeof BaseMenu.Root>) { return <BaseMenu.Root {...props} />; }
export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export function MenuContent({ children, side="bottom", align="start", sideOffset=6, className }: MenuContentProps) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseMenu.Popup className={cn("min-w-[8rem] rounded-[var(--radius)] border border-border bg-surface p-1 text-foreground shadow-xl outline-none", motion data-[starting/ending-style], className)} style={overlayTransition}>
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export const menuItemVariants = cva(
  "flex cursor-default select-none items-center gap-2 rounded-[min(var(--radius),0.375rem)] px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  { variants: { variant: {
      default: "text-foreground data-[highlighted]:bg-surface-hover data-[highlighted]:text-foreground",
      danger:  "text-danger data-[highlighted]:bg-danger/10 data-[highlighted]:text-danger",
  }}, defaultVariants: { variant: "default" } },
);
export function MenuItem({ variant, className, ...props }: MenuItemProps) {
  return <BaseMenu.Item className={cn(menuItemVariants({ variant }), className)} {...props} />;
}

export function MenuSeparator({ className }) { return <BaseMenu.Separator className={cn("-mx-1 my-1 h-px bg-border", className)} />; }
export function MenuGroupLabel({ className, ...p }) { return <BaseMenu.GroupLabel className={cn("px-2 py-1.5 text-xs font-medium text-muted", className)} {...p} />; }
```

**类型**（`menu.types.ts`）：
- `MenuContentProps { children; side?/align?/sideOffset?; className? }`（同 PopoverContentProps 去掉 title/description）。
- `MenuItemProps extends Omit<BaseMenu.Item.Props,"className"> { variant?: "default"|"danger"; className?: string }`（透传 onClick/disabled/closeOnClick/label + 收窄 className 便于 cn）。

`圆角`用 `rounded-[min(var(--radius),0.375rem)]` 封顶（item 小盒，套 [[token-radius-on-small-square-control-becomes-circle]] 同理，避免过圆）。

---

## 4. showcase 承载（照 popover，`ShowcaseSpec` 零改）

`Demo` = `<Menu><MenuTrigger render={<Button variant="outline">菜单</Button>}/><MenuContent side align>…items…</MenuContent></Menu>`，click 开。
- `controls`: side(select) + align(select) + withGroup(boolean)。
- `states`: **default**（基础项：编辑/复制/分享 + Separator + danger「删除」）、**分组**（GroupLabel + Group 包项）、**含禁用项**、四向（top/right/bottom/left 各一）。
- `renderWithProps`: 渲触发器 + MenuContent(side/align)，含一个 danger 项 + separator。
- `toCode`: 出组合代码。
- 截图「**先点开再截**」：验弹层定位、item `data-highlighted` hover 高亮、separator 线、danger item 红、焦点环。

---

## 5. 测试策略（TDD，jsdom）

带 Portal 的受控 `open` 在 jsdom 能 mount（Tooltip/Popover 已证）。**注**：Menu `modal=true` 含 focus-manager/scroll-lock，若受控 open 渲染在 jsdom 抛错 → 测试里渲染传 `modal={false}`（测的是 items 结构/皮肤，非 modality）。
- **`menuItemVariants` 纯函数**：default 含 `data-[highlighted]:bg-surface-hover`；danger 含 `text-danger` + `data-[highlighted]:bg-danger/10`；含 `data-[disabled]:opacity-50`。
- **闭合态**：trigger 在、item 文本不在 DOM。
- **open 态**：item 文本渲染（getByText）、Popup 带 surface 皮肤（`.bg-surface.border-border`）、Separator 渲出（role=separator）、GroupLabel 渲出。
- **MenuItem onClick**：`fireEvent.click` item → onClick 被调。
- **danger variant**：item className 含 `text-danger`。
- 定位/碰撞/`data-highlighted` 实际高亮/焦点环 → Playwright 截图。

**门禁**（沿用）：`pnpm --filter @hulian/ui exec vitest run menu`（TDD）+ `pnpm typecheck` + commit 前；接 IA 后 `pnpm typecheck && pnpm test && pnpm build --filter=www --force`（`--force` 防 turbo 缓存掩盖、套 [[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。**git add 只列自己文件**（[[parallel-session-git-add-all-sweeps-your-staged-files]]，且 commit 用 `git commit -- <pathspec>` 防并发 index 竞争）。

---

## 6. 继承硬约束

只消费语义 token（无 success）；overlay 全 Base UI（Portal/Positioner/Popup，禁第二套引擎/React Aria）；四件套 + `"use client"`（Base UI client）+ 桶导出 + 主 index `export * from "./menu"` + showcase 从主 barrel 导出；motion 复用 dialog 的 motion-token CSS 镜像；RSC：showcase/组件全 client 岛，server 模块图（manifest 纯数据）不 import（套 [[rsc-registry-split-data-from-spec-to-isolate-server-module-graph]]）；端口 5512/5514（桌面 app 跑 5514 则用 5514，套 [[nextjs-16-dev-server-dedupes-by-project-dir-not-port]]）；截图被占用启隔离 chromium（[[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）存 cwd 根 Read 看像素。

---

## 7. 分步落地

| Step | 内容 | 标志 |
|------|------|------|
| Task 0 | 基线 `--force`（记录，红则 isolate 非我 WIP） | 基线 |
| M1 — Menu 组件 | 四件套 TDD（变体/闭合/open/onClick/separator/group/danger）+ 主 index 导出 | `vitest run menu` 绿 + typecheck 绿 + commit |
| M2 — 接 IA + 验收 | manifest +1（navigation/new）+ registry +1 + 契约 + 三道门 `--force` + Playwright 明暗截图（先点开） | 全绿 + 像素自证 + commit |

---

## 8. 验收口径

1. 左树「导航」分组新增 **Menu**（`new`），`/components/menu` 独立 SSG 页。
2. 四件套齐、只消费语义 token、`"use client"`、overlay 全 Base UI、Portal 装配。
3. click 触发器弹菜单：item 列表、`data-highlighted` 悬停/键盘高亮 `bg-surface-hover`、Separator 线、GroupLabel、danger item 红、禁用项变暗不可点、Esc/外部关闭、键盘漫游（↑↓）。
4. 我 scope `vitest run menu` 全绿 + typecheck + `build --filter=www --force` + 契约双边齐；Playwright 明暗两态像素自证。
5. `ShowcaseSpec` 类型未动、未引新依赖、submenu/checkbox/radio item 未做（YAGNI 留痕）。

---

## 9. Spec 自审

- 占位扫描：无 TBD；箭头无（菜单不用）。
- 一致性：§2 裁决 ↔ §3 API ↔ §5 测试 ↔ §7 步骤 互洽；`data-highlighted`/`data-disabled`/modal 默认全文一致。
- 范围：单组件 + YAGNI 边界清晰，单 plan 可承载。
- 歧义：Menu(动作) vs Select(值选择) 已显式区分；submenu/checkbox/radio item 显式 YAGNI。
