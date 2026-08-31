# 数学题制作、作答与判分件（QuestionEditor / QuestionAnswer / MathTextarea / MathField / grade）设计

**日期：** 2026-08-31

**状态：** 用户已批准五节设计（2026-08-31），spec 待用户复核，实施尚未开始

**目标：** 在已有 `Formula`（KaTeX）与 `QuestionCard` 之上，补齐「一道数学题」从录入/复核、学生作答到客观题判分的整条链路，让首个消费方 5069tk-app 删掉它自建的录题表单、公式输入框、作答卡与答案格式化函数，全部改吃库件。

## 1. 背景与成功标准

### 1.1 背景

- 库内 `@hulianui/ui/math` 已有 `Formula`（`$…$` 混排、填空槽 `____`）与展示件 `QuestionCard`。`QuestionCard` 的 `kind` 只有 `choice / fill / solution / judge` 四型，且没有答案、解析、分值字段。
- 首个消费方 5069tk-app（`/Users/zhangzhiwei/Desktop/code/5069tk-app`，FastAPI + Next.js 16）已经在业务仓里造了本该属于库的东西：
  - `web/components/formula-input.tsx` + `web/lib/formula-editing.ts`：公式按钮 + 模板面板 + KaTeX 实时预览 + 提交前语法自检（未闭合 `$`、不配对 `{}` 报行列）。
  - `web/components/question-form.tsx`（1221 行）：七型题目表单，约三分之一是私有字段（学科 / 教材小节 / 考点树 / 通用题授权 / 上传端点）。
  - `web/components/h5/question-card.tsx` + `web/lib/practice-answer.ts` + `web/lib/question-options.ts` + `web/lib/answer-format.ts`：学生作答卡与答案形状归一，里面记着三条曾经静默让学生「答不了」的 bug。
  - `web/lib/question-stem.ts`：题干先切 `![](key)` 图再排公式，判据在 `contracts/stem-figures.json`。
- 消费方的权威口径（本设计逐字对齐，不另造）：
  - 题型 7 个受控枚举：`single / multiple / judge / blank / short_answer / calculation / essay`（`api/app/models/question.py:33`）；主观题名单 `SUBJECTIVE_TYPES = {short_answer, calculation, essay}`。
  - 答案形状规则 `_check_type_shape`（`api/app/schemas/questions.py:53`）：single 选项字母串；multiple 字母数组（≥2）；judge 布尔；blank 字符串或数组，每空可为多等价写法的数组；calculation/essay 文本或 `{reference, rubric}`；主观题允许为空。
  - 客观题判分 `score_objective`（`api/app/services/grading.py:913`）：多选全对才给分；判断题等价词表；填空逐空 `strip()` 比对，整串按 `[,，;；\n]` 拆空兜底；**无数值容差、无符号等价**。服务端是判分 SSOT，线上只对客观题即时判分。
  - 跨语言对账习惯：`contracts/*.json` fixture 同时被 vitest 与 pytest 读取。
- 业界参照（调研见记忆 `hulian-question-editor-research`）：Khan Perseus 的「正文字符串 + 占位符 + 结构化 map」与「renderer / editor 共用注册表」；MathLive `<math-field>`（MIT，JS 823KB + 字体 253KB + 音效 227KB，硬依赖 compute-engine，unpacked 38MB）；`@tiptap/extension-mathematics`（MIT）。国内题库项目清一色「LaTeX 源码 + 实时预览」。

### 1.2 成功标准

