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

export interface CountrySelectProps {
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
