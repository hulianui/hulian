import type { HTMLAttributes } from "react";

/** 国家/地区数据条目。value 统一用 ISO 3166-1 alpha-2 码（如 CN/US）。国旗 emoji 由 code 现算，不入库。 */
export interface Country {
  /** ISO2 国码，如 "CN"。 */
  code: string;
  /** 中文名，如 "中国"。 */
  cn: string;
  /** 英文名，如 "China"。 */
  en: string;
  /** 国际区号，如 "+86"（少数无电话区号的为 ""）。 */
  dial: string;
}

/**
 * 未列出的原生属性（`aria-*` / `data-*` / `id` / `title` …）落到**触发器**上（多选时是 chips
 * 外壳里的输入框）—— 读屏念的、能聚焦的都是它。`Field required` 注入的 `aria-required`
 * 也走这条路（#293）。
 */
export interface CountrySelectProps
  extends Omit<
    // 落点随形态变（单选是触发按钮、多选是 chips 外壳里的 input），所以继承的是通用元素属性：
    // 按 button 收会让事件处理器的元素类型跟 input 那一支对不上。
    HTMLAttributes<HTMLElement>,
    "defaultValue" | "onChange" | "className" | "children" | "role"
  > {
  /** 受控值：单选为 ISO2 码字符串；多选为码数组。 */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (next: string | string[]) => void;
  multiple?: boolean;
  /** 选项行是否显示英文名（默认显示）。 */
  showEnglish?: boolean;
  /** 选项行是否显示国际区号（默认不显示）。 */
  showDialCode?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}
