---
slug: date-picker
name: DatePicker
category: forms
group: datetime
tags: []
exports: [DatePicker]
status: enriched
---

# DatePicker

> Date picker · Dependency-free trigger and Popover around Calendar, with day/month/year granularity, bounds, `disabledDate`, and clear action · forms/datetime

## When to use

Use DatePicker to select a date, month, or year in a form. Its trigger opens a Popover containing the [Calendar](../calendar/calendar.md) panel, so both components share the same drill-down and disabled-date behavior.

Use [Calendar](../calendar/calendar.md) directly for an always-visible panel, [DateRangePicker](../date-range-picker/date-range-picker.md) for a range, or [DateTimePicker](../date-time-picker/date-time-picker.md) when the user also selects a time.

> Before 0.15.0, this component was named `DateField`, while a separate MUI X bridge used the `DatePicker` name. That bridge and the `_mui` directory have been removed; `DatePicker` now refers only to this dependency-free HulianUI implementation.

## Import
```ts
import { DatePicker } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| null` | - | controlled value. Shape varies with `picker`: `"YYYY-MM-DD"` / `"YYYY-MM"` / `"YYYY"` |
| defaultValue | `string \| null` | - | Uncontrolled initial value, the shape is the same as above |
| picker | `"date" \| "month" \| "year"` | `"date"` | Select the granularity and determine the value shape and panel starting layer |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size, on the same scale as [Input](../input/input.md) (32 / 40 / 48px), so controls on one form row line up. |
| minDate | `string` | - | Earliest selectable date as any parseable date string; normalized internally. |
| maxDate | `string` | - | Latest selectable date. |
| disabledDate | `(isoDate: string) => boolean` | - | Determines whether a date is disabled. The argument is always `"YYYY-MM-DD"`; month/year pickers pass the first day of that month/year. |
| placeholder | `string` | Follows `picker` | Trigger placeholder. |
| displayFormat | `string` | Follows `picker` | Day.js format string for the trigger. **Affects display only** and does not change the external value shape. |
| clearable | `boolean` | `true` | Shows a clear button when a value exists and the component is neither disabled nor read-only. |
| showToday | `boolean` | `true` | Shows the Today, This Month, or This Year shortcut at the bottom. |
| disabled | `boolean` | `false` | Disables the trigger and prevents the panel from opening. |
| readOnly | `boolean` | `false` | Allows viewing the panel but prevents selection. |
| aria-label | `string` | - | Accessible trigger name when no visible label is present. |
| className | `string` | - | Additional class name for the trigger's outer container. |

## Events

| Event | Type | Description |
|------|------|------|
| onValueChange | `(value: string \| null) => void` | Select/clear callback; clear callback `null` |

## Localization

When `placeholder` is omitted, the date, month, and year placeholders and the
clear-button label follow the nearest `ConfigProvider locale`; `enUS` uses
“Select date,” “Select month,” and “Select year.” An explicit `placeholder`
always wins. A legacy custom locale with no `components.datePicker`, or with
only its older `clear` field, keeps the original Chinese fallback placeholders.

## Examples
```tsx
// Basic: values are ISO date strings
<DatePicker defaultValue="2026-06-08" />

// Controlled
const [date, setDate] = useState<string | null>(null);
<DatePicker value={date} onValueChange={setDate} />

// Month and year pickers return YYYY-MM and YYYY respectively
<DatePicker picker="month" defaultValue="2026-06" />
<DatePicker picker="year" defaultValue="2026" />

// Restrict the range and disable weekends
<DatePicker
  minDate="2026-06-01"
  maxDate="2026-06-30"
  disabledDate={(iso) => {
    const day = new Date(`${iso}T00:00:00`).getDay();
    return day === 0 || day === 6;
  }}
/>
```

## Usage guidelines

- **Values are fixed-width strings, not `Date` objects.** With `"YYYY-MM-DD"`, lexical order matches chronological order, so ranges can be compared as strings. This also avoids timezone boundary errors such as `new Date("2026-06-08").toISOString()` producing the previous date in UTC+8. Convert explicitly if the application needs a `Date`.
- **`picker` changes the value shape.** Switching from `date` to `month` means an existing `"2026-06-08"` value is parsed and then emitted as `"2026-06"` after month selection. Migrate existing state deliberately when changing granularity; the component does not rewrite application data automatically.
- `displayFormat` changes presentation only. Use `picker` to change the external value shape.
- At `date` granularity, `disabledDate` runs once per visible day, typically 42 times per panel. Keep it a pure, inexpensive calculation: do not issue requests or repeatedly allocate heavy objects. Month and year pickers call it only for the first day of each month/year, so the rule is necessarily coarser.
- Clicking the panel title moves upward through date → month → year. `picker` determines which level submits a value, so choosing a year or month while `picker="date"` only drills down; it does not emit a final selection.
- When migrating from the pre-0.15.0 MUI `DatePicker`, note that the **value format changed** from a full ISO timestamp to a fixed-width date string. The old `views` and `openTo` props are consolidated into `picker`, while `label` is replaced by `placeholder` plus `aria-label`.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, …) land on **it** rather than on the outer container, which is the element that takes focus and that screen readers announce (#293).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken before 0.54.0** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore.

## Related
[Calendar](../calendar/calendar.md) · [DateRangePicker](../date-range-picker/date-range-picker.md) · [DateTimePicker](../date-time-picker/date-time-picker.md) · [TimePicker](../time-picker/time-picker.md) · [TimeField](../time-field/time-field.md) · [ColorField](../color-field/color-field.md)
