import { describe, expect, it } from "vitest";
import { enUS, zhCN } from "../config/locale";
import { QUESTION_EDITOR_LOCALE_EN, QUESTION_EDITOR_LOCALE_ZH } from "./question-editor.locale";

const CJK = /[㐀-䶿一-鿿]/u;

/** 把词条表压成字符串数组：函数按代表性参数调一次。 */
function flatten(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const f = value as (...args: unknown[]) => unknown;
    return flatten(f("A", 2, { key: "A", expected: 2, actual: 1 }));
  }
  if (value !== null && typeof value === "object") return Object.values(value).flatMap(flatten);
  return [];
}

function keysOf(value: unknown, prefix = ""): string[] {
  if (value === null || typeof value !== "object" || typeof value === "function") return [prefix];
  return Object.entries(value).flatMap(([k, v]) =>
    typeof v === "object" && v !== null ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe("QuestionEditor 词条", () => {
  it("中英键集合一致", () => {
    expect(keysOf(QUESTION_EDITOR_LOCALE_EN).sort()).toEqual(keysOf(QUESTION_EDITOR_LOCALE_ZH).sort());
  });

  it("英文词条里没有中文", () => {
    for (const s of flatten(QUESTION_EDITOR_LOCALE_EN)) expect(s, s).not.toMatch(CJK);
  });

  it("插值函数把参数放进句子", () => {
    expect(QUESTION_EDITOR_LOCALE_ZH.blankMismatch(3, 1)).toContain("3");
    expect(QUESTION_EDITOR_LOCALE_ZH.blankMismatch(3, 1)).toContain("1");
    expect(QUESTION_EDITOR_LOCALE_EN.validation.option_empty({ key: "B" })).toContain("B");
    expect(QUESTION_EDITOR_LOCALE_EN.validation.blank_count_mismatch({ expected: 2, actual: 3 })).toContain("2");
  });

  it("config/locale 的 zhCN / enUS 都接上了", () => {
    expect(zhCN.components?.questionEditor).toBe(QUESTION_EDITOR_LOCALE_ZH);
    expect(enUS.components?.questionEditor).toBe(QUESTION_EDITOR_LOCALE_EN);
  });
});
