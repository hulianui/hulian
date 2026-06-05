# 瑚琏 Hulian A2 Step 4 设计 — 导航族 Tabs

- **日期**: 2026-06-02
- **状态**: 设计定稿（用户已下达「直到完成再通知我」自主执行授权 → 本 spec 内的四个关键裁决由架构师按第一性原理拍板并记录，不逐项阻塞确认）
- **覆盖范围**: A2 批次一 **Step 4 — 导航族 Tabs**（单组件）。这是 `navigation` 分类的**首个落地组件**，落地后左侧组件树「导航」分组首次出现。
- **上游依据**:
  - 主 spec `2026-06-02-hulian-a2-absorption-batch-design.md`（§3.4 分类法 navigation · §4 选源表 Tabs 行 · §6 硬约束 · §7 Step 4）
  - Step 2 plan `2026-06-02-hulian-a2-step2-form-inputs.md`（四件套 + TDD + 三道门模具）
  - 已落地 `packages/ui/src/dialog/`（Base UI 多部件组件的 hulian 包装范式）
- **前置进度**: P0/P1 + A0/A1 + A2 批次一 Step0–Step3（IA 骨架 + 展示族 + 表单录入族 + 选择族）。现共 10+ 组件（见项目记忆 `hulian-phase-status`）。

---

## 1. 本步定义与边界

- **做**：吸取 **Tabs**（Base UI），统一成瑚琏复合 API + 明暗 token 皮肤，提供 **underline / solid 两种皮肤**，受控/非受控双支持，键盘可达（方向键/Home/End 由 Base UI 兜底）。下划线/solid 的活动指示条用 Base UI `Tabs.Indicator` 内建的几何变量 + 纯 CSS 过渡驱动滑动。
- **不做**（YAGNI，见 §9）：垂直 orientation 的专门皮肤打磨（API 透传但皮肤只针对 horizontal 调优）；`Tabs.Indicator` 的 `renderBeforeHydration`（showcase 是 client 岛，无 SSR 闪烁问题）；导航族其余成员（Menu/Accordion/Breadcrumb，后续步/批次）；Tabs 懒加载内容、可滚动溢出 tab 条（YAGNI）。

> **为什么 Tabs 不触发 overlay 红线**：Tabs 是纯面板切换（同一文档流内 show/hide panel），无 Portal/浮层/focus-trap，故不属于「overlay 全 Base UI」红线管辖的浮层族，但选源本就是 Base UI（与 Dialog 同库同源），零额外引擎。

---

## 2. Base UI Tabs rc.0 API（防漂移记录 · 用 require.resolve 实读 node_modules 确认，非凭记忆）

> 版本 `@base-ui-components/react@1.0.0-rc.0`（与已落地 Dialog/Field/Switch 同版本）。子组件命名与 props 全部读自 `esm/tabs/**/*.d.ts`。**实现期若与此表不符以源码为准并回写本节。**

| 部件 | 渲染元素 | 关键 props / 行为 |
|------|---------|-------------------|
| `Tabs.Root` | `<div>` | `value?`（受控）· `defaultValue?`（**默认 `0`，即按 index**）· `orientation?`（默认 `'horizontal'`）· `onValueChange?(value, eventDetails)` |
| `Tabs.List` | `<div role="tablist">` | `activateOnFocus?`（默认 **false** → tab 用 Enter/Space 激活，方向键只移焦点）· `loopFocus?`（默认 true）· 方向键/Home/End 由 Base UI 兜底 |
| `Tabs.Tab` | `<button>` | `value`（不传则用 index）· 激活态属性 = **`data-active`**（非 `data-selected`！）· `data-disabled` · `data-orientation` · `data-activation-direction` · `aria-selected` |
| `Tabs.Panel` | `<div>` | `value` · `keepMounted?`（默认 **false** → 隐藏即从 DOM 卸载） |
| `Tabs.Indicator` | `<span>` | 在自身 inline style 写 6 个 px 变量：`--active-tab-left/right/top/bottom/width/height`（相对 List 几何）· measured 前带 `hidden` 属性 · `renderBeforeHydration?`（默认 false） · **必须是 List 后代**（prehydration 脚本 `closest('[role="tablist"]')` 定位） · 无激活 tab 时渲染 `null` |

