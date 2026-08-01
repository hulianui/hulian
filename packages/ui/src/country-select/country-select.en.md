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

> Country and region selector · 250 built-in entries with flags, localized names, dialing codes, single/multiple selection, and multilingual search, built with Combobox · forms/advanced

## When to use

Use CountrySelect to choose one or more countries or regions from 250 built-in entries with flag emoji, Chinese and English names, and dialing codes. Search accepts either language, ISO codes, and dialing codes. Use [Combobox](../combobox/combobox.md) for a custom flat list or [RegionCascader](../region-cascader/region-cascader.md) for Chinese provinces and cities.

## Import
```ts
import { CountrySelect, getCountry, flagEmoji, countrySearchText, filterCountries, countries } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| value | `string \| string[]` | — | Controlled value: single selection is ISO2 code string; multiple selection is code array |
| defaultValue | `string \| string[]` | — | uncontrolled initial value |
| multiple | `boolean` | `false` | Multiple selection (chips) |
| showEnglish | `boolean` | `true` | Whether to display the English name in the option line |
| showDialCode | `boolean` | `false` | Whether the item line displays the international area code |
| placeholder | `string` | — | Trigger placeholder copy |
| searchPlaceholder | `string` | — | Search box placeholder copy |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Trigger size |
| disabled | `boolean` | `false` | Disable |
| invalid | `boolean` | `false` | Invalid state |
| className | `string` | — | Additional class name for the trigger. |

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

## Related
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
