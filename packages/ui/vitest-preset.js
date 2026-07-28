/**
 * 瑚琏消费方的 Vitest / Vite 解析预设。
 *
 * 为什么需要它：`@hulianui/ui` 是**源码分发**（`exports` 指向 `src/index.ts`），消费方自己编译
 * 这份源码，于是瑚琏依赖的第三方包由消费方的解析器去找。在 vitest（jsdom + Vite 的 SSR 解析）
 * 下很容易解析出**第二份 React** —— 报错形态是 `useRef` / `useId` / `useContext` / `useMemo`
 * 读到 null，而**栈顶落在第三方包内部**，每次都像是「那个组件坏了」，实际是 React 实例分裂。
 *
 * 分界线不是「哪个包」，而是**这个包的模块形态**，四类各需要一条不同的配置：
 *
 * | 依赖形态                                     | 需要的配置        |
 * |---------------------------------------------|-------------------|
 * | 自研零依赖件（只 import react）              | `dedupe`          |
 * | `@base-ui/react`（纯 ESM，peerDependency）   | `dedupe` + 消费方自己装上这个 peer |
 * | `@mui/material` / `@emotion`（有 exports，但 `import` 指向 `.cjs.mjs` 壳） | `conditions` 让 `module` 先于 `import` |
 * | `@dnd-kit/*`（**无 exports**，只有 legacy main/module） | `mainFields` 让 `module` 先于 `main` |
 *
 * 外加 `server.deps.inline` 覆盖瑚琏这棵树，让它走 Vite 的转换管线而不是 Node 的 require。
 *
 * 用法：
 * ```ts
 * // vitest.config.ts
 * import { defineConfig } from "vitest/config"
 * import react from "@vitejs/plugin-react"
 * import { withHulian } from "@hulianui/ui/vitest-preset"
 *
 * export default defineConfig(withHulian({
 *   plugins: [react()],
 *   test: { environment: "jsdom", setupFiles: ["./vitest.setup.ts"] },
 * }))
 * ```
 *
 * 只想自己拼的话，直接取下面几个常量往自己的 config 里合并即可。
 */

/** 必须全局唯一实例的包。React 分裂是绝大多数「hook 读到 null」的真因。 */
export const hulianDedupe = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react/jsx-dev-runtime",
  "@base-ui/react",
  "@emotion/react",
  "@emotion/styled",
  "@mui/material",
  "motion",
];

/**
 * 启用 `module` 条件：`@mui/material` / `@emotion/*` 的 exports 里 `module` 排在 `import` 之前，
 * 不启用就会落到 `import` 那条 —— 它指向 `.cjs.mjs` 互操作壳，会另起一份模块实例。
 * 另外两项与 Vite 的客户端默认条件一致，一并列出是因为显式设置 `conditions` 会**替换**默认值。
 */
export const hulianConditions = ["module", "browser", "development|production"];

/** `@dnd-kit/*` 没有 `exports` 字段，只有 legacy `main`(CJS) / `module`(ESM)，必须优先取后者。 */
export const hulianMainFields = ["module", "browser", "jsnext:main", "jsnext", "main"];

/** 让瑚琏这棵树走 Vite 转换管线（源码分发 + 未预构建，不 inline 会被当外部依赖直接 require）。 */
export const hulianInlineDeps = [/@hulianui\/(ui|tokens)/, /@base-ui\/react/, /@dnd-kit\//];

/**
 * 把上面几项合并进消费方的 Vite/Vitest 配置。
 * 已有的同名字段**保留在前**（消费方的显式配置优先），预设只做追加去重。
 */
export function withHulian(config = {}) {
  const uniq = (a = [], b = []) => [...new Set([...a, ...b])];
  const resolve = config.resolve ?? {};
  const test = config.test ?? {};
  const server = test.server ?? {};
  const deps = server.deps ?? {};

  return {
    ...config,
    resolve: {
      ...resolve,
      dedupe: uniq(resolve.dedupe, hulianDedupe),
      conditions: uniq(resolve.conditions, hulianConditions),
      mainFields: uniq(resolve.mainFields, hulianMainFields),
    },
    test: {
      ...test,
      server: {
        ...server,
        deps: { ...deps, inline: uniq(deps.inline, hulianInlineDeps) },
      },
    },
  };
}
