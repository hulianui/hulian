---
slug: date-range-picker
name: DateRangePicker
category: forms
group: datetime
tags: []
exports: [DateRangePicker]
status: enriched
---

# DateRangePicker

> Range picker · Dependency-free two-panel calendar in a Popover at day / month / year granularity, with presets, bounds, `disabledDate`, and controlled fixed-width string arrays · forms/datetime

## When to use

Use DateRangePicker to select a **start and end** with two panels shown side by side and quick presets. `picker` sets the granularity -- day (default), month, or year -- matching el-date-picker's `daterange`, `monthrange`, and `yearrange`. Use [DatePicker](../date-picker/date-picker.md) for one date, [DateTimePicker](../date-time-picker/date-time-picker.md) for date and time, or [Calendar](../calendar/calendar.md) for an always-visible month panel. The HulianUI date family has no external date-picker dependency and uses fixed-width string values.

## Import
```ts
import { DateRangePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `[string, string] \| null` | — | Controlled value `[start, end]`; the shape follows `picker` (`YYYY-MM-DD` / `YYYY-MM` / `YYYY`); `null` = cleared; controlled when passed in |
| defaultValue | `[string, string] \| null` | — | uncontrolled initial value |
| picker | `"date" \| "month" \| "year"` | `"date"` | Selection granularity, same meaning as the prop of the same name on [DatePicker](../date-picker/date-picker.md). The panels follow: two month calendars, two year pages (12 months each), or two 12-year pages. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size, on the same scale as [Input](../input/input.md) (32 / 40 / 48px). Date-cell geometry inside the panel does not change with it. |
| minDate | `string` | — | The earliest selectable date. Always an ISO `YYYY-MM-DD` string, **regardless of `picker`**; at month and year granularity a cell is disabled only when the whole month or year is out of bounds. |
| maxDate | `string` | — | The latest selectable date, same convention as `minDate` |
| disabledDate | `(isoDate: string) => boolean` | — | Custom disabling. The argument is always an ISO `YYYY-MM-DD` string; at month and year granularity it is asked once per cell, with the **first day** of that month or year. |
| presets | `boolean \| DateRangePreset[]` | `true` | `true` or omitted uses the defaults for that granularity (day: Today / Last 7 days / Last 30 days / This month; month: This month / Last 3 months / Last 6 months / This year; year: This year / Last 3 years / Last 5 years), all resolved through the active locale. Pass an array for custom presets or `false` to hide them. |
| placeholder | `[string, string]` | follows `picker` | Placeholder pair `[start, end]`; defaults to the locale's "Start date" / "Start month" / "Start year" wording. |
| displayFormat | `string` | follows `picker` | Display format (dayjs format), defaulting to `YYYY-MM-DD` / `YYYY-MM` / `YYYY`. It never changes the shape of the controlled value. |
| disabled | `boolean` | `false` | Disable |
| readOnly | `boolean` | `false` | Read only: can be opened for viewing, no endpoint selection/no preset/no clearing |
| className | `string` | — | Container class name |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(range: [string, string] \| null) => void` | Interval changes (including clearing → null) |

`DateRangePreset`: `{ label: string; getValue: () => [string, string] }`, called when clicked, can be dynamically calculated based on "today".

## Examples
```tsx
function Demo() {
  const [v, setV] = useState<[string, string] | null>(null);
  return <DateRangePicker value={v} onValueChange={setV} />;
}
```
```tsx
<DateRangePicker
  defaultValue={["2026-06-10", "2026-06-12"]}
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(iso + "T00:00:00").getDay();
    return day === 0 || day === 6; // Disable weekends
  }}
/>
```
```tsx
// Month range, the equivalent of el-date-picker type="monthrange". Values become
// ["YYYY-MM", "YYYY-MM"] and the presets switch to This month / Last 3 months /
// Last 6 months / This year.
<DateRangePicker picker="month" value={months} onValueChange={setMonths} />

// Stop at the current month: `maxDate` is still an ISO date, and at month granularity a
// month is disabled only when all of it is out of bounds -- so the current month stays
// selectable and later months grey out.
<DateRangePicker picker="month" maxDate={new Date().toISOString().slice(0, 10)} />

// Year range: 12 years per page, and the two pages never overlap
<DateRangePicker picker="year" defaultValue={["2024", "2026"]} />
```

## Usage guidelines

- Choose controlled or uncontrolled usage. Pair `value` with `onValueChange`; use `defaultValue` only for an uncontrolled initial range, and do not pass both.
- The external value is always an array of **fixed-width strings**, not Date objects, and its shape follows `picker`: `YYYY-MM-DD` / `YYYY-MM` / `YYYY`. `displayFormat` changes the trigger text only.
- **`minDate`, `maxDate`, and `disabledDate` always speak in ISO dates**, regardless of `picker`. At month and year granularity a cell is disabled only when the whole segment is out of bounds: with `maxDate="2026-06-15"`, `2026-06` is still selectable and `2026-07` is the first one greyed out. To exclude the current month as well, set `maxDate` to the end of the previous segment (`2026-05-31`).
- At month and year granularity `disabledDate` is asked once per cell with the **first day** of that segment (`2026-09-01` stands for all of September). Do not put per-day logic such as "disable weekends" there; it has no meaning at those granularities.
- The year page shows a **full 12-year block**, not a decade. With two pages side by side, a decade's leading and trailing filler years would make the same year appear on both pages.
- `disabledDate` receives an ISO date string. For weekday calculations, use `new Date(iso + "T00:00:00")` and account for the local timezone. Avoid `new Date(iso)`, which parses as UTC and can shift the calendar day.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, …) land on **it** rather than on the outer container — it is the element that takes focus and that screen readers announce (#293).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken before 0.54.0** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore.

## Related
[Calendar](../calendar/calendar.md) · [DatePicker](../date-picker/date-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimeField](../time-field/time-field.md) · [Button](../button/button.md) · [ShimmerButton](../shimmer-button/shimmer-button.md)
