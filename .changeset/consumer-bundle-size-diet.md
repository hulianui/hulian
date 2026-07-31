---
"@hulianui/ui": patch
---

消费方产物瘦身：Button 首屏 -75%，凡用图标的组件均 -3.7 KB

三处改动，都不动任何 API：

**`_icons` 补 `/*#__PURE__*/` —— 全库受益**

67 个内联图标都是 `createIcon(...)` 的调用结果。打包器对顶层函数调用一律保守：无法证明无副作用就整条留下。于是**任何组件只要引一个图标，67 个全进它的 bundle**。Button 只用 `Loader2`，产物里却背着 11.6 KB 的完整图标集。加上 PURE 标注后 Tag 从 13.6 KB 降到 9.9 KB（**-27%**），Table、ProTable、MarkdownEditor、Video 各降约 3.7 KB。

新增图标时记得连 `/*#__PURE__*/` 一起写，`_icons/index.tsx` 顶部有说明。

**动画引擎改按需加载 —— Button 40.1 KB → 10.0 KB**

`LazyMotionProvider` 的 `features` 从静态 `domAnimation` 改为 `import()`，约 24 KB 的动画引擎因此切成独立 chunk，不再占用任何组件的首屏关键路径。

行为上：features 到达之前 `m.*` 渲染为无动画元素，慢网络下「一进页面就播」的入场动画可能少播一次淡入。**不会卡在不可见** —— features 缺席时元素以最终态呈现，不是停在 `opacity: 0`。交互触发的动效（按压、hover、overlay 开合）完全不受影响。文档站逐帧实测：入场动画照常逐帧推进，chunk 到得比动画该开始的时刻还早。

**ProTable 的虚拟滚动补上文档与测试**

`virtual` 一直随 `...tableProps` 透传给内部 Table，能力早就有，但整个 `pro-table/` 目录没有一处写着 "virtual"，文档也没提，很容易被当成不支持而把上万行直接铺进 DOM。现在 Props 段显式点名，并加了测试钉住这条隐式透传契约（连同 Table 自身的虚拟滚动 —— 它此前同样没有任何测试保护）。

**配套：两把尺子 + 一处文档更正**

- `pnpm size` —— 体积门禁（已进 CI）。pack 出 tarball → 仓库外空白工程 → esbuild 打包量 gzip，基线在 `scripts/size-limits.json`；`--why <入口>` 看体积构成。
- `pnpm compile-cost` —— 编译压力诊断（不进 CI，耗时受机器负载影响太大）。量 dev 模块图规模、内存，以及 tsc 的 Files/内存/耗时。实测同样 8 个组件，根 barrel 是子路径的 **27 倍模块**；只 import 一个 Button，根 barrel 让 tsc 吃 **722 MB / 3020 files**，子路径只要 105 MB / 83 files —— 而这一层 `optimizeDeps` / `optimizePackageImports` 都救不了，它们只塌缩打包器的模块图，tsserver 照样直面源码。

`docs/consuming.md` 里「Vite 默认不对 node_modules 里的源码包做预构建」一句按实测更正：Vite 7 对**正常 `pnpm add` 装进来**的瑚琏会自动预打包（16 个模块请求 / 43 MB），**软链消费**才会退回逐文件 transform（250 个请求）——那时 `optimizeDeps.include` 是必需项而非优化项。
