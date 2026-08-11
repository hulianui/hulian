# 消费方集成约束

> 面向**在自己的仓库里装 `@hulianui/ui`** 的人。
> 这里只写「不写明就一定会踩」的几条，不是使用教程。

瑚琏是**源码分发**的：`package.json` 的 `exports` 里 `default` 条件直接指向 `src/index.ts`，
你的打包器编译的是这份 TypeScript 源码，而不是预编好的产物。好处是 tree-shaking 干净、
能直接跳进源码看实现、主题变量走你自己的 Tailwind 管线；代价是**瑚琏依赖的第三方包由你的
解析器去找**，于是模块解析的锅归消费方。下面两条都是这个代价的直接后果。

**0.28.0 起，`types` 条件另外指向随包发的预编译 `.d.ts`（`dist/`）**：你的 `tsc` 读声明、
打包器仍读源码。这条改动只影响类型检查那一半 —— 见第 5 节末尾的实测，以及第 6 节
新承诺的 `noUncheckedIndexedAccess`。

**界面语言不是中文的，先读 [第 9 节](#9-configprovider非中文应用的必需品)**：不挂
`ConfigProvider` 时组件内置文案（大半在 `aria-label` 里）会**静默**回退成 zh-CN，
页面看起来完全正常。

---

## 1. 测试环境会解析出第二份 React

**症状**：Vitest 里渲染任意瑚琏组件，报 `Cannot read properties of null (reading 'useRef')`
（或 `useId` / `useContext` / `useMemo`），**栈顶落在第三方包内部**。看起来像「那个组件坏了」，
实际是 React 出现了两份实例，hook 读到的是另一份的 dispatcher。

**为什么单靠 `resolve.dedupe` 不够**：分界线不是「哪个包」，而是**这个包的模块形态**。
瑚琏的依赖恰好横跨四类，各需要一条不同的配置：

| 依赖形态 | 例子 | 你要配的 |
|---|---|---|
| 自研零依赖件（只 import react） | 绝大多数瑚琏组件 | `resolve.dedupe` |
| 纯 ESM，且是 **peerDependency** | `@base-ui/react` | `dedupe` + **你自己也得装上这个 peer** |
| 有 `exports`，但 `import` 条件指向 `.cjs.mjs` 互操作壳 | `@mui/material`、`@emotion/*` | `resolve.conditions` 启用 `module`（它在这些包的 exports 里排在 `import` 前面） |
| **没有 `exports` 字段**，只有 legacy `main`(CJS) / `module`(ESM) | `@dnd-kit/*` | `resolve.mainFields` 让 `module` 先于 `main` |

再加一条 `test.server.deps.inline` 覆盖瑚琏这棵树（源码分发 + 未预构建，不 inline 会被当外部
依赖直接 require）。

**直接用现成的预设**，别自己一条条试：

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { withHulian } from "@hulianui/ui/vitest-preset"

export default defineConfig(withHulian({
  plugins: [react()],
  test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
}))
```

`withHulian` 只做追加去重，你已经写的同名字段保留在前、优先级更高。想自己拼的话，
`@hulianui/ui/vitest-preset` 也单独导出了 `hulianDedupe` / `hulianConditions` /
`hulianMainFields` / `hulianInlineDeps` 四个常量。

> **你的 `package.json` 没有 `"type": "module"` 也没关系**（`create-next-app` 生成的项目默认
> 就没有）。Vite 按这个字段决定 `vitest.config.ts` 用 ESM 还是 CJS 加载，两条路本预设都走得通。
> 0.27.0 及更早版本只有 ESM 入口，走 CJS 那条会在**配置加载阶段**就报
> `"@hulianui/ui/vitest-preset" resolved to an ESM file. ESM file cannot be loaded by require`，
> 一个用例都跑不到；0.28.0 起补上了 `require` 入口。`@hulianui/ui/vite` 同理。

**别忘了装 peer**：`@base-ui/react` 是 peerDependency，你的 `package.json` 里必须有它，
否则 dedupe 无从谈起（根本没有第二份可去重，是压根找不到）。当前 peer 清单：

```json
{
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@base-ui/react": ">=1.6.0",
    "motion": ">=11",
    "tailwindcss": ">=4.1"
  }
}
```

> **下界不是随手写的，每一条都有依据**（记在 `scripts/dep-family-baseline.json` 的 `_peers` 里，
> 由 `pnpm deps:family` 钉住）。两条值得单独说：
>
> - `@base-ui/react` 从 `>=1.0.0` 抬到 `>=1.6.0`（0.33.0）。库里绝大多数组件直接建在 Base UI 上，
>   而我们只对着 1.6.x 开发和测试；锁在 1.4.1 的消费方装得上、不报警，但 `Slider` 的 SSR 首屏会
>   **偶发** hydration mismatch（hulianui/hulian#209）。**从 0.29.x 一路升上来的话请一并刷
>   `@base-ui/react`** —— 你写的若是 `^1.4.1`，`npm install @hulianui/ui@latest` 不会动它，
>   锁原样保留，与下面 tiptap 那条是同一个机制。
> - `tailwindcss` 是 `>=4.1` 而不是 `>=4`：`Textarea` 的 `cell` 档用了 `field-sizing-content`，
>   这个工具类 4.1 才有。4.0 上它不生成，装得上、不报警，只是高度不跟随内容。
>   （`@hulianui/tokens` 单独用仍是 `>=4` —— 它的 CSS 只用 4.0 就有的语法。）

> **上面就是全部 peer —— 没有 optional peer，也没有需要你按需安装的东西。**
> 0.15.0 之前日期族是 MUI X 的桥接件，拖着 `@mui/material` / `@mui/x-date-pickers` / `@emotion/*`
> 四个 optional peer，还得记着挂 `MuiBridgeProvider`、从 `@hulianui/ui/date-pickers` 子路径导入。
> 这一族现已全部自研为零依赖并回到根 barrel，那四个包、那条子路径、那个 Provider 一并消失。
>
> `@dnd-kit/*` 等仍是 dependency —— 它们服务的组件在根 barrel 里，装库即到位，你不用管。

---

## 2. 从 shadcn/ui 迁过来：token 命名基本一致，只有一个曾经反义

瑚琏和 shadcn 都把语义色注册在 Tailwind v4 的 `@theme` 里，也就是说**两边共用
`--color-*` 这个命名空间**，同名 token 会互相覆盖（谁的 `@theme` 后被处理谁赢），
和 CSS 优先级、cascade layer 都无关。

好消息是重叠的部分语义一致，不重叠的部分名字不同、互不干扰：

| shadcn | 瑚琏 | 关系 |
|---|---|---|
| `--color-foreground` | `--color-foreground` | 同名同义（主文字） |
| `--color-primary` / `-foreground` | 同名 | 同名同义 |
| `--color-border` · `--color-ring` | 同名 | 同名同义 |
| `--color-chart-1…5` | `--color-chart-1…6`（多一档） | 兼容 |
| `--color-muted` | `--color-muted`（弱背景） | **0.28.0 起同名同义**，见下 |
| `--color-muted-foreground` | 同名（次要文字） | **0.28.0 起同名同义** |
| `--color-background` | `--color-bg` | 名字不同，各用各的 |
| `--color-card` · `--color-popover` | `--color-surface` | 名字不同，各用各的 |
| `--color-destructive` | `--color-danger` | 名字不同，各用各的 |
| `--color-secondary` · `--color-accent` | 无对应 | 你自己的定义原样保留 |

**0.28.0 之前有一处同名反义**：瑚琏的 `--color-muted` 是次要**文字**色，而 shadcn 的
`--muted` 是弱**背景**。后果是从 shadcn 迁过来的项目一引入瑚琏 token，满屏 `bg-muted`
（Skeleton、表格斑马纹、Avatar 占位底）立刻变成深灰色块，且消费方挡不住 —— 这不是覆盖
顺序能调的，是同一个名字被两种语义抢用（[#142](https://github.com/hulianui/hulian/issues/142)）。

0.28.0 起瑚琏朝生态对齐：`--color-muted` = 弱背景（与 `--color-subtle` 同值同义），
次要文字色改名 `--color-muted-foreground`。**从 shadcn 迁过来现在是零改动**。

代价落在既有瑚琏用户身上：`text-muted` 不再对应任何 token。Tailwind 对未定义颜色
既不报错也不生成规则，写了会**静默回退成继承色**（次要说明文字渲染成正文同色），
所以别靠肉眼查 —— `@hulianui/guard` 有一条 error 规则专挡这个：

```bash
npx hulian-check src            # 逐条列出位置
npx hulian-check --format json src   # CI 做棘轮用
```

改法是机械的：`text-muted` → `text-muted-foreground`（`fill-` / `stroke-` / `border-`
等前缀同理）。`bg-muted` **不用改**，它现在就是弱背景。

### 三行 `@import` 里有一行会接管你的 `dark:` / `shadow-*` / 过渡曲线

接入三行里最容易出事的是 `preset.css`。它按对消费方的影响分成两类，拆成了两个可独立引入的入口
（`@hulianui/tokens` 0.8.0 起）：

| 入口 | 内容 | 性质 |
|---|---|---|
| `@hulianui/tokens/preset-core.css` | 语义 token → `--color-*` 映射、五档断点、42 个 `hulian-*` 关键帧 | **纯加法**。全是新增 token / 新增关键帧，`hulian-` 前缀不撞名，断点与 Tailwind 默认同值 |
| `@hulianui/tokens/preset-opinionated.css` | `@custom-variant dark`、`--shadow-sm..2xl` 重绑、`--ease-*` 与默认过渡曲线重绑 | **接管**。改变项目里**已有**的 `dark:` / `shadow-*` / 裸 `transition` 的行为 |
| `@hulianui/tokens/preset.css` | 上面两份的聚合入口 | 与拆分前**逐字节等价**，现存写法零改动 |

新项目继续引 `preset.css` 一份即可，什么都不用改。下面这段只写给**存量项目**。

#### 渐进接入：先只引核心层

瑚琏组件要正常显示，只需要 `preset-core.css`：

```css
@import "tailwindcss";
@import "@hulianui/tokens/tokens.css";
@import "@hulianui/tokens/preset-core.css";   /* 先只要这一份 */
/* @import "@hulianui/tokens/preset-opinionated.css";  ← 换完组件、准备统一视觉语言时再放开 */
```

代价是瑚琏组件的阴影走 Tailwind 默认那套（不随明暗切值）、动效走 Tailwind 内置缓动，
暗色由你自己那套 `dark:` 机制驱动。三样都是「看起来不完全是瑚琏的样子」，**不是坏掉**。

#### `dark:` 那一条是静默的，务必先读

`preset-opinionated.css` 里的 `@custom-variant dark` 判的是继承来的 `--hl-theme`
（[#101](https://github.com/hulianui/hulian/issues/101)，为的是主题岛嵌套时 `dark:` 跟着**最近**的岛走，
选择器表达不了「最近」）。而 shadcn 的默认形态是 `<html class="dark">` +
`@custom-variant dark (&:is(.dark *))`。两份定义撞在同一个 variant 上，**后声明的那份生效**：

- 你的 `@custom-variant dark` 写在瑚琏 `@import` **之前** → 瑚琏的赢 → **全站 `dark:` 工具类不再匹配任何东西**
- 写在瑚琏 `@import` **之后** → 你的赢 → `dark:` 照常，瑚琏组件的主题岛嵌套退化成跟随页面

翻车形态是「半暗」：页面底色还是暗的（那来自 `.dark { --… }` 的 token 块，不走 variant），
前景色 / 边框 / 次要文字留在亮色 —— 暗底压黑字。而且**构建成功、控制台无警告、DevTools 里规则确实存在**
（`dark:text-gray-400` 生成的是合法 CSS，只是没有祖先能匹配新选择器），排查起来很绕。

三条出路，任选其一：

1. **只引 `preset-core.css`**（上一节）。你自己那份 `@custom-variant dark` 原样保留，最省心。
2. **把 `@custom-variant dark (&:is(.dark *))` 挪到瑚琏 `@import` 之后**。零成本，代价是主题岛退化。
3. **加一层 `--hl-theme` 桥**，保留瑚琏的定义，同时让 `.dark` 也能驱动它：

```css
/* 放在所有 @import 之后 */
.dark {
  --hl-theme: dark;
}
:root:not(.dark) {
  --hl-theme: light;
}
```

自定义属性靠继承传播，`.dark` 挂在 `<html>` 上时全部后代都读得到，
`@container style(--hl-theme: dark)` 那条分支即命中。

**这条桥是实测过的**，不是推理：Chrome 151 headless，`<html class="dark">` +
`@import "tailwindcss"` → `@custom-variant dark (&:is(.dark *))` → 瑚琏三行（瑚琏定义胜出）：

| 场景 | `dark:text-red-500` 计算色 | `shadow-lg` |
|---|---|---|
| 不引瑚琏（基线） | `oklch(0.637 0.237 25.331)` = red-500 ✅ | Tailwind 默认 |
| 引 `preset.css`，无桥 | `oklch(0.208 0.042 265.755)` = slate-900 ❌（复现翻车） | 瑚琏阴影 |
| 引 `preset.css` + 上面那段桥 | `oklch(0.637 0.237 25.331)` = red-500 ✅ | 瑚琏阴影 |
| 只引 `preset-core.css` | `oklch(0.637 0.237 25.331)` = red-500 ✅ | Tailwind 默认 |

同一次实测还确认：嵌在 `[data-theme="light"]` 岛内的元素在桥打开后**不会**被点亮
（计算色仍是 slate-900）—— 桥与主题岛语义是相容的，不会把 #101 撤回。

两个已知边界：

- 需要 style container query（Chrome 111 / Safari 18 / Firefox 128），与本库基线一致。
- `@container` 查的是**父容器**，所以元素**自己**带 `.dark` 又同时写 `dark:` 工具类时不命中
  （`<html class="dark">` 这种放在根上的常规写法不受影响）。

#### 顺带：`@import "tailwindcss"` 会引两遍

`preset-core.css` 自己第一行就 `@import "tailwindcss"`（拆分前是 `preset.css` 干这事），
而 shadcn 项目的 `globals.css` 首行通常已经有一份。**Tailwind v4 不去重**：实测同一份工程
（v4.3.3）里两处引入会让 `@layer theme, base, components, utilities;` 与整段 preflight
各出现两次，产物 28.1 KB → 32.1 KB（+4 KB）。

行为上没有区别（重复规则等价覆盖，无视觉差异），所以两种写法都对：

- 保留你自己那行 `@import "tailwindcss"` —— 多 4 KB，换来「Tailwind 的引入点在你自己文件里」这件事清清楚楚。
- 删掉你自己那行，由 `preset-core.css` / `preset.css` 带进来 —— 省 4 KB。

库这边刻意**不动**：把 `@import "tailwindcss"` 从 preset 里摘掉会让现在照 README 抄三行、
且自己没引 Tailwind 的消费方（含本仓库的 `apps/www`）当场炸，属破坏性改动，不值得为 4 KB 做。

---

## 3. 日期族：全部零依赖，直接从根 barrel 用

涉及组件：`Calendar`、`DatePicker`、`DateTimePicker`、`TimeField`、`TimePicker`、`DateRangePicker`。

```tsx
import { Calendar, DatePicker, DateTimePicker, TimeField, TimePicker, DateRangePicker } from "@hulianui/ui"
```

装 `@hulianui/ui` 就有了，**不需要另外装任何包，也不需要包 Provider**。

对外值一律是**定宽字符串**，不是 `Date`：

| 组件 | 值形状 |
|------|--------|
| `Calendar` / `DatePicker` | `"YYYY-MM-DD"`（`picker="month"` → `"YYYY-MM"`，`"year"` → `"YYYY"`） |
| `TimeField` / `TimePicker` | `"HH:mm"`，`withSeconds` 时 `"HH:mm:ss"` |
| `DateTimePicker` | `"YYYY-MM-DD HH:mm"`，`withSeconds` 时带秒 |
| `DateRangePicker` | `["YYYY-MM-DD", "YYYY-MM-DD"]` |

定宽是刻意的：字典序即时间序，`minDate`/`maxTime` 这类比较可以直接比字符串，
既不用引 date 库，也不会被时区和 UTC 日界搅进来。

### 从 0.15.0 之前升级

| 之前 | 现在 |
|------|------|
| `import { X } from "@hulianui/ui/date-pickers"` | `import { X } from "@hulianui/ui"` |
| `pnpm add @mui/material @mui/x-date-pickers @emotion/react @emotion/styled` | 不需要，可以卸掉 |
| `<MuiBridgeProvider>` 包裹 | 删掉，不再存在 |
| `DateField` | 改名为 `DatePicker` |
| 值是完整 ISO 时间戳 | 定宽字符串（见上表） |
| `DatePicker` 的 `views` / `openTo` | `picker="date" \| "month" \| "year"` |
| `DatePicker` / `TimeField` 的 `label` | 用 `placeholder` + `aria-label`（组件不带浮动 label） |
| `DateTimePicker` 的 `minutesStep` | `minuteStep`（与 `TimePicker` 对齐） |
| `DateTimePicker` 的 `format` | `displayFormat`（只改显示，不改值） |

---

## 4. 只用少数几个组件时，从子路径引入

瑚琏是**源码分发**（`exports` 指向 `.ts`，产物里没有 `dist/`），所以根 barrel 不是一个「打好的包」，
而是一棵会被你的打包器逐文件 transform 的源码树。从根 barrel 取一个组件，整棵 `src/`（700+ 个 tsx）
连同全部 26 个 dependencies（tiptap / recharts / vidstack / ogl / MUI …）都会进你的 dev 模块图 ——
即使你一个都没用到。实测某 Vite 桌面 App 只用了约 15 个组件，dev server 常驻 3.1 GB、CPU ~90%，
HMR 卡到「点了没反应」（hulianui/hulian#19）。

0.14.0 起每个组件都有子路径入口，按需引入即可绕开：

```ts
// 只把 tag / tooltip 两棵子树拉进模块图
import { Tag } from "@hulianui/ui/tag"
import { Tooltip, TooltipTrigger, TooltipContent } from "@hulianui/ui/tooltip"
```

子路径名就是组件的目录名（与文档站 URL 一致，`ProTable` → `@hulianui/ui/pro-table`）。
基础设施件同理：`@hulianui/ui/theme`、`@hulianui/ui/access`、`@hulianui/ui/config`、`@hulianui/ui/lib`。
两个入口导出的是同一份东西，混用没有问题 —— 子路径只是让打包器少看几百个文件。

**什么时候收益有限**：你本来就用到大半个库时，根 barrel 更省事。

### Next.js 消费方：这是最糟的一档，务必加一行配置

> 本节此前写着「走 Next.js / webpack 这类默认对 node_modules 做过依赖预打包的链路不必管」——
> **那句话是反的**，已更正（hulianui/hulian#34）。webpack 侧根本没有「依赖预打包」这回事，
> `optimizeDeps` 是 Vite/esbuild 的概念。

Next 不是「不必管」，而是比 Vite **更糟**，三层叠加：

1. **`transpilePackages` 是强制项，不是可选优化。** 本库源码分发，Next 默认不转译 node_modules，
   不加这条根本起不来 —— 而它的语义恰恰是把整棵 `src/` 放回 webpack 的 loader 路径，逐个走 SWC。
2. **webpack 没有依赖预打包。** 对应物只有 persistent cache，冷启动时不救场。
3. **dev 模式不做 tree-shaking。** webpack 的 `optimization.sideEffects` / `usedExports` 只在
   production 默认开启，所以本库 `sideEffects: false` 在 dev 下等于没写，根 barrel 全量进图。

Next 侧有一个正好对口的开关，且**在 dev 也生效**（不像 tree-shaker 只在 prod 跑）：

```js
// next.config.mjs
export default {
  transpilePackages: ["@hulianui/ui"],          // 强制项：源码分发必须转译
  experimental: {
    optimizePackageImports: ["@hulianui/ui"],   // 与上一条成对出现，别只写一半
  },
}
```

它的 barrel loader 会在编译期把 `import { Button } from "@hulianui/ui"` 改写成深路径导入。
本库根 barrel 是纯 `export *` + 每个组件目录都有 `index.ts`，静态完全可分析，正是这个 transform
的理想形态 —— **不需要你改任何一行业务代码**，这点比逐个改成子路径省事得多。

实测（Next 15.5.22 + webpack dev，从 npm 装 `@hulianui/ui@0.14.0`，页面只用 8 个组件）：

| 指标 | 只有 `transpilePackages` | 加 `optimizePackageImports` |
|---|---|---|
| 冷编译 `/`（全新 `distDir`） | 16.5 s | **3.9 s** |
| 模块数 | 7378 | **1730** |

⚠️ 它治的是**编译时间与模块图**，不是产物体积 —— 页面真正用到的重依赖该多大还是多大。

**用 Turbopack 的话不必加**（Next 16 起 `next dev` 默认就是 Turbopack）。我们在本仓文档站
（Next 16.2 + Turbopack）上实测两轮：加与不加分别是 13.9 s / 13.7 s，**没有可测差异** ——
Turbopack 自己就处理 barrel，上面那三层成因里的第 2、3 层对它不成立。
所以这条配置的适用面是**明确跑 webpack 的 dev**（Next 15 及以下，或 Next 16 显式关掉 Turbopack）。
加了也无害，只是别指望在 Turbopack 上看到同样的收益。

### Vite 消费方：装出来的没事，**软链的才是重灾区**

> 本节此前写着「Vite 默认不对 node_modules 里的源码包做预构建，必须显式 include」——
> 这句话对 Vite 7 只说对了一半，已按实测更正。

Vite 的依赖预打包（optimizeDeps）会从入口 HTML 出发扫描 bare import，把扫到的包用 esbuild
预打包进 `node_modules/.vite/deps/`。**正常 `pnpm add` 装进来的 `@hulianui/ui` 会被自动预打包**，
一整棵源码树因此塌缩成一个文件，dev 完全不吃亏 —— 这一档不需要你做任何配置。

真正的坑在**软链消费**（`link:` / `file:` 指向目录 / pnpm workspace，也就是一边改库一边跑下游的
双源开发模式）。Vite **有意跳过 linked 包的预构建**，因为它假定你正在改那个包、需要 HMR。
于是整棵 `src/` 回到逐文件 transform 的老路。实测同一个页面（引 8 个组件，Vite 7.3.6）：

| 消费方式 | 浏览器模块请求 | dev server RSS | `.vite/deps` 里有预打包产物 |
|---|---|---|---|
| `pnpm add`（tarball） | **16** | 43 MB | ✅ 自动 |
| **软链**（`link:`） | **250** | 83 MB | ❌ |
| 软链 + 下面这行配置 | **13** | 80 MB | ✅ |

请求数差 **15 倍**，且这是只用 8 个组件的量 —— 真实项目引十几个组件、跨多个页面，
模块图按同样的比例放大，这就是「dev server 常驻 3 GB、HMR 卡到点了没反应」的来源。

所以软链消费瑚琏时，预打包是**必需项而不是优化项**。0.15.0 起库自带一个插件替你判断：

```ts
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { hulian } from "@hulianui/ui/vite"

