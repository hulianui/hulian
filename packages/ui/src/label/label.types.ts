import type { LabelHTMLAttributes } from "react";

/**
 * 继承 `<label>` 的原生属性（`id` / `title` / `data-*` / `aria-*` / `onClick` …）。
 * 纯展示件按 docs/consuming.md 第 7 节的口径开放根节点属性 —— Label 常常要接
 * react-hook-form 的字段 id、或挂 tooltip 的 `title`，接口封死就只能退回手搓 `<label>`。
 */
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * 关联控件的 id，渲染为原生 `for`。点标签即聚焦/切换控件，读屏也据此念标签。
   *
   * 在 [Field] 里这层关联是白送的（Base UI 自动生成 id 并串好）；独立用 Label 时
   * 必须自己传，并保证与控件的 `id` 一致 —— 不传就只是一段长得像标签的文字（#161）。
   */
  htmlFor?: string;
}
