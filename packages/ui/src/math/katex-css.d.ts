// KaTeX 的样式表没有随包提供类型声明，而 TypeScript **6.0 起** `noUncheckedSideEffectImports`
// 默认为 true —— 于是 `import "katex/dist/katex.min.css"` 会报
// TS2882: Cannot find module or type declarations for side-effect import。
//
// 与 vidstack-css.d.ts 同一个形状、同一个理由：瑚琏是源码分发（`exports "." → "./src/index.ts"`），
// 消费方直接编译这份源码，任何已经升到 TS 6/7 的下游只要 `import { Formula }` 就当场吃这条错误。
// 这是**下游缺陷**，与我们自己升不升 TS 无关。
//
// 刻意用带包名前缀的通配（而不是全局 `declare module "*.css"`）：全局形式会顺着源码分发
// 渗进消费方的类型环境，把他们自己的 CSS Module 类型也一并吃掉。
//
// 光有这个文件还不够 —— .d.ts 只在被 include 时才生效，库内 tsconfig 的 `src/**/*.ts` 能扫到它，
// 但消费方的 tsconfig 只 include 自己的 src。因此 math.tsx 里配了一条三斜线引用，
// 让这份声明跟着 math.tsx 一起被拉进消费方的 program。两者缺一，下游就还是 TS2882。
declare module "katex/dist/*.css";
