import { cloneElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

// Button 底座里**与配色无关**的那一半，单独拆出来给 effects 分类下自绘背景的特效按钮共享
// （ShimmerButton / RainbowButton / PulsatingButton / RippleButton，见 #126）。
//
// 为什么不让它们内部直接渲染 <Button>：特效件的背景是自己的（微光 / 彩虹渐变 / 脉冲 / 波纹），
// 吃不了 bg-primary。也不给 Button 加 effect prop：那会把特效代码拖进核心 Button 的打包路径，
// 而 Button 的首屏体积本来就紧张。
//
// 为什么这些字符串不放在 button.tsx 里：那个文件是 "use client" 且引了 motion，四个特效件里有
// 三个是 RSC 安全的纯 CSS 组件，从那边 import 会把 client 边界和 motion 一起拖进来。本模块无副作用、
// 无 client 依赖，两边都能引。

/** 排布：图标与文案同行居中、不换行。与状态、配色、圆角都无关。 */
const LAYOUT = "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium";

/**
 * 交互态：焦点环、禁用态、文本不可选。
 * 这三样此前四个特效件各漏一遍 —— 焦点样式与全库不统一（同一页面两套焦点语言）、
 * 传了 disabled 只是点不动但看上去和可用状态一模一样、连点会把按钮文字刷成蓝底。
 */
const INTERACTION =
  "select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

/** 普通 Button 的 base：排布 + 圆角 + 颜色过渡 + 交互态。 */
export const BUTTON_BASE_CLASS = `${LAYOUT} rounded-[var(--radius)] transition-colors ${INTERACTION}`;

/**
 * 特效按钮的 base：只有排布与交互态。
 * **刻意不含圆角**——特效件各自用 `[border-radius:var(--hulian-*)]` 之类的自定义圆角，
 * 两条规则都生成 `border-radius` 时谁赢由样式表顺序决定，不由 className 顺序决定，
 * 混在一起就是不可预测的。也不含 `transition-colors`：它们变的是背景动画不是颜色。
 */
export const EFFECT_BUTTON_BASE_CLASS = `${LAYOUT} ${INTERACTION}`;

/**
 * 尺寸档。图标档边长严格等于同名文字档的高度（32/40/48），
 * 这样图标按钮与任意文字按钮、与特效按钮混排都等高。
 */
export const BUTTON_SIZE_CLASS = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  // 纯图标方形按钮（无文字内边距）：免去消费方手贴 size-10 px-0 之类补丁。
  // 0.26.0 前 icon 是孤立的 36px，与任何文字档都对不齐（见 #97）。
  icon: "size-10 p-0",
  iconSm: "size-8 p-0",
  iconLg: "size-12 p-0",
} as const;

/** 特效按钮只开放三档文字尺寸——它们没有纯图标形态。 */
export type EffectButtonSize = "sm" | "md" | "lg";

/**
 * `render`：把按钮样式套到自定义元素上（`<a>` / Next `<Link>`），用于「按钮样式的链接」CTA。
 *
 * 抽成公共 helper 而不是各写一份：ShimmerButton 早已把这段逻辑抄过一遍，再来一个特效件就是
 * 第三份拷贝。合并规则是「本组件的 props/style/className 在前，render 元素自带的在后」——
 * 调用方在 render 元素上写的东西永远能覆盖默认值。
 */
export function renderAsElement(
  render: ReactElement,
  props: Record<string, unknown>,
  className: string,
  style: CSSProperties | undefined,
  children: ReactNode,
): ReactElement {
  const own = render.props as Record<string, unknown>;
  return cloneElement(
    render,
    {
      ...props,
      style: { ...style, ...((own.style as CSSProperties) ?? {}) },
      className: cn(className, own.className as string | undefined),
    } as Record<string, unknown>,
    children,
  );
}
