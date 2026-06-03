import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface SafariProps extends ComponentPropsWithoutRef<"div"> {
  /** 地址栏文本，默认 hulian.design */
  url?: string;
  /** 内容区图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
}