**两条最易踩的事实**（写进测试守护）：
1. **选中态是 `data-active`，不是 `data-selected`**——Tab 文字皮肤的 Tailwind 钩子必须写 `data-[active]:text-foreground`，写 `data-[selected]:` 会静默失效（永不命中）。
2. **`Tabs.Indicator` 只产出几何 CSS 变量，不自带任何视觉**——下划线条/solid 药丸的形状、颜色、过渡全由瑚琏皮肤通过这 6 个变量自行绘制。

---

## 3. 四个关键裁决（brainstorm 四问的第一性原理拍板）

### 裁决 1 — underline / solid 皮肤实现：变体落在 `TabsList`，Tab/Panel 皮肤无关

皮肤差异**只存在于 tab 条区域**（List 容器 + Indicator 形状），Panel 在两种皮肤下完全一致，Tab 本体也可做到皮肤无关（统一 `text-muted` → `data-[active]:text-foreground` + `relative z-10` + 焦点环）。因此变体 `variant: 'underline' | 'solid'`（默认 `underline`）**落在 `TabsList`** 上，由 List 同时决定容器皮肤与其内部自动注入的 Indicator 皮肤。

- **不引 Context**：变体不放 `Tabs`(root) 经 context 下发——那会让 `Tabs` 从「纯 Base.Root 透传」退化成「包 Root + Provider」，徒增一个概念且有丢 ref/props 风险，违背 Switch/Dialog 既定的薄包装家风。皮肤是 tab 条的视觉属性，归属 List 最诚实，且每个部件可独立理解。
- **代价**：用户直觉可能先找 `<Tabs variant>`。由 showcase 的 `toCode` 永远生成 `<TabsList variant="…">` 作权威用法范例化解；未来若要改放 root 是平凡重构。

### 裁决 2 — Indicator 滑块方案：Base UI `Tabs.Indicator` + 纯 CSS transition，零 motion 运行时

Base UI Indicator 已把活动 tab 的几何持续测好写进 6 个 CSS 变量。滑块只需把 Indicator 的 `width`/`transform`(/`height`) 绑这些变量，再加 CSS `transition` 即免费获得平滑滑动：

```
// underline 条
width: var(--active-tab-width); transform: translateX(var(--active-tab-left));
// solid 药丸
width/height: var(--active-tab-{width,height}); transform: translate(var(--active-tab-left), var(--active-tab-top));
```

过渡时长/曲线复用 hulian motion-token 的 **CSS 镜像**（`motionDurationCss.base` + `motionEaseCss.out`，与 dialog.tsx 同手法），手感与 Dialog/Button 一致、零混库。

- **不接 `motion`/react 运行时、不接 AnimatePresence**：没有需要「揭示」的内容，纯几何插值 CSS 即胜任 → **天然规避 `motion-reveal-invisible-after-wrapper-becomes-client` 陷阱**（该陷阱正是 motion 包裹层在变 client 后初始不可见）。
- **不手写 JS 测量滑块**：Base UI 已测好并防了 hydration 闪烁（measured 前 `hidden`），重造 = 浪费 + 易错。

### 裁决 3 — 受控 vs 非受控默认：双支持，**默认非受控**（`defaultValue`）

`Tabs`(root) 纯透传 Base UI `Tabs.Root` 的 `value`/`defaultValue`/`onValueChange`/`orientation`。默认人体工学是**非受控**（传 `defaultValue`，状态交给 Base UI），与 Base UI 自身取向、与家族（Switch/Dialog 透传）一致；受控（传 `value`+`onValueChange`）同样一等支持。showcase 用非受控。

