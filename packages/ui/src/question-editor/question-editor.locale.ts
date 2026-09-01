// QuestionEditor 词条。单独成文件的理由与 question/question.locale.ts 相同：@hulianui/ui/math 入口
// 不能拖进 config/locale.ts 那份全库字典。这里是 SSOT，config/locale.ts 的 zhCN / enUS 反向引用本文件。
// 题型名与判断题两个值不在这里：它们在 question.locale.ts（QuestionCard 也用）。
import type { QuestionType, QuestionValidationCode } from "../question/question.types";

export type SubjectiveType = Extract<QuestionType, "short_answer" | "calculation" | "essay">;

type Detail = Record<string, number | string> | undefined;

export interface QuestionEditorLocale {
  type: string;
  typeHint: string;
  stem: string;
  stemPlaceholder: string;
  stemHint: string;
  insertFigure: string;
  figureAlt: (index: number) => string;
  removeFigure: (index: number) => string;
  /** 题干有图但没给 resolveFigure 时缩略图位置的 title。 */
  figureMissingResolver: string;
  uploading: (name: string) => string;
  uploadFailed: (name: string, message: string) => string;
  dismissUpload: string;
  options: string;
  optionsHint: (min: number, max: number) => string;
  optionLabel: (key: string) => string;
  optionPlaceholder: (key: string) => string;
  addOption: string;
  removeOption: (key: string) => string;
  moveOptionUp: (key: string) => string;
  moveOptionDown: (key: string) => string;
  answer: string;
  singleAnswerHint: string;
  multipleAnswerHint: string;
  blankAnswers: string;
  blankAnswersHint: string;
  blankLabel: (index: number) => string;
  blankPlaceholder: (index: number) => string;
  alternativeLabel: (blank: number, index: number) => string;
  addAlternative: string;
  addAlternativeFor: (blank: number) => string;
  removeAlternative: (blank: number, index: number) => string;
  addBlank: string;
  removeBlank: (index: number) => string;
  blankMismatch: (expected: number, actual: number) => string;
  alignBlanks: (expected: number) => string;
  reference: string;
  /** 三种主观题的参考答案说明与占位。键必须齐：后端加题型这里 tsc 当场红。 */
  referenceCopy: Record<SubjectiveType, { hint: string; placeholder: string }>;
  rubric: string;
  rubricHint: string;
  rubricPoint: (index: number) => string;
  rubricPointPlaceholder: string;
  rubricScore: (index: number) => string;
  addRubricPoint: string;
  removeRubricPoint: (index: number) => string;
  rubricTotal: (total: number, score: number) => string;
  analysis: string;
  analysisPlaceholder: string;
  difficulty: string;
  difficultyHint: string;
  score: string;
  estimatedMinutes: string;
  preview: string;
  previewEmpty: string;
  issues: string;
  resolveIssue: string;
  switchTypeTitle: string;
  switchTypeDescription: string;
  switchTypeConfirm: string;
  cancel: string;
  /** `validateQuestion` 机器码 → 文案。键必须齐。 */
  validation: Record<QuestionValidationCode, (detail?: Detail) => string>;
}

