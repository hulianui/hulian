---
slug: calendar
name: Calendar
category: forms
group: datetime
tags: []
exports: [Calendar]
status: enriched
---

# Calendar

> Calendar panel · Dependency-free day/month/year drill-down, always-visible layout, date bounds, `disabledDate`, Today shortcut, and fixed-width string values · forms/datetime

## When to use

Use Calendar when the month view is an **always-visible part of the interface**, such as date navigation in a dashboard sidebar or a date-selection panel on a booking page. It has no trigger or popup.

For an input that opens a calendar on click, use [DatePicker](../date-picker/date-picker.md); its popup renders this component. Both share the same drill-down and disabled-date behavior. Use [DateRangePicker](../date-range-picker/date-range-picker.md) for a range, or [DateTimePicker](../date-time-picker/date-time-picker.md) when the user also selects a time.

> Before 0.15.0, this component bridged MUI X `DateCalendar` and required four optional peer dependencies plus `MuiBridgeProvider`. It is now a dependency-free HulianUI implementation and works without that setup.

## Import
```ts
import { Calendar } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | — | Controlled value. Its shape follows `picker`: `"YYYY-MM-DD"`, `"YYYY-MM"`, or `"YYYY"`. |
| defaultValue | `string \| null` | — | Initial value when uncontrolled, with the same shape as `value`. |
| picker | `"date" \| "month" \| "year"` | `"date"` | Selection granularity; also determines the value shape and initial panel level. |
| defaultMonth | `string` | Follows `value` | Initial visible month as any parseable date string, independent of the selected value. Internal navigation takes over afterward. |
| minDate | `string` | — | Earliest selectable date as any parseable date string; normalized internally. |
| maxDate | `string` | — | Latest selectable date. |
| disabledDate | `(isoDate: string) => boolean` | — | Determines whether a date is disabled. The argument is always `"YYYY-MM-DD"`; month/year pickers pass the first day of that month/year. |
| showToday | `boolean` | `true` | Shows the Today, This Month, or This Year shortcut at the bottom. |
| disabled | `boolean` | `false` | Disables the entire panel, including navigation. |
| readOnly | `boolean` | `false` | Allows navigation but prevents selection. |
| aria-label | `string` | `"calendar"` | Accessible name for the panel. |
| className | `string` | — | Additional class name for the outer panel container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string) => void` | Called only when the user selects at the configured `picker` level. **Drilling between panel levels does not trigger it.** The panel has no clear action, so it never returns `null`. |

## Examples
```tsx
// Basic: values are ISO date strings
<Calendar defaultValue="2026-06-08" />

// Controlled
const [date, setDate] = useState<string | null>(null);
<Calendar value={date} onValueChange={setDate} />

// Month and year pickers return YYYY-MM and YYYY respectively
<Calendar picker="month" defaultValue="2026-06" />
<Calendar picker="year" defaultValue="2026" />

// No selected value, but start the panel in September
<Calendar defaultMonth="2026-09-01" />

// Restrict the range and disable weekends
<Calendar
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(`${iso}T00:00:00`).getDay();
    return day === 0 || day === 6;
  }}
/>
```

## Usage guidelines

- **Values are fixed-width strings, not `Date` objects.** With `"YYYY-MM-DD"`, lexical order matches chronological order, so ranges can be compared as strings. This also avoids timezone boundary errors such as `new Date("2026-06-08").toISOString()` producing the previous date in UTC+8. Convert explicitly if your application needs a `Date`.
- `onValueChange` receives `string`, not `string | null`, because the panel has no clear action. Use [DatePicker](../date-picker/date-picker.md) when the user needs a clearable trigger.
- **Drilling down does not emit a value.** With `picker="date"`, opening the month view and choosing September only moves to that month; the value changes only after a day cell is selected. Tests should not treat choosing the month as a completed date selection.
- At `date` granularity, `disabledDate` runs once per visible day, typically 42 times per panel. Keep it a pure, inexpensive calculation: do not issue requests or repeatedly allocate heavy objects. Month and year pickers call it only for the first day of each month/year, so the rule is necessarily coarser; use the date picker for day-level precision.
- `readOnly` still allows navigation, while `disabled` also disables the navigation controls.
- The panel has a fixed width of `15.75rem` (7 columns × 2.25rem) and does not shrink responsively. Scale it explicitly if it must fit in a narrower container.

## Related
[DatePicker](../date-picker/date-picker.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [Scheduler](../scheduler/scheduler.md)
