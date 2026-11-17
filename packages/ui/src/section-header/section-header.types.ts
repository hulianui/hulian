import type { HTMLAttributes, ReactNode } from "react";

export interface SectionHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** 标题上方的一行小字（分类 / 栏目名），主色。 */
  eyebrow?: ReactNode;
  /** 标题。 */
  title: ReactNode;
  /** 标题后半句，主色强调（「从一个按钮，**到一整个后台**」）。 */
  accent?: ReactNode;
  /**
   * 标题与 `accent` 之间怎么接：`always` 总是换行；`mobile` 只在窄屏换行（sm 起同一行）；
   * `space` 同一行、中间一个空格（英文）；`none` 直接相连（中文）。
   * @default "always"
   */
  accentBreak?: "always" | "mobile" | "space" | "none";
  /** 标题下方的一段导语，次要灰。 */
  description?: ReactNode;
  /** 对齐：`start` 左对齐；`center` 居中（收尾 CTA、居中导语段）。@default "start" */
  align?: "start" | "center";
  /** 标题的语义层级（视觉尺寸固定为分节标题那一档，与层级解耦）。@default 2 */
  level?: 2 | 3 | 4;
}
