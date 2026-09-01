import { describe, expect, it } from "vitest";
import { emptyQuestion } from "../question/question-shape";
import type { Question } from "../question/question.types";
import {
  addBlank,
  addBlankWriting,
  addOption,
  addRubricPoint,
  addStemFigure,
  alignBlanks,
  blankCells,
  blankMismatch,
  blankWritings,
  disableRubric,
  enableRubric,
  isRubric,
  issuesByField,
  joinStemFigures,
  moveOption,
  optionCaption,
  questionFormulaIssues,
  referenceText,
  removeBlank,
  removeBlankWriting,
  removeOption,
  removeRubricPoint,
  removeStemFigure,
  rubricTotal,
  scoreDefaults,
  setBlankWriting,
  setEstimatedMinutes,
  setOptionText,
  setReference,
  setRubricPoint,
  setStemBody,
  shapeIsDirty,
  stemBody,
  stemFigures,
  switchType,
} from "./question-editor.state";

const single = (): Question => ({
  ...emptyQuestion("single"),
  stem: "题干",
  options: [
    { key: "A", text: "甲" },
    { key: "B", text: "乙" },
    { key: "C", text: "丙" },
  ],
  answer: "C",
});

describe("题型切换", () => {
  it("scoreDefaults 用覆盖值盖住内置默认分", () => {
    expect(scoreDefaults({ essay: 12 }).essay).toBe(12);
    expect(scoreDefaults({ essay: 12 }).single).toBe(3);
  });

  it.each([
    ["空单选不脏", emptyQuestion("single"), false],
    [
      "填了选项就脏",
      { ...emptyQuestion("single"), options: [{ key: "A", text: "x" }, { key: "B", text: "" }] },
      true,
    ],
    ["选了答案就脏", { ...emptyQuestion("single"), answer: "A" }, true],
    ["判断题默认 true 不脏", emptyQuestion("judge"), false],
    ["判断题改成 false 就脏", { ...emptyQuestion("judge"), answer: false }, true],
    ["空填空不脏", emptyQuestion("blank"), false],
  ] as const)("shapeIsDirty：%s", (_, q, expected) => {
    expect(shapeIsDirty(q)).toBe(expected);
  });

  it("switchType 同时重置 options 与 answer，不带旧题型的形状", () => {
    const next = switchType(single(), "judge");
    expect(next.type).toBe("judge");
    expect(next.options).toBeNull();
    expect(next.answer).toBe(true);
    expect(next.stem).toBe("题干");
  });

  it("switchType：score 等于旧题型默认分时换成新默认分，改过则保留", () => {
    expect(switchType(single(), "essay").score).toBe(8);
    expect(switchType({ ...single(), score: 5 }, "essay").score).toBe(5);
    expect(switchType(single(), "essay", scoreDefaults({ essay: 12 })).score).toBe(12);
  });

  it("switchType 同题型原样返回", () => {
    const q = single();
    expect(switchType(q, "single")).toBe(q);
  });
});

describe("选项", () => {
  it("setOptionText 只改那一项", () => {
    expect(setOptionText(single(), 1, "乙乙").options).toEqual([
      { key: "A", text: "甲" },
      { key: "B", text: "乙乙" },
      { key: "C", text: "丙" },
    ]);
  });

  it("addOption 按下标补字母；到 8 个停", () => {
    expect(addOption(single()).options?.map((o) => o.key)).toEqual(["A", "B", "C", "D"]);
    let q = single();
    for (let i = 0; i < 10; i++) q = addOption(q);
    expect(q.options).toHaveLength(8);
  });

  it("removeOption 重排字母，答案跟着被删项之后的重排走", () => {
    const next = removeOption(single(), 0);
    expect(next.options).toEqual([
      { key: "A", text: "乙" },
      { key: "B", text: "丙" },
    ]);
    expect(next.answer).toBe("B");
  });

  it("removeOption 删掉的正是答案项时答案清空", () => {
    expect(removeOption(single(), 2).answer).toBe("");
  });

  it("removeOption 多选：删掉的 key 去掉，其余重映射并排序", () => {
    const q: Question = { ...single(), type: "multiple", answer: ["A", "C"] };
    expect(removeOption(q, 0).answer).toEqual(["B"]);
    expect(removeOption(q, 1).answer).toEqual(["A", "B"]);
  });

  it("removeOption 只剩两项时不再删", () => {
    const q = removeOption(single(), 0);
    expect(removeOption(q, 0)).toBe(q);
  });

  it("moveOption 内容移动、字母按新位置重排、答案跟着内容走", () => {
    const next = moveOption(single(), 2, 0);
    expect(next.options).toEqual([
      { key: "A", text: "丙" },
      { key: "B", text: "甲" },
      { key: "C", text: "乙" },
    ]);
    expect(next.answer).toBe("A");
  });

  it("moveOption 越界或原地原样返回", () => {
    const q = single();
    expect(moveOption(q, 0, -1)).toBe(q);
    expect(moveOption(q, 2, 3)).toBe(q);
    expect(moveOption(q, 1, 1)).toBe(q);
  });

  it("optionCaption：空文本只给字母，有文本取朴素文本前 20 字", () => {
    expect(optionCaption("A", "")).toBe("A");
    expect(optionCaption("B", "$\\frac{1}{2}$")).toBe("B 1/2");
    expect(optionCaption("C", "一二三四五六七八九十一二三四五六七八九十廿一")).toBe(
      "C 一二三四五六七八九十一二三四五六七八九十…",
    );
  });
});

