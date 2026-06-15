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

> 中国省市区级联 · 内置全量行政区划(国家统计局口径·3级) + 浮层搜索直达 + onChange 同回码与名 · dogfood Cascader · forms/advanced

## 何时用

需要让用户选中国省/市/区县时用，行政区划数据已内置（`cnDivisions`），无需自备数据源。若是通用任意层级树选择用 [TreeSelect](../tree-select/tree-select.md)；若选国家/地区用 [CountrySelect](../country-select/country-select.md)。

## 导入
```ts
import { RegionCascader, sliceLevel, cnDivisions } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string[]` | — | 受控值：行政区划 code 路径，如 `["11","1101","110101"]` |
| defaultValue | `string[]` | — | 非受控初值 |
| level | `2 \| 3` | `3` | 联动层级：3=省/市/区县；2=省/市 |
| showSearch | `boolean` | `true` | 浮层内搜索框，输"浦东"直达 |
| changeOnSelect | `boolean` | — | 允许选到中间级即提交（不必到末级） |
| placeholder | `string` | — | 触发器占位文案 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸 |
| disabled | `boolean` | `false` | 禁用 |
| invalid | `boolean` | `false` | 无效态 |
| className | `string` | — | 透传到触发器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(codes: string[], names: string[]) => void` | 变更回调，同时给 code 路径与名称路径（表单常存名称） |

## 示例
```tsx
const [codes, setCodes] = useState<string[]>([]);
const [names, setNames] = useState<string[]>([]);
<RegionCascader
  value={codes}
  onChange={(c, n) => { setCodes(c); setNames(n); }}
  showSearch
/>

// 默认值回显（北京/东城区）+ 两级
<RegionCascader level={2} defaultValue={["44", "4401"]} />
```

## 禁忌 / 坑

- `onChange` 给两个数组：code 路径与 name 路径。表单存名称时取第二参，但受控 `value` 要回传的是 **code 路径**（第一参），两者别搞反。
- `value` 必须是合法的 code 链路（每级 code 是上级的子项），否则浮层无法定位回显。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md)
