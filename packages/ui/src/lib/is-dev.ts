// 模块作用域 declare，而不是给 packages/ui 加 @types/node 依赖。
// 因为本库是「源码分发」（exports 指向 src/index.ts、files 只发 src、不产 .d.ts），消费方的 tsc
// 会把整棵 src 编进 program —— 与它实际 import 了哪个组件无关。于是库里任何一处裸 `process`
// 都会在浏览器端消费方那里炸成 TS2580 / TS2552（见 hulianui/hulian#24）。
// 而装 @types/node 是更坏的解：它会把整套 Node 全局类型灌进消费方的类型环境，setTimeout 从此
// 返回 NodeJS.Timeout 而不是 number，反倒把真实的运行平台错配掩盖掉。模块作用域的 declare 只在
// 本文件内可见，既不污染消费方全局，也不要求消费方装任何东西。
//
// 也不用 import.meta.env.DEV：那会把本库绑死在 Vite 上，Next / webpack / Rollup 消费方直接失效。
// process.env.NODE_ENV 才是各打包器都会做静态替换、生产构建里能被 DCE 掉的那条通路。
declare const process: { env: Record<string, string | undefined> } | undefined;

/**
 * 开发态标记：仅用于库内部的开发期告警，不对外导出（属实现细节）。
 *
 * 刻意**不写成可选链** `process?.env?.NODE_ENV`：打包器的 define（Vite / esbuild /
 * webpack DefinePlugin）是按 `process.env.NODE_ENV` 这条**成员表达式**做字面匹配替换的，
 * 可选链形式未必命中。一旦没命中，浏览器端消费方（没有 process 全局）就会走
 * `typeof process === "undefined"` 分支 → isDev 恒 false → 库的开发期告警永远不出现，
 * 而这正是它存在的意义。用 typeof 守卫 + 完整成员表达式，两头都保住。
 */
export const isDev =
  typeof process !== "undefined" && !!process.env && process.env.NODE_ENV !== "production";

/**
 * 测试环境标记（vitest / jest 都会把 NODE_ENV 置成 "test"）。
 *
 * 只给「正常渲染路径上会命中的告警」当消音开关用 —— 那类告警说的不是「你写错了」，而是
 * 「你的**应用**少接了一层」，而单元测试里裸渲染一个组件恰恰是正当做法。不消音的话，本库
 * 4000+ 条用例里凡是没挂 Provider 的都会各喊一次（vitest 每个测试文件一套模块注册表，
 * warnOnce 的去重只在文件内生效），消费方的测试输出同样会被淹 —— 真告警反而被冲掉。
 *
 * **props 层面的误用告警不要用它消音**：那种问题在测试里出现就是测试写错了，该照喊。
 */
export const isTest =
  typeof process !== "undefined" && !!process.env && process.env.NODE_ENV === "test";
