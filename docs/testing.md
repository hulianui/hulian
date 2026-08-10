# 测试基座：双 project 分流

> 2026-08-01 立。`packages/ui` 的 vitest 拆成两个 project，按**「这条断言在 jsdom 里可不可信」**分流。

## TL;DR

| project | 环境 | 文件名 | 跑什么 |
|---|---|---|---|
| `unit` | jsdom | `*.test.tsx` | props → DOM 契约、aria、受控/非受控、纯函数 |
| `browser` | 真实 chromium | `*.browser.test.tsx` | 拖拽、指针捕获、动画、布局定位、滚动、WebGL、图表 |

```bash
pnpm test                       # 两个都跑
pnpm --filter @hulianui/ui exec vitest run --project unit     # 只跑 jsdom（快）
pnpm --filter @hulianui/ui exec vitest run --project browser  # 只跑真实浏览器
```

新增测试**默认写 `unit`**。只有命中下面判据时才写 `.browser.test.tsx`。

---

## 为什么要分：jsdom 会说谎，而且说得很像真的

这不是理论顾虑，是实测。以 Kanban 整卡拖拽为例做的三向验证：

| 场景 | 结果 |
|---|---|
| 正确代码 + `browser` | ✅ 3/3 通过 |
| **注入历史 bug + `browser`** | ❌ 精确变红：`expected "spy" to be called 1 times, but got 0 times` |
| **正确代码 + `jsdom`** | ❌ **假红**：报错**一字不差** |

第三行是要害：**在 jsdom 里，「拖拽工作正常」和「拖拽完全失效」产生完全相同的输出，不可区分。**

这正是历史上那个 bug 的逃逸机制——整卡拖拽曾经**完全失效**（守卫函数没传边界，`closest` 命中了 dnd-kit 自己挂在卡片上的 `role="button"`，于是每张卡都拖不动），而当时 388 个 jsdom 测试全绿，因为它们只拿孤立 `createElement` 测纯函数。

### jsdom 缺的四样能力

| 缺什么 | 导致 |
|---|---|
| 布局引擎 | `getBoundingClientRect()` 恒为 0 → 所有基于坐标的碰撞检测（dnd-kit `closestCorners`）永远算不出落点 |
| 渲染循环 | rAF 驱动的入场动画被饿死（recharts 图表截图只剩轴和图例） |
| 合成器 | WAAPI 动画 `currentTime` 冻结在 0 |
| GPU 上下文 | WebGL 不可用；`loseContext` 还会毒化 StrictMode remount |

### 更隐蔽的问题：setup 里的桩把要测的东西屏蔽掉了

`vitest.setup.ts`（仅 `unit` project 加载）为了让测试能跑，打了三个桩：

| 桩 | 后果 |
|---|---|
| `PointerEvent` 降级成 `MouseEvent` | 拖拽测的是 polyfill，不是真实指针语义 |
| `setPointerCapture` → **no-op** | 指针捕获这个拖拽核心机制**从未被测过** |
| `IntersectionObserver` → 永不触发 | 注释自陈"`useInView` 恒返回 false，进场类组件落静息态"——**所有进场动画从没被测过** |

`browser` project 的 setup（`vitest.setup.browser.ts`）**一个 polyfill 都不打**，这些能力在真实浏览器里都是原生的。

---

## 分流判据

写进 `.browser.test.tsx` 的**充分条件**——命中任意一条即可：

- [ ] 断言依赖**元素的真实尺寸或位置**（`getBoundingClientRect`、overlay 定位、吸顶、滚动阈值、虚拟列表）
- [ ] 测**指针序列**（拖拽、滑动、长按、跟手、`setPointerCapture`）
- [ ] 测**动画的中间态或结果态**（不只是"初始 DOM 完整"）
- [ ] 依赖 `IntersectionObserver` / `ResizeObserver` **真的触发**
- [ ] 涉及 **canvas / WebGL** 的实际绘制
- [ ] 涉及**原生滚动**行为
- [ ] 测**焦点环、`:focus-visible`、真实 CSS 计算值**

留在 `unit` 的（**绝大多数**）：

- 纯函数（`flow-geometry`、`computeFit`、日期数学、`resolveKanbanMove`）——连 jsdom 都不需要
- props → 渲染结果、条件渲染、列表分桶
- aria 属性、role、label 关联
- 受控/非受控切换、回调是否被调用（不涉及坐标）

**判断口诀**：这条断言换成真实浏览器会不会得到不同结论？会 → `browser`。

---

## 怎么写 browser 测试

参考 `src/kanban/kanban.browser.test.tsx`。要点：

**1. 给组件一个有尺寸的容器。** 真实浏览器里布局是真的，但你得让它有地方布局：

