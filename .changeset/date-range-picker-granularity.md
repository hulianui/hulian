---
"@hulianui/ui": minor
---

`DateRangePicker` 补月份区间与年份区间：新增 `picker="date" | "month" | "year"`

`DatePicker` 一直有三档粒度，`DateRangePicker` 却只有**天**——「选一段月份」这件事在库里没有对应件，
只能拿两个 `picker="month"` 的 `DatePicker` 拼（#262）。拼出来比真区间件少三样：没有区间高亮
（两个独立面板，看不出中间那段是选中的）、用不上 `presets`、两端得自己写 `minDate` / `maxDate`
互夹，少写一处就能选出「起月晚于止月」。

新的 `picker` 与 `DatePicker` 的同名 prop 同名同义，对齐关系补齐为：

| Element Plus | 瑚琏 |
|---|---|
| `type="daterange"` | `DateRangePicker`（默认） |
| `type="monthrange"` | `DateRangePicker picker="month"` |
| — | `DateRangePicker picker="year"` |

随之变化的三处，都跟着粒度走：

- **值形状**：`["YYYY-MM-DD", …]` / `["YYYY-MM", …]` / `["YYYY", …]`（与 `DatePicker`、`Calendar`
  同源的定宽文本，字典序即时间序）。`displayFormat` 的默认值同理。
- **面板**：两个月历 / 两个年份页（各 12 个月）/ 两个 12 年段。年份页刻意是 12 年整段而不是十年段
  ——十年段的首尾补位年会让同一个年份在左右两页各出现一次。
- **预设与占位**：月档给「本月 / 最近 3 个月 / 最近 6 个月 / 今年」，年档给「今年 / 最近 3 年 /
  最近 5 年」，全部走 locale（新词条在 `dateRangePicker` 下是可选的，自带整份 locale 的消费方不受影响）。

**`minDate` / `maxDate` / `disabledDate` 恒按 ISO 日期说话**，不随 `picker` 变，判定直接复用
`Calendar` / `DatePicker` 那份纯逻辑：整段都超界才禁。于是 `maxDate` 写今天就得到「当月可选、
未来月灰掉」——issue 里那个「运营在右面板点 7 月拿到明年 7 月，后端只校验 `yyyy-MM`、那一列
统计全 0 还看不出筛错了」的坑，这是它的解法。月/年粒度下 `disabledDate` 每段只按**首日**问一次。

天粒度的行为与 DOM 不变。
