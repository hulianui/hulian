# 瑚琏 Hulian A2.2 — 命令式浮层 Toast 设计文档

- **日期**: 2026-06-03
- **状态**: 已与用户确认两条关键裁决（Provider 挂点 + 皮肤），进入实施计划阶段
- **范围**: A2.2 overlay 族的 **Toast 轻提示** —— 库里第一个 **imperative API** 组件（非声明式渲染，靠函数 `toast()` 触发 + 队列 + 自动消失）
- **上游依据**:
  - `2026-06-02-hulian-a2-absorption-batch-design.md`（§2 overlay 红线 · §3.4 feedback/Toast · §6 硬约束 · §10 A2.2 预告）
  - 兄弟件 Tooltip/Popover（`2026-06-02-hulian-a2-2-overlay-tooltip-popover-design.md`，overlay 承载范式 + motion CSS 镜像）
  - Alert（`2026-06-02-hulian-a2-feedback-alert-design.md`，tone=info/danger/neutral 调色板）
- **前置进度**: 已 18+ 组件；overlay 族已落 Tooltip/Popover（声明式浮层）。Toast 是本族第一个命令式件。

---

## 1. 为什么 Toast 与已落浮层都不同

Tooltip/Popover 是**声明式**：消费者在 JSX 里写 `<Tooltip><Trigger/><Content/></Tooltip>`，浮层与触发器同处一棵子树，hover/click 才弹。

Toast 是**命令式**：业务代码在任意位置（事件回调、异步成功/失败分支）调用一个**函数** `toast({title, description, tone})`，提示就从屏幕角落（Viewport）冒出来、自动倒计时消失、可手动关闭、多条堆叠。触发点与渲染点**在 DOM 上彻底解耦**。

这带来两个本族独有的设计难点，本 spec 的核心就是解决它们：

1. **触发与渲染解耦的运行时机制** —— 函数怎么把一条 toast 送到一个挂在别处的 Viewport？（§3）
2. **imperative 组件在 ShowcaseSpec 里怎么承载** —— showcase 没有"声明式结构"可展示，只能放"点我弹 toast"的按钮；而全局 Provider 又不能放进 showcase（§4）。

---

## 2. Base UI rc.0 toast API 实证（require.resolve + 读 .d.ts，非记忆）

版本 `@base-ui-components/react@1.0.0-rc.0`（与全部已落组件同版本）。`@base-ui-components/react/toast` 导出：

**部件（`Toast.*` 命名空间）**：`Provider / Viewport / Root / Content / Title / Description / Close / Action / Portal / Positioner / Arrow`。

**命令式 API（两条路径）**：
- `useToastManager()` → 返回 `{ toasts, add, close, update, promise }`（**React hook**，须在 `Toast.Provider` 内）。`add(options)` 返回 toast id。
- `createToastManager()` → 返回**框架无关的全局 manager** `{ add, close, update, promise, ' subscribe' }`，可在 React 外创建、通过 `<Toast.Provider toastManager={mgr}>` 接入。**这是真 imperative `toast()` 的钥匙**：模块级建一个单例 manager，`toast()` 调 `manager.add()`，与组件树位置无关。

**`add` options（`ToastManagerAddOptions`）关键字段**：
- `title?: ReactNode` / `description?: ReactNode`
- `type?: string` —— 用于按类型条件化样式（我们用它承载 tone）
- `timeout?: number` —— 自动消失毫秒数；**`0` = 不自动消失**；默认取 Provider 的 `timeout`
- `priority?: 'low' | 'high'` —— `low` polite / `high` urgent（a11y 播报级别）
- `id?` / `onClose?` / `onRemove?` / `actionProps?` / `data?`（本批多数不用）

**`Toast.Provider` props**：`timeout?`（默认 `5000`）/ `limit?`（默认 `3`，超出挤掉最旧）/ `toastManager?`（接全局 manager）。

