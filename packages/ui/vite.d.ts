// ESM 侧的类型入口。声明的单一真源是 `./vite.d.cts`（实现也在 `.cjs` 一侧，
// 原因见那里的「为什么实现写成 CJS」）。ESM 引用 CJS 是合法方向，反过来不是。
export * from "./vite.cjs";
export { default } from "./vite.cjs";
