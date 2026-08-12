import type { HTMLAttributes, ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import type { cardVariants } from "./card";

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /**
   * 是否用分隔线把 CardHeader / CardFooter 与正文切开。
   *
   * 设 `false` 时两条线一起去掉，并把它们原本撑着的那段内边距收一档（关线不收边距会让标题
   * 与正文之间空出一道无来由的留白）。整卡级而非分区级，是为了不出现「头部有线、底部没线」
   * 的半吊子状态。@default true
   */
  divided?: boolean;
}

// title 为 ReactNode → 与 HTMLAttributes 的 title?:string 冲突，必须 Omit "title"
// （同 PageHeader/Alert/Empty 的复发坑）。
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /**
   * 主标题。给标题一个自己的元素（`data-slot="card-title"`），于是它有独立的字号 / 行高 / 字重，
   * 而同一行里的图标、状态标签、计数不再被 header 的 `font-medium` 一起染成标题样式。
   */
  title?: ReactNode;
  /** 副标题 / 说明，排在标题下方，次要文字色。 */
  description?: ReactNode;
  /** 右侧操作区（按钮、开关、计数等），与标题群同一行、垂直居中，窄屏换行到下方。 */
  extra?: ReactNode;
}
