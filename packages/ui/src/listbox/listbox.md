---
slug: listbox
name: Listbox
category: forms
group: advanced
tags: []
exports: [Listbox]
status: enriched
---

# Listbox

> 可选列表 · WAI-ARIA roving tabindex + 单/多/纯动作 + typeahead(零依赖) · forms/advanced

## 何时用

需要一段「就地可见、键盘可达」的选项列表（菜单项、设置项、命令列表）时用。要单/多选受控选中态走 `selectionMode="single"/"multiple"`；只想点了就触发动作（不持有选中态）走 `selectionMode="none"` + `onAction`。和 [Combobox](../combobox/combobox.md) 的区别：Combobox 带输入框与浮层、适合海量可搜索选项；Listbox 是常驻的扁平列表，无输入、无弹层。

## 导入
```ts
import { Listbox } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items* | `ListboxItemData[]` | — | 列表项；每项含 `key`/`label`，可带 `description`/`startContent`/`endContent`/`disabled` |
| selectionMode | `"none" \| "single" \| "multiple"` | `"single"` | none=纯动作列表（不持有选中态）；single/multiple=可选 |
| selectedKeys | `string[]` | — | 受控选中键 |
| defaultSelectedKeys | `string[]` | — | 非受控初始选中键 |
| disabledKeys | `string[]` | — | 额外禁用键（与 `item.disabled` 合并） |
| className | `string` | — | 容器类名 |
| style | `CSSProperties` | — | 行内样式，落在列表根元素。用于表达 Tailwind 类给不出的动态值（如运行时决定的 `maxHeight`） |
| aria-label | `string` | — | 无可见标题时的无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onSelectionChange | `(keys: string[]) => void` | 选中变化回调 |
| onAction | `(key: string) => void` | 任意项激活都触发（含 none 模式），用于命令式动作 |

## 示例
```tsx
const [keys, setKeys] = useState<string[]>(["profile"]);
<Listbox
  items={items}
  selectionMode="single"
  selectedKeys={keys}
  onSelectionChange={setKeys}
/>
```

纯动作列表（不持选中态）：
```tsx
<Listbox items={items} selectionMode="none" onAction={(key) => run(key)} aria-label="动作列表" />
```

## 禁忌 / 坑

- `selectionMode="none"` 时组件不持有选中态，要响应点击必须接 `onAction`；`onSelectionChange` 在该模式下不会有意义的输出。
- 无可见标题时务必传 `aria-label`，否则屏幕阅读器读不出列表用途。
- 暂无其它已知坑。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
