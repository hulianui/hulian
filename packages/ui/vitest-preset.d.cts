import type { UserConfig } from "vitest/config";

/**
 * 必须全局唯一实例的包。React 分裂是绝大多数「hook 读到 null」的真因。
 *
 * 直接取用可以自己拼配置，不必走 {@link withHulian}。
 */
export declare const hulianDedupe: string[];

/**
 * 启用 `module` 条件：`@mui/material` / `@emotion/*` 的 exports 里 `module` 排在 `import` 之前，
 * 不启用就会落到 `import` 那条 —— 它指向 `.cjs.mjs` 互操作壳，会另起一份模块实例。
 *
 * 注意显式设置 `conditions` 会**替换**默认值，所以这里一并列出了 Vite 的客户端默认条件。
 */
export declare const hulianConditions: string[];

/** `@dnd-kit/*` 没有 `exports` 字段，只有 legacy `main`(CJS) / `module`(ESM)，必须优先取后者。 */
export declare const hulianMainFields: string[];

/** 让瑚琏这棵树走 Vite 转换管线（源码分发 + 未预构建，不 inline 会被当外部依赖直接 require）。 */
export declare const hulianInlineDeps: RegExp[];

/**
 * 把瑚琏所需的解析配置合并进消费方的 Vite / Vitest 配置。
 * 已有的同名字段**保留在前**（消费方的显式配置优先），预设只做追加去重。
 *
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
 * 泛型透传入参类型，好让消费方自己那些字段在 `defineConfig` 里不被抹成宽泛的 `UserConfig`。
 */
export declare function withHulian<T extends UserConfig = UserConfig>(config?: T): T & UserConfig;