1. 5069tk-app 升级后可以**删除**上述七个自建文件（`question-form.tsx` 收缩为「私有字段 + `QuestionEditor` + 提交」），不再出现第二份公式编辑、作答控件或答案格式化实现。
2. `QuestionEditor` 产出的值直接满足消费方 `_check_type_shape`，且切题型不会产出「judge 带 options」这类被后端 422 的形状。
3. `gradeObjective` 默认档与 `score_objective` 在同一份 `grade.contract.json` 上结果逐条一致。
4. 主 barrel `@hulianui/ui` 体积增量为 0；`@hulianui/ui/math` 不引入 MathLive；`@hulianui/ui/math-field` 缺 `mathlive` 时报清晰错误而不是白屏。
5. 三个静默 bug（判断题空单选组、多空只有一个输入框、对象形 options 被滤空）在库里有回归测试。
6. 新件走全部注册点并通过既有门禁（showcase 英文词表、`docs:check:props`、`conventions`、`ssr-safety`、bundle-size、`hulian-scan CI=1`），一次 minor 发版。

## 2. 范围与非目标

### 2.1 范围

- 题目域类型与纯函数：`Question` / `QuestionType` / `QuestionAnswer`、`defaultShape`、`validateQuestion`、`blankCount`、`normalizeOptions`、`splitStemFigures`、`toWireAnswer` / `fromWire`、`answerText` / `answerLines`、`encodeBlanks` / `decodeBlanks`。
- `MathTextarea`（含公式编辑纯函数与模板库）。
- `QuestionEditor`（复核与新建同一个件）。
- `QuestionAnswer`（学生作答卡）+ `canSubmit`。
- `gradeObjective` 三档判分 + `grade.contract.json`。
- `MathField`（MathLive 包装，独立 subpath）+ `createCasComparator`。
- `QuestionCard` 迁到新类型（`kind → type`，补 `answer` / `analysis` 展示槽）。
- 文档、showcase、内置 demo `learn` 增加「录题 + 作答」页。

### 2.2 非目标

- 不引入 ProseMirror / tiptap 文档模型：题干始终是含 `$…$` 与 `![](key)` 的字符串，与库内 `Formula` 及消费方的落库形状一致。
- 不做 AI 作答、导入解析、版本历史、权限等页面级能力。
- 不把 subject / textbook_node / knowledge_points / general_scope_note / 上传端点等消费方私有字段带进库。
- 库内判分不是权威分数；不做主观题自动评分；不做部分给分。
- 不做题型可插拔注册表（Perseus 路线）：7 型在消费方就是硬编码分支，抽象层没有第二个消费方来证明。
- 不在本轮改造消费方仓库；回流步骤只写在 §9 供后续执行。

## 3. 包结构与数据模型

### 3.1 目录

```
packages/ui/src/
  math/                    既有 subpath；barrel 追加导出 question/ 与 math-textarea/ 的公开件
  question/
    question.types.ts      Question / QuestionType / QuestionOption / QuestionAnswer / BlankAnswer / Rubric
    question-shape.ts      defaultShape · validateQuestion · blankCount · defaultScoreByType · normalizeOptions
    question-stem.ts       splitStemFigures · stemFigureKeys · stripStemFigures（判据复刻 5069tk contracts/stem-figures.json）
    question-wire.ts       toWireAnswer · fromWire · encodeBlanks · decodeBlanks
    answer-format.ts       answerText · answerLines
    grade.ts               gradeObjective · normalizeForCompare · parseNumeric
    grade.contract.json    跨语言 fixture
    question-editor.tsx    QuestionEditor
    question-answer.tsx    QuestionAnswer · canSubmit
    *.md / *.en.md / *.showcase.tsx / *.test.tsx
  math-textarea/
    formula-editing.ts     FORMULA_TEMPLATE_GROUPS · applyFormulaTemplate · wrapSelectionInMath · isInsideMath · validateFormulaSyntax · katexErrorAt
    math-textarea.tsx
  math-field/              独立 subpath @hulianui/ui/math-field
    math-field.tsx         MathField
    cas.ts                 createCasComparator
  question-card/           既有；类型改吃 question.types.ts
```

