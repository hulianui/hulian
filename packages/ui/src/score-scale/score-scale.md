---
slug: score-scale
name: ScoreScale
category: data-display
group: info
tags: []
exports: [ScoreScale, toSegments, toPercent]
status: enriched
---

# ScoreScale

> 用整条按档着色的横带展示分值落在哪一档 · data-display/info

## 何时用

一个分值本身不重要、重要的是它掉进了哪一档时用它：风控/信用评分、健康度、体检指标（偏低/正常/偏高）、SEO 或质量得分、水位分档告警。它与 [ScoreRing](../score-ring/score-ring.md) 共用同一套等级模型（`Grade[]`），一个画圆、一个画线。

要「这个量占满量的多少」用 [Meter](../meter/meter.md)；要「任务推进到哪了」用 [Progress](../progress/progress.md)；要「分值 + 等级」但不关心它在量程上的位置，用 [ScoreRing](../score-ring/score-ring.md)。可 RSC（无 hook、无事件，几何全是渲染期算术）。

## 导入
```ts
import { ScoreScale } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | - | 当前分值。越界时游标夹到端点，`aria-valuetext` 仍念原始值 |
| min | `number` | `0` | 量程下限 |
| max | `number` | `100` | 量程上限 |
| grades | `Grade[]` | `DEFAULT_GRADES` | 等级带，与 ScoreRing 同一套。**相邻两档 min 之差 = 该段在条上的宽度** |
| size | `"sm" \| "md"` | `"md"` | 尺寸档：sm 表格行内、md 评分卡主角 |
| showGrade | `boolean` | `true` | 右上角显示命中档的 label，用该档的 tone 着色 |
| showRange | `boolean` | `false` | 条下方标出量程端点（`0` / `100`） |
| segmentGap | `boolean` | `false` | 段与段之间留 2px 缝 |
| markers | `ScoreScaleMarker[]` | - | 参照线（可多根），如「行业均值 62」 |
| formatValueText | `(info: ScoreScaleValueTextInfo) => string` | - | 自定义 `aria-valuetext` |
| className | `string` | - | 自定义类 |
| …HTMLAttributes | `Omit<HTMLAttributes<HTMLDivElement>, "children">` | - | 透传 div 原生属性（`aria-label` / `aria-labelledby` 走这里） |

### ScoreScaleMarker

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `number` | - | 参照值，与主值同量程；越界同样夹到端点 |
| label | `ReactNode` | - | 线下方的说明文字。任一 marker 带 label 就会多出一行标注行 |
| tone | `string` | 前景色 | 线的颜色，经 `resolveTone` 解析（语义色名 / `var(--color-*)` / 任意 CSS 色） |

### ScoreScaleValueTextInfo

| 名称 | 类型 | 说明 |
|------|------|------|
| value | `number` | 调用方传进来的原始值（**未夹紧**） |
| min / max | `number` | 量程两端 |
| percent | `number` | 已夹进 0–100 的位置百分比 |
| grade | `Grade \| undefined` | 命中的等级；`grades` 为空时没有等级可言 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| label | `ReactNode` | 条上方的标题。传**字符串**时同时用作 `role="meter"` 的无障碍名 |

## 示例
```tsx
// 基础：默认 A-F 等级带
<ScoreScale value={73} label="质量分" />

// 自定义等级带：相邻两档 min 之差就是该段的宽度
const CREDIT_GRADES = [
  { min: 80, label: "优秀", tone: "success" },
  { min: 60, label: "良好", tone: "chart-2" },
  { min: 30, label: "一般", tone: "warning" },
  { min: 0, label: "差", tone: "danger" },
]
<ScoreScale value={36} label="信誉评分" grades={CREDIT_GRADES} showRange />

// 参照线：游标不是条上唯一的标记物
<ScoreScale value={36} grades={CREDIT_GRADES} markers={[{ value: 62, label: "行业均值 62" }]} />

// 中文量词的读屏文案（默认是不含语言词的 "36 / 100, 一般"）
<ScoreScale value={36} grades={CREDIT_GRADES} formatValueText={({ value, grade }) => `${value} 分，${grade?.label ?? ""}`} />
```

### Stat + ScoreScale 拼出整张评分卡

外壳不必新造：[Stat](../stat/stat.md) 的四个槽正好对上这张卡 —— `label` 标题、`value` 分值、`chart` 这条尺、`hint` 底部释义。

```tsx
<Stat
  className="w-80"
  label="信誉评分"
  // Stat 的 value 钉死 text-2xl，超大分值靠 value 节点自带字号盖住（见下方「坑」）
  value={<span className="text-6xl font-bold tabular-nums">36</span>}
  chart={<ScoreScale value={36} grades={CREDIT_GRADES} showRange showGrade={false} />}
  hint="信誉一般，建议先补齐资质材料后再申请提额。"
/>
```

## 禁忌 / 坑

- **别拿 Meter 顶这件事**。Meter 画的是填充长度（"占了多少 / 完成了多少"，越长越满）；评分尺里 36 分左边那截绿色不属于这个值，它是量程刻度。用填充条画 36 分，读者接收到的是"进行中、还差一截"，说的是相反的话。
- **`Stat` 的 `value` 钉死 `text-2xl font-semibold`**（`stat.tsx:31`），而评分卡的主角就是那个超大数字。直接传 `value={36}` 只会得到一个 24px 的数字；要放大必须让 value 节点自带字号 —— `value={<span className="text-6xl font-bold tabular-nums">36</span>}`（子元素自带字号胜过父级继承）。库里没有现成的「超大数值」档。
- **等级字别去借 `Stat` 的 `icon` 槽**：`icon` 在标题行右上、语义是角标，`delta` 只收数字。等级字由 `ScoreScale` 自己带（`showGrade`）。
- **默认 `DEFAULT_GRADES` 的 5 档只画得出 3 种颜色**（A/B 同为 success、C/D 同为 warning），条上看起来是 3 段。要让 5 档都分得出来，开 `segmentGap`，或传自定义 `grades` 给每档不同 `tone`。
- **`grades` 只声明每档下界**，最低档会被向下补到量程起点 —— 否则轨道左端会露出一截无主空白。整档落在量程外的会被丢掉，不留 0 宽空段。
- **`showGrade` 显示的是等级字，不是分值**。分值不在这件组件里渲染（它归 `Stat` 的 `value` 或你自己的标题），只进 `aria-valuetext`。
- **不传字符串 `label` 时读屏念到的是一条无名的 meter**。`label` 传节点时无障碍名不会自动生成，请另外透传 `aria-label` 或 `aria-labelledby`。
- **颜色一律走 token**：`tone` 传语义色名（`"success"` / `"warning"` / `"chart-2"`）或带 `--color-` 前缀的变量。裸 `var(--warning)` 在 style/SVG 里解析不到 —— `resolveTone` 会为已知 token 兜底补前缀，但别依赖它。

## 相关
[ScoreRing](../score-ring/score-ring.md) · [Meter](../meter/meter.md) · [Progress](../progress/progress.md) · [Stat](../stat/stat.md) · [Sparkline](../sparkline/sparkline.md) · [Legend](../legend/legend.md)
