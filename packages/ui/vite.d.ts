import type { Plugin } from "vite";

export interface HulianViteOptions {
  /**
   * 是否强制预打包瑚琏（`optimizeDeps.include`）。
   *
   * - `"auto"`（默认）—— 仅在探测到软链消费（`link:` / workspace / `file:` 指向目录）时开启。
   *   正常 `pnpm add` 装进来的项目 Vite 自己就会预打包，插件不插手。
   * - `true` —— 总是开启。
   * - `false` —— 从不开启。正在改瑚琏源码、需要 HMR 时用这个。
   */
  prebundle?: "auto" | boolean;
  /** 关掉启动时那行诊断输出。默认 false。 */
  silent?: boolean;
}

/**
 * 瑚琏的 Vite 插件：软链消费时自动启用依赖预打包，避免 dev 模块图膨胀数百倍。
 *
 * ```ts
 * import { defineConfig } from "vite"
 * import { hulian } from "@hulianui/ui/vite"
 *
 * export default defineConfig({ plugins: [hulian()] })
 * ```
 *
 * 只在 `serve` 生效；正常安装的项目加了也无害（探测到不是软链就什么都不做）。
 */
export declare function hulian(options?: HulianViteOptions): Plugin;

export default hulian;