`exports` 已有 `./*` 通配：目录名即 subpath 名，`question/` 与 `math-textarea/` 刻意**不**作为独立 subpath 对外宣传，只从 `@hulianui/ui/math` 导出（它们内部都用 `Formula`，独立入口会让消费方误以为能绕开 KaTeX）。

### 3.2 类型

```ts
export type QuestionType =
  | "single" | "multiple" | "judge" | "blank"
  | "short_answer" | "calculation" | "essay";

export const SUBJECTIVE_TYPES: ReadonlySet<QuestionType>; // short_answer / calculation / essay

export interface QuestionOption { key: string; text: string }   // key 为 A–H
export type BlankAnswer = string | string[];                     // 一个空：一种写法或多种等价写法
export interface Rubric { reference: string; rubric: { point: string; score?: number }[] }

export type QuestionAnswer =
  | string          // single 的选项 key；三种主观题的参考答案文本
  | string[]        // multiple 的 key 集合
  | boolean         // judge
  | BlankAnswer[]   // blank：外层每项一个空。编辑器内部单空也用一项数组
  | Rubric          // calculation / essay 的分步给分
  | null;           // 主观题暂无参考答案

export interface Question {
  type: QuestionType;
  stem: string;                       // 含 $…$ 与 ![](figure-key)
  options: QuestionOption[] | null;   // 仅 single / multiple 非 null
  answer: QuestionAnswer;
  analysis: string;
  difficulty: number;                 // 1–5
  score: number;
  estimatedMinutes?: number;
  // 展示元数据（QuestionCard 既有）：number / typeLabel / topics / chapter / source / issues
}

export type StudentAnswer = string | string[];   // blank 为 string[]，其余 string；judge 为 "true" | "false"
```

规则：

- 每个 `QuestionType` 都必须在 `defaultShape`、`validateQuestion`、编辑器分支、作答分支、判分分支、`defaultScoreByType`、`typeLabel` 词表里有一行，全部用 `Record<QuestionType, …>` 钉住，漏一行 tsc 当场红。
- `normalizeOptions(raw: unknown): QuestionOption[]` 三种形状全收：`[{key,text}]`、`["A. 甲"]`（分隔符 `. 、 ． : ：` 全认，字母以自己写的为准）、无字母前缀的字符串（按下标补字母）。非数组或空数组回 `[]`。
- `toWireAnswer(q)`：按消费方需要把单空 `["90"]` 压回 `"90"`，其余原样。`fromWire`：`"A,C"` 多选串、字符串形 options、`"true"` 判断串在此归一。

### 3.3 QuestionCard 迁移

- `kind?: "choice" | "fill" | "solution" | "judge"` 标记 `@deprecated`，保留一个 minor：内部映射到 `type`（`choice → single`、`fill → blank`、`solution → essay`），开发期 `warnOnce` 提示改用 `type`。下一个 minor 移除。
- 新增 `type?: QuestionType`、`answer?: QuestionAnswer`、`analysis?: string`、`showAnswer?: boolean`（默认 false；开着时在小问之后渲染「答案」「解析」两段，答案文本用 `answerText`）。
- `options` 接受 `QuestionOption[]`，同时接受旧的 `{label, text}` 一个 minor（`label` 视作 `key`）。

## 4. MathTextarea 与 MathField

### 4.1 MathTextarea（`@hulianui/ui/math`）

5069tk `FormulaInput` 回流，接口：

```ts
interface MathTextareaProps {
  value: string;
  onChange: (next: string) => void;
  multiline?: boolean;          // 题干 / 解析 / 参考答案 true；选项 / 每空答案 false
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  compact?: boolean;            // 预览一行、无说明文字
  templates?: FormulaTemplateGroup[];      // 覆盖默认模板组（高中加 \vec / 数集，初中去积分）
  renderPreview?: (value: string) => ReactNode;  // 默认 <Formula>；QuestionEditor 传带图渲染
  visualEditor?: ComponentType<MathFieldLikeProps>;  // 注入 MathField；给了才出「可视化输入」页签
  "aria-label"?: string;
  className?: string;
}
```

