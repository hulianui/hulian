export interface FitScreenProps {
  children: React.ReactNode;
  /** 设计稿宽，默认 1920。 */
  designWidth?: number;
  /** 设计稿高，默认 1080。 */
  designHeight?: number;
  /**
   * fit  = 取 min(等比不裁切，四周可能留黑边)·默认
   * cover= 取 max(等比铺满，可能裁切)
   * stretch = 非等比拉满(可能变形)
   */
  mode?: "fit" | "cover" | "stretch";
  className?: string;
}

export interface FitInput {
  outerW: number;
  outerH: number;
  designW: number;
  designH: number;
  mode: "fit" | "cover" | "stretch";
}
