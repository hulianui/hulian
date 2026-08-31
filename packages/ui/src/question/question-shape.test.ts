import { describe, expect, it } from "vitest";
import {
  DEFAULT_SCORE_BY_TYPE,
  SUBJECTIVE_TYPES,
  blankCount,
  defaultShape,
  emptyQuestion,
  isSubjective,
  normalizeOptions,
  optionKey,
  validateQuestion,
} from "./question-shape";
import { QUESTION_TYPES, type Question } from "./question.types";

describe("question-shape · 常量", () => {
  it("主观题名单 = short_answer / calculation / essay", () => {
    expect([...SUBJECTIVE_TYPES].sort()).toEqual(["calculation", "essay", "short_answer"]);
    expect(isSubjective("blank")).toBe(false);
    expect(isSubjective("essay")).toBe(true);
  });

  it("默认分七型齐全且与消费方一致", () => {
    expect(DEFAULT_SCORE_BY_TYPE).toEqual({
      single: 3,
      judge: 3,
      multiple: 4,
      blank: 4,
      short_answer: 5,
      calculation: 8,
      essay: 8,
    });
  });

  it("optionKey 按下标给字母", () => {
    expect([0, 1, 7].map(optionKey)).toEqual(["A", "B", "H"]);
  });
});

describe("question-shape · defaultShape", () => {
  it("七型各有一行且形状互不串", () => {
    expect(defaultShape("single")).toEqual({
      options: [
        { key: "A", text: "" },
        { key: "B", text: "" },
      ],
      answer: "",
    });
    expect(defaultShape("multiple").answer).toEqual([]);
    expect(defaultShape("judge")).toEqual({ options: null, answer: true });
    expect(defaultShape("blank")).toEqual({ options: null, answer: [""] });
    for (const t of ["short_answer", "calculation", "essay"] as const) {
      expect(defaultShape(t)).toEqual({ options: null, answer: "" });
    }
  });

  it("emptyQuestion 带默认分与难度 3", () => {
    const q = emptyQuestion();
    expect(q.type).toBe("single");
    expect(q.score).toBe(3);
    expect(q.difficulty).toBe(3);
    expect(emptyQuestion("essay").score).toBe(8);
  });
});

describe("question-shape · normalizeOptions（三种历史形状全收）", () => {
  it("对象形 {key,text}", () => {
    expect(normalizeOptions([{ key: "A", text: "50°" }])).toEqual([{ key: "A", text: "50°" }]);
  });
  it("字符串形带字母前缀，四种分隔符，字母以自己写的为准", () => {
    expect(normalizeOptions(["B. 乙", "A、甲", "C．丙", "D：丁"])).toEqual([
      { key: "B", text: "乙" },
      { key: "A", text: "甲" },
      { key: "C", text: "丙" },
      { key: "D", text: "丁" },
    ]);
  });
  it("字符串形无前缀按下标补字母（不取整串首字符）", () => {
    expect(normalizeOptions(["60°", "-8a⁶b³"])).toEqual([
      { key: "A", text: "60°" },
      { key: "B", text: "-8a⁶b³" },
    ]);
  });
  it("对象形缺 key 按下标补；text 非字符串回退 JSON 字面量", () => {
    expect(normalizeOptions([{ text: "x" }, { key: "B", text: 1 }])).toEqual([
      { key: "A", text: "x" },
      { key: "B", text: '{"key":"B","text":1}' },
    ]);
  });
  it("非数组 / 空数组回 []", () => {
    expect(normalizeOptions(null)).toEqual([]);
    expect(normalizeOptions([])).toEqual([]);
    expect(normalizeOptions("A")).toEqual([]);
  });
});

describe("question-shape · blankCount", () => {
  it("数 ≥2 连续下划线的段数；$ 内外都算；单个 _ 不算", () => {
    expect(blankCount("a____b____")).toBe(2);
    expect(blankCount("$x_1 + ____ = 2$，则 y=____")).toBe(2);
    expect(blankCount("没有空")).toBe(0);
    expect(blankCount("__")).toBe(1);
  });
});

const base: Question = {
  type: "single",
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
  ],
  answer: "A",
  analysis: "",
  difficulty: 3,
  score: 3,
};

