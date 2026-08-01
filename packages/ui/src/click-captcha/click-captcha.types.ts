import type { ReactNode } from "react";

/** 点位：相对坐标，x/y ∈ [0,1]（相对图片显示区域左上角）。消费方按自家后端要的像素基准换算。 */
export interface CaptchaPoint {
  x: number;
  y: number;
}

/** 校验态：idle 待点选 / verifying 校验中（锁定交互）/ failed 失败（抖动并清空点位）/ success 通过（锁定）。 */
export type ClickCaptchaStatus = "idle" | "verifying" | "failed" | "success";

export interface ClickCaptchaProps {
  /** 背景图 URL（业务自己取，组件不碰网络）。 */
  backgroundSrc: string;
  /** 提示图 URL（如「请依次点击：书 山 水」的文字条图），渲染在提示行右侧。 */
  hintSrc?: string;
  /** 提示文案（默认 locale.clickCaptcha.hint）。 */
  hintText?: ReactNode;
  /** 需要采集的点位数，默认 3；采满触发 onComplete。 */
  maxPoints?: number;
  /** 受控点位；不传则组件内部自管。 */
  points?: CaptchaPoint[];
  /** 非受控初始点位。 */
  defaultPoints?: CaptchaPoint[];
  /** 点位变化（新增 / 撤销 / 清空）。 */
  onPointsChange?: (points: CaptchaPoint[]) => void;
  /** 点位采满 maxPoints 时触发——消费方在此编码成自家协议串并发请求。 */
  onComplete?: (points: CaptchaPoint[]) => void;
  /** 点「换一张」时触发；组件只负责清空点位，换图由消费方改 backgroundSrc。 */
  onRefresh?: () => void;
  /** 图片/协议加载中：盖遮罩 + 禁点选。 */
  loading?: boolean;
  /** 校验态，默认 idle。 */
  status?: ClickCaptchaStatus;
  /** 禁用（不可点选，按钮同时禁用）。 */
  disabled?: boolean;
  /** 图片区宽高比，默认 2（BuildAdmin 系点选图常见 310×155）。 */
  aspectRatio?: number;
  /** 键盘准星单次步进（相对坐标），默认 0.02。 */
  keyboardStep?: number;
  className?: string;
}
