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

> 国家/地区选择 · 内置 250 国(旗+中英文名+区号) + 单/多选 chips + 中英文/码/区号搜索 · dogfood Combobox(新增多选) · forms/advanced

## 何时用

选国家/地区时用，250 国数据（国旗 emoji + 中英文名 + 区号）已内置，支持中英文名/ISO 码/区号搜索。若选项是自定义扁平列表用 [Combobox](../combobox/combobox.md)；若是中国省市区用 [RegionCascader](../region-cascader/region-cascader.md)。

## 导入
```ts
import { CountrySelect, getCountry, flagEmoji, countrySearchText, filterCountries, countries } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string \| string[]` | — | 受控值：单选为 ISO2 码字符串；多选为码数组 |
| defaultValue | `string \| string[]` | — | 非受控初值 |
| multiple | `boolean` | `false` | 多选（chips） |
| showEnglish | `boolean` | `true` | 选项行是否显示英文名 |
| showDialCode | `boolean` | `false` | 选项行是否显示国际区号 |
| placeholder | `string` | — | 触发器占位文案 |
| searchPlaceholder | `string` | — | 搜索框占位文案 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| invalid | `boolean` | `false` | 无效态 |
| className | `string` | — | 透传到触发器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(next: string \| string[]) => void` | 选择变更回调；单选回传 string，多选回传 string[] |

## 示例
```tsx
// 单选
const [code, setCode] = useState("");
<CountrySelect value={code} onChange={(v) => setCode(v as string)} showDialCode />

// 多选（chips）
const [codes, setCodes] = useState<string[]>([]);
<CountrySelect multiple value={codes} onChange={(v) => setCodes(v as string[])} />
```

## 禁忌 / 坑

- `value`/`onChange` 入参在单选与多选下类型不同（`string` vs `string[]`），onChange 回调拿到的是联合类型，需按 `multiple` 用 `as` 收窄，别直接当数组用。
- value 存的是 ISO2 码（如 `"CN"`），不是中文名；展示名用 `getCountry(code)` 现取。
- 未在 Props 里列出的原生属性（`aria-*` / `data-*` / `id` / `title` …）落到**触发器**上（多选时是 chips 外壳里的输入框），不是外层容器 —— 读屏念的、能聚焦的都是它。`<Field required>` 注入的 `aria-required` 也走这条路（#293）。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
