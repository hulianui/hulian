---
slug: emoji-picker
name: EmojiPicker
category: forms
group: advanced
tags: []
exports: [EmojiPicker, EMOJI_CATEGORIES, ALL_EMOJI]
status: enriched
---

# EmojiPicker

> 表情选择器 · 内联 emoji 数据集(7 分类·中英关键词) + 关键词搜索 + 分类页签 + 最近使用(受控/内部) · 搜索框 dogfood Input · onSelect 回传 emoji(零依赖·聊天/评论) · forms/advanced

## 何时用

聊天/评论输入框旁需要插入表情时用，emoji 数据（7 分类 + 中英关键词）内置、零依赖、支持搜索。本身只是表情面板，浮层弹出/定位需自配 [Popover](../popover/popover.md) 等容器。

搜索、空态、最近使用与分类标签跟随最近的 `ConfigProvider` locale；默认 `zhCN`，切换 `enUS` 后使用英文。显式传入 `searchPlaceholder` 时仍以该 prop 为准。

## 导入
```ts
import { EmojiPicker, EMOJI_CATEGORIES, ALL_EMOJI } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| columns | `number` | `8` | 网格列数 |
| searchable | `boolean` | `true` | 是否显示搜索框 |
| defaultCategory | `string` | 第一个分类 | 初始分类 key |
| recent | `string[]` | — | 受控「最近使用」列表；省略则组件内部维护 |
| searchPlaceholder | `string` | — | 搜索框 placeholder |
| className | `string` | — | 透传到容器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelect | `(emoji: string) => void` | 选中某个 emoji 的回调，参数为 emoji 字符 |

## 示例
```tsx
// 追加到输入
const [text, setText] = useState("");
<EmojiPicker onSelect={(e) => setText((t) => t + e)} />

// 受控最近使用 + 隐藏搜索 + 紧凑 6 列
<EmojiPicker columns={6} searchable={false} recent={["🔥", "💯", "👍", "🎉", "❤️"]} onSelect={insert} />
```

## 禁忌 / 坑

- `recent` 一旦传入即进入受控模式，组件不再自行追加最近使用，需自己在 `onSelect` 里维护并回写；省略才走内部自动维护。
- 组件只是面板，不含触发器/浮层定位；要做弹出式表情按钮需自己套 [Popover](../popover/popover.md)。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
