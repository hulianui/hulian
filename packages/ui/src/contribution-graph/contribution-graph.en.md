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

> A date-driven contribution calendar or strip with completed day ranges, month and weekday labels, shared heatmap buckets, legends, and accessible interaction.

## When to use

Use ContributionGraph to show how often one subject acted each day: commits, study check-ins, publishing, alerts, or tickets.

Unlike the generic matrix in [Heatmap](../heatmap/heatmap.md), this component owns date geometry: it fills every calendar day, distinguishes absent reports from reported zero, groups weeks, positions month labels, and supports Sunday or Monday week starts. Both components share `bucketize` for consistent color levels.

## Import
```ts
import { ContributionGraph, buildContributionCalendar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| data* | `ContributionDay[]` | — | `{ date, count? }[]`; duplicate days add together and omitted count means one. |
| days | `number` | `365` | Inclusive range length. |
| endDate | `string \| Date` | Today | Inclusive end date. |
| weekStart | `0 \| 1` | `0` | Sunday or Monday week start. |
| layout | `"calendar" \| "strip"` | `"calendar"` | Week-column calendar or single recent-day row. |
| levels | `number` | `4` | Color levels excluding no contribution. |
| max | `number` | Maximum day in range | Full-scale count. |
| tone | `string` | `"primary"` | Semantic color name or arbitrary CSS color. |
| cellSize | `number` | `11` | Cell side length in pixels. |
| gap | `number` | `3` | Cell gap in pixels. |
| showMonthLabels | `boolean` | `true` | Shows month labels in calendar layout. |
| showWeekdayLabels | `boolean` | `false` | Shows alternate weekday labels in calendar layout. |
| showLegend | `boolean` | `false` | Shows the low-to-high color legend. |
| formatMonth | `(isoDate: string) => string` | `` `${month}\u6708` `` ("Month") | Formats month labels. |
| formatTooltip | `(cell: ContributionCell) => string` | Date and count | Formats each native hover title. |
| onDayClick | `(cell: ContributionCell) => void` | — | Enables focusable day buttons and drill-down. |

### buildContributionCalendar(data, options?)

This pure date-geometry helper returns `{ days, weeks, monthLabels, total, max }`. `days` contains every date and a `present` flag, `weeks` contains seven cells per column with null padding, and `monthLabels` contains `{ weekIndex, date }`.

## Examples
```tsx
// GitHub-style contribution wall
<ContributionGraph data={commits} days={365} tone="success" showLegend />

// Thirty-day activity strip
<ContributionGraph layout="strip" days={30} data={events} tone="danger" />

// Monday start with drill-down
<ContributionGraph
  data={commits}
  weekStart={1}
  showWeekdayLabels
  onDayClick={(day) => router.push(`/activity?date=${day.date}`)}
/>
```

## Pitfalls

- Without `onDayClick`, the graph is one `role="img"` summary instead of hundreds of screen-reader cells. Supplying the callback turns each day into a labeled button.
- Dates align to local calendar days through `dayjs.startOf("day")`; normalize server dates to the intended local day first.
- A 365-day graph is about 53 columns. Built-in horizontal scrolling handles narrow cards; an outer `overflow-hidden` can clip it.
- Cell radius derives from `cellSize / 4`, avoiding oversized design-token radii on tiny squares.
- Default runtime copy is Chinese: month labels append `"\u6708"` ("month"), tooltips use `` `${cell.date} \u00b7 ${cell.count} \u6b21` `` ("date, N times") or `` `${cell.date} \u00b7 \u65e0\u8d21\u732e` `` ("date, no contributions"), the summary uses `` `\u8fc7\u53bb ${calendar.days.length} \u5929\u5171 ${calendar.total} \u6b21\u8d21\u732e` `` ("N contributions over N days"), and legend endpoints are `"\u5c11"` ("Less") and `"\u591a"` ("More"). Override the formatters when English UI copy is required.

## Related
[Heatmap](../heatmap/heatmap.md) · [Legend](../legend/legend.md) · [Sparkline](../sparkline/sparkline.md) · [Calendar](../calendar/calendar.md) · [Stat](../stat/stat.md) · [GitCommit](../git-commit/git-commit.md)
