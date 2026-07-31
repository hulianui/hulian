---
slug: rating
name: Rating
category: forms
group: advanced
tags: []
exports: [Rating]
status: enriched
---

# Rating

> 评分 · 零依赖受控星级(radio 语义) + 自定义图标 + hover 预览 + token 星色 · forms/advanced

## 何时用

需要星级打分/满意度采集，或只读展示已有评分时用。零依赖自研，可换图标（心/火苗等）和颜色，星色走 token、hover 态用 color-mix 自动派生。纯只读且只需展示分值文字的场景可直接用文本，不必引入本组件。

## 导入
```ts
import { Rating } from "@hulianui/ui"
```

> ⚠️ **前置条件：本组件属 `_mui` 桥接族，必须置于 `MuiBridgeProvider` 之内。**
## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `number` | — | 受控当前分值 |
| defaultValue | `number` | — | 非受控初始分值 |
| max | `number` | — | 星数上限 |
| readOnly | `boolean` | `false` | 只读（不可交互） |
| disabled | `boolean` | — | 禁用 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 尺寸 |
| color | `string` | `var(--color-primary)` | 星色（任意 CSS 颜色或 token var()）；hover 自动派生 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: number \| null) => void` | 受控回调，点星即触发 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 自定义图标，如 `<Heart />`（默认实心五角星） |
| emptyIcon | `ReactNode` | 自定义空状态图标，缺省时复用 icon（同形状走空色） |

## 示例
```tsx
const [v, setV] = useState<number | null>(3);
<Rating value={v ?? 0} onValueChange={setV} />
```

只读 + 换图标/颜色：
```tsx
<Rating value={4} readOnly />
<Rating defaultValue={3} color="var(--color-danger)" icon={<Heart size="1em" fill="currentColor" />} />
```

## 禁忌 / 坑

- 回调是 `onValueChange`，不是原生 `onChange`。
- `readOnly` 时不渲染任何 radio，只留一个带 `aria-label` 的静态图形；可交互时是一组真实 radio（可按 value 选中）。
- `color` 传 token 须带前缀写 `var(--color-primary)`，裸 `var(--primary)` 不解析 —— 见 [[hulian-token-color-var-needs-color-prefix]]。
- 自定义 `icon` 想填充实色须自带 `fill="currentColor"`（如示例），否则只描边。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Upload](../upload/upload.md)
