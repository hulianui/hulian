import type { CSSProperties, ReactNode } from "react";

export interface StatisticProps {
  /** 标题（数值上方说明）。 */
  title?: ReactNode;
  /** 数值；string 原样输出，number 走千分位 + precision 格式化。 */
  value: number | string;
  /** 小数位数（仅 value 为 number 时生效）。 */
  precision?: number;
  /** 数值前缀（货币符号/图标等）。 */
  prefix?: ReactNode;
  /** 数值后缀（单位等）。 */
  suffix?: ReactNode;
  /** 千分位分组，默认 true。 */
  groupSeparator?: boolean;
  /** 接 NumberTicker 入场滚动（仅 value 为 number 时生效；动效路径恒带千分位）。 */
  animate?: boolean;
  /** 数值行内联样式（如自定义颜色/字号）。 */
  valueStyle?: CSSProperties;
  className?: string;
}

export interface CountdownProps {
  /** 标题。 */
  title?: ReactNode;
  /** 截止时间戳（毫秒，Date.now() 同基准）。 */
  deadline: number;
  /** 格式化模板，默认 "HH:mm:ss"。支持 D/H/HH/m/mm/s/ss/S/SS/SSS。 */
  format?: string;
  /** 前缀。 */
  prefix?: ReactNode;
  /** 后缀。 */
  suffix?: ReactNode;
  /** 倒计时归零时回调（只触发一次）。 */
  onFinish?: () => void;
  /** 数值行内联样式。 */
  valueStyle?: CSSProperties;
  className?: string;
}
