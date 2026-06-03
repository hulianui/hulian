import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ChromeProps extends ComponentPropsWithoutRef<"div"> {
  /** 地址栏文本，默认 hulian.design */
  url?: string;
  /** 标签页标题，默认取 url */
  title?: string;
  /** 内容区图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
}
