import { isDev } from "./is-dev";

// 误用告警的去重表。key 相同的告警整个进程只打一次。
const warned = new Set<string>();

/**
 * 开发期误用告警（同 key 只打一次）。
 *
 * 直接在组件 render body 里 `console.warn` 会随每次重渲染重复打印，StrictMode 下还要翻倍 ——
 * 同一个误用刷屏几十条，反而把真正需要注意的其它告警冲掉。但也不能挪进 effect：
 * 误用是 props 层面的静态问题，render 期就该报，挪进 effect 只是延迟且 SSR 下不执行。
 * 所以保留 render 期调用，用模块级 Set 去重。
 *
 * key 要能唯一标识「哪个组件的哪种误用」，不要把可变的 props 值拼进去 —— 那样等于没去重。
 */
export function warnOnce(key: string, message: string): void {
  if (!isDev || warned.has(key)) return;
  warned.add(key);
  console.warn(message);
}
