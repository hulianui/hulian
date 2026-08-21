---
slug: country-select
name: CountrySelect
category: forms
group: advanced
tags: []
exports: [CountrySelect, getCountry, flagEmoji, countrySearchText, filterCountries, countries]
status: enriched
---

# CountrySelect

> Searches and selects countries with codes, flags, and optional calling prefixes. · forms/advanced

## When to use

Use CountrySelect to choose one or more countries or regions from 250 built-in entries with flag emoji, Chinese and English names, and dialing codes. Search accepts either language, ISO codes, and dialing codes. Use [Combobox](../combobox/combobox.md) for a custom flat list or [RegionCascader](../region-cascader/region-cascader.md) for Chinese provinces and cities.

## Import
```ts
import { CountrySelect, getCountry, flagEmoji, countrySearchText, filterCountries, countries } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| string[]` | - | Controlled value: single selection is ISO2 code string; multiple selection is code array |
| defaultValue | `string \| string[]` | - | uncontrolled initial value |
| multiple | `boolean` | `false` | Multiple selection (chips) |
| showEnglish | `boolean` | `true` | Whether to display the English name in the option line |
| showDialCode | `boolean` | `false` | Whether the item line displays the international area code |
| placeholder | `string` | `"\u9009\u62e9\u56fd\u5bb6/\u5730\u533a"` | Trigger placeholder; the built-in Chinese copy means “Select a country or region.” |
| searchPlaceholder | `string` | `"\u641c\u7d22\u56fd\u5bb6 / \u533a\u53f7\u2026"` | Search placeholder; the built-in Chinese copy means “Search country or dialing code…”. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size |
| disabled | `boolean` | `false` | Disable |
| invalid | `boolean` | `false` | Invalid state |
| className | `string` | - | Additional class name for the trigger. |

## Events

| Event | Type | Description |
|------|------|------|
| onChange | `(next: string \| string[]) => void` | Select change callback; single selection returns string, multiple selection returns string[] |

## Examples
```tsx
// Single selection
const [code, setCode] = useState("");
<CountrySelect value={code} onChange={(v) => setCode(v as string)} showDialCode />

// Multiple selection (chips)
const [codes, setCodes] = useState<string[]>([]);
<CountrySelect multiple value={codes} onChange={(v) => setCodes(v as string[])} />
```

## Usage guidelines

- `value` and `onChange` use `string` in single-select mode and `string[]` in multi-select mode. The callback exposes the union type, so narrow it from `multiple` or with an `as` type assertion before treating it as an array.
- Stored values are ISO 3166-1 alpha-2 codes such as `"CN"`, not display names. Resolve display data with `getCountry(code)`.
- Native attributes that are not listed in Props (`aria-*`, `data-*`, `id`, `title`, …) land on the **trigger** (the input inside the chips shell in multiple mode) rather than on the outer container, because that is the element which takes focus and is announced. The `aria-required` injected by `<Field required>` travels the same way (#293).

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
