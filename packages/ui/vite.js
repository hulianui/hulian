/**
 * 瑚琏的 Vite 插件 —— 只解决一件事：**软链消费时 dev server 会慢到不能用**。
 *
 * ## 它治的病
 *
 * Vite 的依赖预打包（optimizeDeps）会把 node_modules 里的包用 Rolldown/esbuild 预打包成
 * 单文件，一整棵源码树因此塌缩成一个模块。`pnpm add @hulianui/ui` 装进来的瑚琏会被自动
 * 预打包，dev 完全不吃亏 —— 这一档不需要本插件。
 *
 * 但 Vite **有意跳过 linked 包的预打包**（`link:` / workspace / `file:` 指向目录），
 * 因为它假定你正在改那个包、需要 HMR。于是整棵 `src/` 回到逐文件 transform 的老路。
 * 实测同一个页面（引 8 个组件，Vite 7.3.6）：
 *
 * | 消费方式        | 浏览器模块请求 | dev server RSS |
 * |----------------|---------------|----------------|
 * | `pnpm add`     | 16            | 43 MB          |
 * | **软链**        | **250**       | 83 MB          |
 * | 软链 + 本插件   | 13            | 80 MB          |
 *
 * 请求数差 15 倍，而这只是 8 个组件的量 —— 真实项目引十几个组件、跨多个页面，
 * 模块图按同样比例放大，就是「dev server 常驻数 GB、HMR 卡到点了没反应」。
 *
 * ## 它**不**做的事
 *
 * 不加 `resolve.dedupe`。实测软链场景下 Vite 会把所有 bare `import "react"` 重写到同一份
 * 预构建产物，React 不会分裂 —— 加了是噪音。
 * （注意这与 `@hulianui/ui/vitest-preset` 不同：那边确实需要 dedupe，因为 vitest 走的是
 * SSR 转换 + Node 解析，没有浏览器侧的预构建统一这一层。两个环境，两套配置，别互相套用。）
 *
 * 不碰 build。产物体积与打包方式由你的 Rollup/Rolldown 配置决定，本插件只在 `serve` 生效。
 *
 * ## 用法
 *
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from "vite"
 * import react from "@vitejs/plugin-react"
 * import { hulian } from "@hulianui/ui/vite"
 *
 * export default defineConfig({ plugins: [react(), hulian()] })
 * ```
 *
 * 正常安装的项目加了也无害（探测到不是软链就什么都不做），所以可以无脑加上。
 *
 * ## 代价
 *
 * 预打包意味着**库源码不再有 HMR** —— 改 `packages/ui` 下的文件后要重启 dev server。
 * 正在改库本身时传 `hulian({ prebundle: false })` 换回 HMR。
 */

import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

/** 需要预打包的入口。只列根 barrel：用子路径引入的项目模块图本来就只有几十个，不需要这层。 */
const OPTIMIZE_ENTRIES = ["@hulianui/ui"];

/**
 * 判断瑚琏是不是被软链进来的。
 *
 * 手法：本文件就在包内，取自己的真实路径看是否还在 node_modules 里。
 *   - pnpm 正常安装 → realpath 落在 `node_modules/.pnpm/@hulianui+ui@x.y.z/...` → 含 node_modules
 *   - `link:` / workspace → realpath 落在 `<你的仓库>/packages/ui` → 不含 node_modules
 *
 * 为什么不用 `require.resolve("@hulianui/ui/package.json")`：那要求 exports 里有
 * `./package.json` 条目，而本包的 `"./*"` 通配会把它错映射到 `./src/package.json/index.ts`。
 * 读自己的路径没有这个依赖，也不受消费方 exports 解析策略影响。
 *
 * @returns {boolean | null} null = 判不出来（不做任何事，宁可不管也不要误配）
 */
function detectLinked() {
  try {
    const self = realpathSync(fileURLToPath(import.meta.url));
    // 用路径分段判断而不是 includes("node_modules")：避免把
    // `/Users/me/my-node_modules-demo/...` 这类名字里带 node_modules 的目录误判。
    return !self.split(path.sep).includes("node_modules");
  } catch {
    return null;
  }
}

/**
 * @typedef {object} HulianViteOptions
 * @property {"auto" | boolean} [prebundle="auto"]
 *   是否强制预打包瑚琏。`"auto"`（默认）= 仅在探测到软链时开启；
 *   `true` = 总是开启；`false` = 从不开启（正在改库源码、需要 HMR 时用）。
 * @property {boolean} [silent=false] 关掉启动时那行诊断输出。
 */

/**
 * @param {HulianViteOptions} [options]
 * @returns {import("vite").Plugin}
 */
export function hulian(options = {}) {
  const { prebundle = "auto", silent = false } = options;
  /** @type {boolean | null} */
  let linked = null;
  let applied = false;

  return {
    name: "hulianui:dev",
    // 只在 dev 生效：build 时 Rollup/Rolldown 自己会 tree-shake，预打包既无必要也会碍事。
    apply: "serve",

    config() {
      linked = detectLinked();
      applied = prebundle === true || (prebundle === "auto" && linked === true);
      if (!applied) return;
      // 返回部分配置交给 Vite 深合并 —— 不要直接改传入的 config 对象，
      // 那样会和消费方自己写的 optimizeDeps.include 互相覆盖而不是合并。
      return { optimizeDeps: { include: [...OPTIMIZE_ENTRIES] } };
    },

    configResolved() {
      if (silent) return;
      if (applied) {
        console.log(
          `\n  \x1b[35m[hulianui]\x1b[0m 检测到软链消费，已启用依赖预打包 —— ` +
            `dev 模块图从数百个文件塌缩成一个。\n` +
            `  代价：库源码不再有 HMR，改 @hulianui/ui 后需重启 dev server（改库时可传 hulian({ prebundle: false })）。\n`,
        );
      } else if (linked === true) {
        console.log(
          `\n  \x1b[35m[hulianui]\x1b[0m 检测到软链消费，但 prebundle: false —— ` +
            `库源码保有 HMR，代价是 dev 模块图会多出数百个文件。\n`,
        );
      }
      // 正常安装（linked === false）时保持安静：Vite 自己就会预打包，本插件无事可做，
      // 没必要每次启动都打扰。
    },
  };
}

export default hulian;
