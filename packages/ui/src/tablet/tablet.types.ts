import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** 预设机型 → 设备宽度 px + 机身比例（平板机型纵横比差异明显，故各自带 aspectRatio） */
export const TABLET_MODELS = {
  "ipad-pro-13": { width: 360, aspectRatio: "3 / 4.05" },
  "ipad-pro-11": { width: 320, aspectRatio: "3 / 4.3" },
  "ipad-air-11": { width: 320, aspectRatio: "3 / 4.3" },
  "ipad-10": { width: 320, aspectRatio: "3 / 4.3" },
  "ipad-mini": { width: 250, aspectRatio: "3 / 4.55" },
} as const;

export type TabletModel = keyof typeof TABLET_MODELS;

export interface TabletProps extends ComponentPropsWithoutRef<"div"> {
  /** 屏幕内容图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
  /** 设备宽度 px；不传时取 model 预设宽度，model 也不传则 320 */
  width?: number;
  /** 预设机型，决定默认宽度与机身比例（width 显式传入时优先覆盖宽度） */
  model?: TabletModel;
}