```tsx
render(
  <div style={{ width: 900, height: 600, display: "flex" }}>
    <Kanban {...props} />
  </div>,
);
```

**2. 指针序列要分步，并让每个事件单独提交。** 单跳一步会被当成瞬移，且过不了 `activationConstraint: { distance: 6 }`；把整段拖拽放进同一个 `act` 又会让 React 合并更新，使下一次 move 看不到已经提交的 pointerdown 状态：

```tsx
async function actPointer(target, type, x, y) {
  await act(async () => {
    firePointer(target, type, x, y);
    await nextFrame();
  });
}

await actPointer(from, "pointerdown", start.x, start.y);
for (let i = 1; i <= 8; i++) {
  const point = lerp(start, end, i / 8);
  await actPointer(document, "pointermove", point.x, point.y);
}
await actPointer(document, "pointerup", end.x, end.y);
```

**3. `pointermove` / `pointerup` 派发到 `document`。** 传感器激活后监听挂在 `ownerDocument` 上，不是原元素。

**4. 等真实帧，不要 `vi.advanceTimersByTime`：**

```tsx
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
```

**5. 断言用 `waitFor`**，真实浏览器的时序不保证同步完成。

**6. 样式已自动就绪**：`vitest.browser.css` 引了 tokens + preset + `@source ./src`，根节点也已设 `data-theme="light"`。

**7. React 状态更新必须显式放进异步 `act()`**：browser setup 不再关闭 `IS_REACT_ACT_ENVIRONMENT`。门禁要求 browser suite 的 stderr 不含 `not wrapped in act`；不要用过滤日志或全局关警告代替正确时序。

---

## 三个已经踩过的坑

### 坑一：browser project 会解析出第二份 React

**症状**：组件一渲染就报 `Cannot read properties of null (reading 'useState')`，栈顶落在你的组件里，看着像组件坏了。

**真因**：`browser` project 走的是**浏览器侧解析**（不是 `unit` 那条 SSR 解析），`motion` 这类有多份入口的包会被解析出第二份 React 实例。Kanban 不受影响、Carousel 一碰就炸，区别只是后者 `import { useReducedMotion } from "motion/react"`。

**根治**：`vitest.config.ts` 顶层已配 `resolve.dedupe`，直接复用发给消费方的 `hulianDedupe` 清单（`vitest-preset.cjs`，`vitest-preset.js` 是它的 ESM 包装），两处不会漂移。**新增依赖如果也有多入口，记得加进那个清单。**

这其实是 dogfood：消费方早就被这个问题坑过（所以才有 `@hulianui/ui/vitest-preset`），而库自己的测试配置一直没用上。

### 坑二：合成事件测不了指针捕获

`setPointerCapture(id)` 要求 `id` 对应一个**真实的活跃指针**。`dispatchEvent(new PointerEvent(...))` 造出来的只是个数据对象，浏览器不认它的 `pointerId` —— 于是 `hasPointerCapture()` 恒为 `false`，断言它只会得到一条**假失败**。

所以 browser mode 里有两档保真度，按需要选：

| 手段 | 保真度 | 能做什么 | 不能做什么 |
|---|---|---|---|
| `dispatchEvent` 合成指针序列 | 中 | 逐帧控制、拖拽中途断言、任意坐标 | 指针捕获、原生手势、`:hover` 等真实 UA 状态 |
| `userEvent`（→ playwright 真实鼠标） | 高 | 真实输入设备的完整路径 | 拖拽**中途**插入断言（`dragAndDrop` 是原子操作） |

```tsx
import { userEvent } from "@vitest/browser/context";
await userEvent.dragAndDrop(source, target);   // 真实鼠标
```

**实践**：默认用 `dispatchEvent`（可控、可断言中间态），需要证明"真实设备也走得通"时再补一条 `userEvent` 测试。参考 `carousel.browser.test.tsx` 里两种各留了一条。

### 坑三：Vite 中途重新优化依赖会打断测试

**症状**：某条测试报 `Cannot read properties of null (reading 'useContext')`，看着像坑一（React 分裂），但只有**特定一条**用例失败，日志里能看到：

```
[vite] (client) ✨ new dependencies optimized: lucide-react
[vite] (client) ✨ optimized dependencies changed. reloading
```

**真因**：某条用例第一次用到某个包（例：Sortable 只在 `handle` 模式才渲染 lucide 图标），Vite 触发依赖预构建并 **reload 页面**，正在跑的用例被腰斩。

**根治**：`vitest.config.ts` 的 `optimizeDeps.include` 把浏览器侧会用到的重包一次性列全，让预构建在启动时完成。**新组件引入新的第三方包时，记得同步这份清单。**

