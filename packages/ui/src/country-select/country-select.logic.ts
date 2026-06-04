// CountrySelect 纯逻辑（零 React）——可独立单测。
import { countries } from "./countries.data";
import type { Country } from "./country-select.types";

const byCode = new Map(countries.map((c) => [c.code, c]));

/** 按 ISO2 码取国家数据。 */
export function getCountry(code: string): Country | undefined {
  return byCode.get(code);
}

/** ISO2 码 → 国旗 emoji（两个区域指示符码点拼接，CN→🇨🇳）。非两位字母返回空串。 */
export function flagEmoji(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return code
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65));
}

/** 一条国家的可搜索文本（中文名/英文名/ISO 码/区号）——供 Combobox itemToStringLabel 与离线过滤共用。 */
export function countrySearchText(c: Country): string {
  return `${c.cn} ${c.en} ${c.code} ${c.dial}`.trim();
}

/** 离线过滤（与 Combobox 内置过滤同口径）：query 命中 中文/英文/码/区号 任一即保留。 */
export function filterCountries(list: Country[], query: string): Country[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((c) => countrySearchText(c).toLowerCase().includes(q));
}
