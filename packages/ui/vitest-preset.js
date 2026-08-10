/**
 * `@hulianui/ui/vitest-preset` 的 ESM 入口 —— 实现与全部文档在 `./vitest-preset.cjs`。
 *
 * 拆成两份不是历史包袱：消费方的 `vitest.config.ts` 走 ESM 还是 CJS 由**他们的**
 * `package.json` `type` 字段决定，两条路都必须能加载（#143）。CJS 侧只能 `require` CJS，
 * 所以实现必须落在 `.cjs`；这份 ESM 包装再把它转出去，两侧拿到的是同一个对象。
 */

import preset from "./vitest-preset.cjs";

// 走默认导入再解构，而不是 `export { withHulian } from "./vitest-preset.cjs"`：
// 后者要求 Node 的 cjs-module-lexer 能从 `module.exports = { … }` 里静态认出具名导出，
// 认不出就是加载期报错。默认导入拿到的就是 module.exports 本身，没有这层依赖。
export const { hulianDedupe, hulianConditions, hulianMainFields, hulianInlineDeps, withHulian } =
  preset;
