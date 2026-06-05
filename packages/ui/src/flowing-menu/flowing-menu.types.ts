import type { ComponentPropsWithoutRef } from "react";

/** 单个流动菜单项 */
export interface FlowingMenuItem {
  /** 跳转链接 */
  link: string;
  /** 文案（主标题 + 揭幕跑马灯文字） */
  text: string;
  /**
   * 跑马灯里循环穿插的图片地址（可选）。
   * 留空则只跑文字，不渲染图片块。
   */
  image?: string;
}

export interface FlowingMenuProps
  extends Omit<ComponentPropsWithoutRef<"nav">, "children"> {
  /** 菜单项列表 */
  items: FlowingMenuItem[];
  /**
   * 跑马灯走完一整屏的秒数，越大越慢。
   * @default 18
   */
  speed?: number;
  /**
   * 单个文字块里重复的份数（撑满并保证无缝循环用）。
   * @default 4
   */
  repeat?: number;
}
