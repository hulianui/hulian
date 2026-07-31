# 消费方集成约束

> 面向**在自己的仓库里装 `@hulianui/ui`** 的人。
> 这里只写「不写明就一定会踩」的几条，不是使用教程。

瑚琏是**源码分发**的：`package.json` 的 `exports` 直接指向 `src/index.ts`，你的打包器编译的是
这份 TypeScript 源码，而不是预编好的产物。好处是 tree-shaking 干净、能直接跳进源码看实现、
主题变量走你自己的 Tailwind 管线；代价是**瑚琏依赖的第三方包由你的解析器去找**，
于是模块解析的锅归消费方。下面两条都是这个代价的直接后果。

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

**别忘了装 peer**：`@base-ui/react` 是 peerDependency，你的 `package.json` 里必须有它，
否则 dedupe 无从谈起（根本没有第二份可去重，是压根找不到）。当前 peer 清单：

```json
{
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18",
    "@base-ui/react": ">=1.0.0",
    "motion": ">=11",
    "tailwindcss": ">=4"
  }
}
```

> 为什么不干脆把 `@mui/material` / `@dnd-kit/*` 也改成 peerDependency？
> 因为根 barrel（`src/index.ts`）会把全部组件拉进模块图，改成 peer 等于要求**每个**消费方
> 都装齐十来个包才能 `import { Button }`。在 0.x 阶段这个代价不划算，所以选择「保持 dependency
> + 把解析约束显式化成可 import 的预设」。语义如有变化会写进 CHANGELOG。

---

## 2. `_mui` 桥接族必须置于 `MuiBridgeProvider` 之内

涉及组件：`Rating`、`Stepper`、`Calendar`、`DatePicker`、`DateTimePicker`、`TimeField`。

桥主题把 `theme.alpha` 重写成 `color-mix`（好让 MUI 读瑚琏的 OKLCH token，单一真源）。
不挂 Provider 时，MUI 核心件（如日期族头部那个 IconButton）会对 `var(--color-*)` 调 `alpha()`
并直接抛 `Unsupported color`。**真实浏览器同样触发**，不是只在测试里出现。

整个应用挂一次即可，通常在根 layout：

```tsx
import { ThemeProvider, MuiBridgeProvider } from "@hulianui/ui"

export default function RootLayout({ children }) {
  return (
    <ThemeProvider>
      <MuiBridgeProvider>{children}</MuiBridgeProvider>
    </ThemeProvider>
  )
}
```

不用日期/评分/步骤条这几件的话，不挂也没关系 —— 它不是全局必需品。

---

## 3. 只用少数几个组件时，从子路径引入

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

> 重依赖组件（`_mui/*`、`markdown-editor`、`video`、`*-chart`、WebGL 特效系）目前仍在根 barrel 里，
> 也就是说**根 barrel 依然会拖出全部 26 个 dependencies**。把它们移出根 barrel 是破坏性改动，
> 留到 1.0；在那之前，子路径引入（或 Next 的 `optimizePackageImports`）是唯一能真正瘦下来的办法。

---

## 4. 各入口到底多大（实测）

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
| `@hulianui/ui/pro-table` | 142.9 KB | 170.0 KB | 列表页整套编排 |
| `@hulianui/ui/_mui` | 144.5 KB | 144.5 KB | MUI + emotion 桥 |
| `@hulianui/ui/markdown-editor` | 193.8 KB | 220.8 KB | tiptap 全家 |
| `@hulianui/ui/video` | 61.9 KB | 116.5 KB | vidstack 自带懒加载 |
| `@hulianui/ui` **根 barrel** | **1086.8 KB** | 1215.6 KB | 全库导出的上界 |

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

### 还有一层：IDE 的类型检查，`optimizeDeps` 救不了

打包器的负担可以靠预打包卸掉（`optimizeDeps` / `optimizePackageImports` 都是把源码树塌缩成
预打包产物），**但 tsserver 吃不到这个好处** —— IDE 里的类型检查永远直面我们发出去的 `.tsx`
源码，`skipLibCheck` 也只跳 `.d.ts`、跳不过源码。所以「IDE 卡」和「dev server 卡」是两个
独立的问题。

实测只 `import` **一个** Button 的固定成本（同机同时段，两个 TypeScript 大版本各跑一次）：

| 引入方式 | Files | tsc 内存 | tsc 耗时 |
|---|---|---|---|
| 根 barrel · TS 5.9 | 3018 | **703 MB** | 9.2 s |
| 根 barrel · TS 7.0 | 3018 | **668 MB** | 1.4 s |
| 子路径 · TS 5.9 | 83 | 105 MB | 0.57 s |
| 子路径 · TS 7.0 | 82 | 58 MB | 0.07 s |

一个 Button 就要 700 MB —— 这就是 tsserver 在大项目里常驻 1~2 GB 的来源。

**TypeScript 7 不是这件事的解药，别指望升上去就没事了。** 它把耗时打下 6.8 倍（Go 重写的
收益，真金白银），但**内存只降了 5%、Files 一个没少**（3018 → 3018）。原因是 TS7 只是同一套
类型系统换了实现，program 里该有多少文件还是多少 —— 而内存是按文件数吃的。所以「引一个
Button 拖进三千个文件」这条在 TS7 下原样成立。

**结论：子路径引入是唯一同时救打包器和 IDE 的手段。** Next 的 `optimizePackageImports`
只治前者，IDE 那半边它管不着；换 tsc 实现治的是速度，也不是这一条。

自己跑一遍（两层一起量）：

```bash
pnpm compile-cost
```

（这把尺子没进 CI：编译耗时受机器负载影响大，做成门禁只会 flaky。它是诊断工具，
怀疑「库把我的 dev / IDE 拖慢了」时拿它取证。）

---

## 5. 几个不那么致命但值得先知道的

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
