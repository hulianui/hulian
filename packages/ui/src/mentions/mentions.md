---
slug: mentions
name: Mentions
category: forms
group: advanced
tags: []
exports: [Mentions, MentionText, type MentionTextProps, findTrigger, insertMention, defaultFilter, segmentMentions, type MentionSegment]
status: enriched
---

# Mentions

> 输入触发符后弹出候选，把提及插进文本 · forms/advanced

## 何时用

多行评论/工单/动态里需要 @ 某人、# 关联工单这类「键入触发符 → 弹候选 → 插入」场景时用。它本质是带候选浮层的 Textarea。和 [Combobox](../combobox/combobox.md) 的区别：Combobox 选「单值」整体替换输入框；Mentions 在自由文本中插入一个个提及片段，候选只在触发符后唤起，正文仍是普通多行文本。

## 导入
```ts
import { Mentions, MentionText, type MentionTextProps, findTrigger, insertMention, defaultFilter, segmentMentions, type MentionSegment } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| options* | `MentionOption[]` | - | 候选清单；每项 `value`/`label`，可带 `description`/`startContent`/`disabled` |
| value | `string` | - | 受控文本值（与 onChange 配套） |
| defaultValue | `string` | - | 非受控初始值（不传 value 时生效） |
| prefix | `string` | `"@"` | 触发符，可配多字符如 `"@@"`/`"#"`；其前为行首或空白时唤起候选 |
| filter | `false \| ((option, query) => boolean)` | 内置子串匹配 | `false`=关闭本地过滤交给 onSearch；函数=自定义；缺省=大小写不敏感子串（label/value） |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 文本域皮肤尺寸（复用 Textarea 的 size 变体） |
| invalid | `boolean` | `false` | 独立使用时标红 |
| placeholder | `string` | - | 占位符（透传 textarea） |
| rows | `number` | - | 文本域行数（透传 textarea） |
| disabled | `boolean` | `false` | 禁用 |
| className | `string` | - | 容器类名 |
| popupClassName | `string` | - | 候选浮层额外类名 |

> 还透传 `Textarea` 的原生属性（除被 Omit 的 `size`/`value`/`defaultValue`/`onChange`/`onSelect`/`prefix`）。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(value: string) => void` | 文本变化回调（受控必接） |
| onSearch | `(query: string) => void` | 查询变化通知（外部/异步过滤用，本身不返回结果） |
| onSelect | `(option: MentionOption) => void` | 选中候选回调（回传整条 option） |

## 示例
```tsx
<Mentions
  options={people}
  defaultValue="提醒 "
  placeholder="输入 @ 提及同事…"
  onSelect={(o) => console.log(o)}
/>
```

自定义触发符 `#` 关联工单：
```tsx
<Mentions prefix="#" options={tickets} placeholder="输入 # 关联工单…" />
```

## 禁忌 / 坑

- 受控用法 `value` 必须配 `onChange`，否则文本无法编辑（与原生受控 textarea 同理）。
- 插入文本是 `prefix + label + " "`，`label` 即可见名也是写入正文的字面量；要展示和插入不一致请自行用 `onSelect` 接管。
- 外部/异步过滤时设 `filter={false}` 并在 `onSearch` 里刷新 `options`，否则内置子串过滤会再过滤一遍父级已筛好的结果。
- 暂无其它已知坑。
- 候选浮层的无障碍名称读取 `ConfigProvider` 的 `locale.components.mentions.suggestions`。`zhCN` / `enUS` 已内置；旧版自定义 locale 未提供该可选字段时回退「提及候选」。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
