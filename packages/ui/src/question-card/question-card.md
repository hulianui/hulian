---
slug: question-card
name: QuestionCard
category: data-display
group: collection
tags: []
exports: [QuestionCard]
status: enriched
---

# QuestionCard

> 题目卡片 · 教辅题库标准展示件(题号/题型/分层/题干/选项/小问/附图/章节/出处) · 题干选项走 Formula(KaTeX) 真排版 · 走 @hulianui/ui/math 独立 subpath 主包不付 KaTeX 体积 · 待复核题亮左警示边条不混进正常题 · dogfood Card/Tag/Chip/Image · data-display/collection

## 何时用

题库列表、组卷预览、错题本、批改回看 —— 凡是要把「一道题」完整呈现给人看的地方。它把题号、题型、分层难度、题干、选项、小问、附图、章节归属、出处这九件事收在一张卡里，并保证数学记号被真正排版。

要展示一组可勾选的卡片选项用 [Choicebox](../choicebox/choicebox.md)；只要一段带公式的文字用 [Formula](../math/math.md)。

## 导入
```ts
import { QuestionCard } from "@hulianui/ui/math"
```

**0.25.0 起换了 subpath**（原来是 `@hulianui/ui`）。本件的题干与选项内部就是 [Formula](../math/math.md)，也就带着 KaTeX；留在主 barrel 会让每一个 `@hulianui/ui` 消费者都多付 86KB gzip，哪怕根本不排数学。样式不用管，Formula 自己引 KaTeX 的 CSS。

## 用法

```tsx
<QuestionCard
  number="3"
  type="single"
  difficulty="A 组"
  stem="如图,图形①②都由完全相同的小正方形拼成。若图形①的边长为 4,则图形②的面积用分数表示为( )。"
  options={[
    { key: "A", text: "\\frac{1}{9}" },
    { key: "B", text: "\\frac{5}{9}" },
    { key: "C", text: "\\frac{16}{9}" },
    { key: "D", text: "\\frac{80}{9}" },
  ]}
  figure={{ src: "/figures/q3.png" }}
  chapter="第1章 有理数 · 1.1.1 自然数、分数和小数"
  topics={["有理数", "分数"]}
  source="学能评价 七上 · 第 3 页 · 第 3 题"
/>
```

自动拆题拿不准的条目：

```tsx
<QuestionCard
  stem="下列各式中,正确的是( )。"
  issues={[{ label: "选项不足 4 个" }, { label: "题号不连续" }]}
  actions={<Button size="sm" variant="ghost">去校对</Button>}
/>
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `stem` | `string` | - | 题干，支持 LaTeX 记号与填空槽 `____`，由 Formula 排版 |
| `number` | `ReactNode` | - | 原书题号 |
| `type` | `"single" \| "multiple" \| "judge" \| "blank" \| "short_answer" \| "calculation" \| "essay"` | - | 题型（七型枚举），决定标签文案与语气色；文案走 Locale `question.types` |
| `kind` | `"choice" \| "fill" \| "solution" \| "judge"` | - | **已弃用**，改用 `type`。映射 choice→single / fill→blank / solution→essay；下一个 minor 移除 |
| `typeLabel` | `ReactNode` | - | 覆盖题型标签文案 |
| `kindLabel` | `ReactNode` | - | **已弃用**，改用 `typeLabel` |
| `difficulty` | `ReactNode` | - | 分层标签（A 组 / 基础 / 拔高） |
| `options` | `{ key, text }[]` | - | 选择题选项，`text` 支持 LaTeX 记号；旧形状 `{ label, text }` 仍接受一个 minor |
| `parts` | `string[]` | - | 小问 (1)(2)(3) |
| `figure` | `{ src, alt? }` | - | 附图 |
| `resolveFigure` | `(key: string) => string` | - | 题干里 `![](key)` 的解析器：给了就先切图再排公式，图按顺序渲染在正文之后；不给则题干原样交给 Formula |
| `figureAlt` | `(index: number) => string` | - | 题干附图的 alt 文案，如 (1) → "题目附图 1"。本件无 hook 读不到 Locale，缺省中文；QuestionEditor 预览会传自己 locale 的 `figureAlt`，单独用且要英文时自己传 |
| `answer` | `QuestionAnswerValue` | - | 答案；形状见 `@hulianui/ui/math` 的 `QuestionAnswerValue`。只有 `showAnswer` 为真才渲染 |
| `analysis` | `string` | - | 解析，支持 LaTeX 记号。只有 `showAnswer` 为真才渲染 |
| `showAnswer` | `boolean` | `false` | 渲染答案与解析区。学生作答前必须关 |
| `chapter` / `source` | `ReactNode` | - | 章节归属 / 出处，落在页脚 |
| `topics` | `string[]` | - | 知识点，渲染成 Chip |
| `issues` | `{ label, tone? }[]` | - | 质量标记，非空时亮左侧警示边条 |
| `actions` | `ReactNode` | - | 右上角操作区 |
| `compact` | `boolean` | `false` | 收起小问与页脚，用于长列表 |

## 禁忌 / 坑

- **`stem` 和 `options[].text` 必须是 LaTeX 记号串，不要预先转成纯文本**。传 `"3/8"` 只会显示斜杠；传 `"\\frac{3}{8}"` 才排出真分数。上游包了 `$…$` 更好（边界由数据显式携带），没包也认 —— Formula 会退到裸记号切分。
- **`issues` 不是装饰**。它存在的意义是让「机器拆出来但没把握」的题一眼可辨。把待复核的题和正常题渲染成一个样子，等于拿不可信的数据骗验收 —— 有 `issues` 就一定要传。
- 警示用**左侧边条**而非整卡染色：整卡染色会压低题干对比度，题反而看不清。
- `compact` 只影响小问与页脚，题干和选项始终完整渲染 —— 题面截断会让人误判题目内容。
- **`showAnswer` 默认关，学生端不要开**。答案与解析一旦随卡片渲染就等于泄题；练习 / 作业页只在服务端回了判分结果之后再开。
- **`type` 是七型枚举不是自由字符串**。简答 / 计算 / 解答是三个不同题型（简答短、计算可分步给分、解答是综合证明），别把它们都塞进 `essay`；旧的四型 `kind` 只保留到下一个 minor。

## 相关

- [Formula](../math/math.md) —— 题干/选项内部的数学排版；本件与它同住 `@hulianui/ui/math`
- [Card](../card/card.md) —— 外壳
- [Choicebox](../choicebox/choicebox.md) —— 可勾选卡片选项