**`Toast.Root` props**：`toast: ToastObject`（**必传**，把某条 toast 数据喂给 Root）/ `swipeDirection?`（默认 `['down','right']`，滑动消失）。Root state 暴露 `transitionStatus`/`type`/`swiping`/`expanded` 等。

**渲染模型**：`Toast.Provider` 持有 toasts 状态；内部用 `useToastManager().toasts` 遍历，每条映射一个 `<Toast.Root toast={t}>`，内含 `<Toast.Title/>`（无 children 时自动渲染 `t.title`）`<Toast.Description/>` `<Toast.Close/>`。容器是 `<Toast.Viewport>`（一个 `position: fixed` 的 `<div>`，**非 Portal**）。

> **关键裁决：不用 Positioner/Portal/Arrow。** 标准堆叠 toast 用 `Viewport`（自身 fixed 定位）即可；`Positioner`（须配 `Portal`，见 [[base-ui-overlay-positioner-requires-portal]]）+ `Arrow` 仅用于"锚定到某元素的 toast"，本批 YAGNI 不做。→ 天然不触发 Positioner-requires-Portal 那条坑。

---

## 3. 架构：全局单例 manager + 单挂 Provider

### 3.1 触发/渲染解耦机制

```
business code           module singleton            mounted once
─────────────           ────────────────            ────────────
toast({title,...})  ──> hulianToastManager.add() ──> Toast.Provider (subscribed)
                        (createToastManager)          └─ Toast.Viewport
                                                          └─ toasts.map(Toast.Root)
```

- **`hulianToastManager = createToastManager()`** 在 `toast.tsx` 模块级创建（框架无关、无浏览器 API、SSR 安全）。
- **`toast(options)`** = 薄函数，调 `hulianToastManager.add(...)`，把瑚琏的 `tone` 翻译成 Base UI 的 `type`。返回 toast id。
- **`<ToastProvider/>`**（瑚琏组件）= `<Toast.Provider toastManager={hulianToastManager}>` 内嵌 `<Toast.Viewport>` + 遍历 `useToastManager().toasts` 渲染瑚琏皮肤的 `<Toast.Root>` 列表。**自闭合、不需要外部 children**（manager 全局，渲染靠订阅）。

因为 manager 是单例订阅源，**页面任意处只要挂了一个 `<ToastProvider/>`，全页任意位置的 `toast()` 都生效**。

### 3.2 Provider 挂点（已裁决：`app/components/layout.tsx` 单挂）

ComponentDoc 把 `states[0]` 渲染**两次**（顶部预览 + 全状态 gallery），且 gallery 渲染**全部** states → **Provider 绝不能放进任何 showcase state**（会多次挂载、同一 manager 多个 Viewport 订阅 → 同条 toast 重复渲染）。

裁决：在 `apps/www/app/components/layout.tsx`（/components 段 layout）加**一行**自闭合 `<ToastProvider/>`。
- 全 /components 段**只挂一次**、跨 SPA 导航**不重挂**（layout 不随 slug 变化重渲染）；
- scoped 到文档段（非站点根 layout）；
- ComponentDoc 保持"通用 doc 渲染器"纯净（**不特判** slug==="toast"）；
- showcase 的 states/playground 只放触发按钮，依赖此 layout 的 Provider 工作；
- 仅动这一处共享文件（append 一行 JSX + 一行 import，低并发冲突），守"只加你那一处、别动别人的"。

> 候选 skill：imperative 组件的"全局 manager + 单挂 Provider + showcase 只放触发器"承载范式（claudeception 评估）。

### 3.3 motion

复用 dialog/tooltip/popover 的 **motion-token CSS 镜像**（`motionDurationCss`/`motionEaseCss`）驱动 Base UI 原生 `data-[starting-style]`/`data-[ending-style]` 进出场过渡（滑入 + 淡入），**零 motion 运行时** → 天然避 [[motion-reveal-invisible-after-wrapper-becomes-client]]。

---

## 4. 瑚琏 API 与皮肤

### 4.1 公开 API（主 barrel 导出）