行为：

- 模板插在光标处：`applyFormulaTemplate` 纯函数（选中内容进第一个空槽、光标跳下一个空槽；`isInsideMath` 为真时不再套 `$`）。受控重渲染后用 `pendingCaret` 还原光标，这是消费方踩过的坑。
- 「行内公式 $…$」「独立公式 $$…$$」两个按钮是最常用动作，放在模板之前。
- 实时预览：`value` 含 `$` 且无语法错误时渲染 `renderPreview(value)`；预览下方再跑一次 `katexErrorAt(value)`（对每个 `$…$` 段调 `katex.__parse`）给出「第 N 个字符附近：<KaTeX 错误信息>」，不让老师对着红色源码自己找。
- 提交前自检 `validateFormulaSyntax` 只查两件能确定说错的事（`$` 未闭合、`{}` 不配对）并报行列。
- 所有文案走 `useComponentLocale`（新增 `mathTextarea` 词条），英文站零中文残留。
- 可视化输入页签：确认后拿到 LaTeX，走 `applyFormulaTemplate` 同一条插入路径，产出仍是 `$…$`。

### 4.2 MathField（`@hulianui/ui/math-field`）

```ts
interface MathFieldProps {
  value: string;                       // LaTeX
  onChange: (latex: string) => void;
  onSubmit?: (latex: string) => void;  // 回车
  virtualKeyboard?: "auto" | "manual" | "off";   // 映射 mathVirtualKeyboardPolicy；off = 不挂键盘
  keyboardLayouts?: unknown[];         // 透传 mathVirtualKeyboard.layouts
  readOnly?: boolean; disabled?: boolean; placeholder?: string;
  "aria-label"?: string; className?: string;
}
```

- `mathlive` 为 **optional peerDependency**（`peerDependenciesMeta.mathlive.optional = true`），不进 `dependencies`；peer 下界写进基线并附 why（compute-engine 38MB 不能让所有消费方买单）。缺依赖时 `import()` 失败 → 抛 `[瑚琏] MathField 需要安装 mathlive`。
- SSR：组件内 `useEffect` 里 `await import("mathlive")` 注册自定义元素；服务端与首帧渲染同尺寸 `Skeleton` 形态的占位，`customElements.whenDefined("math-field")` 后再挂真元素，避免 hydration mismatch。`ssr-safety.test.tsx` 覆盖。
- 资源：`MathfieldElement.soundsDirectory = null`；字体由消费方 `import "mathlive/fonts.css"` 交给 bundler（文档写清，缺字体只是回退不是白屏）。
- 主题：把 `--hl-*` token 映射到 MathLive 的 CSS 变量（光标、选区、高亮）；关掉 MathLive 内置菜单。
- 受控：监听 `input` 事件回写 `onChange(el.getValue("latex"))`；`value` 变化且与 `el.getValue()` 不同时 `el.setValue(value, {silenceNotifications: true})`。
- `createCasComparator(): (a: string, b: string) => boolean`：用 MathLive 自带的 Compute Engine `ce.parse(a).isEqual(ce.parse(b))`；解析失败回 `false`。只在此 subpath 导出。

## 5. QuestionEditor

```ts
interface QuestionEditorProps {
  value: Question;
  onChange: (next: Question) => void;
  disabled?: boolean;
  resolveFigure?: (key: string) => string;               // 题干里 ![](key) → 可显示 URL
  onUploadFigure?: (file: File) => Promise<string>;      // 返回 key；给了才出「插入图片」
  extra?: ReactNode;                                     // 消费方私有字段，题型之后、题干之前
  issues?: QuestionIssue[];                              // 复核条
  onResolveIssue?: (label: string) => void;
  defaultScoreByType?: Partial<Record<QuestionType, number>>;
  templates?: FormulaTemplateGroup[];                    // 透传 MathTextarea
  visualEditor?: ComponentType<MathFieldLikeProps>;      // 透传 MathTextarea
  preview?: boolean;                                     // 默认 true：右侧 / 下方 QuestionCard 实时预览
  className?: string;
}
export function emptyQuestion(type?: QuestionType): Question;
export function validateQuestion(q: Question): QuestionValidationIssue[];  // { field, message }
```