describe("填空", () => {
  const blank = (): Question => ({
    ...emptyQuestion("blank"),
    stem: "a=____，b=____",
    answer: ["1", ["2", "2.0"]],
  });

  it("blankCells / blankWritings 把两种形状展平", () => {
    expect(blankCells(blank().answer)).toEqual(["1", ["2", "2.0"]]);
    expect(blankCells("")).toEqual([""]);
    expect(blankCells([])).toEqual([""]);
    expect(blankWritings("1")).toEqual(["1"]);
    expect(blankWritings(["2", "2.0"])).toEqual(["2", "2.0"]);
    expect(blankWritings([])).toEqual([""]);
    expect(blankWritings(undefined)).toEqual([""]);
  });

  it("setBlankWriting：单写法存字符串，多写法存数组", () => {
    expect(setBlankWriting(blank(), 0, 0, "10").answer).toEqual(["10", ["2", "2.0"]]);
    expect(setBlankWriting(blank(), 1, 1, "2.00").answer).toEqual(["1", ["2", "2.00"]]);
  });

  it("addBlankWriting / removeBlankWriting：加一种写法变数组，删到一种收回字符串", () => {
    expect(addBlankWriting(blank(), 0).answer).toEqual([["1", ""], ["2", "2.0"]]);
    expect(removeBlankWriting(blank(), 1, 1).answer).toEqual(["1", "2"]);
    // 单写法不可删：返回原对象
    const q0 = blank();
    expect(removeBlankWriting(q0, 0, 0)).toBe(q0);
  });

  it("addBlank / removeBlank：至少保留一空", () => {
    expect(addBlank(blank()).answer).toEqual(["1", ["2", "2.0"], ""]);
    expect(removeBlank(blank(), 0).answer).toEqual([["2", "2.0"]]);
    const one = removeBlank(blank(), 0);
    expect(removeBlank(one, 0)).toBe(one);
  });

  it("blankMismatch：题干有空且数目不同才报；题干没写空不比", () => {
    expect(blankMismatch({ stem: "a=____", answer: ["1", "2"] })).toEqual({ expected: 1, actual: 2 });
    expect(blankMismatch(blank())).toBeNull();
    expect(blankMismatch({ stem: "没有空", answer: ["1", "2"] })).toBeNull();
  });

  it("alignBlanks：多的截掉、少的补空串，至少 1 空", () => {
    expect(alignBlanks(blank(), 3).answer).toEqual(["1", ["2", "2.0"], ""]);
    expect(alignBlanks(blank(), 1).answer).toEqual(["1"]);
    expect(alignBlanks(blank(), 0).answer).toEqual(["1"]);
  });
});

describe("主观题", () => {
  const essay = (): Question => ({ ...emptyQuestion("essay"), answer: "参考" });

  it("isRubric / referenceText 三种形状", () => {
    expect(isRubric("x")).toBe(false);
    expect(isRubric(null)).toBe(false);
    expect(isRubric(["A"])).toBe(false);
    expect(isRubric({ reference: "r", rubric: [] })).toBe(true);
    expect(referenceText("x")).toBe("x");
    expect(referenceText(null)).toBe("");
    expect(referenceText({ reference: "r", rubric: [] })).toBe("r");
  });

  it("setReference：纯文本直接写；分步给分只改 reference", () => {
    expect(setReference(essay(), "新").answer).toBe("新");
    const q = enableRubric(essay());
    expect(setReference(q, "新").answer).toEqual({ reference: "新", rubric: [{ point: "" }] });
  });

  it("enableRubric 保留参考答案并给一条空得分点；disableRubric 只留参考答案", () => {
    const on = enableRubric(essay());
    expect(on.answer).toEqual({ reference: "参考", rubric: [{ point: "" }] });
    expect(enableRubric(on)).toBe(on);
    expect(disableRubric(on).answer).toBe("参考");
    // 本来就不是分步给分：返回原对象
    const q0 = essay();
    expect(disableRubric(q0)).toBe(q0);
  });

  it("得分点增删改与合计", () => {
    let q = enableRubric(essay());
    q = setRubricPoint(q, 0, { point: "列式", score: 3 });
    q = addRubricPoint(q);
    q = setRubricPoint(q, 1, { point: "求解", score: 5 });
    expect(q.answer).toEqual({
      reference: "参考",
      rubric: [
        { point: "列式", score: 3 },
        { point: "求解", score: 5 },
      ],
    });
    expect(rubricTotal(q.answer)).toBe(8);
    expect(rubricTotal("x")).toBe(0);
    q = setRubricPoint(q, 1, { score: undefined });
    expect(rubricTotal(q.answer)).toBe(3);
    q = removeRubricPoint(q, 1);
    expect(isRubric(q.answer) && q.answer.rubric).toHaveLength(1);
    expect(removeRubricPoint(q, 0)).toBe(q);
  });

  it("非分步给分时得分点函数原样返回", () => {
    const q = essay();
    expect(setRubricPoint(q, 0, { point: "x" })).toBe(q);
    expect(addRubricPoint(q)).toBe(q);
    expect(removeRubricPoint(q, 0)).toBe(q);
  });
});