```ts
type ToastTone = "info" | "danger" | "neutral"; // 无 success（token 无）

interface ToastOptions {
  title?: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;       // 默认 "neutral"
  timeout?: number;       // 默认取 Provider 5000；0 = 不自动消失
}

function toast(options: ToastOptions): string;  // 返回 id
function ToastProvider(): JSX.Element;           // 单挂，含 Viewport + 列表
```

- tone → Base UI `type`：`add({ title, description, type: tone, timeout })`。
- tone → `priority`：`danger` → `high`（urgent 播报）；其余 → `low`（polite）。
- 手动关闭：每条 toast 内置 `<Toast.Close>`（× 按钮）。
- **YAGNI 推迟**（同 Alert dismissible/Slider marks 纪律）：`toast.promise()`、`update()`、`action` 按钮、`anchor` 锚定、swipe 自定义方向、自定义图标 —— 不做，文档化为 future。

### 4.2 皮肤（已裁决：抬升 surface + tone 左边条）

- **基底**：复用 Popover 抬升气质 —— `bg-surface border border-border rounded-[var(--radius)] shadow-lg`，明暗 token 自动翻转。
- **tone 区分**：左侧 `border-l-2 border-{tone}` + 标题 `text-{tone-accent}` 着色；正文 description 恒 `text-muted`（明暗都可读，不被 tone 染整块）。tone 类在 JS 里按 `toast.type` 直接计算（我自己遍历 toasts → 有 `toast.type`，无需 data 属性钩子）。
- **布局**：`<Toast.Root>` = flex；左主体（Title 加粗 + Description），右上角 `<Toast.Close>` × 按钮（`text-muted hover:text-foreground` + 焦点环）。
- **Viewport**：`fixed top-4 right-4 z-[60] flex w-[min(90vw,22rem)] flex-col gap-2`（右上角堆叠；z 高于 Popover/Tooltip 的 50）。

tone 调色板沿用 Alert 已验证的语义 token（`border-info`/`border-danger`/`border-border`(neutral)、`text-info`/`text-danger`/`text-foreground`）。

---

## 5. showcase 承载（imperative 专属）

`ShowcaseSpec` 类型**零改动**。Provider 由 layout 提供（§3.2），showcase 只放触发按钮：

- **states**（触发器画廊，每个是 `<Button onClick={() => toast(...)}>`）：
  - `info` — 信息提示
  - `danger` — 错误提示（priority high）
  - `neutral` — 中性提示（默认）
  - `带描述` — title + 较长 description
  - `不自动消失` — `timeout: 0`（验手动 Close）
  - `堆叠` — 一个按钮连发 3 条（验 limit=3 堆叠/挤出）
- **controls**（Playground）：`tone`(select: info/danger/neutral) / `title`(text) / `description`(text) / `timeout`(number)。`renderWithProps` 渲染一个按钮，点击按当前参数 `toast(p)`。
- **toCode**：输出 `toast({ title: "...", description: "...", tone: "..." })` 代码串。

> 截图口径：**先点按钮触发 toast 再截**（同 Tooltip/Popover "先触发再截"），验弹层右上定位 / 多条堆叠 / tone 左边条配色 / Close 按钮 / 进入退出，明暗两态。

---

## 6. 四件套 + IA 接入

四件套（`packages/ui/src/toast/`）：
- `toast.tsx`（`"use client"`：`hulianToastManager` 单例 + `toast()` 函数 + `ToastProvider` 组件 + 内部列表/皮肤）
- `toast.types.ts`（`ToastTone` / `ToastOptions`）
- `toast.showcase.tsx`（`"use client"`，§5）
- `toast.test.tsx`（§7）
- `index.ts`（桶导出 `toast` / `ToastProvider` / 类型 / `toastShowcase`）

主 barrel `packages/ui/src/index.ts` 加 `export * from "./toast"`（showcase 也从主 barrel 导出，registry 消费 → RSC 边界套 [[rsc-registry-split-data-from-spec-to-isolate-server-module-graph]]）。