布局：两栏（`Resizable` 或 grid），窄屏上下叠；预览就是 `QuestionCard`（`showAnswer`），所见即所得由同源渲染保证。

编辑区分节：

1. **题型** `Segmented` 七型。切换时 `defaultShape(type)` 同时重置 `options` 与 `answer`；当前选项或答案非空时先 `ConfirmDialog` 提示会清掉。
2. **题干** `MathTextarea multiline`，`renderPreview` 走 `splitStemFigures` + `resolveFigure`；`onUploadFigure` 存在时工具条多「插入图片」，成功后在光标处插 `![](key)`；题干下方缩略图条列出已引用的图，可删（删的是题干里的引用）。
3. **选项**（single / multiple）：2–8 行，每行 `MathTextarea compact` + 上下移 + 删除；key 按下标 A–H 自动生成，删行后重排。正确答案：single 用 `Segmented`，multiple 用 `CheckboxGroup`，标签同步选项文本首 20 字。
4. **判断**：`Segmented` 正确 / 错误。
5. **填空**：`blankCount(stem)` 从 `____`（≥2 连续下划线）数出空数，答案区按空数生成行；每空可「+ 等价写法」；空数与答案数不一致时 `Alert` 提示并允许一键对齐，不静默截断。
6. **主观题**：参考答案 `MathTextarea multiline`（可空，占位与说明按题型给）；calculation / essay 可切「分步给分」→ `rubric` 行编辑（得分点 + 分值），实时合计与总分对比。
7. **解析** `MathTextarea multiline`。
8. **难度 / 分值 / 预估用时**：`Rating(1–5)` + `NumberField` ×2；切题型且 `score` 仍等于旧题型默认分时自动换成新默认分。
9. **`extra` 插槽**。
10. **复核条**：`issues` 非空时顶部 `Alert` 列出，每条一个「已处理」，勾选回调 `onResolveIssue`。

校验：`validateQuestion` 与后端 `_check_type_shape` 同构，外加空选项、`$` 未闭合、`{}` 不配对、空数不匹配、难度 1–5、分值非负；编辑器把问题挂到对应 `Field.error`，同时导出给页面在提交按钮上用。**编辑器不带提交按钮**。

## 6. QuestionAnswer 与判分

### 6.1 QuestionAnswer（`@hulianui/ui/math`）

```ts
interface QuestionAnswerProps {
  question: Pick<Question, "type" | "stem" | "options"> & { blankCount?: number; difficulty?: number; topics?: string[] };
  value: StudentAnswer | undefined;
  onChange: (next: StudentAnswer) => void;
  result?: { correct: boolean; correctAnswer: QuestionAnswer; analysis?: string } | null;
  onSubmit?: (answer: StudentAnswer) => void;   // 给了才出提交按钮
  pending?: boolean;
  disabled?: boolean;
  renderStem?: (stem: string) => ReactNode;
  blankInput?: "text" | "math";
  mathField?: ComponentType<MathFieldLikeProps>;   // blankInput="math" 时必给
  header?: ReactNode; reason?: ReactNode; correctHint?: ReactNode;
  className?: string;
}
export function canSubmit(answer: StudentAnswer | undefined): boolean;
```

