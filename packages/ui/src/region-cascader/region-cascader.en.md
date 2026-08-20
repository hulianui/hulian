---
slug: region-cascader
name: RegionCascader
category: forms
group: advanced
tags: []
exports: [RegionCascader, sliceLevel, cnDivisions]
status: enriched
---

# RegionCascader

> China administrative-region cascader · built-in three-level National Bureau of Statistics data + searchable popup + code and name paths from `onChange` · built on Cascader · forms/advanced

## When to use

Use RegionCascader to select a province, city, and district or county in China. The `cnDivisions` dataset is built in, so consumers do not need to supply a data source. Use [TreeSelect](../tree-select/tree-select.md) for an arbitrary hierarchy, or [CountrySelect](../country-select/country-select.md) for countries and regions.

## Import
```ts
import { RegionCascader, sliceLevel, cnDivisions } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string[]` | — | Controlled administrative-code path, such as `["11","1101","110101"]`. |
| defaultValue | `string[]` | — | Initial code path when uncontrolled. |
| level | `2 \| 3` | `3` | Depth: 3 = province/city/district or county; 2 = province/city. |
| showSearch | `boolean` | `true` | Shows popup search, allowing direct matches such as “Pudong.” |
| changeOnSelect | `boolean` | `false` | Allows an intermediate level to be submitted without selecting the final level. |
| placeholder | `string` | Depends on `level` | Built-in Chinese copy is `"\u8bf7\u9009\u62e9\u7701/\u5e02"` for level 2 or `"\u8bf7\u9009\u62e9\u7701/\u5e02/\u533a"` for level 3, meaning “Select province/city” or “Select province/city/district.” |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size |
| disabled | `boolean` | `false` | Disable |
| invalid | `boolean` | `false` | Invalid state |
| className | `string` | — | Passthrough to trigger |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(codes: string[], names: string[]) => void` | Called with both the code path and name path. Forms commonly persist the name path. |

## Example
```tsx
const [codes, setCodes] = useState<string[]>([]);
const [names, setNames] = useState<string[]>([]);
<RegionCascader
  value={codes}
  onChange={(c, n) => { setCodes(c); setNames(n); }}
  showSearch
/>

// Uncontrolled two-level selection (Guangdong/Guangzhou)
<RegionCascader level={2} defaultValue={["44", "4401"]} />
```

## Usage guidelines

- `onChange` returns code and name paths in that order. Use the second argument when persisting names, but pass the **code path**—the first argument—back as controlled `value`.
- `value` must be a valid ancestry path in which every code belongs to its preceding parent; otherwise the popup cannot locate and display the selection.
- The trigger is a `role="combobox"` button, and native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, `onBlur`, …) land on **it** rather than on the outer container — it is the element that takes focus and that screen readers announce (#293).
- Inside [Field](../field/field.md) the label's `htmlFor`, `aria-describedby`, `invalid`, and `disabled` are wired to the trigger automatically, and so is the `aria-required` injected by `<Field required>`. **That chain was broken before 0.54.0** (the label pointed at an id that did not exist, so screen readers never announced the field name); upgrading needs no call-site change.
- Query the trigger by role with `getByRole("combobox")` in tests, not `"button"` anymore.

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
