import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { FORMULA_TEMPLATE_GROUPS } from "./formula-editing";
import { MATH_TEXTAREA_LOCALE_EN, MATH_TEXTAREA_LOCALE_ZH } from "./math-textarea.locale";

const CJK = /[㐀-䶿一-鿿]/u;

describe("MathTextarea locale", () => {
  it("内置字典反向引用本文件的两份预设", () => {
    expect(zhCN.components?.mathTextarea).toBe(MATH_TEXTAREA_LOCALE_ZH);
    expect(enUS.components?.mathTextarea).toBe(MATH_TEXTAREA_LOCALE_EN);
  });

  it("每个内置模板与分组都有名字（两种语言）", () => {
    for (const group of FORMULA_TEMPLATE_GROUPS) {
      expect(MATH_TEXTAREA_LOCALE_ZH.templateGroups[group.id]).toBeTruthy();
      expect(MATH_TEXTAREA_LOCALE_EN.templateGroups[group.id]).toBeTruthy();
      for (const item of group.items) {
        expect(MATH_TEXTAREA_LOCALE_ZH.templates[item.id]).toBeTruthy();
        expect(MATH_TEXTAREA_LOCALE_EN.templates[item.id]).toBeTruthy();
      }
    }
  });

  it("英文预设没有任何中文（含函数产出）", () => {
    const L = MATH_TEXTAREA_LOCALE_EN;
    const texts = [
      ...Object.values(L).filter((v): v is string => typeof v === "string"),
      ...Object.values(L.syntax),
      ...Object.values(L.templateGroups),
      ...Object.values(L.templates),
      L.insertTemplate("Fraction"),
      L.position(2, 4),
      L.katexError(3, "Undefined control sequence"),
    ];
    for (const t of texts) expect(t).not.toMatch(CJK);
  });

  it("中文句子拼得通：位置前缀 + 句尾", () => {
    const L = MATH_TEXTAREA_LOCALE_ZH;
    expect(`${L.position(2, 4)}${L.syntax["unclosed-math"]}`).toContain("第 2 行第 4 个字符处的「$」没有闭合");
  });
});
