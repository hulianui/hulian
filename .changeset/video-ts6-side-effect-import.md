---
"@hulianui/ui": patch
---

修复：升到 TypeScript 6/7 的消费方一 `import { Video }` 就报 TS2882

`video.tsx` 里的 `import "@vidstack/react/player/styles/base.css"` 是一条 side-effect import，
而 vidstack 没有随包提供样式表的类型声明。TypeScript **6.0 起** `noUncheckedSideEffectImports`
默认为 `true`，于是这条 import 直接报错：

```
TS2882: Cannot find module or type declarations for side-effect import of
'@vidstack/react/player/styles/base.css'.
```

因为瑚琏是**源码分发**（`exports "." → "./src/index.ts"`，消费方直接编译这份源码），
这不是我们仓内的小事 —— **任何已经升到 TS 6/7 的下游只要引了 Video 就当场编译失败**，
与我们自己升不升 TypeScript 无关。用 TS 7.0.2 在一个仓库外的干净消费方工程实测复现、并验证修复。

修法：新增 `src/video/vidstack-css.d.ts` 声明该样式路径，并在 `video.tsx` 顶部加三斜线引用把它
带进下游的 program（消费方的 tsconfig 只 include 自己的 src，不会自动加载库里的 `.d.ts`）。

两个刻意的选择，改动时请勿"顺手优化"：

- **用带包名前缀的通配** `declare module "@vidstack/react/player/styles/*.css"`，而不是全局
  `declare module "*.css"` —— 后者会顺着源码分发渗进消费方的类型环境，把他们自己的
  CSS Module 类型一起吃掉。
- **三斜线必须排在 `"use client"` 之前**。三斜线指令只在任何语句之前才生效，而 `"use client"`
  是一条 ExpressionStatement；排在它后面会被当成普通注释静默失效（实测过：放下面时消费方仍报
  TS2882，且库内因为 tsconfig 的 `src/**/*.ts` 会自动 include 那份 `.d.ts` 而**假绿**）。
  指令前允许有注释，所以这个顺序对 `"use client"` 本身没有影响。

对 TS 5.x 消费方无任何影响（那里本就不报这条）。
