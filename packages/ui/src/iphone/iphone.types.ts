import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** 预设机型 → 设备宽度 px（机身比例统一走组件内 aspectRatio，预设仅决定尺寸） */
export const IPHONE_MODELS = {
  "16-pro-max": 330,
  "16-pro": 305,
  "16-plus": 320,
  "16": 295,
  "15-pro": 295,
  "13-mini": 270,
} as const;

export type IPhoneModel = keyof typeof IPHONE_MODELS;

export interface IPhoneProps extends ComponentPropsWithoutRef<"div"> {
  /** 屏幕内容图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
  /** 设备宽度 px；不传时取 model 预设宽度，model 也不传则 280 */
  width?: number;
  /** 预设机型，决定默认宽度（width 显式传入时优先） */
  model?: IPhoneModel;
}