---

## 迁移状态

**已迁**：

| 组件 | 补上了什么 jsdom 测不到的 | jsdom 那边为什么测不了 |
|---|---|---|
| `kanban` | 整卡拖拽跨列 | `closestCorners` 依赖真实 rect，jsdom 恒 0 |
| `carousel` | 轨道溢出几何、拖拽改 `scrollLeft`、snap 类切换、圆点 `scrollTo` 落位、真实输入设备拖拽 | 测试开头就把 `scrollTo`/`setPointerCapture` 桩成 `vi.fn()` |
| `resizable` | 面板真实宽度、拖手柄改比例、min/max 夹取、`data-dragging` | `avail = Σ offsetWidth` 恒 0 → `deltaPct` 恒 0 → **拖拽是彻底 no-op** |
| `swipe-action` | 面板真实宽度、跟手偏移、过阈值吸附、回弹、纵向放行 | `widths()` 读 `offsetWidth` 恒 0 → 拖不动也永不吸附，只能全局 mock 成 80 |
| `sortable` | 拖拽重排、相邻互换、交互元素放行、handle 模式 | `closestCenter` 同样依赖 rect，`over` 恒空 → **onChange 永不触发** |
| `route-tabs` | 横向 HTML5 拖放的左/右半区落点 | jsdom 只能手工覆盖 rect，无法证明真实页签宽度 |
| `tree` | HTML5 拖放的 before / inside / after、非法子树保护 | jsdom rect 高度恒 0，旧测试必须伪造高度与 dragover 坐标 |

共 30 个用例。三处**源码级证据**说明这些不是"覆盖不足"而是"根本测不了"：

```js
// resizable.tsx:163,178
const avail = panelEls.reduce((s, p) => s + p.offsetWidth, 0);   // jsdom 恒 0
const deltaPct = d.avail > 0 ? ((pos - d.startPos) / d.avail) * 100 : 0;   // → 恒 0

// swipe-action.tsx:67,77
setOffset(Math.max(-rw, Math.min(lw, start.current.offset + dx)));   // rw/lw=0 → 恒 0
if (offset < 0 && rw > 0 && ...) next = -rw;                         // rw>0 不成立 → 永不吸附

// sortable.tsx:151  onDragEnd
if (!over || active.id === over.id) return;   // over 恒空 → 直接短路
```

### 迁移时的纪律：写完必做变异验证

**测试通过 ≠ 测试有用。** 每迁一个组件，人为把对应逻辑改坏（或还原成 jsdom 的行为），确认测试**精确变红**再收工。

实例：Resizable 首版有一条"min/max 约束"断言写成 `expect(last[0]).toBeLessThanOrEqual(80)`，变异后**依然通过**——因为 `deltaPct` 恒 0 时也满足"没越界"。收紧成 `toBeCloseTo(80, 1)`（必须真的顶到边界）后，变异红条从 2 条增至 3 条。

本轮重新枚举 `setPointerCapture|dragover|dragstart|pointer*` 后，坐标依赖最强的 RouteTabs 与 Tree 已迁移。剩余命中主要是 Lanyard 的 window 监听器清理、VoiceRecord 的事件去重，以及特效件“事件不抛错”契约；这些断言不依赖真实布局，继续留在 unit 更准确。

**不必全迁。** 迁移的判据是“断言是否依赖真实浏览器能力”，不是“文件是否提到了某个 API”。多数 `IntersectionObserver` / rAF 测试只验证静息态 DOM 完整，在 jsdom 下仍可信。

---

## CI

`ci.yml` 的 `verify` job 在 `pnpm test` 前安装 Chromium：

```yaml
- name: Install Playwright chromium
  run: pnpm --filter @hulianui/ui exec playwright install --with-deps chromium
```

只装 chromium（不是三个内核）以省 CI 时间。

生产构建完成后还会运行 `pnpm a11y`。该命令扫描 10 条固定静态路由，critical / serious axe 违规或同源资源加载失败都会阻断；moderate / minor 只报告。

---

## 相关文件

| 文件 | 作用 |
|---|---|
| `packages/ui/vitest.config.ts` | 双 project 定义与分流规则 |
| `packages/ui/vitest.setup.ts` | **仅 unit**：jsdom 的三个 polyfill 桩 |
| `packages/ui/vitest.setup.browser.ts` | **仅 browser**：零 polyfill，只加载样式 + 主题 |
| `packages/ui/vitest.browser.css` | 真实样式入口（相对路径引 tokens，postcss 不解析包名） |
| `packages/ui/postcss.config.mjs` | 让 browser project 能编译 Tailwind |
