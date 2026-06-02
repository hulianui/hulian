# 瑚琏 Hulian A2.2 设计文档 — overlay 浮层族起步：Tooltip + Popover

- **日期**: 2026-06-02
- **状态**: 设计已定（自主模式 `/goal`：作者代用户拍板全部裁决，理由逐条留痕，待用户在收尾时复核）
- **本 spec 覆盖范围**: **A2.2 第一批** = overlay 浮层族的前两件 **Tooltip + Popover**，并据此**确立「overlay 组件在 registry/文档站里的承载约定」**（A2.2 spec 预告里点名的本族最大设计难点）。
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（A2 主 spec：§2 overlay 红线裁决「守红线·全 Base UI」、§9「不引 React Aria」、§10「A2.2 先解决 overlay 族在 registry/文档页里的承载」）
  - `2026-06-02-hulian-a2-step2-form-inputs-design.md` + `…-step2-form-inputs.md`（Step 2 四件套 + TDD + 三道门模具，本批照此复用）
  - `packages/ui/src/dialog/dialog.tsx` + `dialog.showcase.tsx`（已落地的 Base UI Portal/Positioner/Popup 同源 overlay 引擎 + 交互组件在 showcase 里的承载范式）
- **前置进度**: A2 批次一（IA 骨架 + 展示族）+ Step 2（表单录入族）均已完成，现共 **10 组件**（见项目记忆 `hulian-phase-status`）。文档站 IA = `manifest.ts`（纯数据）+ `registry.tsx`（`"use client"` spec 映射）双文件 SSOT。

---

## 1. 本批定义与边界

A2.2 是 overlay 浮层族的开篇，全族（Select / Combobox / Menu / Popover / Tooltip / Toast / Drawer）都将守「overlay 全 Base UI」红线。本批**只做 Tooltip + Popover 两件**，目的不止于多两个组件，而是**用最小、最具代表性的两件浮层把「overlay 在文档站里怎么承载」这条全族通用约定钉死**——后续浮层照此扩量。

- **做**：①`Tooltip`（hover/focus 触发的非交互提示）+ `Popover`（click 触发、可含交互内容的浮层），全部基于 `@base-ui-components/react` rc.0，与已落地 Dialog 共享同一套 `Portal/Positioner/Popup` 引擎；②确立 **overlay 承载约定**（§4）；③接入 IA（manifest +2 / registry +2，分类 `feedback`，status `new`）。
- **不做**（推迟到 A2.2 后续批次 / 见 §10）：Select / Combobox / Menu / Toast / Drawer；不引第二套 overlay 引擎；不引 React Aria；不改 `ShowcaseSpec` 类型。

---

## 2. 关键裁决（自主模式逐条留痕）

| 决策点 | 裁决 | 理由（含实测论据） |
|--------|------|-------------------|
| **overlay 承载方式**（本族最大难点） | **方案 A：交互触发器**（states 渲染闭合态触发器，hover/click 才弹），与已落地 Dialog 同范式；**否决「默认展开态」**与「改 `ShowcaseSpec` 类型」 | 见 §4，承重论据是下方「Positioner 必须 Portal」实测 |
| **Base UI Positioner 能否脱离 Portal 内联渲染**（决定「强制展开收纳预览」可行性） | **不能**。实测渲染 `<Tooltip.Positioner>`/`<Popover.Positioner>` 不包 `<X.Portal>` 直接抛 `Base UI: <Tooltip.Portal> is missing.` | 探针实测（rc.0）：Positioner 内部 `useTooltipPortalContext()` 在缺 Portal 时硬抛错 → 「内联收纳强制展开浮层」方案在技术上不成立，承载只能走交互触发器 |
| **强制展开 + Portal-to-body 能否承载** | 否决 | Positioner `positionMethod` 默认 `'absolute'`（实测 grep 确认），Portal 默认挂 `document.body` → 强制展开的浮层按触发器视口坐标浮在整页上；`states[0]` 同时被 hero 预览与 gallery 渲染两次 → 两个浮层同时 portal 到 body 飘乱、互相遮挡，且 Popover `defaultOpen` 一旦点击外部即关且不再开（initial-only），脆弱 |
| **Tooltip.Provider 是否必需** | **非必需**，仅作可选 re-export 逃生口 | 实测 `TooltipRoot.js` 自带 `TooltipRootContext.Provider`，单个 `<Tooltip>` 独立可用；`TooltipProvider` 只为「多 tooltip 共享 open delay 分组」。本批 showcase 不强制包 Provider，保持最小；导出 `TooltipProvider` 透传供 app 端需要分组时用 |
| **单测能否断言 open 后浮层内容**（jsdom 无 polyfill） | **能**，无需加 ResizeObserver polyfill | 探针实测：带 Portal 的 `<Tooltip open>`/`<Popover open>` 在本仓 jsdom（`vitest.config.ts` 仅 jsdom+globals）下正常 mount，`screen.getByText(浮层内容)` 通过。故 open 态结构/皮肤/a11y 可单测；**定位/碰撞翻转/箭头几何**因 jsdom 无布局 → 交给 Playwright |
| **组件 API 形态** | 镜像 Dialog 的「薄包 Root + 透传子件 + 复合 Content」 | `Tooltip`/`TooltipTrigger`/`TooltipContent`（+可选 `TooltipProvider`）；`Popover`/`PopoverTrigger`/`PopoverContent`/`PopoverClose`。Content 内固定 `Portal>Positioner>Popup(+Arrow)`（Portal 强制，无 `portal` 开关）|
| **皮肤 token** | **Tooltip = 反相高对比气泡** `bg-foreground text-bg`；**Popover = 抬升 surface 面板** `bg-surface text-foreground border-border shadow`（同 Dialog） | 两者皆纯语义 token、明暗自适应。反相气泡是 tooltip 经典观感且在明暗下天然翻转（亮色页→深气泡，暗色页→浅气泡），同时与 Popover 面板形成清晰视觉/语义区分 |