### 裁决 4 — 多 panel 在 showcase 怎么展示：`states` 预置 demo 承载，`ShowcaseSpec` 零改动

复合结构（多 tab + 多 panel）**不用 controls 拼装**，用 `states` 预置完整 demo 展示全貌；`controls` 只放一个标量 `variant` select 驱动 `<Playground>`。经核对 `ShowcaseSpec`（`controls` 支持 `select` + `states:[{name,render}]` + `renderWithProps`）**完全够用，无需改类型**（与 Step 2 同结论）。

---

## 4. 组件形态（hulian 复合 API，镜像 dialog.tsx 范式）

四个薄包装导出（消费者不手写 Indicator）：

```tsx
<Tabs defaultValue="account">        {/* = Base Tabs.Root 透传：value/defaultValue/onValueChange/orientation */}
  <TabsList variant="underline">     {/* 皮肤变体在此；自动内嵌 Indicator；position:relative 锚定 */}
    <TabsTab value="account">账户</TabsTab>     {/* 皮肤无关：text-muted→data-[active]:text-foreground + relative z-10 + 焦点环 */}
    <TabsTab value="password">密码</TabsTab>
    <TabsTab value="team" disabled>团队</TabsTab>
  </TabsList>
  <TabsPanel value="account">…</TabsPanel>   {/* 皮肤无关：mt + text-foreground + 面板焦点环 */}
  <TabsPanel value="password">…</TabsPanel>
</Tabs>
```

- `Tabs` = `<BaseTabs.Root {...props} />` 纯透传。
- `TabsList` = `<BaseTabs.List className=cn(tabsListVariants({variant}), className)>` 内先注入 `<BaseTabs.Indicator>`（按 variant 皮肤）再渲染 `{children}`（Indicator 作首子 + tabs `z-10` → 药丸自然在文字之下）。
- `TabsTab` = `<BaseTabs.Tab className=cn(tabsTabClasses, className)>`。
- `TabsPanel` = `<BaseTabs.Panel className=cn(tabsPanelClasses, className)>`。
- **类型**：List/Tab/Panel 用 `Omit<ComponentProps<typeof BaseTabs.X>, "className"> & { className?: string }`（+List 再 `& VariantProps<typeof tabsListVariants>`），把 Base UI 的「className 可为函数」收窄成 string 以便 `cn()`；Root 直接 `ComponentProps<typeof BaseTabs.Root>` 透传。

### 4.1 皮肤细节（只消费语义 token）

可用语义 token（与 Step 2 同清单，无 success/warning）：`bg-surface` `bg-surface-hover` `text-foreground` `text-muted` `border-border` `ring-ring` `bg-primary` `text-primary` 等；圆角 `rounded-[var(--radius)]`。

- **underline**：
  - List：`relative inline-flex items-center gap-1 border-b border-border`
  - Indicator：`absolute bottom-0 left-0 h-0.5 rounded-full bg-primary`，inline 绑 `width: var(--active-tab-width); transform: translateX(var(--active-tab-left))` + 过渡 `transform,width`
  - Tab：`relative z-10 px-3 py-2 text-sm font-medium text-muted data-[active]:text-foreground hover:text-foreground` + 焦点环 `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-[var(--radius)]` + `data-[disabled]:opacity-50 data-[disabled]:pointer-events-none`
- **solid**（分段控件/药丸）：
  - List：`relative inline-flex items-center gap-1 rounded-[var(--radius)] bg-surface-hover p-1`
  - Indicator：`absolute left-0 top-0 rounded-[calc(var(--radius)-0.25rem)] bg-surface shadow-sm`，inline 绑 `width/height: var(--active-tab-{width,height}); transform: translate(var(--active-tab-left), var(--active-tab-top))` + 过渡 `transform,width,height`
  - Tab：同 underline 的 Tab 类（皮肤无关，`relative z-10` 保证文字在药丸之上）