describe("题图", () => {
  it("joinStemFigures：无图原样；有图接在正文后、空正文只有图块", () => {
    expect(joinStemFigures("正文", [])).toBe("正文");
    expect(joinStemFigures("正文", ["a.png", "b.png"])).toBe("正文\n\n![](a.png)\n![](b.png)");
    expect(joinStemFigures("", ["a.png"])).toBe("![](a.png)");
    expect(joinStemFigures("   ", ["a.png"])).toBe("![](a.png)");
  });

  it("stemBody：编辑器写回的形状整块切掉，保住正文末尾的换行", () => {
    expect(stemBody("正文\n\n![](a.png)")).toBe("正文");
    expect(stemBody("正文\n\n\n![](a.png)\n![](b.png)")).toBe("正文\n");
    expect(stemBody("![](a.png)")).toBe("");
    expect(stemBody("没有图")).toBe("没有图");
  });

  it("stemBody：图夹在正文中间（导入线的形状）退回通用剥离", () => {
    expect(stemBody("看图 ![](import/a.png) 求面积")).toBe("看图 求面积");
  });

  it("stemFigures / setStemBody / addStemFigure / removeStemFigure 来回一致", () => {
    let q: Question = { ...emptyQuestion("blank"), stem: "正文\n\n![](a.png)" };
    expect(stemFigures(q.stem)).toEqual(["a.png"]);
    q = setStemBody(q, "正文改了\n");
    expect(q.stem).toBe("正文改了\n\n\n![](a.png)");
    expect(stemBody(q.stem)).toBe("正文改了\n");
    q = addStemFigure(q, "b.png");
    expect(stemFigures(q.stem)).toEqual(["a.png", "b.png"]);
    expect(addStemFigure(q, "b.png")).toBe(q);
    q = removeStemFigure(q, "a.png");
    expect(q.stem).toBe("正文改了\n\n\n![](b.png)");
    expect(removeStemFigure(q, "zzz.png")).toBe(q);
    q = removeStemFigure(q, "b.png");
    expect(q.stem).toBe("正文改了\n");
  });
});

describe("其余", () => {
  it("setEstimatedMinutes：null 删掉字段而不是写 undefined", () => {
    const q = setEstimatedMinutes(emptyQuestion("single"), 5);
    expect(q.estimatedMinutes).toBe(5);
    expect("estimatedMinutes" in setEstimatedMinutes(q, null)).toBe(false);
  });

  it("issuesByField 每个字段只留第一条", () => {
    const grouped = issuesByField([
      { field: "options", code: "option_empty", detail: { key: "A" } },
      { field: "options", code: "option_empty", detail: { key: "B" } },
      { field: "answer", code: "answer_out_of_range" },
    ]);
    expect(grouped.options?.detail).toEqual({ key: "A" });
    expect(grouped.answer?.code).toBe("answer_out_of_range");
    expect(grouped.stem).toBeUndefined();
  });

  it("questionFormulaIssues 逐字段跑语法自检并带上是哪一项", () => {
    const q: Question = {
      ...emptyQuestion("multiple"),
      stem: "定价 $100 元",
      options: [
        { key: "A", text: "$x$" },
        { key: "B", text: "$\\frac{1}{2$" },
      ],
      answer: ["A", "B"],
      analysis: "ok",
    };
    expect(questionFormulaIssues(q)).toEqual([
      { field: "stem", issue: expect.objectContaining({ code: "unclosed-math" }) },
      { field: "options", key: "B", issue: expect.objectContaining({ code: "unclosed-brace" }) },
    ]);
  });

  it("questionFormulaIssues 覆盖填空每空每写法、参考答案与得分点、解析", () => {
    const blank: Question = {
      ...emptyQuestion("blank"),
      stem: "a=____",
      answer: [["1", "$2"]],
      analysis: "$x",
    };
    expect(questionFormulaIssues(blank).map((i) => [i.field, i.key])).toEqual([
      ["answer", "1"],
      ["analysis", undefined],
    ]);
    const essay: Question = {
      ...emptyQuestion("essay"),
      stem: "题",
      answer: { reference: "$r", rubric: [{ point: "ok" }, { point: "$p" }] },
    };
    expect(questionFormulaIssues(essay).map((i) => [i.field, i.key])).toEqual([
      ["answer", undefined],
      ["answer", "2"],
    ]);
  });
});