> **第一性原理记录**：任务预告把「states 里放触发器 / 默认展开态 / 给 ShowcaseSpec 加约定」三选一留给 brainstorm。调查阶段先验证「默认展开态」的技术前提——结果 Base UI Positioner 硬性要求 Portal、且 Portal 默认挂 body，使「在文档格子里内联收纳一个展开浮层」要么不可能（无 Portal 抛错）、要么飘到整页（Portal-to-body）。叠加 Dialog 既有先例本就是「触发器」承载、且任务自带的截图口径已是「先触发再截」——三方证据一致指向方案 A。这不是抄 Dialog 的惰性选择，而是被硬约束筛掉其余选项后的收敛解。

---

## 3. 组件 API 设计

### 3.1 Tooltip（`packages/ui/src/tooltip/`）

子件（实测 `@base-ui-components/react/tooltip` 导出）：`Root/Trigger/Portal/Positioner/Popup/Arrow/Provider`（本批用前六个 + 可选 Provider）。

```tsx
// tooltip.tsx —— "use client"
export function Tooltip(props: ComponentProps<typeof BaseTooltip.Root>) {
  return <BaseTooltip.Root {...props} />;          // 薄包，透传 open/defaultOpen/delay/...
}
export const TooltipTrigger = BaseTooltip.Trigger; // 透传（用 render={<Button/>} 包真实元素）
export const TooltipProvider = BaseTooltip.Provider; // 可选逃生口：多 tooltip 共享 delay 分组

export function TooltipContent({ children, side = "top", align = "center", sideOffset = 8, className }: TooltipContentProps) {
  return (
    <BaseTooltip.Portal>
      <BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BaseTooltip.Popup className={cn(反相气泡皮肤 + motion data-styles, className)} style={overlayTransition}>
          {children}
          <BaseTooltip.Arrow className={箭头·bg-foreground} />
        </BaseTooltip.Popup>
      </BaseTooltip.Positioner>
    </BaseTooltip.Portal>
  );
}
```

- 皮肤：`rounded-[var(--radius)] bg-foreground px-2.5 py-1 text-xs text-bg shadow-md`；motion：`data-[starting-style]`/`data-[ending-style]` 淡入+轻微缩放，CSS 镜像 motion token（同 Dialog `overlayTransition`）。
- 箭头：Base UI `Arrow` 由 Positioner 定位，皮肤填 `bg-foreground`（旋转方块成尖），精确 CSS 在实现期调 + Playwright 像素核。

### 3.2 Popover（`packages/ui/src/popover/`）

子件（实测导出）：`Root/Trigger/Portal/Positioner/Popup/Arrow/Backdrop/Title/Description/Close`（本批用 Root/Trigger/Portal/Positioner/Popup/Arrow/Title/Description/Close；**Backdrop 不用**——popover 非模态，YAGNI）。

