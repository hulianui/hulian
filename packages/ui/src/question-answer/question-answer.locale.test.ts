import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { QUESTION_ANSWER_LOCALE_EN, QUESTION_ANSWER_LOCALE_ZH } from "./question-answer.locale";

const CJK = /[㐀-䶿一-鿿]/u;

/** 把词条表压成字符串数组：函数按代表性参数调一次。 */
function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const f = value as (...args: unknown[]) => unknown;
    return [...flatten(f(2, 3)), ...flatten(f(1, 1))];
  }
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(flatten);
  return [];
}

describe("QuestionAnswer 词条", () => {
  it("中英键集合一致", () => {
    expect(Object.keys(QUESTION_ANSWER_LOCALE_EN).sort()).toEqual(Object.keys(QUESTION_ANSWER_LOCALE_ZH).sort());
  });

  it("英文词条里没有中文", () => {
    for (const s of flatten(QUESTION_ANSWER_LOCALE_EN)) expect(s, s).not.toMatch(CJK);
  });

  it("单空不标空号，多空标", () => {
    expect(QUESTION_ANSWER_LOCALE_ZH.blankAria(1, 1)).not.toContain("1");
    expect(QUESTION_ANSWER_LOCALE_ZH.blankAria(2, 3)).toContain("2");
    expect(QUESTION_ANSWER_LOCALE_EN.blankAria(1, 1)).not.toContain("1");
    expect(QUESTION_ANSWER_LOCALE_EN.blankPlaceholder(2, 3)).toContain("2");
    expect(QUESTION_ANSWER_LOCALE_ZH.blankLabel(2)).toContain("2");
  });

  it("config/locale 的 zhCN / enUS 都接上了", () => {
    expect(zhCN.components?.questionAnswer).toBe(QUESTION_ANSWER_LOCALE_ZH);
    expect(enUS.components?.questionAnswer).toBe(QUESTION_ANSWER_LOCALE_EN);
  });
});
