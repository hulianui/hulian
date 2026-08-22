import type { HTMLAttributes, ReactNode } from "react";
import type { Grade } from "../score-ring/score-ring.grade";

/** 条上的一根参照线（如「行业均值 62」「上次体检 71」）。 */
export interface ScoreScaleMarker {
  /** 参照值，与 value 同量程；越界同样夹到端点。 */
  value: number;
  /** 线下方的说明文字。任一 marker 带 label 就会多出一行标注行。 */
  label?: ReactNode;
  /** 线的颜色，经 resolveTone 解析；默认用前景色（两个主题都与色带反相）。 */
  tone?: string;
}

export interface ScoreScaleValueTextInfo {
  /** 调用方传进来的原始值（未夹紧）。 */
  value: number;
  min: number;
  max: number;
  /** 已夹进 0–100 的位置百分比。 */
  percent: number;
  /** 命中的等级；grades 为空时没有等级可言，此项为 undefined。 */
  grade?: Grade;
}

export interface ScoreScaleProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  /** 当前分值。越界（超出 min/max）时游标夹到端点，`aria-valuetext` 仍念原始值。 */
  value: number;
  /** 量程下限。@default 0 */
  min?: number;
  /** 量程上限。@default 100 */
  max?: number;
  /** 等级带，与 ScoreRing 同一套 `Grade[]`。相邻两档 min 之差 = 该段在条上的宽度。@default DEFAULT_GRADES */
  grades?: Grade[];
  /** 尺寸档。@default "md" */
  size?: "sm" | "md";
  /**
   * 可见标题（如「信誉评分」）。传**字符串**时同时用作 `role="meter"` 的无障碍名；
   * 传节点或不传时，名字请自行走透传的 `aria-label` / `aria-labelledby`。
   */
  label?: ReactNode;
  /** 是否在右上角显示命中档的 label，用该档的 tone 着色。@default true */
  showGrade?: boolean;
  /** 是否在条下方标出量程端点（如 `0` / `100`）。@default false */
  showRange?: boolean;
  /** 段与段之间留 2px 缝。默认紧邻无缝；相邻档同色时开它才分得出档。@default false */
  segmentGap?: boolean;
  /** 参照线（可多根）。游标不是条上唯一的标记物。 */
  markers?: ScoreScaleMarker[];
  /**
   * 自定义 `aria-valuetext`。默认是 `"36 / 100, 一般"`（值 / 满分, 等级）——
   * 刻意不含任何语言词，等级文字来自调用方的 `grades`。要中文量词就传这个：
   * `({ value, grade }) => `${value} 分，${grade?.label ?? ""}``。
   */
  formatValueText?: (info: ScoreScaleValueTextInfo) => string;
  className?: string;
}
