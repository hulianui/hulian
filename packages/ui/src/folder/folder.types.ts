import type { MouseEventHandler, ComponentPropsWithoutRef, ReactNode } from "react";

export interface FolderProps
  extends Omit<ComponentPropsWithoutRef<"div">, "color" | "onClick"> {
  /** 点击文件夹（触发展开/收起）时回调 */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** 文件夹主体色：接受任意 CSS 颜色字符串，推荐喂 token，如 `var(--color-primary)`、`var(--color-chart-1)`；默认 `var(--color-primary)` */
  color?: string;
  /** 整体缩放倍数（基准尺寸 100×80px），默认 1 */
  size?: number;
  /** 最多 3 张「纸张」内容（多余截断、不足补空）。展开后扇形铺开并支持磁吸跟随鼠标 */
  items?: ReactNode[];
  /** 受控展开态；提供时组件受控，配合 `onOpenChange` 使用 */
  open?: boolean;
  /** 默认展开态（非受控），默认 false */
  defaultOpen?: boolean;
  /** 展开态变化回调（受控/非受控均触发） */
  onOpenChange?: (open: boolean) => void;
  /** 关闭磁吸跟随（展开后纸张不再随鼠标偏移），默认 false */
  disableMagnet?: boolean;
}
