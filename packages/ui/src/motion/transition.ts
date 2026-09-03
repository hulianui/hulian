import type { CSSProperties } from "react";
import { motionDurationCss, motionEaseCss } from "./tokens";

export type TransitionDuration = keyof typeof motionDurationCss;
export type TransitionEase = keyof typeof motionEaseCss;

/**
 * 「变换」要过渡的全部属性（#341）。
 *
 * Tailwind v4 把 `scale-95` 编成独立的 `scale` 属性、`-translate-x-full` 编成独立的 `translate`
 * 属性，不再走 `transform`。而按 CSS Transforms Level 2，`transition-property: transform`
 * **不覆盖**这三个独立变换属性 —— 库里 20 个浮层件手写 `transition: opacity …, transform …`
 * 时，缩放 / 位移入场一直是瞬间跳到终态，只有 opacity 在淡（Chrome 152 实测
 * `getAnimations()` 里从没出现过 scale / translate）。Tailwind 自己的 `transition-transform`
 * 工具类展开的就是这四项。
 */
export const TRANSFORM_TRANSITION_PROPERTIES = ["transform", "translate", "scale", "rotate"] as const;

/**
 * 变换类时长的减弱动效开关（#341）。系数由 `@hulianui/tokens` 的 semantic.css 定义：
 * 正常 1，`prefers-reduced-motion: reduce` 下 0（变换瞬时到位，淡入淡出照旧）。
 *
 * 只能走变量：过渡写在内联 style 上（Base UI 会往同一个 style 注入 transition 简写，
 * 长写会被 React 判成 shorthand / longhand 混用并丢弃），而内联样式压不过媒体查询。
 * 回退值 1 让没接 tokens CSS 的消费方行为不变。
 */
function reducible(duration: string): string {
  return `calc(${duration} * var(--hl-motion-transform-factor, 1))`;
}

export interface TransitionEntry {
  /** CSS 属性名；写 `transform` 会自动展开成 TRANSFORM_TRANSITION_PROPERTIES 四项。 */
  property: "opacity" | "transform" | "width" | "height" | "background-color";
  /**
   * 时长档位；也收原始 CSS 时长，让消费点把时长做成可被 className 压制的变量
   * （Tooltip 的 `var(--hl-tooltip-duration, …)` 就靠这个把 instant 模式压到 0）。
   */
  duration: TransitionDuration | (string & {});
  /** 缺省 `out`。 */
  ease?: TransitionEase;
}

function durationCss(duration: TransitionDuration | (string & {})): string {
  return duration in motionDurationCss
    ? motionDurationCss[duration as TransitionDuration]
    : (duration as string);
}

/**
 * 拼 `transition` 简写串。
 *
 * 用简写而不是 transitionProperty / transitionDuration 长写：Base UI 在过渡生命周期会往
 * 内联 style 注入 `transition` 简写，与长写混在同一 style 对象 → React 报 shorthand / longhand
 * 混用并丢弃长写。简写同属性覆盖无混用，警告消除。
 */
export function transitionCss(...entries: TransitionEntry[]): string {
  return entries
    .flatMap(({ property, duration, ease = "out" }) => {
      const isTransform = property === "transform";
      const properties = isTransform ? TRANSFORM_TRANSITION_PROPERTIES : [property];
      const time = isTransform ? reducible(durationCss(duration)) : durationCss(duration);
      return properties.map((p) => `${p} ${time} ${motionEaseCss[ease]}`);
    })
    .join(", ");
}

/**
 * 浮层件共用的内联过渡（直接喂 `style`）。所有 overlay 从这里取，不要再各自手写串 ——
 * 22 处手写就是 #341 漏掉 translate / scale 的土壤；`motion/transition.test.ts` 会扫源码拦手写。
 */
export const overlayTransitions = {
  /** 浮层主体：淡入 + 缩放 / 位移入场，base 时长、out 曲线。 */
  popup: {
    transition: transitionCss(
      { property: "opacity", duration: "base" },
      { property: "transform", duration: "base" },
    ),
  },
  /**
   * 遮罩：淡入淡出，外加底色浓度 —— DialogContent 开着的时候会自己改浓度
   * （`draggable` 拖过之后遮罩让开，见 dialog.tsx），不给它过渡就是一下子跳到浅色。
   * 另外四个用这套过渡的浮层从不在开着的时候改底色，多列一项对它们零影响。
   *
   * 刻意**不含** `backdrop-filter`：模糊半径是整屏逐帧重算，而它唯一会变的时刻恰好是
   * 拖拽刚开始那一帧，跟拖动本身抢同一批帧。模糊直接撤掉反而是更利落的「揭开」。
   */
  backdrop: {
    transition: transitionCss(
      { property: "opacity", duration: "base" },
      { property: "background-color", duration: "base" },
    ),
  },
  /** 大面积滑入滑出（Drawer / ActionSheet）：位移走 slow 时长 + 抽屉曲线，淡入仍是 base · out。 */
  slide: {
    transition: transitionCss(
      { property: "transform", duration: "slow", ease: "drawer" },
      { property: "opacity", duration: "base" },
    ),
  },
  /** 高频键盘入口（Command）：只淡且更快，刻意不位移不缩放。 */
  fade: { transition: transitionCss({ property: "opacity", duration: "fast" }) },
} as const satisfies Record<string, CSSProperties>;
