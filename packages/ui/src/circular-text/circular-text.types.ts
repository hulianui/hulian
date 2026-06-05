import type { ComponentPropsWithoutRef } from "react";

export type CircularHover = "speedUp" | "slow" | "pause" | "goBonkers";

export interface CircularTextProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /** 环绕排布的文本（建议尾部加分隔符如 ✦ 让首尾衔接更顺） */
  text: string;
  /** 转一圈秒数。默认 20 */
  spinDuration?: number;
  /** 悬停行为：加速 / 减速 / 暂停 / 抓狂。默认 speedUp */
  onHover?: CircularHover;
  /** 文字所在圆半径像素。默认 80 */
  radius?: number;
}
