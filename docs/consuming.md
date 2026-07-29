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

**Vite 侧**已经踩上又暂时不想改 import 的，止血是强制预打包（Vite 默认不对 node_modules 里的
源码包做预构建，必须显式 include）：

```ts
// vite.config.ts
optimizeDeps: { include: ["@hulianui/ui"] }
```

> 重依赖组件（`_mui/*`、`markdown-editor`、`video`、`*-chart`、WebGL 特效系）目前仍在根 barrel 里，
> 也就是说**根 barrel 依然会拖出全部 26 个 dependencies**。把它们移出根 barrel 是破坏性改动，
> 留到 1.0；在那之前，子路径引入（或 Next 的 `optimizePackageImports`）是唯一能真正瘦下来的办法。

---

## 4. 几个不那么致命但值得先知道的

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
