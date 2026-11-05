---
slug: tag
name: Tag
category: data-display
group: info
tags: []
exports: [Tag, tagVariants]
status: enriched
---

# Tag

> 状态标签 · 6 语气状态色 + 任意分类色(color) + 状态圆点/呼吸进行态(pulse) + 图标 + 可关闭(企业状态标记·区别 Chip 令牌) · data-display/info

## 何时用

表达对象状态/类别的小标记（运行中、待审核、已驳回等），支持状态圆点与呼吸动画表达进行态。展示数值/计数徽记用 [[Badge]]；可输入/可移除的过滤令牌用 Chip，本组件偏只读状态标记。

## 导入
```ts
import { Tag, tagVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"soft" \| "solid" \| "outline"` | `"soft"` | 视觉变体：soft 浅底（最常用于状态标签）/ solid 实底 / outline 描边。三档各自的底与文字色见「三档配色」 |
| tone | `"neutral" \| "brand" \| "info" \| "success" \| "warning" \| "danger"` | `"neutral"` | 语气色。取值集与 [Alert](../alert/alert.md) 一致。 |
| color | `string` | - | 分类色：渠道 / 业务线 / 文件类型这类「属于哪一类」的着色（见下节「语义色 vs 分类色」）。语义色名（`chart-2` / `primary` …）、任意 CSS 颜色或 `var(--color-*)` 都收，与 [[Dot]] 的 `color` / [[Brand]] 的 `color` 同一条路径。与 `tone` 同时传时 `color` 优先。 |
| size | `"sm" \| "md"` | `"md"` | 尺寸。 |
| dot | `boolean` | `false` | 前导状态圆点（颜色随 tone）。与 icon 互斥：icon 优先于 dot。 |
| pulse | `boolean` | `false` | 圆点呼吸动画（进行态语义）。仅在 dot 为真时生效。 |
| isDisabled | `boolean` | `false` | 禁用：降透明度、屏蔽指针事件、关闭按钮不可点。 |
| className | `string` | - | - |
| …HTMLAttributes | `HTMLAttributes<HTMLSpanElement>` | - | 透传 span 原生属性。状态标签常用 `title` 挂完整值做 hover 全文（表格里显示「Word」、title 是完整 MIME），以及 `data-testid` / `aria-*` |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 提供则渲染关闭(×)按钮，点击触发该回调。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 前导图标槽；存在时不渲染 dot。 |
| children | `ReactNode` | 标签文本。 |

## 示例
```tsx
// 状态语气
<Tag>默认</Tag>
<Tag tone="success">成功</Tag>
<Tag tone="danger">错误</Tag>
```
```tsx
// info 是中性事实说明（当前处于什么模式），不是操作也不是成功/警告
<Tag tone="info">外接浏览器模式</Tag>
<Tag variant="outline" tone="info">只读</Tag>
```
```tsx
// 呼吸圆点表达进行态 + 可关闭
<Tag dot pulse tone="brand">部署中</Tag>
<Tag onClose={() => remove(id)}>待审核</Tag>
```
```tsx
// 分类色：语义六档接不住十几二十种分类（渠道 / 业务线 / 文件类型）时用它
<Tag color="chart-1">抖音</Tag>
<Tag color="chart-4">B 站</Tag>
<Tag color="#ec4899">自定义色</Tag>
```

## 三档配色

自己拼一块带语义色的高亮区（不是 Tag、不是 Alert）时照这张表配 —— 它就是本组件内部那份配方：

| 档 | 底 | 文字 |
|---|---|---|
| solid | `bg-warning` | `text-warning-foreground` |
| soft | `bg-warning-subtle`（或 `bg-warning/12`） | `text-warning` |
| outline | `border-warning` | `text-warning` |

**`-foreground` 只配实心底**：亮色下它就是白。浅底上按命名直觉写 `text-warning-foreground` 得到的是白字白底、文字整个看不见，而暗色下反而是对的（那边 `-foreground` 是近黑），谁在暗色主题里开发谁查不出来。浅底的文字色一律用语义色本身。

## 语义色 vs 分类色

- `tone` 是**语义**轴：六档状态色，全库共用同一套枚举，回答「它现在是什么状态」——成功 / 警告 / 错误 / 进行中 / 中性说明 / 与主操作有关。
- `color` 是**分类**轴：回答「它属于哪一类」，与状态无关。渠道、业务线、文件类型、标签体系常有十几二十种，语义色接不住；硬映射只会让「成功」和「渠道 A」共用一个绿，读的人再从颜色反推含义就会错。
- 两者同时传时 `color` 优先（`tone` 是语义快捷方式）。分类色同样吃明暗主题：soft 是 12% 混合底、outline 是描边、solid 是实底，不必为每个色再准备亮暗两套值。
- 极浅的分类色（例如 `chart-3` 的琥珀）配 `solid` 时前景走 `primary-foreground`，白字对比偏弱 —— 分类色优先用 soft / outline。

## 禁忌 / 坑

- **`brand` 与 `info` 不是同一件事**（#232）。`brand` 是主色，意思是「这条和产品/主操作有关」；`info` 走独立的 info 色，意思是「这是中性事实说明，读一下就好」。表达「当前处于什么模式」这类既不成功也不警告的事实，用 `info`——用 `brand` 会让一个不可点的标签在页面里与主 CTA 抢注意力，用 `neutral` 则会和一堆灰标签糊在一起读不出来。两者在 tokens 0.8.0 补齐 `--color-info` 前确实是一个颜色（见 [Alert](../alert/alert.md) 的同一段历史），现在不是了。
- `color` **不是**第六档语义色。要表达状态仍然用 `tone`；把「成功」写成 `color="chart-2"`，暗色表里的绿就只是一段数据序列色，换主题时语义会漂。
- `pulse` 只在 `dot` 为真时生效，单独传 `pulse` 无动画。
- `icon` 与 `dot` 互斥，同传时只渲染 `icon`——想要圆点就别传 icon。
- `onClose` 列表场景需自行维护移除后的状态（受控数组 filter），组件本身不删元素。
- 关闭按钮的无障碍标签跟随 `ConfigProvider`：`zhCN` 为“移除”，`enUS` 为 “Remove”。旧自定义 locale 缺少 `components.tag` 时回退中文。

## 相关
[Sparkline](../sparkline/sparkline.md) · [ImageViewer](../image-viewer/image-viewer.md) · [LiveProductCard](../live-product-card/live-product-card.md) · [DiffStat](../diff-stat/diff-stat.md) · [ScoreRing](../score-ring/score-ring.md) · [Badge](../badge/badge.md)
