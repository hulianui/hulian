import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface SafariProps extends ComponentPropsWithoutRef<"div"> {
  /** 地址栏文本，默认 hulian.design */
  url?: string;
  /** 内容区图片地址（优先于 children） */
  imageSrc?: string;
  /**
   * 顶栏右端的工具入口（#272 同族的 #278）。不传时该格仍是那块用来让地址胶囊
   * 相对红绿灯居中的 `w-12` 占位，尺寸逐字节不变；传了就把那格让出来。
   *
   * 宽度下限锁在占位宽（`min-w-12`）：内容窄于它时对称性完全保持，宽于它时该格随内容生长
   * ——宁可让胶囊偏一点，也不裁掉按钮。Safari 本尊的右上角放的也是分享/下载这类入口。
   */
  headerExtra?: ReactNode;
  children?: ReactNode;
}