export default defineConfig({ plugins: [react(), hulian()] })
```

它只做一件事：**探测瑚琏是不是软链进来的**（读自己的 realpath 是否还在 `node_modules` 里），
是就注入 `optimizeDeps.include`，不是就什么都不做。所以**正常安装的项目加了也无害**，
可以无脑写进模板；只在真正生效时打印一行说明，其余时候安静。

代价是**库源码不再有 HMR** —— 改 `packages/ui` 下的文件要重启 dev server。
一边改库一边调下游时传 `hulian({ prebundle: false })` 换回来。冷启动那次预打包
约 4 秒（把 5204 个模块打成一个 9.4 MB 的 chunk），之后走缓存。

不想加插件就手写等价配置：

```ts
optimizeDeps: { include: ["@hulianui/ui"] }
```

> 这个插件和 `@hulianui/ui/vitest-preset` **不要互相套用**：那边是给 vitest 的，
> 治的是 SSR 转换 + Node 解析下的 React 分裂（需要 `dedupe` / `conditions` / `mainFields`）；
> 这边是给 dev server 的，治的是模块图膨胀。实测 Vite dev 会把所有 bare `import "react"`
> 重写到同一份预构建产物，React 不会分裂，所以这个插件**刻意不加 `dedupe`**。

> 重依赖组件（`markdown-editor`、`video`、`*-chart`、WebGL 特效系）目前仍在根 barrel 里
> （`_mui/*` 已移出，见第 2 节），
> 也就是说**根 barrel 依然会拖出全部 26 个 dependencies**。把它们移出根 barrel 是破坏性改动，
> 留到 1.0；在那之前，子路径引入（或 Next 的 `optimizePackageImports`）是唯一能真正瘦下来的办法。

---

## 5. 各入口到底多大（实测）

上一节说的都是**编译时间与模块图**；这一节是**产物体积** —— 你的用户真正要下载的字节。

数字由 `pnpm size` 实测：`pnpm pack` 出 tarball，装进一个仓库外的空白工程，
用 esbuild 打包 + minify + gzip。react 外部化（你本来就有），其余依赖全部计入。
CSS 不在其中（瑚琏的样式走你自己的 Tailwind 产物）。同一套脚本在 CI 里当门禁跑，
所以下面这张表不会随版本悄悄失真。

| 入口 | initial | total | 说明 |
|---|---|---|---|
| `@hulianui/ui/card` | 9.0 KB | 9.0 KB | 纯展示件的地板价 |
| `@hulianui/ui/tag` | 9.9 KB | 9.9 KB | |
| `@hulianui/ui/button` | 10.0 KB | 36.8 KB | 差额是动画引擎，懒加载（见下） |
| `@hulianui/ui/dialog` | 30.9 KB | 55.1 KB | Base UI 的 overlay 基建 |
| `@hulianui/ui/select` | 69.5 KB | 93.7 KB | |
| `@hulianui/ui/table` | 87.7 KB | 111.9 KB | 含 TanStack Table |
| `@hulianui/ui/chart` | 141.6 KB | 141.6 KB | recharts |
| `@hulianui/ui/pro-table` | 142.9 KB | 169.9 KB | 列表页整套编排 |
| `@hulianui/ui/date-picker` | 53.6 KB | 77.8 KB | 自研零依赖日期族（含共用的 Calendar 面板） |
| `@hulianui/ui/markdown-editor` | 193.8 KB | 220.8 KB | tiptap 全家 |
| `@hulianui/ui/video` | 61.9 KB | 116.5 KB | vidstack 自带懒加载 |
| `@hulianui/ui` **根 barrel** | **957.5 KB** | 1086.3 KB | 全库导出的上界 |

**initial 是首屏立刻要下的，total 含之后按需加载的 chunk。** 两个数差得多的入口，
说明它把大头推到了首屏之后；两个数相等的，进来就得全付。

几点值得注意：

- **每个入口都含约 8 KB 的 `tailwind-merge`** —— 它是 `cn()` 的运行时，全库共用一份，
  多引几个组件不会重复计费。所以「9 KB 的 Card」里真正属于 Card 的不到 1 KB。
- **动画引擎（motion 的 `domAnimation`，约 24 KB）走 `import()` 单独成 chunk**，
  不在任何组件的首屏关键路径上。代价是它到达之前 `m.*` 渲染为无动画元素 ——
  慢网络下「一进页面就播」的入场动画可能少播一次淡入。**不会卡在不可见**：
  features 缺席时组件以最终态呈现，而不是停在 `opacity: 0`。
  交互触发的动效（按压、hover、overlay 开合）完全不受影响。
  （本仓文档站逐帧实测：入场动画照常逐帧推进，chunk 到得比动画该开始的时刻还早。）
- **根 barrel 的 1 MB 是「用满全库」的上界**，不是你一定会付的价 —— 打包器 tree-shaking 后
  只留你用到的部分。但 dev 模式不做 tree-shaking，所以上一节那条配置仍然要加。

想看某个入口为什么这么大：

```bash
pnpm size                                   # 全表
bash scripts/bundle-size.sh --why button    # 某个入口的体积构成归因
```

### 字节之外：编译压力是另一把尺子，结论常常相反

上面那张表量的是**用户的下载压力**。开发者关心的另一件事 —— dev server 吃多少内存、
冷启动等多久、HMR 卡不卡 —— 由**模块数**决定，和字节数不是一回事：

| 入口 | 产物字节 | 模块数 |
|---|---|---|
| `@hulianui/ui/video` | 61.9 KB | **39** |
| `@hulianui/ui/button` | 10.0 KB | **415** |
| `@hulianui/ui/card` | 9.0 KB | 7 |
| `@hulianui/ui` 根 barrel | 1095 KB | **5204** |

Video 的产物是 Button 的 6 倍字节，模块数却只有它的十分之一 —— 因为 vidstack 发的是打包好的
dist（少数大文件），而 motion 发的是细碎 ESM（一个函数一个文件）。打包器的成本是按**文件个数**
付的：每个文件都要 resolve、parse、transform，并在模块图里占一个常驻节点。

**dev 模式不做 tree-shaking**，所以 prod 里被剪掉的东西在 dev 里全都要过一遍。
实测（Vite 7，同样 8 个组件）：

| 引入方式 | 模块数 | 内存增量 | transform 耗时 |
|---|---|---|---|
| 根 barrel | **809** | 184~261 MB | 5~21 s |
| 子路径 | **30** | 1~2 MB | ~0.2 s |
| 单个轻组件（地板） | 4 | ~0 | ~0.05 s |

**27 倍模块。** 耗时和内存给的是区间 —— 它们随机器负载浮动（同一台机器两次跑相差 4 倍），
模块数才是稳定可比的那个数；但三者同向，量级差距是真的。

### 还有一层：IDE 的类型检查 —— 0.28.0 已用预编译 `.d.ts` 解决

打包器的负担可以靠预打包卸掉（`optimizeDeps` / `optimizePackageImports` 都是把源码树塌缩成
预打包产物），**但 tsserver 吃不到这个好处**。0.28.0 之前，IDE 与 `tsc` 里的类型检查直面我们
发出去的 `.tsx` 源码，`skipLibCheck` 只跳 `.d.ts`、跳不过源码，于是「IDE 卡」是一个独立于
「dev server 卡」的问题。

0.27.0 时代只 `import` **一个** Button 的固定成本（同机同时段，两个 TypeScript 大版本各跑一次）：

| 引入方式 | Files | tsc 内存 | tsc 耗时 |
|---|---|---|---|
| 根 barrel · TS 5.9 | 3018 | **703 MB** | 9.2 s |
| 根 barrel · TS 7.0 | 3018 | **668 MB** | 1.4 s |
| 子路径 · TS 5.9 | 83 | 105 MB | 0.57 s |
| 子路径 · TS 7.0 | 82 | 58 MB | 0.07 s |

一个 Button 就要 700 MB —— 这就是 tsserver 在大项目里常驻 1~2 GB 的来源。
**TypeScript 7 也不是这件事的解药**：它把耗时打下 6.8 倍（Go 重写的收益，真金白银），
但**内存只降了 5%、Files 一个没少**（3018 → 3018）—— 内存是按文件数吃的，而 TS7 只是同一套
类型系统换了实现，program 里该有多少文件还是多少。

**0.28.0 起 `exports` 的 `types` 条件改指随包发的 `dist/*.d.ts`**（`default` 仍是源码，
所以 Tailwind 的 `@source` 扫描、HMR、点进源码看实现全都不受影响）。同一个工程、
同机同时段，引 12 个组件（根 barrel）的实测（TS 7.0）：

| 类型入口 | Files | tsc 内存 | tsc 耗时 |
|---|---|---|---|
| 源码（0.27.0 形态） | 2242 | **699 MB** | 1.53 s |
| 预编译 `.d.ts`（0.28.0） | 1872 | **88 MB** | 0.27 s |

**内存降到八分之一，耗时快 5.6 倍**，而且这个收益**不随组件用量增长** —— 声明文件按需引入，
不再把整棵 `src` 拖进 program。原报告里「只用 10 个组件，typecheck 从 90s 涨到 2m40s」
（hulianui/hulian#156）说的就是这条。

**打包器那一半没变**：`default` 仍是源码，所以上面「27 倍模块」那张表原样成立。
**子路径引入依然值得做**，只是理由从「同时救打包器和 IDE」收窄回「救打包器与 dev server」。

自己跑一遍（两层一起量）：

```bash
pnpm compile-cost
```

（这把尺子没进 CI：编译耗时受机器负载影响大，做成门禁只会 flaky。它是诊断工具，
怀疑「库把我的 dev / IDE 拖慢了」时拿它取证。）

---

## 6. 官方支持的 TypeScript 配置矩阵

0.28.0 起，`types` 条件指向随包发的预编译 `.d.ts`，所以**你的严格档不再直接作用在库内源码上**
（`skipLibCheck` 对 `.d.ts` 生效）。下表因此比 0.27.0 宽了一档。

⚠️ 仍要留意：`default` 条件依然是 `.tsx` 源码，**你的打包器**照旧编译它 ——
Babel/SWC/esbuild 的语法档、`jsx` 设置、Tailwind `@source` 这些约束一条没少。

### 承诺支持（CI 每次都跑）

| 项 | 值 |
|----|----|
| TypeScript | **5.x 与 7.x 双版本**（`scripts/consumer-typecheck.sh` 各跑一遍） |
| `strict` | `true` |
| `noImplicitOverride` | `true`（不在 strict 家族里，但消费方常开，故承诺） |
| `noUnusedLocals` / `noUnusedParameters` | `true`（同上；0.28.0 起承诺，见 hulianui/hulian#155） |
| `noUncheckedIndexedAccess` | `true`（0.28.0 起承诺，见下） |
| `skipLibCheck` | `true`（**是上一条成立的前提**：类型走 `.d.ts`，靠它整体跳过） |
| `moduleResolution` | `Bundler` |
| `jsx` | `react-jsx` |
| `types` | **不写**（复刻只跑浏览器的消费方；不假设有 `@types/node`） |

门禁走 `pnpm pack` 产物、装在仓库之外、只装声明的 peer，一个可选依赖都不装 ——
即「装出去的那份」本身能在上述配置下 `tsc --noEmit` 通过。

### `noUncheckedIndexedAccess`：0.27.0 的已知边界，0.28.0 已解除

0.27.0 及以前开了它，库内约 300 处索引访问会在**你的**编译里报 TS2532/TS18048
（hulianui/hulian#56），而这类错误不能机械加 `!`（那是把真实的 undefined 风险从编译期
挪到运行时），所以当时只能列为已知边界。

0.28.0 起类型走预编译 `.d.ts`（#156）—— 声明文件里没有表达式，也就没有索引访问，
这条随之消失，不需要你改任何配置。门禁里已经开着这一项。

### 目前**不**承诺

- 「逐文件语义级」严格项（`exactOptionalPropertyTypes` 等）未逐一验证。
  它们大概率也随 `.d.ts` 一起不成问题了，但没验过的事不写进承诺表 —— 需要哪一项请提 issue，
  我们把它加进 `scripts/consumer-typecheck.sh` 再承诺。
- `skipLibCheck: false`：上面整张表都以它为 `true` 为前提。

改这张表**必须同步改** `scripts/consumer-typecheck.sh` 里的 `write_tsconfig`：
那份 tsconfig 就是这张表的可执行版本，两边漂了这张表就是空头支票。

## 7. 组件属性透传的口径（0.28.0 起）

封闭的 props 接口是这个库最常见的失效方式：缺一个 `onBlur` 就接不上
react-hook-form 的 `Controller`，缺一个 `title` 就没法挂 tooltip，于是整块 UI 退回手搓。
0.28.0 起按下面两条走，写新组件也照这条办：

| 组件类别 | 口径 | 例 |
|---|---|---|
| 纯展示件 | 继承根节点的 `HTMLAttributes<T>` | `Tag` / `Badge` / `Chip`（#148） |
| **表单受控件** | 同上，且 **`onBlur` 必须能传到根**——「能不能接 `Controller`」是验收项 | `InputOTP` / `Rating` / `Segmented` / `Calendar` / `TimeField` …（#157） |

两条注意：

- **同名异义的 prop 会被 `Omit` 掉**，此时以组件自己的语义为准：`Rating.color` 是星色（不是
  HTML 的 `color` 属性）、`SecretField.onCopy` 回吐的是密钥原值（不是剪贴板事件）、
  `EmojiPicker.onSelect` 回吐 emoji 字符串（不是原生 `select` 事件）。查该组件文档的 Props 表。
- **组件自身的 `role` / `aria-*` / 键盘处理赢**：`rest` 展开在根节点属性的**最前面**，
  所以你传的 `role` 不会顶掉 `Listbox` 的 `role="listbox"`。这是有意的——那些属性一旦被顶掉，
  组件的无障碍语义与键盘导航当场失效。想换语义请提 issue，不要靠覆盖。

**还没拉平的**：`Cascader` / `TreeSelect` / `CountrySelect` / `RegionCascader` /
`DatePicker` 族这些 Popover 包壳的选择器 —— 它们的"根"不是一个 DOM 节点，
`id` / `data-*` 该落触发器还是浮层要逐件定，机械展开会静默落错位置。需要哪个先提 issue。

## 8. 几个不那么致命但值得先知道的

- **`Table` 不开 `rowDraggable` 就不会碰 dnd-kit**（0.11.0 起）。此前 `useSensors` 写在组件顶层，
  任何用了 `Table` 的下游都会拉起整条 dnd-kit 运行时；现在这些 hook 收在只有开了拖拽才挂载的
  子组件里。你仍需要让 `@dnd-kit/*` 解析正确（上面第 1 条），但不再因为「表格没开拖拽」而无故受牵连。
- **`Pagination` 的 `total` 是总页数，不是总条数**，与几乎所有后端回的 `total` 反向。
  接后端数据请用 `totalItems` + `pageSize`（0.11.0 起）。语义修正留到 1.0。
- **接客户端路由用 `render` 口子**：`<Link render={<NextLink href="/a" />}>`、
  `<Button render={<NextLink href="/a" />}>`。`href` 要写在被 render 的那个元素上，
  写在瑚琏这层传不下去。
- **Tailwind v4**：瑚琏的类名在你的项目里要能被扫到，`@source` 需覆盖 `@hulianui/ui` 的源码路径。
  详见 [README](../README.md) 的接入段。

---

## 9. ConfigProvider：非中文应用的必需品

组件带着一批内置文案：`NumberField` 的 ± 按钮、`Table` 空态、`Spinner` 的 `role=status`、
`Select` 的搜索占位与空态、`Tag` 的关闭按钮……没挂 `ConfigProvider` 时它们**回退成 zh-CN**。

回退本身是设计使然（组件必须能脱离 Provider 渲染，所以不抛错）。真正的问题是它**完全静默**：

- 不报错，`ConfigProvider` 在类型上也是可选的；
- typecheck / lint / guard 全绿；
- 视觉上看不出来 —— 这些文案大半在 `aria-label` 里，**只有读屏用户和 e2e 断言会撞到**。

漏 `ThemeProvider` 页面立刻不对，漏 `ConfigProvider` 页面看起来完全正常，能带着一屏中文
读屏标签活过一整轮迁移（hulianui/hulian#164 就是这么发现的）。为此库在**开发期**会就此
`console.warn` 一次（`NODE_ENV=production` 与 `NODE_ENV=test` 下零成本、不打印），
但那是兜底不是设计 —— 该挂还是要挂。

```tsx
import { ThemeProvider, ConfigProvider, enUS } from "@hulianui/ui";

<ThemeProvider>
  <ConfigProvider locale={enUS}>{children}</ConfigProvider>
</ThemeProvider>;
```

中文应用可以省（内置文案本来就是 zh-CN）；**其它任何语言都不能省**。

### 只有 `zhCN` / `enUS` 两本字典，其余语言 spread `enUS`

```ts
import { enUS, type Locale } from "@hulianui/ui";

export const frFR: Locale = {
  ...enUS,
  table: { ...enUS.table, empty: "Aucune donnée" },
  components: {
    ...enUS.components,
    numberField: { decrement: "Diminuer", increment: "Augmenter" },
  },
};
```

一定要 spread 而不是从零写一份：这样将来版本新增的键自动有英文兜底，不会因为漏键渲染出
`undefined`。注意 `components` 是嵌套的一层，展开外层不会带上它的内容，要覆盖里面某个组件
就得像上面那样再展开一次 `...enUS.components`。

### `Locale` 的键长什么样

顶层按组件分节，低层原语的文案统一收在 `components` 下：

| 层 | 键 |
|------|------|
| `Locale` 顶层 | `table` · `proTable` · `adminLayout` · `modalForm` · `editableTable` · `proForm` · `stepsForm` · `drawer` · `loginForm` · `clickCaptcha` · `passwordGenerator` · `components` |
| `Locale["components"]` | 低层原语，按组件名分节：`popconfirm` · `toast` · `alert` · `tag` · `select` · `spinner` · `numberField` · `upload` · `pagination` · `combobox` …（100+ 节，随版本增长） |

**别把完整清单抄进自己的代码库**，它每个版本都在长。要当前实装版本的全量键就从字典自己打，
这份输出永远与你装的那一版一致：

```ts
import { enUS } from "@hulianui/ui";

const walk = (o: object, prefix = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? walk(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
console.log(walk(enUS).join("\n"));
```

参数化文案（如 `proTable.total(count)`、`table.filter(column)`）是函数，会被上面这段当成叶子
打出来，签名去 `Locale` 类型里查。

### 接到自己的 i18n 上

多语言产品在应用根架一层桥，跟着当前语言切：

```tsx
export function HulianLocaleProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const locale = useMemo(
    () => (i18n.resolvedLanguage?.startsWith("zh") ? zhCN : enUS),
    [i18n.resolvedLanguage],
  );
  return <ConfigProvider locale={locale}>{children}</ConfigProvider>;
}
```

MCP 消费方可以直接取这一片：`get_setup_guide({ target: "locale" })`；
`inspect_project` / `audit_hulian_adoption` 也会在扫不到 `ConfigProvider` 时报一条建议。

---

## 10. 升级时的 lockfile：tiptap 那一族要一起走

`MarkdownEditor` / `RichTextEditor` 底下是 tiptap，而 **tiptap 全家的 `peerDependencies` 钉的
是精确版本**，不是范围：

```
@tiptap/extension-table@3.30.0 → { "@tiptap/core": "3.30.0", "@tiptap/pm": "3.30.0" }
@tiptap/core@3.30.0            → { "@tiptap/pm": "3.30.0" }
```

也就是说这一族只有「在同一次解析里被一起决定」才自洽。全新安装天然满足这个前提；
**带着旧 lockfile 升级时不一定满足**——某个版本如果给这一族新添了成员（0.30.0 就为
`RichTextEditor` 添了 4 个扩展），而你的锁里 `@tiptap/core` / `@tiptap/pm` 早已固定在老版本，
那么只有新成员会被解析到当时的最新版，装出来是 `extension@3.30.0 + core@3.29.2` 这种错配组合，
`pnpm install` 会刷一串 unmet peer 警告（hulianui/hulian#207）。

**0.31.0 起库侧已经把这条约定机械化**：新增 tiptap 家族成员的同一次改动里，全族 specifier
必须一起抬高（CI 有静态门禁 `pnpm deps:family` 守着）。老成员的 specifier 一变，你锁里对它们的
固定就失效了，于是整族在同一次解析里一起前进——正常升级不需要你做任何额外动作。

如果你手上是**已经装成错配状态**的旧环境（从 0.30.0 升上来的那批），刷一次锁即可：

```bash
pnpm update "@tiptap/*"
```

只动 lockfile。**不要**为了消警告把 `@tiptap/*` 写进自己的 `package.json` 或 `pnpm.overrides`——
那是把库的内部实现细节抬进业务仓，下次库侧调整依赖时你还得跟着改。

> 顺带一提：`tiptap-markdown` 不在这一族里（它的 peer 是 `^3.0.1`，是正常范围），不受影响。
