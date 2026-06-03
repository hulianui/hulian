import type { ReactNode } from "react";

/** 气泡卡相对高亮目标的方位（放不下会自动翻转到对侧）。 */
export type TourPlacement = "top" | "bottom" | "left" | "right";

export interface TourStep {
  /**
   * 高亮目标。
   * · 函数：返回元素（如 `() => ref.current`，DOM 动态时最稳）。
   * · 字符串：CSS 选择器（`document.querySelector`）。
   * · null / 省略：无目标 → 气泡卡居中（适合开场 / 收尾步）。
   */
  target?: (() => Element | null) | string | null;
  /** 步骤标题。 */
  title?: ReactNode;
  /** 步骤描述。 */
  description?: ReactNode;
  /** 气泡卡方位。默认 bottom；无目标时忽略（居中）。 */
  placement?: TourPlacement;
}

/**
 * 自研 Tour 漫游引导 props（零依赖 · 受控）。
 * open + current 由消费者受控；上一步/下一步触发 onChange，跳过/Esc/末步完成触发 onClose（或 onFinish）。
 */
export interface TourProps {
  /** 引导步骤列表。 */
  steps: TourStep[];
  /** 是否打开（受控）。 */
  open: boolean;
  /** 当前步索引（受控，从 0 起）。 */
  current: number;
  /** 当前步变化（点上一步 / 下一步）。 */
  onChange?: (current: number) => void;
  /** 关闭（跳过 / Esc / 末步完成且未传 onFinish）。 */
  onClose?: () => void;
  /** 末步「完成」回调；不传则末步完成走 onClose。 */
  onFinish?: () => void;
  /** 点击遮罩是否关闭。默认 false（引导默认不允许误触关闭）。 */
  maskClosable?: boolean;
  /** 高亮镂空在目标四周的留白（px）。默认 8。 */
  spotlightPadding?: number;
  /** 镂空圆角（px）。默认 8。 */
  spotlightRadius?: number;
  /** 气泡卡与目标的间距（px）。默认 12。 */
  gap?: number;
  /** 遮罩 z-index。默认 100。 */
  zIndex?: number;
  /** 按钮文案覆盖。 */
  prevText?: ReactNode;
  nextText?: ReactNode;
  skipText?: ReactNode;
  finishText?: ReactNode;
}
