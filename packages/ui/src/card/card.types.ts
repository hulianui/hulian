import type { HTMLAttributes } from "react";
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
