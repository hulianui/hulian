import { describe, expect, it } from "vitest";
import { MATH_FIELD_LOCALE_EN, MATH_FIELD_LOCALE_ZH } from "./math-field.locale";
import { enUS, zhCN } from "../config/locale";

const CJK = /[㐀-鿿＀-￯]/;

describe("math-field 词条", () => {
  it("中英键集一致，英文零中文字符", () => {
    expect(Object.keys(MATH_FIELD_LOCALE_EN).sort()).toEqual(Object.keys(MATH_FIELD_LOCALE_ZH).sort());
    for (const value of Object.values(MATH_FIELD_LOCALE_EN)) {
      expect(CJK.test(value), value).toBe(false);
    }
  });

  it("config/locale 的 zhCN / enUS 反向引用本文件（SSOT 在这里）", () => {
    expect(zhCN.components?.mathField).toBe(MATH_FIELD_LOCALE_ZH);
    expect(enUS.components?.mathField).toBe(MATH_FIELD_LOCALE_EN);
  });
});
