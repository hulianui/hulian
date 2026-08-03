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

> 题目卡片 · 教辅题库标准展示件(题号/题型/分层/题干/选项/小问/附图/章节/出处) · 题干选项走 MathText 真数学版式 · 待复核题亮左警示边条不混进正常题 · dogfood Card/Tag/Chip/Image · data-display/collection

## 何时用

题库列表、组卷预览、错题本、批改回看 —— 凡是要把「一道题」完整呈现给人看的地方。它把题号、题型、分层难度、题干、选项、小问、附图、章节归属、出处这九件事收在一张卡里，并保证数学记号被真正排版。

要展示一组可勾选的卡片选项用 [Choicebox](../choicebox/choicebox.md)；只要一段带公式的文字用 [MathText](../math-text/math-text.md)。

## 导入
```ts
import { QuestionCard } from "@hulianui/ui"
```

## 用法

```tsx
<QuestionCard
  number="3"
  kind="choice"
  difficulty="A 组"
  stem="如图,图形①②都由完全相同的小正方形拼成。若图形①的边长为 4,则图形②的面积用分数表示为( )。"
  options={[
    { label: "A", text: "\\frac{1}{9}" },
    { label: "B", text: "\\frac{5}{9}" },
    { label: "C", text: "\\frac{16}{9}" },
    { label: "D", text: "\\frac{80}{9}" },
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
| `stem` | `string` | — | 题干，支持 MathText 记号 |
| `number` | `ReactNode` | — | 原书题号 |
| `kind` | `"choice" \| "fill" \| "solution" \| "judge"` | — | 题型，决定标签文案与语气色 |
| `kindLabel` | `ReactNode` | — | 覆盖内置题型中文名 |
| `difficulty` | `ReactNode` | — | 分层标签（A 组 / 基础 / 拔高） |
| `options` | `{ label, text }[]` | — | 选择题选项，`text` 支持 MathText 记号 |
| `parts` | `string[]` | — | 小问 (1)(2)(3) |
| `figure` | `{ src, alt? }` | — | 附图 |
| `chapter` / `source` | `ReactNode` | — | 章节归属 / 出处，落在页脚 |
| `topics` | `string[]` | — | 知识点，渲染成 Chip |
| `issues` | `{ label, tone? }[]` | — | 质量标记，非空时亮左侧警示边条 |
| `actions` | `ReactNode` | — | 右上角操作区 |
| `compact` | `boolean` | `false` | 收起小问与页脚，用于长列表 |

## 禁忌 / 坑

- **`stem` 和 `options[].text` 必须是 MathText 记号串，不要预先转成纯文本**。传 `"3/8"` 只会显示斜杠；传 `"\\frac{3}{8}"` 才有真分数版式。
- **`issues` 不是装饰**。它存在的意义是让「机器拆出来但没把握」的题一眼可辨。把待复核的题和正常题渲染成一个样子，等于拿不可信的数据骗验收 —— 有 `issues` 就一定要传。
- 警示用**左侧边条**而非整卡染色：整卡染色会压低题干对比度，题反而看不清。
- `compact` 只影响小问与页脚，题干和选项始终完整渲染 —— 题面截断会让人误判题目内容。

## 相关

- [MathText](../math-text/math-text.md) —— 题干/选项内部的数学排版
- [Card](../card/card.md) —— 外壳
- [Choicebox](../choicebox/choicebox.md) —— 可勾选卡片选项