export const QUESTION_EDITOR_LOCALE_ZH: QuestionEditorLocale = {
  type: "题型",
  typeHint: "切换题型会清空选项与答案",
  stem: "题干",
  stemPlaceholder: "题干，公式用 $…$ 包起来",
  stemHint: "填空题在题干里用 ____ 标出空",
  insertFigure: "插入图片",
  figureAlt: (index) => `题图 ${index}`,
  removeFigure: (index) => `删除题图 ${index}`,
  figureMissingResolver: "未提供 resolveFigure，只能显示 key",
  uploading: (name) => `正在上传 ${name}`,
  uploadFailed: (name, message) => `${name} 上传失败：${message}`,
  dismissUpload: "关闭上传提示",
  options: "选项",
  optionsHint: (min, max) => `${min}–${max} 项，字母按顺序自动编号`,
  optionLabel: (key) => `选项 ${key}`,
  optionPlaceholder: (key) => `选项 ${key} 内容`,
  addOption: "添加选项",
  removeOption: (key) => `删除选项 ${key}`,
  moveOptionUp: (key) => `上移选项 ${key}`,
  moveOptionDown: (key) => `下移选项 ${key}`,
  answer: "正确答案",
  singleAnswerHint: "选一项",
  multipleAnswerHint: "至少选两项",
  blankAnswers: "填空答案",
  blankAnswersHint: "每空一行，按题干里空的顺序；一空可加多种等价写法",
  blankLabel: (index) => `第 ${index} 空`,
  blankPlaceholder: (index) => `第 ${index} 空答案`,
  alternativeLabel: (blank, index) => `第 ${blank} 空写法 ${index}`,
  addAlternative: "加一种等价写法",
  addAlternativeFor: (blank) => `第 ${blank} 空加一种等价写法`,
  removeAlternative: (blank, index) => `删除第 ${blank} 空写法 ${index}`,
  addBlank: "添加一空",
  removeBlank: (index) => `删除第 ${index} 空`,
  blankMismatch: (expected, actual) => `题干有 ${expected} 个空，答案有 ${actual} 项`,
  alignBlanks: (expected) => `按题干对齐为 ${expected} 空`,
  reference: "参考答案",
  referenceCopy: {
    short_answer: { hint: "可留空，批阅时由教师评判", placeholder: "简短的参考答案或要点" },
    calculation: { hint: "可留空；写清关键步骤", placeholder: "计算过程与最终结果" },
    essay: { hint: "可留空，批阅时由教师评判", placeholder: "完整解答" },
  },
  rubric: "分步给分",
  rubricHint: "按得分点逐条给分，合计应等于分值",
  rubricPoint: (index) => `得分点 ${index}`,
  rubricPointPlaceholder: "得分点",
  rubricScore: (index) => `得分点 ${index} 分值`,
  addRubricPoint: "添加得分点",
  removeRubricPoint: (index) => `删除得分点 ${index}`,
  rubricTotal: (total, score) => `得分点合计 ${total} 分，题目分值 ${score} 分`,
  analysis: "解析",
  analysisPlaceholder: "解题思路与易错点",
  difficulty: "难度",
  difficultyHint: "1 星最易，5 星最难",
  score: "分值",
  estimatedMinutes: "预估用时（分钟）",
  preview: "预览（与题目展示用同一张卡片）",
  previewEmpty: "输入题干后显示预览",
  issues: "待复核",
  resolveIssue: "已处理",
  switchTypeTitle: "切换题型？",
  switchTypeDescription: "当前的选项与答案会被清空。",
  switchTypeConfirm: "清空并切换",
  cancel: "取消",
  validation: {
    stem_empty: () => "题干不能为空",
    options_too_few: () => "至少需要 2 个选项",
    options_too_many: () => "最多 8 个选项",
    option_empty: (d) => `选项 ${d?.key ?? ""} 不能为空`,
    options_forbidden: () => "该题型不应有选项",
    answer_out_of_range: () => "答案必须在选项范围内",
    multiple_answer_too_few: () => "多选题答案至少两项",
    judge_not_boolean: () => "答案必须是「正确」或「错误」",
    blank_empty: () => "每个空都要有答案",
    blank_count_mismatch: (d) => `题干有 ${d?.expected ?? "?"} 个空，答案有 ${d?.actual ?? "?"} 项`,
    subjective_answer_shape: () => "参考答案应是文本或分步给分",
    difficulty_range: () => "难度需在 1–5 之间",
    score_negative: () => "分值不能为负数",
  },
};