describe("question-shape · validateQuestion（与后端 _check_type_shape 同构）", () => {
  it("合法单选零问题", () => {
    expect(validateQuestion(base)).toEqual([]);
  });
  it("题干为空", () => {
    expect(validateQuestion({ ...base, stem: "  " })).toContainEqual({
      field: "stem",
      code: "stem_empty",
    });
  });
  it("选项不足 2 / 超过 8 / 有空选项", () => {
    expect(validateQuestion({ ...base, options: [{ key: "A", text: "甲" }] })).toContainEqual({
      field: "options",
      code: "options_too_few",
    });
    const nine = Array.from({ length: 9 }, (_, i) => ({ key: optionKey(i), text: "x" }));
    expect(validateQuestion({ ...base, options: nine })).toContainEqual({
      field: "options",
      code: "options_too_many",
    });
    expect(
      validateQuestion({ ...base, options: [{ key: "A", text: "甲" }, { key: "B", text: " " }] }),
    ).toContainEqual({ field: "options", code: "option_empty", detail: { key: "B" } });
  });
  it("单选答案越界；多选至少两项且都在范围内", () => {
    expect(validateQuestion({ ...base, answer: "C" })).toContainEqual({
      field: "answer",
      code: "answer_out_of_range",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A"] })).toContainEqual({
      field: "answer",
      code: "multiple_answer_too_few",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A", "Z"] })).toContainEqual({
      field: "answer",
      code: "answer_out_of_range",
    });
    expect(validateQuestion({ ...base, type: "multiple", answer: ["A", "B"] })).toEqual([]);
  });
  it("判断题不许有选项且答案必须布尔", () => {
    expect(validateQuestion({ ...base, type: "judge", answer: true })).toContainEqual({
      field: "options",
      code: "options_forbidden",
    });
    expect(validateQuestion({ ...base, type: "judge", options: null, answer: "true" })).toContainEqual(
      { field: "answer", code: "judge_not_boolean" },
    );
    expect(validateQuestion({ ...base, type: "judge", options: null, answer: false })).toEqual([]);
  });
  it("填空：答案非空；空数与题干不一致报 detail", () => {
    const q: Question = { ...base, type: "blank", options: null, stem: "a____b____", answer: ["1", "2"] };
    expect(validateQuestion(q)).toEqual([]);
    expect(validateQuestion({ ...q, answer: ["1", " "] })).toContainEqual({
      field: "answer",
      code: "blank_empty",
    });
    expect(validateQuestion({ ...q, answer: [["1", "一"]] })).toContainEqual({
      field: "answer",
      code: "blank_count_mismatch",
      detail: { expected: 2, actual: 1 },
    });
    // 题干没写下划线时不比空数（老数据大量如此），只查非空
    expect(validateQuestion({ ...q, stem: "没有空位", answer: ["1"] })).toEqual([]);
  });
  it("主观题允许 null / 空串 / Rubric，但拒绝选择题形状", () => {
    const q: Question = { ...base, type: "essay", options: null, answer: null };
    expect(validateQuestion(q)).toEqual([]);
    expect(validateQuestion({ ...q, answer: "" })).toEqual([]);
    expect(
      validateQuestion({ ...q, type: "calculation", answer: { reference: "x=3", rubric: [] } }),
    ).toEqual([]);
    expect(validateQuestion({ ...q, answer: ["A", "B"] })).toContainEqual({
      field: "answer",
      code: "subjective_answer_shape",
    });
    expect(validateQuestion({ ...q, answer: true })).toContainEqual({
      field: "answer",
      code: "subjective_answer_shape",
    });
  });
  it("难度 1–5、分值非负", () => {
    expect(validateQuestion({ ...base, difficulty: 0 })).toContainEqual({
      field: "difficulty",
      code: "difficulty_range",
    });
    expect(validateQuestion({ ...base, score: -1 })).toContainEqual({
      field: "score",
      code: "score_negative",
    });
  });
  it("七型每一型 defaultShape 出来的值都能通过（题干补上后）", () => {
    for (const type of QUESTION_TYPES) {
      const q = { ...emptyQuestion(type), stem: "题干" };
      const issues = validateQuestion(q).filter(
        // 默认形状里选项文本为空、单选答案为空是「还没填」，属于预期问题
        (i) => !["option_empty", "answer_out_of_range", "multiple_answer_too_few", "blank_empty"].includes(i.code),
      );
      expect(issues, type).toEqual([]);
    }
  });
});
