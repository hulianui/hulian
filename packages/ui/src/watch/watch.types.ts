import type { ComponentPropsWithoutRef, ReactNode } from "react";

/** 预设机型 → 表壳宽度 px（Apple Watch 各尺寸纵横比近似一致 ~5/6，故仅尺寸不同） */
export const WATCH_MODELS = {
  "ultra-49": 210,
  "series-45": 190,
  "se-44": 184,
  "series-41": 172,
} as const;

export type WatchModel = keyof typeof WATCH_MODELS;

export interface WatchProps extends ComponentPropsWithoutRef<"div"> {
  /** 表盘内容图片地址（优先于 children） */
  imageSrc?: string;
  children?: ReactNode;
  /** 表壳宽度 px；不传时取 model 预设宽度，model 也不传则 184 */
  width?: number;
  /** 预设机型，决定默认宽度（width 显式传入时优先） */
  model?: WatchModel;
}