IA（apps/www）：
- `lib/manifest.ts` +1 行：`{ slug:"toast", name:"Toast", category:"feedback", status:"new", description:"命令式轻提示，自动消失 + 队列堆叠" }`。
- `lib/registry.tsx` +1：`import { toastShowcase }` + `toast: toastShowcase` 映射。
- `app/components/layout.tsx`：import `ToastProvider` + 在两栏 `<main>` 外/后加一行 `<ToastProvider/>`（§3.2）。

---

## 7. 测试策略

**单测（vitest + RTL，jsdom）** —— Viewport 是普通 fixed div（非 Portal），`toast()` → manager.add → Provider 订阅 → 渲染，jsdom 可断言：
1. 挂 `<ToastProvider/>`，`act(() => toast({title:"已保存"}))` → 文档出现 "已保存"。
2. tone=info/danger/neutral → Root 命中对应 `border-{tone}` 皮肤类。
3. `<Toast.Close>` 点击 → 该 toast 移除（消失，可能等过渡）。
4. `timeout:0` → 不自动消失（不依赖真实计时，断言 add option 透传 / 或用 fake timers 验未移除）。
5. `description` 渲染、title 加粗结构。
6. danger → priority high（透传断言）。

**留给 Playwright/CDP（jsdom 测不了）**：自动倒计时消失时序、右上角定位、多条堆叠几何/挤出动画、进入退出过渡、明暗两态像素。截图 "先触发再截"。

---

## 8. 门禁与并发纪律（继承固化坑）

- **三道门**：`pnpm typecheck` + 自己 vitest（toast scope）+ `pnpm build --filter=www --force`（必 `--filter=www` 避 desktop 二次 build [[turbo-monorepo-desktop-shell-beforebuild-double-builds-frontend]]；`--force` 绕 turbo cache-hit 拿真实态 [[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。
- **基线/全量红**：并行 session 的 untracked WIP 致全量 `pnpm test` 红时 isolate 不碰（[[turbo-test-red-isolate-untracked-wip-not-your-regression]]）。
- **git add 只列自己文件**，禁 `-A`；commit 用 pathspec（`git commit -- <path>`）防并发 add -A/commit 卷走（[[parallel-session-git-add-all-sweeps-your-staged-files]]）。
- **截图**：Playwright/chrome-devtools MCP 被占用则自起隔离 chromium（[[mcp-browser-busy-launch-isolated-chromium-via-executablepath]]）；端口 5512/5514（桌面 app 已跑 5514 则用 5514，[[nextjs-16-dev-server-dedupes-by-project-dir-not-port]]）；存 cwd 根 Read 看像素（[[ui-layout-verify-needs-screenshot-not-dom-eval]]）。
- 只消费语义 token（无 success）；overlay 全 Base UI 红线、禁 React Aria。

---

## 9. 本批不做（YAGNI 边界）

- `toast.promise()` / `update()` / action 按钮 / 锚定 toast（Positioner+Portal+Arrow）/ swipe 方向自定义 / 自定义图标 / 位置可配（固定右上）/ success/warning tone（token 无）。
- 不改 `ShowcaseSpec` 类型。
- 不在站点根 layout / ComponentDoc 挂 Provider（已裁决 components/layout.tsx 单挂）。

---

## 10. 验收口径（done 的标志）

1. `import { toast, ToastProvider } from "@hulianui/ui"`；`toast({title,description,tone})` 在文档站任意组件页可触发右上角提示，自动消失 + 手动 Close + 多条堆叠（limit 3）。
2. tone=info/danger/neutral 左边条配色明暗两态正确，无 success。
3. 四件套齐 + 主 barrel 导出 + manifest/registry/layout 三处 IA 接入，左树 feedback 组出现 Toast(new)。
4. 三道门（typecheck + toast vitest + build --filter=www --force）全绿；Playwright/CDP 明暗两态像素自证（先触发再截）。
5. Provider 单挂、无重复渲染；showcase 只放触发器（零 Provider in state）。
