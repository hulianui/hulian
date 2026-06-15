---
slug: input-otp
name: InputOTP
category: forms
group: advanced
tags: []
exports: [InputOTP]
status: enriched
---

# InputOTP

> 验证码输入 · 分段自动跳格/退格回退/整段粘贴(零依赖) · forms/advanced

## 何时用

短信/邮箱验证码、PIN、二次验证码这类「定长、分格、填满即提交」的输入用。不要用普通文本框拼正则——本组件内置分段跳格、退格回退、整段粘贴拆分与 `onComplete`。需要任意长度自由文本请用普通 Input/[SecretField](../secret-field/secret-field.md)。

## 导入
```ts
import { InputOTP } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| length | `number` | `6` | 分段数量 |
| value | `string` | — | 受控值 |
| defaultValue | `string` | — | 非受控初始值 |
| onChange | `(value: string) => void` | — | 值变化回调 |
| onComplete | `(value: string) => void` | — | 填满时回调 |
| type | `"numeric" \| "text"` | `"numeric"` | 仅数字（默认）或任意字符 |
| disabled | `boolean` | — | 禁用 |
| invalid | `boolean` | `false` | 校验失败态 |
| groupGap | `boolean` | — | 中间插入横线分隔符（3-3 分组视觉，如 XXX–XXX） |
| className | `string` | — | 容器类名 |
| aria-label | `string` | — | 无障碍标签 |

## 示例
```tsx
const [otp, setOtp] = useState("");
<InputOTP
  length={6}
  type="numeric"
  value={otp}
  onChange={setOtp}
  onComplete={verify}
/>
```

3-3 分组：
```tsx
<InputOTP length={6} groupGap value={otp} onChange={setOtp} />
```

## 禁忌 / 坑

- `onComplete` 仅在填满最后一格瞬间触发一次，验证逻辑放这里；不要在 `onChange` 里判 `value.length === length` 重复触发。
- 受控用 `value` 须配 `onChange`，否则格子无法输入。
- 暂无其它已知坑。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [Rating](../_mui/rating.md) · [Upload](../upload/upload.md)