- Indicator 过渡统一用 motion-token CSS 镜像：`style={{ transitionDuration: motionDurationCss.base, transitionTimingFunction: motionEaseCss.out, ... }}`。

> Indicator 的 `width`/`height`/`transform` 在 jsdom（无布局）下都是 0/`hidden`，**几何正确性只能由 Playwright 像素实测**（§8）；jsdom 单测只验结构/类/行为（§7）。

---

## 5. showcase 计划（`ShowcaseSpec` 不动）

- `controls`: `[{ prop:"variant", type:"select", options:["underline","solid"], defaultValue:"underline" }]`
- `states`:
  - `underline` — 3 tab（账户/密码/团队）+ 各自 panel，underline 皮肤
  - `solid` — 同内容，solid 皮肤
  - `disabled tab` — 含一个 `disabled` tab（验证键盘跳过 + 暗化）
- `renderWithProps(p)` → 共享 `<Demo variant={p.variant} />`
- `toCode(p)` → 生成 `<Tabs defaultValue><TabsList variant="…">…` 权威片段

`*.showcase.tsx` 必 `"use client"`（含 Base UI client）；从主 barrel 导出供 registry 消费。

---

## 6. 继承的硬约束（实现期逐条守）

1. **只消费语义 token**（无 success/warning），禁裸值；明暗自动适配。
2. **a11y 全靠 Base UI 兜底**：`role=tablist/tab/tabpanel`、`aria-selected`、`aria-controls`/`aria-labelledby` 串联、方向键/Home/End/Enter/Space —— 不手写键盘逻辑。
3. **变体收敛**：皮肤差异走 CVA `tabsListVariants` 的 `variant`，不散落 className 覆盖。
4. **四件套**：`tabs.tsx` + `tabs.types.ts` + `tabs.showcase.tsx`(必 `"use client"`) + `tabs.test.tsx` + `index.ts`；桶导出 + 主 `index.ts` 加 `export * from "./tabs"`；showcase 从主 barrel 导出。本体用 Base UI(client) → `tabs.tsx`/`tabs.showcase.tsx` 都加 `"use client"`。
5. **动效用 motion 基元的 CSS 镜像**（`motionDurationCss`/`motionEaseCss`），不散写 transition 时长。
6. **三道门 + Playwright** 见 §8。
7. **trunk-based**：直接 master 小步 commit，无 remote、不 push。

---

## 7. 测试计划（jsdom 单测 · 结构/类/行为，非几何）

`tabs.test.tsx` 用 `@testing-library/react` 的 `render` + `fireEvent`（`user-event` 未装）：

1. `tabsListVariants({})` 默认含 underline 标记（`border-b`、`relative`）；`{variant:"solid"}` 含 `bg-surface-hover`、`p-1`、`relative`。
2. 结构：渲染完整 Tabs 树 → `getByRole("tablist")` 在、`getAllByRole("tab")` 数目对、激活 tab 有 `data-active` + `aria-selected="true"`。
3. **Indicator 自动注入**：`container.querySelector('[role="tablist"] span')` 真值（jsdom 下 `hidden` 但在 DOM）。
4. **`data-active` 钩子守护**（防 `data-selected` 漂移）：tab 的 className 含 `data-[active]:text-foreground` 且含 `text-muted`、`relative`、`z-10`、`focus-visible:ring-ring`。
5. 非受控切换：`defaultValue` 指首 tab → 首 panel 内容在、次 panel 内容不在 DOM（keepMounted false）；`fireEvent.click(次 tab)` → 次 panel 内容出、首消失。
6. 受控：`value` + `onValueChange` spy，`fireEvent.click(次 tab)` → spy 收到次 tab 的 value。
7. 禁用 tab：`<TabsTab value=… disabled>` → 该 button 有 `data-disabled`。

