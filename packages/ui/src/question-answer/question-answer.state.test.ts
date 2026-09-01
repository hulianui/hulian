import { describe, expect, it } from "vitest";
import {
  answerKind,
  blankValues,
  canSubmit,
  choiceKey,
  choiceKeys,
  currentAnswer,
  isKnownQuestionType,
  resolveBlankCount,
  setBlank,
} from "./question-answer.state";

describe("answerKind：这道题该用哪种作答控件", () => {
  it.each([
    // 回归 #150：判断题的 options 在题库里是 null，它不能掉进「从 options 取选项」的分支
    [{ type: "judge", options: null }, "judge"],
    [{ type: "blank", options: null }, "blank"],
    // 回归 #136：对象形 options 不能被滤成空
    [{ type: "single", options: [{ key: "A", text: "甲" }, { key: "B", text: "乙" }] }, "single"],
    [{ type: "multiple", options: [{ key: "A", text: "甲" }, { key: "B", text: "乙" }] }, "multiple"],
    [{ type: "single", options: null }, "unanswerable"],
    [{ type: "multiple", options: [] }, "unanswerable"],
    [{ type: "short_answer", options: null }, "subjective"],
    [{ type: "calculation", options: null }, "subjective"],
    [{ type: "essay", options: null }, "subjective"],
    // 未知题型按主观题只读
    [{ type: "matching", options: null }, "subjective"],
  ] as const)("%j → %s", (question, expected) => {
    expect(answerKind(question as Parameters<typeof answerKind>[0])).toBe(expected);
  });

  it("字符串形 options（历史数据）也算有选项", () => {
    expect(answerKind({ type: "single", options: ["A. 甲", "B. 乙"] as never })).toBe("single");
  });
});

describe("isKnownQuestionType", () => {
  it("七型认识，其余不认识", () => {
    for (const t of ["single", "multiple", "judge", "blank", "short_answer", "calculation", "essay"]) {
      expect(isKnownQuestionType(t)).toBe(true);
    }
    expect(isKnownQuestionType("matching")).toBe(false);
    expect(isKnownQuestionType("")).toBe(false);
  });
});

describe("resolveBlankCount：这道填空题该给几个输入框", () => {
  it.each([
    [{ stem: "a____b", blankCount: 3 }, 3],
    // blankCount 缺失 / 不合法：按题干里的 ____ 数
    [{ stem: "甲____乙____丙" }, 2],
    [{ stem: "甲____乙____丙", blankCount: 0 }, 2],
    [{ stem: "甲____乙", blankCount: 2.5 }, 1],
    [{ stem: "甲____乙", blankCount: -1 }, 1],
    // 都没有：按 1 兜底，绝不猜
    [{ stem: "没有下划线的老题" }, 1],
    // 单个下划线是下标不是空
    [{ stem: "$a_1$ 的值" }, 1],
  ])("%j → %d", (question, expected) => {
    expect(resolveBlankCount(question)).toBe(expected);
  });
});

describe("canSubmit：这份作答能不能交", () => {
  it.each([
    [undefined, false],
    ["", false],
    ["  ", false],
    ["A", true],
    ["true", true],
    [[], false],
    [["1", ""], false],
    [[" "], false],
    // 多空每个空都要填了才让交
    [["1", "2"], true],
    [["7"], true],
  ])("%j → %s", (answer, expected) => {
    expect(canSubmit(answer)).toBe(expected);
  });
});

describe("blankValues：把 value 归一成「每空一项」", () => {
  it("undefined → count 个空串", () => {
    expect(blankValues(undefined, 2)).toEqual(["", ""]);
  });
  it("数组短了补空、长了截断", () => {
    expect(blankValues(["a"], 2)).toEqual(["a", ""]);
    expect(blankValues(["a", "b", "c"], 2)).toEqual(["a", "b"]);
  });
  it("续做：服务端记的多空 JSON 字面量解开", () => {
    expect(blankValues('["150","30"]', 2)).toEqual(["150", "30"]);
  });
  it("续做：单空不解析 JSON（区间 [1,2] 是正常答案）", () => {
    expect(blankValues("[1,2]", 1)).toEqual(["[1,2]"]);
  });
  it("续做：解析不了整串进第一个空", () => {
    expect(blankValues("150,30", 2)).toEqual(["150,30", ""]);
  });
});

describe("setBlank", () => {
  it("只改那一空，不改原数组", () => {
    const before = ["a", "b"];
    expect(setBlank(before, 1, "c")).toEqual(["a", "c"]);
    expect(before).toEqual(["a", "b"]);
  });
});

describe("choiceKeys / choiceKey", () => {
  it.each([
    [["A", "C"], ["A", "C"]],
    ["A,C", ["A", "C"]],
    ["A，C", ["A", "C"]],
    ["A C", ["A", "C"]],
    ["", []],
    [undefined, []],
  ])("choiceKeys(%j) → %j", (value, expected) => {
    expect(choiceKeys(value)).toEqual(expected);
  });
  it.each([
    ["A", "A"],
    ["true", "true"],
    [["A"], ""],
    [undefined, ""],
  ])("choiceKey(%j) → %j", (value, expected) => {
    expect(choiceKey(value)).toBe(expected);
  });
});

describe("currentAnswer：提交与 canSubmit 用的规范形", () => {
  it("填空恒为逐空数组（单空也是一项数组）", () => {
    expect(currentAnswer("blank", undefined, 2)).toEqual(["", ""]);
    expect(currentAnswer("blank", ["7"], 1)).toEqual(["7"]);
  });
  it("多选为 key 数组", () => {
    expect(currentAnswer("multiple", "A,C", 1)).toEqual(["A", "C"]);
  });
  it("单选 / 判断为字符串", () => {
    expect(currentAnswer("single", "B", 1)).toBe("B");
    expect(currentAnswer("judge", "true", 1)).toBe("true");
    expect(currentAnswer("judge", undefined, 1)).toBe("");
  });
});
