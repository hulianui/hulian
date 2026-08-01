import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import type { GlareState, TiltAngles } from "./tilt-geometry";

export type TiltGlarePosition = "top" | "right" | "bottom" | "left" | "all";

export interface TiltEventPayload {
  angles: TiltAngles;
  glare: GlareState;
}

export interface TiltProps extends Omit<HTMLAttributes<HTMLDivElement>, "onMouseMove"> {
  children?: ReactNode;
  /** 总开关。@default true */
  tiltEnable?: boolean;
  /** x/y 轴最大角（度）。@default 12 */
  maxAngleX?: number;
  maxAngleY?: number;
  /** 反向倾斜。@default false */
  reverse?: boolean;
  /** 只绕单轴倾斜。 */
  axis?: "x" | "y";
  /** 静息角度（不交互时的初始倾斜）。 */
  initialAngleX?: number;
  initialAngleY?: number;
  /**
   * 手动角度（滑杆/摇杆驱动）。给了就完全接管，指针不再影响该轴——
   * `null`/省略 = 交给指针。
   */
  manualAngleX?: number | null;
  manualAngleY?: number | null;
  /** 悬停放大倍数。@default 1 */
  scale?: number;
  /** 透视距离 px，越小越夸张。@default 1000 */
  perspective?: number;
  /** 过渡时长 ms。@default 300 */
  transitionSpeed?: number;
  /** 过渡曲线，默认走瑚琏动效曲线 SSOT。 */
  transitionEasing?: string;
  /** 离开时归位。@default true */
  reset?: boolean;
  /** 在整个窗口内跟踪指针（做背景大卡片时用）。@default false */
  trackOnWindow?: boolean;
  /** 监听设备陀螺仪（移动端）。iOS 需站点自行取得 DeviceOrientation 权限。@default false */
  gyroscope?: boolean;
  /** 开启反光高光层。@default false */
  glare?: boolean;
  /** 反光最大不透明度。@default 0.35 */
  glareMaxOpacity?: number;
  /** 反光颜色。@default "#ffffff" */
  glareColor?: string;
  /** 反光方向取反。@default false */
  glareReverse?: boolean;
  /** 反光层圆角（要与卡片圆角一致，否则高光会溢出圆角）。 */
  glareBorderRadius?: CSSProperties["borderRadius"];
  onTiltMove?: (payload: TiltEventPayload) => void;
  onTiltEnter?: () => void;
  onTiltLeave?: () => void;
  className?: string;
}