> **已知风险 + 兜底**：Base UI Tab 点击激活若在 jsdom 下 `fireEvent.click` 不翻状态（罕见，Tab 主交互即点击，预期可行），则用例 5/6 退化为 `fireEvent.pointerDown`+`click` 或用受控 rerender 断言。TDD 期先红后绿实测，不预设。

---

## 8. 三道门 + Playwright 验收

- **门禁节奏**（沿用 Step 2）：组件 Task 内 TDD 循环 `pnpm --filter @hulianui/ui exec vitest run tabs`（先红后绿）；commit 前 `pnpm typecheck`。
- **完整三道门只在接 IA 那步跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**，否则撞 desktop tauri `beforeBuildCommand` 二次 build www）。
- **Playwright 截图实测**（接 IA 后）：访问 `/components/tabs`，**明暗两态各截**，存 cwd 根 `/Users/zhangzhiwei/Desktop/code/hulian/*.png`（不在 `.playwright-mcp/`），**Read 看像素**逐项验：
  - 左树新增「导航」分组、内含 Tabs（`new` 标记）；
  - **underline**：活动条在当前 tab 正下方、宽度=tab 宽、点不同 tab 平滑滑动对齐；活动 tab 文字 `text-foreground`、其余 `text-muted`；焦点环可见；
  - **solid**：药丸在活动 tab 之下作底、文字在上清晰；切换平滑移动；
  - panel 切换内容正确；明暗开关切换无白闪、两皮肤都换肤正确。
  - 端口：www=5512，桌面 app devUrl=5514；**若桌面 app 已在 5514 跑 www 实例，直接用 5514 截图**（Next 16 按项目目录去重，别另起 5512 撞 dir-guard）。

---

## 9. 本步不做（YAGNI）

- 不做垂直 Tabs 的皮肤专门打磨（`orientation` 透传，皮肤只调 horizontal）。
- 不用 `renderBeforeHydration`（showcase client 岛无 SSR 闪烁场景）。
- 不做可滚动/溢出折叠的 tab 条、不做 tab 懒加载、不做 Context 下发 variant。
- 不引任何新依赖、不改 `ShowcaseSpec` 类型。
- 导航族其余成员（Menu/Accordion/Breadcrumb）后续步/批次再开。

---

## 10. 接 IA + 验收口径

- `apps/www/lib/manifest.ts` +1 行：`{ slug:"tabs", name:"Tabs", description:"选项卡 · Base UI 无浮层 + underline/solid 滑块", category:"navigation", status:"new" }`（**首个 navigation 条目** → 左树「导航」分组首现）。
- `apps/www/lib/registry.tsx` +1 import `tabsShowcase` + map `tabs: tabsShowcase`。
- 契约测试（`apps/www/lib/manifest.test.ts`）自动覆盖：slug 唯一 / category 合法（navigation 已在 CATEGORIES）/ 每 manifest 有 spec / 无孤儿 → manifest+registry 各 +1 即保持绿。

**done 标志**：四件套齐 + 只消费 token + a11y 由 Base UI 兜底 + underline/solid 双皮肤滑块对齐 + 受控/非受控双通 + 三道门全绿 + 契约测试 11 slug 双边齐 + Playwright 明暗两态像素自证 + 桌面 app(5514) 正常。

---

## 11. 自检（spec self-review）

1. **Placeholder 扫描**：无 TBD/TODO；API 表全部实读源码填实。✓
2. **内部一致性**：变体落 List（§3.1/§4）↔ 测试验 List variant（§7.1）↔ showcase variant control（§5）↔ toCode 生成 `<TabsList variant>`（§5）一致；`data-active`（§2/§4.1/§7.4）全文一致，无 `data-selected` 残留。✓
3. **Scope**：单组件，聚焦，适配单一 plan。✓
4. **歧义**：「solid」明确为分段药丸（§4.1）；「变体位置」明确为 List 非 root（§3.1）；受控默认明确为非受控（§3.3）。✓