```tsx
// popover.tsx —— "use client"
export function Popover(props: ComponentProps<typeof BasePopover.Root>) {
  return <BasePopover.Root {...props} />;
}
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;

export function PopoverContent({ title, description, children, side = "bottom", align = "center", sideOffset = 8, className }: PopoverContentProps) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className="z-50">
        <BasePopover.Popup className={cn(surface 面板皮肤 + motion data-styles, className)} style={overlayTransition}>
          {title && <BasePopover.Title className="text-sm font-semibold text-foreground">{title}</BasePopover.Title>}
          {description && <BasePopover.Description className="mt-1 text-xs text-muted">{description}</BasePopover.Description>}
          {children && <div className="mt-2">{children}</div>}
          <BasePopover.Arrow className={箭头·bg-surface+border} />
        </BasePopover.Popup>
      </BasePopover.Positioner>
    </BasePopover.Portal>
  );
}
```

- 皮肤：`w-[min(90vw,18rem)] rounded-[var(--radius)] border border-border bg-surface p-4 text-foreground shadow-xl outline-none`，motion 同 Dialog（淡入+缩放）。
- 箭头：`bg-surface` 方块 + 两侧 border（旋转后只露指向触发器的两条边），实现期调 + Playwright 核。

### 3.3 类型（各自 `*.types.ts`）

```ts
// tooltip.types.ts
export interface TooltipContentProps {
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
// popover.types.ts
export interface PopoverContentProps {
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
}
```

---

## 4. overlay 承载约定（本批确立的全族通用裁决）

> **一句话约定**：**overlay 组件在 showcase 里以「闭合态交互触发器」承载——每个 `StateSpec.render()` 返回一个完整的「触发器 + Content」组合，gallery 格子里看到的是触发器本体，hover/click 才弹出浮层（Portal 到 body，由 Base UI Positioner 定位）。零 `ShowcaseSpec` 类型改动、零强制展开。**

### 4.1 为什么是触发器而非默认展开（承重论据）

1. **技术硬约束**：Base UI Positioner 必须包在 `<X.Portal>` 内（实测无 Portal 抛 `Portal is missing`）；Portal 默认挂 `document.body`、`positionMethod` 默认 `absolute` → 任何「展开态」浮层都会脱离文档格子、按触发器视口坐标浮在整页。`ComponentDoc` 把 `states[0]` 同时渲染进 hero 预览与 gallery（共两次）→ 默认展开会产生两个 body 级浮层互相遮挡。技术上无法「在格子里内联收纳一个展开浮层」。
2. **既有先例**：`dialog.showcase.tsx` 已确立 overlay = 触发器承载（`states:[{name:"default", render:()=><Demo/>}]`，Demo 渲染 `<DialogTrigger render={<Button>打开对话框</Button>}/>`）。本批与之一致，零认知分裂。
3. **截图口径自洽**：本批截图要求本就是「先触发弹出再截」——已预设交互触发。

### 4.2 承载的三处落点（均零类型改动，纯 showcase 写法）

| 文档位 | 现渲染 | overlay 承载写法 |
|--------|--------|-----------------|
| **hero 预览**（`ComponentPreview` 渲 `states[0].render()`） | 居中 `p-8` 弹性盒、不裁 overflow | `states[0]` = 最具代表性的触发器组合（如「悬停查看提示」按钮 / 「打开」按钮）；读者在浏览器里 hover/click 实看 |
| **全状态 gallery**（`StatesGallery` 渲全部 states，`flex-wrap` 多格、每格 `min-h-12`） | 每格居中渲 `s.render()` | 每个 state = 一种触发器配置（不同 side/align/含交互内容），格子里见触发器，hover/click 弹浮层 |
| **Playground**（`renderWithProps`，`min-h-32` 居中盒） | 渲 `renderWithProps(props)` | 渲触发器 + Content，由 controls 调 `side`/`align`/`sideOffset`/内容文案；改完 hover/click 见新定位 |

### 4.3 截图/验收的触发约定（Playwright）

- **Tooltip**：showcase demo 里设 `delay={0}` 让 hover 即开（避免默认延迟导致截图竞态）；Playwright `hover` 触发器 → `wait_for` 浮层文本 → 截全视口（浮层 portal 在 body）。
- **Popover**：Playwright `click` 触发器 → `wait_for` 面板 → 截；面板 click-outside/Esc 前保持展开，截图稳定。
- 明暗各一张，验**浮层定位、箭头朝向、z 层级（浮层在遮罩/内容之上）、反相气泡在明暗下的翻转、surface 面板在明暗下的对比**。

### 4.4 不改 `ShowcaseSpec` 的自证

