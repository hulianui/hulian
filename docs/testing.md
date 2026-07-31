# 测试基座：双 project 分流

> 2026-08-01 立。`packages/ui` 的 vitest 拆成两个 project，按**「这条断言在 jsdom 里可不可信」**分流。

## TL;DR

| project | 环境 | 文件名 | 跑什么 |
|---|---|---|---|
| `unit` | jsdom | `*.test.tsx` | props → DOM 契约、aria、受控/非受控、纯函数 |
| `browser` | 真实 chromium | `*.browser.test.tsx` | 拖拽、指针捕获、动画、布局定位、滚动、WebGL、图表 |

```bash
pnpm test                       # 两个都跑
pnpm exec vitest --project unit     # 只跑 jsdom（快）
pnpm exec vitest --project browser  # 只跑真实浏览器
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

**2. 指针序列要分步。** 单跳一步会被当成瞬移，且过不了 `activationConstraint: { distance: 6 }`：

```tsx
firePointer(from, "pointerdown", start.x, start.y);
for (let i = 1; i <= 8; i++) {
  firePointer(document, "pointermove", lerp(...));
  await nextFrame();          // 每步让一帧
}
firePointer(document, "pointerup", end.x, end.y);
```

**3. `pointermove` / `pointerup` 派发到 `document`。** 传感器激活后监听挂在 `ownerDocument` 上，不是原元素。

**4. 等真实帧，不要 `vi.advanceTimersByTime`：**

```tsx
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
```

**5. 断言用 `waitFor`**，真实浏览器的时序不保证同步完成。

**6. 样式已自动就绪**：`vitest.browser.css` 引了 tokens + preset + `@source ./src`，根节点也已设 `data-theme="light"`。

**7. 不需要 `act()`**：setup 里已关掉 `IS_REACT_ACT_ENVIRONMENT`——真实浏览器里要的就是真实异步时序。

---

## 两个已经踩过的坑

### 坑一：browser project 会解析出第二份 React

**症状**：组件一渲染就报 `Cannot read properties of null (reading 'useState')`，栈顶落在你的组件里，看着像组件坏了。

**真因**：`browser` project 走的是**浏览器侧解析**（不是 `unit` 那条 SSR 解析），`motion` 这类有多份入口的包会被解析出第二份 React 实例。Kanban 不受影响、Carousel 一碰就炸，区别只是后者 `import { useReducedMotion } from "motion/react"`。

**根治**：`vitest.config.ts` 顶层已配 `resolve.dedupe`，直接复用发给消费方的 `hulianDedupe` 清单（`vitest-preset.js`），两处不会漂移。**新增依赖如果也有多入口，记得加进那个清单。**

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

---

## 迁移状态

**已迁**：

| 组件 | 补上了什么 jsdom 测不到的 |
|---|---|
| `kanban.browser.test.tsx` | 整卡拖拽跨列（`closestCorners` 依赖真实 rect） |
| `carousel.browser.test.tsx` | 轨道真实溢出几何、拖拽改 `scrollLeft`、snap 类切换、圆点 `scrollTo` 落位、真实输入设备拖拽 |

> Carousel 的 jsdom 测试开头就把 `scrollTo` 和 `setPointerCapture` 桩成了 `vi.fn()` ——
> 而这个组件的核心逻辑正是 `track.scrollLeft = startLeft - (clientX - startX)`。
> jsdom 无布局无溢出，`scrollLeft` 恒为 0，**拖拽切换幻灯片这个主功能从未被测过**。

**待迁清单**（按信号强度排序，实测于 2026-08-01）：

| 信号 | 命中测试文件数 | 优先级 |
|---|---|---|
| `setPointerCapture` | 2 | 🔴 最高——jsdom 下这个 API 是 no-op，等于没测 |
| `pointerdown` / `pointermove` | 6 | 🔴 高 |
| `dragover` / `dragstart` | 2 | 🔴 高（jsdom 下坐标是 NaN） |
| `getBoundingClientRect` | 15 | 🟡 中——看是否真的断言了几何 |
| `IntersectionObserver` | 53 | 🟡 中——多数只需"静息态 DOM 完整"，可留；测进场动画的要迁 |
| `requestAnimationFrame` | 50 | 🟡 中——同上 |
| `getContext`（canvas/WebGL） | 34 | 🟢 低——多数是特效件，真值验证成本高，可分批 |

涉及指针/拖拽的具体组件：`balatro` `carousel` `kanban` `lanyard` `magnet-lines` `route-tabs` `sortable` `tree` `voice-record`

**不必全迁。** 迁移的判据是"这条断言在 jsdom 下是否可信"，不是"这个文件是否提到了某个 API"。多数 `IntersectionObserver` / `rAF` 测试只是在验证"组件挂载后 DOM 完整"，那在 jsdom 下是可信的，留着即可。

---

## CI

`ci.yml` 的 `verify` job 在 `pnpm test` 前加了一步：

```yaml
- name: Install Playwright chromium
  run: pnpm --filter @hulianui/ui exec playwright install --with-deps chromium
```

只装 chromium（不是三个内核）以省 CI 时间。

---

## 相关文件

| 文件 | 作用 |
|---|---|
| `packages/ui/vitest.config.ts` | 双 project 定义与分流规则 |
| `packages/ui/vitest.setup.ts` | **仅 unit**：jsdom 的三个 polyfill 桩 |
| `packages/ui/vitest.setup.browser.ts` | **仅 browser**：零 polyfill，只加载样式 + 主题 |
| `packages/ui/vitest.browser.css` | 真实样式入口（相对路径引 tokens，postcss 不解析包名） |
| `packages/ui/postcss.config.mjs` | 让 browser project 能编译 Tailwind |
