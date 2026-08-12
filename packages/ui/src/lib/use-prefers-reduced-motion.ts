"use client";
import { useSyncExternalStore } from "react";

// `prefers-reduced-motion: reduce` 的读取原语（#225）。
//
// 为什么自己写而不是用 motion 的 useReducedMotion：这个钩子要给**布局层**用（Sidebar 的宽度
// 过渡是整页级容器变形），而布局件的引入图里没有 motion，为了一个媒体查询把动画运行时拖进
// 首屏路径不划算。实现本身只有一个 matchMedia，没有必要引依赖。
//
// 为什么不是各组件自己写 matchMedia：那样订阅逻辑会散落多份，而「库负责响应这条媒体查询」
// 是全库口径（见 sidebar.md 的说明），口径要有一个共同的落点。
//
// 用 useSyncExternalStore 而不是 useEffect + useState：后者的首帧永远是「未减弱」，
// 于是开着减弱偏好的用户仍会看到第一次动画（effect 跑完才纠正）；前者在客户端首次渲染时
// 就读到真实值，只有 SSR 那一帧按「不减弱」渲染——服务端读不到用户偏好，这是唯一的选择。
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * 用户是否开启了「减弱动效」（`prefers-reduced-motion: reduce`）。
 *
 * 库内的动效件已各自响应这条偏好，一般不需要消费方调用；它导出来是给**自绘动效**用的
 * —— 自己写 canvas / rAF / 内联 style 过渡时，从这里取同一个判断，不必再写一份 matchMedia。
 *
 * SSR 与首屏 HTML 恒为 `false`（服务端读不到用户偏好），hydration 后立即纠正。
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
