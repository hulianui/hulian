// domAnimation 的独立模块 —— 存在的唯一理由是给打包器一个可切分的点。
//
// LazyMotion 的 `features` 既可以直接收一个 features 对象（同步、进首屏 bundle），
// 也可以收一个返回 Promise 的函数（异步、单独成 chunk）。走异步就必须让 domAnimation
// 只经由 `import()` 可达：一旦某处还静态 import 它，打包器照样把它归进主 chunk，
// 这个文件也就白建了。所以库内引用 domAnimation 的地方只有 lazy.tsx 里那个 import()。
export { domAnimation as default } from "motion/react";
