import type { HTMLAttributes, ReactNode } from "react";

export interface EmptyProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 自定义插画/图标；不传用内置空箱图标。传 null 则不渲染图标区。 */
  icon?: ReactNode;
  /** 主标题。 */
  title?: ReactNode;
  /** 辅助描述。 */
  description?: ReactNode;
  /** 尺寸。@default "md" */
  size?: "sm" | "md";
  /**
   * 加载中：图标区换成 spinner（不再是「空」插画），容器打上 `aria-busy`。
   * `title` / `description` / `children` 照常渲染 —— 它们是**当前这一态**的文案，
   * 别把空态那份直接留着（否则加载中会写着「暂无数据」）。
   * @default false
   */
  loading?: boolean;
  /** 操作区（按钮等），渲染在描述下方。 */
  children?: ReactNode;
}