`StateSpec.render: () => ReactNode` 是 thunk，可返回任意 JSX（含完整 overlay 组合）；`renderWithProps` 同理。承载全靠「在 render 里组合触发器 + Content」实现，`controls/states/renderWithProps/toCode` 四字段语义不变、类型不动。后续 Select/Menu/Toast 照此约定承载。

---

## 5. showcase 模具（沿用 Step 2，零类型增量）

- **Tooltip showcase**：`controls` = `side`(select top/right/bottom/left) + `align`(select start/center/end) + `text`(提示文案)；`states` = default(top) / 四向(top/right/bottom/left 各一触发器) / 长文案；`renderWithProps` 渲「按钮 + TooltipContent(side/align)」，demo 内 `delay={0}`；`toCode` 出组合代码。
- **Popover showcase**：`controls` = `side` + `align` + `title`(text) + `withClose`(boolean)；`states` = default(标题+正文) / 含交互(按钮/表单片段) / 四向；`renderWithProps` 渲「按钮 + PopoverContent」；`toCode` 出组合代码。
- 复合内容（Popover 的 title/description/交互体）用 `states` 预置组合展示，不试图用 controls 拼装结构——与 Step 2 §5 同策略。

---

## 6. 测试策略（TDD，jsdom 边界已实测厘清）

**单测覆盖（jsdom 可断言，因带 Portal 的 open 态实测能 mount）**：
- **闭合态**：渲 `<Tooltip><TooltipTrigger render={<button>t</button>}/><TooltipContent>tip</TooltipContent></Tooltip>`（不 open）→ 触发器在、浮层文本不在 DOM（闭合不渲 Positioner，安全无 Floating UI）。
- **open 态**（受控 `open`）：浮层文本在（`screen.getByText`）、Popup 带皮肤类（Tooltip `bg-foreground`/`text-bg`；Popover `bg-surface`/`border-border`）、Arrow 在。
- **Popover 结构**：`title`/`description`/`children` 渲染；`PopoverClose` 在内容内渲出按钮。
- **a11y**：Popover 触发器 `aria-haspopup`/`aria-expanded` 随 open 切换（具体值由 Base UI 决定，TDD 实测落断言）；Tooltip 触发器 open 时 `aria-describedby` 串浮层。

**不单测、交 Playwright（jsdom 无布局）**：浮层相对触发器的定位、碰撞翻转、箭头几何朝向、明暗像素对比、z 层级。

**门禁节奏**（沿用批次一/Step 2）：每组件 TDD 先红后绿（`pnpm --filter @hulian/ui exec vitest run <名>`）+ commit 前 `pnpm typecheck`；**完整三道门 + 生产 build 只在接 IA 那步跑一次**：`pnpm typecheck && pnpm test && pnpm build --filter=www`（**build 必 `--filter=www`**，避免 desktop tauri `beforeBuildCommand` 二次 build www 并发冲突）。**Playwright 截图只在接 IA 后**，存 cwd 根 `*.png`、Read 看像素。

---

## 7. 继承的硬约束（实现期逐条守）

1. **只消费语义 token**（无 success/warning）：Tooltip `bg-foreground`/`text-bg`、Popover `bg-surface`/`text-foreground`/`border-border`/`shadow`、`text-muted`；圆角 `rounded-[var(--radius)]`。
2. **overlay 全 Base UI 红线**：Portal/Positioner/Popup/Arrow 全用 Base UI 一套，**禁第二套 overlay 引擎、禁 React Aria**；与 Dialog 同源。
3. **定位交 Base UI Positioner**：side/align/sideOffset/碰撞翻转/箭头全由 Positioner 兜底，**不手写定位/碰撞**。
4. **四件套**：`x.tsx`+`x.types.ts`+`x.showcase.tsx`（必 `"use client"`）+`x.test.tsx`+`index.ts`，桶导出；组件本体用 Base UI(client) → `x.tsx` 加 `"use client"`。
5. **主 index 导出** + **showcase 从主 barrel 导出**（registry 消费）：`packages/ui/src/index.ts` 加 `export * from "./tooltip"`、`export * from "./popover"`（紧跟 `./field` 后）。
6. **motion 用瑚琏基元**：复用 Dialog 的 CSS 镜像 motion token 驱动 Base UI 原生过渡，不散写 transition、不接 AnimatePresence（overlay 自管 mount/unmount）。
7. **RSC client 岛**：`*.showcase` 与组件本体全 `"use client"`；server 模块图（manifest 纯数据）不 import 浮层渲染代码（registry 是 `"use client"`，套 `rsc-registry-split-data-from-spec-to-isolate-server-module-graph`）。Portal 内容仅 client 端渲染，SSG/RSC 下不破。
8. **端口**：www=5512、桌面 app devUrl=5514（桌面 app 已跑 5514 时直接用 5514 截图，套 `nextjs-16-dev-server-dedupes-by-project-dir-not-port`）。

