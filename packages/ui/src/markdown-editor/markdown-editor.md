---
slug: markdown-editor
name: MarkdownEditor
category: forms
group: advanced
tags: []
exports: [MarkdownEditor]
status: enriched
---

# MarkdownEditor

> Markdown 编辑器 · WYSIWYG 罩 TipTap + 值进出 markdown 字符串 + 隐藏 input 桥 Field + 标准集工具栏 · forms/advanced

## 何时用

需要所见即所得地编辑长文本（订单备注、文章详情、富文本说明）且最终存 markdown 字符串时用。值进出都是 markdown 串，可经 `name` 桥接原生表单 / [Field](../field/field.md)。纯短文本用普通输入框；只需 @ 提及用 [Mentions](../mentions/mentions.md)。

## 导入
```ts
import { MarkdownEditor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value | `string` | — | 受控 markdown 字符串 |
| defaultValue | `string` | — | 非受控初值 |
| name | `string` | — | 桥给原生表单 / Field 的隐藏 input name |
| placeholder | `string` | — | 空内容占位文案 |
| invalid | `boolean` | `false` | 校验失败态：外壳变 danger（也可由外层 Field 经 data-invalid 驱动） |
| disabled | `boolean` | `false` | 禁用 |
| minRows | `number` | `6` | 内容区最小高度（行） |
| className | `string` | — | 透传到外壳 |
| aria-label | `string` | — | 无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(markdown: string) => void` | 内容变化回调，参数为 markdown 字符串 |

## 示例
```tsx
// 受控
const [md, setMd] = useState("# 标题");
<MarkdownEditor value={md} onChange={setMd} />

// 桥接 Field（隐藏 input 承载表单值与校验）
<Field label="订单详情（必填）" error="详情不能为空" className="w-[32rem]">
  <MarkdownEditor name="detail" invalid placeholder="必填" />
</Field>
```

## 禁忌 / 坑

- 值进出是 markdown 字符串而非 TipTap 文档 JSON；不要把内部富文本结构当 value 传入。
- 放进 [Field](../field/field.md) 校验时，`invalid` 既可自传、也可由外层 Field 的 `data-invalid` 驱动，二选一即可，不必两边都设。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
