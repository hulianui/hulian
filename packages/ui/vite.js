/**
 * `@hulianui/ui/vite` 的 ESM 入口 —— 实现与全部文档在 `./vite.cjs`。
 *
 * 消费方的 `vite.config.ts` 走 ESM 还是 CJS 由**他们的** `package.json` `type` 字段决定，
 * 两条路都必须能加载（#143）。CJS 侧只能 `require` CJS，所以实现落在 `.cjs`。
 */

import plugin from "./vite.cjs";

export const hulian = plugin;

export default plugin;