- single → `RadioGroup`（值 = 选项 key，不取整串首字符）；multiple → `CheckboxGroup`；judge → 题型自带两项，值 `"true" | "false"`，文案走 Locale；blank → 每空一个输入框，多空标「第 N 空」，`blankCount` 缺失时按题干数、再不行按 1；选项缺失 → `Alert`「这道题暂时没法作答」；主观题 → 只读题面 + 「此题需教师批阅」。
- 多空全填才可交（`canSubmit`）；单空题 `onSubmit` 仍交 `string[]`，压平交给 `toWireAnswer`。
- Radio/Checkbox 的 label 用 `<Formula>`，不再加 `aria-label`（Base UI 已指向可见 label）。
- 结果区 `Alert`：正确/错误 + `answerText(correctAnswer, type)` + 解析（`Formula`）。

### 6.2 gradeObjective（`grade.ts`）

```ts
interface GradeOptions {
  normalize?: boolean;                       // 第 2 档
  tolerance?: number;                        // 第 2 档，绝对误差
  equivalent?: (a: string, b: string) => boolean;   // 第 3 档，注入
}
function gradeObjective(
  question: Pick<Question, "type" | "answer" | "score">,
  student: StudentAnswer | boolean | null,
  options?: GradeOptions,
): { correct: boolean | null; score: number };
```

| 档 | 规则 |
|---|---|
| 1 精确（默认） | 主观题 → `{correct: null, score: 0}`。multiple：集合相等全对才给分。judge：两侧归一到 bool，词表 `true = {"true","t","1","正确","对","是","√","✓"}`、`false = {"false","f","0","错误","错","否","×","✗","x"}`，刻意不收 A/B；任一侧认不出退回字面相等。blank：`answer` 为数组时逐空比，学生给字符串则按 `[,，;；\n]+` 拆成空数（拆不出判错），每空 `trim` 后与该空任一等价写法相等；`answer` 为单值时学生数组长度须为 1。single：字面相等。 |
| 2 归一（`normalize` / `tolerance`） | 比较前对两侧做只减少误报的归一：剥 `$`、全角标点→半角、空白折叠、Unicode 数学符号→LaTeX（只收 5069tk `answer_comparison.py` 实测过的表，如 `× ÷ · √ → ∴ ∵ ∠ ∥ ⊥`）。`tolerance` 给了且两侧都能 `parseNumeric`（十进制、`\frac{a}{b}`、百分数、末尾 `°`）时按 `|a-b| ≤ tolerance` 判。不做 LaTeX 别名折叠、不剥多字符参数花括号（`\sqrt{1}2` 案例）。 |
| 3 等价（`equivalent`） | 第 1、2 档都不等时调注入比较器；`createCasComparator` 在 math-field 提供。 |

- `grade.contract.json`：`{ level: 1|2, type, answer, student, options?, expectCorrect }[]`；第 1 档 case 从 `grading.py` 的行为与其 pytest 抄，第 2 档标 `level: 2`，Python 侧谁实现谁对账。库的 vitest 全量跑这份文件。
- 文档第一段写明：服务端才是判分 SSOT；本函数用于即时反馈、录题期自测与后端参考实现。

## 7. 错误处理

- `MathField` 缺 `mathlive`：抛带安装命令的错误；showcase 页捕获并显示安装提示，不让整页导出失败。
- `MathTextarea` 语法错误：预览不渲染，改显示行列提示；KaTeX 解析错误：预览照渲染（标红源码）+ 位置提示。
- `QuestionEditor` 空数不匹配、选项不足、答案越界：`Field.error` 就地提示，`validateQuestion` 同时给出，不弹 toast。
- `resolveFigure` 未给而题干有图：缩略图条显示 key 文本占位 + 「未提供 resolveFigure」开发期 `warnOnce`。
- `QuestionAnswer` 对未知 `type`：按主观题只读处理并 `warnOnce`。

## 8. 测试、文档、发版

### 8.1 测试

