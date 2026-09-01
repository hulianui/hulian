---
slug: math-textarea
name: MathTextarea
category: forms
group: advanced
tags: []
exports: [MathTextarea, FORMULA_TEMPLATE_GROUPS, applyFormulaTemplate, wrapSelectionInMath, isInsideMath, mathSpans, validateFormulaSyntax, textPosition, katexErrorAt, MATH_TEXTAREA_LOCALE_ZH, MATH_TEXTAREA_LOCALE_EN]
status: enriched
---

# MathTextarea

> 公式输入框 · 录题用的 LaTeX 输入框：模板插到光标处、选区一键包成 $…$、提交前自检报行列、KaTeX 解析错误定位、实时预览与消费端同一套排版 · 可注入可视化公式编辑器（MathField）出第二个页签 · 产出仍是含 $…$ 的普通字符串 · 走 @hulianui/ui/math 主包不付 KaTeX 体积 · forms/advanced

## 何时用

题干、选项、每空答案、参考答案、解析，凡是「一段可以含公式的文字」都用它，而不是裸 `Textarea` 加一句「可含公式」。它解决三件事：老师不知道公式要写成 `$…$`（工具栏的两个按钮就是那句说明）、不会写 LaTeX（模板插到光标处，选中 `x` 点分式得到 `\frac{x}{}` 且光标在分母）、提交前看不到排出来长什么样（预览用的就是展示端的 [Formula](../math/math.md)，预览对了实际就对）。

只展示不编辑用 [Formula](../math/math.md)；整道题的结构化编辑用 QuestionEditor（阶段 3，内部就是本件）。

## 导入

```ts
import { MathTextarea } from "@hulianui/ui/math"
```

住 `@hulianui/ui/math` 而不是主包：预览内部就是 Formula，也就带着 KaTeX；不排数学的消费者不该付这 86KB gzip。

## 用法

```tsx
const [stem, setStem] = useState("已知 $\\triangle ABC$ 中 $\\angle C=90^{\\circ}$，求 $\\sin A$ 的值。");

<MathTextarea multiline aria-label="题干" placeholder="请输入题干" value={stem} onChange={setStem} />
```

选项与每空答案用单行紧凑形态：

