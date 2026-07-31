"use client";
import { LazyMotion, m } from "motion/react";
import type { ReactNode } from "react";

// 减包：用 m + domAnimation 取代全量 motion。
// `motion.*` 会把 motion 的全部 DOM features 打进首屏 bundle；`m` 是 mini 组件、不自带 features，
// 由 LazyMotion 注入 `domAnimation`（基础动画 + 手势 + SVG，~一半体积；不含 drag/layout——本库无组件用到）。
// 组件库不能假设消费方在根部包了 LazyMotion，故每个动效组件自包一层 <LazyMotionProvider>：
// 它是 context provider，不渲染 DOM、零布局开销，且 domAnimation 模块全局只打一份。
// strict：在其内部误用 `motion.*` 会抛错，兜底防止减包被悄悄破坏。
export { m };

// 再减一层：features 走 `import()` 而不是静态引入，domAnimation 因此被切成独立 chunk。
// 对消费方的意义 —— 引一个 Button 不再等于把整套动画引擎放进首屏关键路径：
// 首屏只有 `m` 的骨架，引擎在 hydration 后并行取回。
//
// 代价：features 到达之前 `m.*` 渲染为无动画的普通元素。理论上「一进页面就播」的
// 入场动画会因此损失第一次播放，直接落到最终态。
//
// 实测（本仓文档站 dev，rAF 逐帧采样）：SplitText 的入场动画照常逐帧推进
// （opacity 0 → 中间态 → 1，中间态确实出现，不是瞬间跳变），Reveal 的视口触发
// 也正常由 0 升到 1。原因是 chunk 到达远早于动画该开始的时刻。慢网络下才可能真的
// 赶不上 —— 那时是「少看一次淡入」，不是元素卡在不可见：features 缺席时 m.* 不写
// initial 样式，元素以最终态呈现。
//
// 判断依据：Button 首屏 40KB 里 motion 独占四分之三，而入场动画的首帧不承载信息。
// 若将来某个组件必须保证首帧动画，让它自己包一层同步 features 的 LazyMotion，
// 不要把这里改回同步 —— 那等于让全库所有消费方替它买单。
const loadDomAnimation = () => import("./dom-animation").then((mod) => mod.default);

export function LazyMotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      {children}
    </LazyMotion>
  );
}