- 表驱动纯函数：`formula-editing`（模板落点 / 选中入槽 / 公式内不套 `$` / 未闭合定位）、`question-shape`（7 型 × 形状 / 校验）、`grade.contract.json` 驱动的判分、`answer-format`、`normalizeOptions`、`splitStemFigures`（复刻 5069tk `contracts/stem-figures.json` 的 case）、`question-wire`。
- jsdom 组件：QuestionEditor 切题型重置形状与确认框、填空空数随题干变化、issues 复核、`onChange` 输出规范形、`extra` 位置；QuestionAnswer 三条静默 bug 回归 + `canSubmit`；MathTextarea 光标还原与插入。
- browser project：MathTextarea 预览与编辑区不重叠、QuestionEditor 窄屏叠放；MathField 注册成功、受控值回流、键盘策略（jsdom 装不了自定义元素）。
- 既有门禁：`ssr-safety`、showcase 英文词表（exact/files 两头）、`docs:check:props`、`conventions`、bundle-size（新增 `math` 与 `math-field` 入口基线；断言主 barrel 增量 0）、`hulian-scan` 带 `CI=1`、消费方冒烟门禁。

### 8.2 文档与注册

- 新 md（中英）：`math-textarea`、`math-field`、`question`（QuestionEditor + QuestionAnswer + 判分函数一份）；`question-card.md` 改 `type` 与新槽；`math.md` 顶部导入表更新。
- 全部注册点：`math/index.ts`（或 `math-field/index.ts`）导出、showcase、`apps/www/lib/manifest.ts`、`registry.tsx`、英文目录元数据、perf-lab `generated.ts`；`pnpm docs:all` 再生成。
- 消费指南 `docs/consuming-math.md`：三条入口各买什么体积、`mathlive` 安装与 `fonts.css`、Next / Vite 的 SSR 注意点、判分 SSOT 说明。
- 内置 demo `apps/www/app/demos/learn` 增「题库录题 + 学生作答」页串起三件。

### 8.3 发版

- 一次 `@hulianui/ui` minor；changeset 含英文标记段。`QuestionCard.kind` 只 deprecated 不移除，不算破坏性。
- `package.json`：`mathlive` optional peer + 基线 why；`katex` 不变。

## 9. 消费方回流（5069tk-app，升级时一次做，不在本仓）

- 删除：`web/components/formula-input.tsx`、`web/lib/formula-editing.ts`、`web/components/h5/question-card.tsx`、`web/lib/practice-answer.ts`、`web/lib/question-options.ts`、`web/lib/answer-format.ts`、`web/lib/question-stem.ts` 的切图函数；`web/components/question-form.tsx` 收缩为「私有字段（`extra`）+ `QuestionEditor` + 提交」。
- `api/tests` 增一条对账测试读库包内的 `grade.contract.json`（路径 `node_modules/@hulianui/ui/src/question/grade.contract.json`）。
- `docs/HULIAN-GAPS.md` 记一笔。

## 10. 实施顺序

1. 类型 + 纯函数 + `grade.contract.json`（含 QuestionCard 迁移）。
2. `MathTextarea`。
3. `QuestionEditor`。
4. `QuestionAnswer` + `gradeObjective`。
5. `MathField` + `createCasComparator` + demo + 文档 + 发版。

每阶段独立可验收；阶段 1–4 不依赖 MathLive。

## 11. 已决定的取舍

- 编辑 LaTeX 字符串而不是文档模型：库与消费方全部管线围绕字符串，双真源不可接受。
- 7 型硬绑定而不是注册表：消费方自己论证过「新题型 = 写代码」，抽象层没有第二个消费方证明。
- MathLive 走可选 peer + 独立 subpath：体积与 compute-engine 依赖决定它不能进默认路径。
- 判分第 1 档逐字对齐服务端、第 2/3 档 opt-in：库不能悄悄比服务端更宽松，否则学生端「答对」与成绩单「答错」打架。
- 填空题在编辑器内统一为数组、出口再压平：编辑器只处理一种形状，压平是消费方后端契约的事。