---

## 8. 分步落地（每步独立 commit + TDD；完整三道门 + 截图在末步）

| Step | 内容 | 产出标志 |
|------|------|---------|
| **Task 0** | 确认绿色基线：`pnpm typecheck && pnpm test && pnpm build --filter=www` 全绿（记基线，红则停报存量） | 基线记录 |
| **D1 — Tooltip** | 四件套 TDD（闭合/open/皮肤/箭头/a11y）+ 主 index 导出 | `vitest run tooltip` 绿 + typecheck 绿 + commit |
| **D2 — Popover** | 四件套 TDD（闭合/open/title-desc-children/Close/aria）+ 主 index 导出 | `vitest run popover` 绿 + typecheck 绿 + commit |
| **D3 — 接 IA + 验收** | manifest +2（`feedback`/`new`）+ registry +2（import+map）+ 契约测试 + 完整三道门 + Playwright 明暗截图 Read 像素 + 桌面 app(5514) 核 | 三道门全绿 + 浮层定位/箭头/明暗自证 + commit |

每步小步提交直接 master（trunk-based，无 remote、不 push）。

---

## 9. 验收口径（done 的标志）

1. 左树「反馈」分组新增 **Tooltip / Popover**（带 `new` 标记），各自 `/components/[slug]` 独立 SSG 页。
2. 两组件四件套齐、只消费语义 token、`"use client"` 正确、overlay 全 Base UI（Portal/Positioner/Popup/Arrow）、定位交 Positioner。
3. **Tooltip**：hover 触发器（`delay=0`）即弹反相气泡、箭头指向触发器、四向 side 可定位、明暗下气泡翻转可读。
4. **Popover**：click 触发器弹 surface 面板、title/description/交互内容/Close 正常、箭头指向、明暗对比足、Esc/click-outside 关闭、焦点管理由 Base UI 兜底。
5. 三道门（typecheck + test + `build --filter=www`）全绿；契约测试 12 slug 双边齐全；桌面 app(5514) 加载正常。
6. Playwright 明暗两态截图 Read 像素，浮层定位/箭头/层级/明暗对比逐项自证。
7. **承载约定**（§4）以 Tooltip/Popover 落地，`ShowcaseSpec` 类型未动、未引新依赖——后续浮层照此扩。

---

## 10. 本批不做（YAGNI 边界 / 推迟）

- **不做** Select / Combobox / Menu / Toast / Drawer（A2.2 后续批次，各自再开 plan，照本批承载约定）。
- **不做** Popover `Backdrop`（非模态，YAGNI）、Tooltip `Viewport`/`Handle`、`createHandle`。
- **不暴露** Positioner 全量 props（仅 side/align/sideOffset；collisionPadding/arrowPadding 等用 Base UI 默认，需要再加）。
- **不改** `ShowcaseSpec` 类型、不加 polyfill（jsdom 实测 Portal-open 可 mount）。
- **不引** 第二套 overlay 引擎 / React Aria。
- **不做** 强制展开态 / 默认展开 showcase（§2/§4 已否决）。

---

## 11. 后续批次预告（不在本 spec 范围）

- **A2.2 续**：Select / Combobox / Menu（Base UI，含键盘/虚焦）→ Toast（Base UI Toast，含 Provider/Viewport）→ Drawer（Base UI Dialog 变体或独立）。均照 §4 承载约定。
- 之后接 A2.3（Tremor 图表）/ A2.4（Magic UI）/ A3（MUI/Ant 桥）/ A4（prod 打包），各自再开 spec。

---

## 12. Spec 自审（占位/一致性/范围/歧义）

- **占位扫描**：无 TBD/TODO；箭头精确 CSS 标注「实现期调 + Playwright 核」是有意的实现细节下放，非占位（几何需像素验，spec 不写死）。
- **一致性**：§2 裁决 ↔ §3 API ↔ §4 承载 ↔ §6 测试 ↔ §8 步骤 ↔ §9 验收 互洽；皮肤 token（Tooltip 反相 / Popover surface）全文一致；子件清单与实测导出一致。
- **范围**：聚焦 2 组件 + 1 条承载约定，单一 plan 可承载。
- **歧义**：「承载」已明确为方案 A（交互触发器）并给硬约束论据；「默认展开」「改类型」均显式否决，无二义。
