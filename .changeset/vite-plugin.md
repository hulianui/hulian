---
"@hulianui/ui": minor
---

新增 `@hulianui/ui/vite` —— 软链消费时自动修好 dev server

```ts
// vite.config.ts
import { hulian } from "@hulianui/ui/vite"
export default defineConfig({ plugins: [react(), hulian()] })
```

**治的病**：Vite **有意跳过 linked 包的依赖预打包**（`link:` / workspace / `file:` 指向目录），
因为它假定你正在改那个包、需要 HMR。于是源码分发的瑚琏回到逐文件 transform 的老路。
实测同一页面（引 8 个组件，Vite 7.3.6）：

| 消费方式 | 浏览器模块请求 | dev server RSS |
|---|---|---|
| `pnpm add`（tarball） | 16 | 43 MB |
| **软链** | **250** | 83 MB |
| 软链 + 本插件 | **13** | 80 MB |

请求数差 15 倍，而这只是 8 个组件的量 —— 真实项目引十几个组件、跨多个页面按同样比例放大，
就是「dev server 常驻数 GB、HMR 卡到点了没反应」。

**怎么判断**：插件读自己的 realpath 是否还在 `node_modules` 里 —— pnpm 正常安装会落在
`.pnpm/@hulianui+ui@x.y.z/...`，软链则落在你的仓库目录。所以**正常安装的项目加了也无害**
（探测到不是软链就什么都不做，且保持安静），可以直接写进项目模板。

**代价**：预打包意味着库源码不再有 HMR，改 `packages/ui` 后需重启 dev server；
正在改库时传 `hulian({ prebundle: false })` 换回来。冷启动那次预打包约 4 秒
（5204 个模块 → 一个 9.4 MB chunk），之后走缓存。

**刻意不做的事**：不加 `resolve.dedupe`。实测 Vite dev 会把所有 bare `import "react"` 重写到
同一份预构建产物，React 不会分裂，加了是噪音。这与 `@hulianui/ui/vitest-preset` 需要 dedupe
并不矛盾 —— 那边走的是 SSR 转换 + Node 解析，没有浏览器侧预构建统一这一层。两个环境两套配置，
别互相套用。

`vite` 以 optional peer 声明（`>=5`），不用 Vite 的消费方不受影响。插件只用 `config` /
`configResolved` 两个钩子与 `optimizeDeps`，这些在 Vite 5~8 都稳定 —— Vite 8 换 Rolldown 后
预打包仍在，linked 包仍默认跳过。