```tsx
<MathTextarea compact aria-label="选项 A" value={optionA} onChange={setOptionA} />
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | 受控值：含 `$…$` 的普通字符串，与题干 / 选项 / 解析的存储格式一致 |
| onChange | `(next: string) => void` | - | 值变化（键入、插入模板、包选区、可视化插入都走它） |
| multiline | `boolean` | `false` | 多行（题干 / 解析 / 参考答案）用 Textarea；单行（选项 / 每空答案）用 Input |
| rows | `number` | `3` | 多行时的初始行数；随内容自动长高 |
| placeholder | `string` | - | 占位 |
| disabled | `boolean` | `false` | 禁用输入与工具栏 |
| compact | `boolean` | `false` | 紧凑形态：预览只占一行、不带说明文字。给选项与每空答案用 |
| templates | `readonly FormulaTemplateGroup[]` | `FORMULA_TEMPLATE_GROUPS` | 覆盖默认模板组。自定义模板给 `label` / 分组给 `title`，内置模板的名字从 Locale 取 |
| renderPreview | `(value: string) => ReactNode` | - | 自定义预览渲染；默认 `<Formula>`。题干带图时由 QuestionEditor 传带图渲染 |
| visualEditor | `ComponentType<MathFieldLikeProps>` | - | 注入可视化公式编辑器；**给了才出「可视化输入」页签**。`@hulianui/ui/math-field` 的 [MathField](../math-field/math-field.md) 满足此契约 |
| macros | `Record<string, string>` | - | 透传给默认预览与 KaTeX 探针的宏表；自定义宏不该被报成「未定义命令」 |
| aria-label | `string` | - | 无障碍名。单行控件必给：选项那一栏靠它区分「选项 A」和「选项 B」 |
| className | `string` | - | 透传到根节点 |

### MathFieldLikeProps（`visualEditor` 的契约）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | - | LaTeX（不带 `$`） |
| onChange | `(latex: string) => void` | - | 编辑中回写 |
| onSubmit | `(latex: string) => void` | - | 回车 / 确认；MathTextarea 把它接到「插入到光标处」同一条路径 |
| disabled | `boolean` | - | 锁定（QuestionAnswer 在已提交 / 提交中时传；MathTextarea 不传） |
| aria-label | `string` | - | 由 MathTextarea 传入（页签名） |
| className | `string` | - | 样式透传 |

### FormulaTemplate / FormulaTemplateGroup

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| id | `string` | - | 稳定标识。内置模板 / 分组的显示名从 Locale 的 `templates[id]` / `templateGroups[id]` 取 |
| latex | `string` | - | 插入的片段。**第一个空 `{}` / `[]` 是光标落点**；有选中文本时选中内容进第一个槽、光标跳到下一个槽 |
| sample | `string` | - | 面板上的示例渲染，`$` 包好直接喂 Formula |
| label | `string` | - | 模板显示名；自定义模板给它，内置模板不给（走 Locale） |
| title | `string` | - | 分组标题；自定义分组给它 |
| items | `readonly FormulaTemplate[]` | - | 分组里的模板 |

## Events

| 名称 | 参数 | 说明 |
|------|------|------|
| onChange | `(next: string)` | 值变化。插入类动作会在下一帧把光标放回插入点（受控重渲染会把光标推到末尾，不还原连点两次模板第二次就插到了末尾） |

## 国际化

全部文案走 Locale 的 `components.mathTextarea`（`MathTextareaLocale`，SSOT 在 `math-textarea.locale.ts`，`zhCN` / `enUS` 已接）。内置模板与分组的名字也在词条表里（`templates` / `templateGroups`，键与 `FORMULA_TEMPLATE_GROUPS` 的 `id` 一一对应，类型钉死）。

## 配套纯函数

都从 `@hulianui/ui/math` 导出，不引 KaTeX 的可在服务端脚本里单独用：

- `applyFormulaTemplate({ text, selectionStart, selectionEnd, latex, wrapInMath })` → `{ text, caret }`：模板插到选区处并算光标落点。
- `wrapSelectionInMath({ text, selectionStart, selectionEnd, display })` → `{ text, caret }`：把选区框成 `$…$` / `$$…$$`。
- `isInsideMath(text, caret)` → `boolean`：光标在不在公式里（决定插入片段要不要自己带 `$`）。
- `mathSpans(text)` → `MathSpan[]`：每个闭合 `$…$` / `$$…$$` 段在整串里的位置（`start` / `end` / `contentStart`）。
- `validateFormulaSyntax(text)` → `FormulaSyntaxIssue | null`：只查 `$` 未闭合与 `{}` 不配对，返回 `code` + `index` + `line` / `column`，**不产出文案**。
- `textPosition(text, index)` → `{ line, column }`：下标换行列（从 1 数）。
- `katexErrorAt(text, { macros })` → `KatexParseIssue | null`：整串里第一处 KaTeX 解析不了的位置与原始信息。引 KaTeX。

## 禁忌 / 坑

- **不要用 `display:none` 藏它再靠 required 拦**：它不是原生表单控件，空值校验由外层 Field / 表单做（与 QuestionEditor 的 `validateQuestion` 一致）。
- **预览出现红色源码不是组件坏了**：那是 KaTeX 解析不了这段公式（`throwOnError:false`），下方会给出「第 N 个字符附近：<原因>」。修命令拼写即可。
- **`\(…\)` / `\[…\]` 写法不做语法自检与错误定位**：编辑器产出永远是 `$` 系；这两种写法 Formula 照样能排，只是这里的两条探针不看它们。
- **段内填空槽 `___` 不会被报成解析错误**：探针走与 Formula 同一条 `blanksToLatex` 替换。落在填空槽之后的错误位置会有几个字符偏差，只影响提示不影响判定。
- **`templates` 里自定义模板必须给 `label`**：不给就显示 `id`。内置模板不用给（Locale 里有）。
- **`visualEditor` 注入的是组件不是元素**：传 `MathField` 本身，不是 `<MathField />`。
- **JSX 属性字符串不处理 `\\`**：`value="$\\frac{1}{2}$"` 传进去的是两个反斜杠。含反斜杠的字面量写成 `value={"$\\frac{1}{2}$"}`。

## 相关

- [Formula](../math/math.md) —— 预览与展示端同一个排版件；`@hulianui/ui/math` 的其余纯函数（切段、转朴素文本）
- [QuestionCard](../question-card/question-card.md) —— `renderPreview` 里最常见的目标
- [Textarea](../textarea/textarea.md) / [Input](../input/input.md) —— 底下的输入控件
- [MathField](../math-field/math-field.md) —— `visualEditor` 的现成实现（可选 peer mathlive）
