import { copy } from "./format.content";

/**
 * 章序：中文读「一、二、三」，英文读 1、2、3。
 * 字形表放在 format.content.ts 里（demo 的中文字面量一律走 catalog），
 * 这一层只做进制换算，不再出现 CJK 字面量。
 */
export function chapterNumeral(value: number): string {
  if (copy("useCjkNumerals") !== "1") return String(value);
  const digits = Array.from(copy("digits"));
  const ten = copy("ten");
  if (value <= 0 || value >= 100) return String(value);
  if (value < 10) return digits[value] ?? String(value);
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const head = tens === 1 ? ten : `${digits[tens]}${ten}`;
  return ones === 0 ? head : `${head}${digits[ones]}`;
}

/** 字数带千分位。中文站点的字数习惯直接读数字，不做 K/M 缩写。 */
export function formatWords(value: number): string {
  return value.toLocaleString("zh-CN");
}
