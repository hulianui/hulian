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

> 分格输入验证码，自动跳格并支持整段粘贴 · forms/advanced

## 何时用

短信/邮箱验证码、PIN、二次验证码这类「定长、分格、填满即提交」的输入用。不要用普通文本框拼正则——本组件内置分段跳格、退格回退、整段粘贴拆分与 `onComplete`。需要任意长度自由文本请用普通 Input/[SecretField](../secret-field/secret-field.md)。

## 导入
```ts
import { InputOTP } from "@hulianui/ui"
```

## Props

继承根节点（`role="group"` 的 div）原生属性：`id` / `data-*` / `aria-*` / `onFocus` / `onBlur` 都能直接传。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| length | `number` | `6` | 分段数量 |
| value | `string` | - | 受控值 |
| defaultValue | `string` | - | 非受控初始值 |
| type | `"numeric" \| "text"` | `"numeric"` | 仅数字（默认）或任意字符 |
| disabled | `boolean` | - | 禁用 |
| invalid | `boolean` | `false` | 校验失败态 |
| groupGap | `boolean` | - | 中间插入横线分隔符（3-3 分组视觉，如 XXX-XXX） |
| name | `string` | - | 提交标识。额外渲染一个持有**完整值**的隐藏 input（槽位各持一位，同名会提交出 N 个字段） |
| className | `string` | - | 容器类名 |
| aria-label | `string` | - | 无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(value: string) => void` | 值变化回调 |
| onComplete | `(value: string) => void` | 填满时回调 |
| onBlur | `(e: FocusEvent<HTMLDivElement>) => void` | 焦点**离开整组**时触发；槽位之间跳焦不算。接 RHF `Controller` 时把 `field.onBlur` 传这里 |

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
- 接 **react-hook-form** 时值是整串而非原生 input，必须走 `Controller`，并且**要把 `field.onBlur` 传进来**——不传的话 `touchedFields` 永不更新，`mode: "onBlur"` / `"onTouched"` 的表单会静默失效（点进点出不校验，只有提交才报错）。
- `onBlur` 是**整组**语义：槽位之间跳焦不触发。想拿逐格失焦请自己在槽位上做，不要指望这个回调。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
