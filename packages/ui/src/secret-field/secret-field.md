---
slug: secret-field
name: SecretField
category: forms
group: advanced
tags: []
exports: [SecretField, maskSecret]
status: enriched
---

# SecretField

> 密钥掩码字段 · sk-abc…wxyz 掩码(full/prefix-suffix) + 眼睛 toggle 显形 + 一键复制原值(同 Snippet idiom·1.5s 反馈) + 尾部动作槽(重置/吊销) + 受控 revealed(API key 管理刚需·复用 _icons Eye/Copy) · forms/advanced

## 何时用

展示已存在的敏感值（API key、token、密钥）——默认掩码、点眼睛显形、一键复制原值，并可挂重置/吊销动作。用于「展示+复制已有密钥」而非录入；录入密码用普通 [Input](../input/input.md)（type=password）；多选输入挑选用 [Combobox](../combobox/combobox.md)。

## 导入
```ts
import { SecretField, maskSecret } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `string` | — | 密钥原值 |
| revealed | `boolean` | — | 受控显形态；不传则组件自管 |
| onRevealedChange | `(revealed: boolean) => void` | — | 显形态变化回调（受控时用） |
| maskStrategy | `"full"｜"prefix-suffix"` | `"prefix-suffix"` | full 全掩 / prefix-suffix 保留首尾 |
| copyable | `boolean` | `true` | 是否显示复制按钮 |
| onCopy | `(value: string) => void` | — | 复制回调（拿到原值） |
| actions | `ReactNode` | — | 尾部动作槽（重置 / 吊销等） |
| readOnly | `boolean` | `false` | 只读外观（去掉交互态描边） |
| size | `"sm"｜"md"` | `"md"` | — |
| className | `string` | — | — |

另导出 `maskSecret(value, strategy)` 工具函数，单独按策略生成掩码串。

## 示例
```tsx
<SecretField value={apiKey} maskStrategy="prefix-suffix" />
```

全掩 + 不可复制 + 受控显形：
```tsx
const [revealed, setRevealed] = useState(false);
<SecretField
  value={apiKey}
  maskStrategy="full"
  copyable={false}
  revealed={revealed}
  onRevealedChange={setRevealed}
/>
```

## 禁忌 / 坑

- `value` 是必填的原值（明文）——掩码只是展示层，组件内部持有真实值用于复制，别把已掩码的串喂进来。
- 不传 `revealed` 时组件自管显形态；要外部控制（如统一收起）才传 `revealed`+`onRevealedChange`，二者配套。
- `copyable` 默认 true，敏感场景按需 `copyable={false}` 关掉复制。

## 相关
[Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md) · [Upload](../upload/upload.md)
