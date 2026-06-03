import type { HTMLAttributes, ReactNode } from "react";

/** 分栏方向：horizontal=面板横排(分隔符竖直)；vertical=面板竖排(分隔符水平)。 */
export type ResizableDirection = "horizontal" | "vertical";

/**
 * 分栏组：拥有 sizes 状态（百分比/相对权重数组，一项一面板）。
 * 受控传 sizes+onSizesChange；非受控传 defaultSizes（缺省则面板均分）。
 */
export interface ResizablePanelGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  direction?: ResizableDirection;
  /** 受控尺寸（百分比数组）。 */
  sizes?: number[];
  /** 非受控初始尺寸；缺省则按面板数均分。 */
  defaultSizes?: number[];
  onSizesChange?: (sizes: number[]) => void;
  children: ReactNode;
}

/** 单个面板：min/max 为该面板允许的尺寸百分比下/上限。 */
export interface ResizablePanelProps extends HTMLAttributes<HTMLDivElement> {
  /** 最小尺寸百分比，默认 10。 */
  min?: number;
  /** 最大尺寸百分比，默认 100。 */
  max?: number;
}

/** 拖拽手柄：键盘方向键每次微调的百分点，默认 5。 */
export interface ResizableHandleProps extends Omit<HTMLAttributes<HTMLDivElement>, "aria-orientation"> {
  keyboardStep?: number;
}
