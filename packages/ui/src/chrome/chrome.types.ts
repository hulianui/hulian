import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface ChromeProps extends ComponentPropsWithoutRef<"div"> {
  /** 地址栏文本，默认 hulian.design */
  url?: string;
  /** 标签页标题，默认取 url */
  title?: string;
  /** 内容区图片地址（优先于 children） */
  imageSrc?: string;
  /**
   * 工具栏右端的工具入口（#278）。不传时该格仍是原来那块 `w-6` 占位，尺寸逐字节不变。
   * 传了则宽度下限锁在占位宽（`min-w-6`），内容更宽时该格随内容生长。
   * 同 [Safari.headerExtra](../safari/safari.md)，只是本壳左侧多了三颗导航键，占位窄一档。
   */
  headerExtra?: ReactNode;
  children?: ReactNode;
}
