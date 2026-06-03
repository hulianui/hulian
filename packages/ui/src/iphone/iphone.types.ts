import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface IPhoneProps extends ComponentPropsWithoutRef<"div"> {
  /** 屏幕内容图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
  /** 设备宽度 px，默认 280 */
  width?: number;
}
