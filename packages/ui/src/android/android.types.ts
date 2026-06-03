import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** 预设机型 → 设备宽度 px（机身比例统一走组件内 aspectRatio，预设仅决定尺寸） */
export const ANDROID_MODELS = {
  "pixel-9-pro-xl": 325,
  "pixel-9-pro": 300,
  "pixel-9": 288,
  "galaxy-s24-ultra": 325,
  "galaxy-s24": 285,
} as const;

export type AndroidModel = keyof typeof ANDROID_MODELS;

export interface AndroidProps extends ComponentPropsWithoutRef<"div"> {
  /** 屏幕内容图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
  /** 设备宽度 px；不传时取 model 预设宽度，model 也不传则 280 */
  width?: number;
  /** 预设机型，决定默认宽度（width 显式传入时优先） */
  model?: AndroidModel;
}
