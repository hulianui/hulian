---
slug: contribution-graph
name: ContributionGraph
category: data-display
group: collection
tags: []
exports: [ContributionGraph, buildContributionCalendar]
status: enriched
---

# ContributionGraph

> 贡献活动墙 · 日期驱动的格子图(GitHub 那面绿墙) · calendar 周列×星期行 / strip 单行最近 N 天(卡片右侧活动条) · 补齐区间每一天 + 月份标签落列 + 周起始 0/1 可切 + 星期标签只标奇数行 · 色阶复用 Heatmap 的 bucketize(同一口径) + tone 换色系 + 少→多图例 · 无点击时整块 role=img 播报总数·onDayClick 后格子成可聚焦按钮 · 日期算术是纯函数 buildContributionCalendar 可测(零新依赖·RSC) · data-display/collection

## 何时用

展示「某个主体在一段时间里每天做了多少事」：代码提交墙、学习打卡、发文频率、服务器告警密度、客服工单量。

和 [Heatmap](../heatmap/heatmap.md) 的分工：Heatmap 是**通用矩阵**（任意行列，标签由数据推导）；本组件专吃**日期**——它替你补齐区间内每一天（区分「无上报」与「上报 0」）、按周分列、算月份标签落在第几列、切周起始。用 Heatmap 画贡献墙也能画，代价是每个消费方各写一遍「日期 → 第几周第几行」的换算。色阶分档两者共用 `bucketize`，不另起 SSOT。

## 导入
```ts
import { ContributionGraph, buildContributionCalendar } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| data* | `ContributionDay[]` | — | `{ date, count? }[]`；同日多条累加，`count` 缺省按 1 计（可直接喂一串「事件发生日」） |
| days | `number` | `365` | 区间天数（含结束日） |
| endDate | `string \| Date` | 今天 | 区间结束日（含） |
| weekStart | `0 \| 1` | `0` | 0=周日（GitHub 口径）/ 1=周一 |
| layout | `"calendar" \| "strip"` | `"calendar"` | calendar 周列×星期行 / strip 单行最近 N 天 |
| levels | `number` | `4` | 色阶档数（不含「无贡献」那档） |
| max | `number` | 区间内单日最大 | 满值 |
| tone | `string` | `"primary"` | 色系：语义色名（`success` 即 GitHub 绿）/ 任意 CSS 色 |
| cellSize | `number` | `11` | 格子边长 px |
| gap | `number` | `3` | 格间距 px |
| showMonthLabels | `boolean` | `true` | 月份标签（仅 calendar） |
| showWeekdayLabels | `boolean` | `false` | 星期标签（仅 calendar，按 GitHub 惯例只标奇数行） |
| showLegend | `boolean` | `false` | 「少 ▢▢▢▢ 多」色阶图例 |
| formatMonth | `(isoDate: string) => string` | `` `${月}月` `` | 月份标签文案 |
| formatTooltip | `(cell: ContributionCell) => string` | `日期 · N 次` | 格子原生 hover 提示 |
| onDayClick | `(cell: ContributionCell) => void` | — | 点击某天下钻；传了之后格子变可聚焦按钮 |

### buildContributionCalendar(data, options?)

日期几何纯函数，返回 `{ days, weeks, monthLabels, total, max }`：`days` 是区间内每一天（含 `present` 区分无上报）、`weeks` 是每列 7 格（首末周补 `null`）、`monthLabels` 是 `{ weekIndex, date }`。想自己画格子又不想重写日期算术时直接用它。

## 示例
```tsx
// GitHub 贡献墙
<ContributionGraph data={commits} days={365} tone="success" showLegend />

// 卡片右侧的 30 天活动条
<ContributionGraph layout="strip" days={30} data={events} tone="danger" />

// 周一起算 + 可下钻
<ContributionGraph
  data={commits}
  weekStart={1}
  showWeekdayLabels
  onDayClick={(d) => router.push(`/activity?date=${d.date}`)}
/>
```

## 禁忌 / 坑

- **别把 365 个格子逐个交给读屏**：不传 `onDayClick` 时整块是 `role="img"` + 一句总数摘要；传了 `onDayClick` 才逐格成按钮（此时每格带 `aria-label`）。要在只读场景做逐格朗读，请自行降低 `days`。
- **日期按本地日历日对齐**（`dayjs.startOf("day")`），跨时区的服务端日期请先归一到本地日再喂。
- 整面墙约 53 列（`cellSize=11` 时 ≈ 740px）。组件已自带 `max-w-full` + 内层 `min-w-0 overflow-x-auto`，放窄卡片里是**内部**横向滚动；别在外面再包一层 `overflow-hidden`，会把滚动区裁死。
- 格子圆角按边长算（`cellSize/4`），不用 `var(--radius)`——小方块套大圆角会被磨成圆点。

## 相关
[Heatmap](../heatmap/heatmap.md) · [Legend](../legend/legend.md) · [Sparkline](../sparkline/sparkline.md) · [Calendar](../calendar/calendar.md) · [Stat](../stat/stat.md) · [GitCommit](../git-commit/git-commit.md)
