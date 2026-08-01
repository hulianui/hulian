import type { HTMLAttributes, ReactNode } from "react";
import type { RegionBox } from "./region-box";

export interface RegionSelectBox {
  box: RegionBox;
  /** 描边色：语义色名（`chart-2` 等）或任意 CSS 色。 */
  color?: string;
  label?: ReactNode;
  id?: string | number;
}

export interface RegionSelectProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "children"> {
  /** 底图地址。 */
  src: string;
  alt?: string;
  /** 当前框（原图像素 `[x1,y1,x2,y2]`），受控；不传则只读展示 `boxes`。 */
  value?: RegionBox | null;
  /** 拖完一次给一个**规范化**的框（反向拖也成立）；短边小于 `minSide` 视为误点，不触发。 */
  onChange?: (box: RegionBox) => void;
  /** 拖拽过程中的实时框（想跟随预览时用；不传不影响拖拽）。 */
  onDrafting?: (box: RegionBox | null) => void;
  /** 误点阈值：框短边小于它（原图像素）不算一次框选。@default 8 */
  minSide?: number;
  /** 只读的其它框（同页多图时一并显示）。 */
  boxes?: RegionSelectBox[];
  /** 固定宽高比（宽/高）；不传则自由框选。 */
  aspect?: number;
  /** 超高图的内部滚动上限，任意 CSS 高度。@default "60vh" */
  maxHeight?: string | number;
  /** 主框描边色。@default "primary" */
  color?: string;
  /** 只读：不响应拖拽（仍显示已有框）。 */
  readOnly?: boolean;
  /**
   * 已知的原图自然尺寸（库里存着时直接给，省一次预读，也让 SSR/测试环境不必等图解码）。
   * 不传则组件用 `new Image()` 自己量。
   */
  naturalSize?: { width: number; height: number };
  /** 图未量到自然尺寸前的占位。 */
  placeholder?: ReactNode;
  className?: string;
}
