import type { HTMLAttributes, ReactNode } from "react";

/** Affix 滚动监听容器：元素 / Window / 返回二者的 getter（默认 window）。 */
export type AffixTarget =
  | HTMLElement
  | Window
  | null
  | (() => HTMLElement | Window | null);

/**
 * 自研 Affix 固钉 props。
 * children 滚动越过阈值后切 `position:fixed` 吸附；原位用等高占位元素撑住防布局跳动。
 * offsetTop / offsetBottom 二选一（同时给则 offsetTop 优先），都不给默认 offsetTop=0。
 */
export interface AffixProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onChange"> {
  /** 被固定的内容。 */
  children: ReactNode;
  /** 距容器顶部多少 px 时吸附固定（吸顶）。默认 0。 */
  offsetTop?: number;
  /** 距容器底部多少 px 时吸附固定（吸底）。仅在未给 offsetTop 时生效。 */
  offsetBottom?: number;
  /** 滚动监听容器，默认 window；可传元素 / Window / getter。 */
  target?: AffixTarget;
  /** 吸附态变化回调。 */
  onChange?: (affixed: boolean) => void;
  /** 吸附时附加到固定元素的类名（如阴影 `shadow-lg`）。 */
  affixedClassName?: string;
}