export const QUESTION_EDITOR_LOCALE_EN: QuestionEditorLocale = {
  type: "Type",
  typeHint: "Switching the type clears options and answer",
  stem: "Stem",
  stemPlaceholder: "Stem; wrap formulas in $…$",
  stemHint: "For fill-in-the-blank, mark each blank with ____ in the stem",
  insertFigure: "Insert image",
  figureAlt: (index) => `Figure ${index}`,
  removeFigure: (index) => `Remove figure ${index}`,
  figureMissingResolver: "No resolveFigure provided; only the key can be shown",
  uploading: (name) => `Uploading ${name}`,
  uploadFailed: (name, message) => `${name} failed to upload: ${message}`,
  dismissUpload: "Dismiss upload notice",
  options: "Options",
  optionsHint: (min, max) => `${min} to ${max} options, lettered in order`,
  optionLabel: (key) => `Option ${key}`,
  optionPlaceholder: (key) => `Option ${key} text`,
  addOption: "Add option",
  removeOption: (key) => `Remove option ${key}`,
  moveOptionUp: (key) => `Move option ${key} up`,
  moveOptionDown: (key) => `Move option ${key} down`,
  answer: "Correct answer",
  singleAnswerHint: "Pick one",
  multipleAnswerHint: "Pick at least two",
  blankAnswers: "Blank answers",
  blankAnswersHint: "One row per blank, in stem order; a blank may accept several equivalent forms",
  blankLabel: (index) => `Blank ${index}`,
  blankPlaceholder: (index) => `Answer for blank ${index}`,
  alternativeLabel: (blank, index) => `Blank ${blank} form ${index}`,
  addAlternative: "Add equivalent form",
  addAlternativeFor: (blank) => `Add equivalent form for blank ${blank}`,
  removeAlternative: (blank, index) => `Remove blank ${blank} form ${index}`,
  addBlank: "Add blank",
  removeBlank: (index) => `Remove blank ${index}`,
  blankMismatch: (expected, actual) => `The stem has ${expected} blanks; the answer has ${actual} entries`,
  alignBlanks: (expected) => `Align to ${expected} blanks`,
  reference: "Reference answer",
  referenceCopy: {
    short_answer: { hint: "Optional; graded by the teacher", placeholder: "Brief reference answer or key points" },
    calculation: { hint: "Optional; show the key steps", placeholder: "Working and final result" },
    essay: { hint: "Optional; graded by the teacher", placeholder: "Full worked solution" },
  },
  rubric: "Rubric",
  rubricHint: "Score point by point; the total should equal the question score",
  rubricPoint: (index) => `Rubric point ${index}`,
  rubricPointPlaceholder: "Rubric point",
  rubricScore: (index) => `Score for rubric point ${index}`,
  addRubricPoint: "Add rubric point",
  removeRubricPoint: (index) => `Remove rubric point ${index}`,
  rubricTotal: (total, score) => `Rubric total ${total}, question score ${score}`,
  analysis: "Explanation",
  analysisPlaceholder: "Approach and common mistakes",
  difficulty: "Difficulty",
  difficultyHint: "1 star easiest, 5 stars hardest",
  score: "Score",
  estimatedMinutes: "Estimated time (minutes)",
  preview: "Preview (the same card used for display)",
  previewEmpty: "Preview appears once the stem has text",
  issues: "Needs review",
  resolveIssue: "Resolved",
  switchTypeTitle: "Switch question type?",
  switchTypeDescription: "The current options and answer will be cleared.",
  switchTypeConfirm: "Clear and switch",
  cancel: "Cancel",
  validation: {
    stem_empty: () => "Stem is required",
    options_too_few: () => "At least 2 options are required",
    options_too_many: () => "At most 8 options",
    option_empty: (d) => `Option ${d?.key ?? ""} is empty`,
    options_forbidden: () => "This type does not take options",
    answer_out_of_range: () => "Answer must be one of the options",
    multiple_answer_too_few: () => "Multiple choice needs at least two answers",
    judge_not_boolean: () => "Answer must be True or False",
    blank_empty: () => "Every blank needs an answer",
    blank_count_mismatch: (d) =>
      `The stem has ${d?.expected ?? "?"} blanks; the answer has ${d?.actual ?? "?"} entries`,
    subjective_answer_shape: () => "Reference answer must be text or a rubric",
    difficulty_range: () => "Difficulty must be between 1 and 5",
    score_negative: () => "Score cannot be negative",
  },
};
