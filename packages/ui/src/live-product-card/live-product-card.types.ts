import type { ReactNode } from "react";

export interface LiveProductCardProps {
  /** 第 N 号链接徽标。 */
  index?: number;
  image: string;
  title: ReactNode;
  /** 现价（秒杀价）。 */
  price: number;
  /** 划线原价。 */
  originalPrice?: number;
  /** 「讲解中」脉冲徽标。 */
  explaining?: boolean;
  /** 剩余库存。 */
  stock?: number;
  /** 已售。 */
  sold?: number;
  /** 角标，如「秒杀」「限量」。 */
  tag?: ReactNode;
  /** 抢购按钮（调用方传 Button 等）。 */
  action?: ReactNode;
  /** 货币符号，默认 ¥。 */
  currency?: string;
  /** 布局：row=列表行（中控/弹层），card=网格卡。默认 row。 */
  layout?: "row" | "card";
  onClick?: () => void;
  className?: string;
}
