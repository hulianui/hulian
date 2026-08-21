---
slug: filter-chip
name: FilterChip
category: data-display
group: info
tags: []
exports: [FilterChip, FilterChipGroup]
status: enriched
---

# FilterChip

> 已应用筛选条件胶囊 · 主语｜操作符｜值｜移除 四段(段间竖线) + 操作符可省 + 值收 ReactNode + 整段可点 · data-display/info

## 何时用

列表页顶部回显「当前生效了哪些筛选条件」，每条一个胶囊，点 × 撤掉这一条。它是筛选的**回显侧**；选参数那一半是 [SearchForm](../search-form/search-form.md)（`fields` 配置 → `onSearch`），两者通常一起用在 [ProTable](../pro-table/pro-table.md) 上方。

要的是「一个可移除的单段标签」（技能标签、收件人令牌）用 [Chip](../chip/chip.md)；只标一个状态用 [Tag](../tag/tag.md)。FilterChip 与它们的分界在于**结构化**：主语、操作符、值是三个独立的段，各有字重色阶并以竖线分隔，塞进 Chip 的单段 `children` 会退化成一句长文字。

## 导入
```ts
import { FilterChip, FilterChipGroup } from "@hulianui/ui"
```

## Props

### FilterChip

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| subject * | `ReactNode` | - | 主语：被筛选的字段名（「状态」「负责人」）。第一段，字重最重。 |
| operator | `ReactNode` | - | 操作符（「属于以下任一项」「早于」）。**省略时胶囊自动少一栏**，不会留空栏。 |
| value * | `ReactNode` | - | 值。收节点而非字符串，见下方「值是富节点」。 |
| size | `"sm"｜"md"` | `md` | 只换高度、字号与段内边距，不改结构。 |
| subjectLabel | `string` | - | 移除按钮无障碍名里用的主语纯文本。`subject` 是字符串时自动取用；是节点时必须给，否则退回不带主语的「移除筛选条件」。 |
| isDisabled | `boolean` | - | 禁用：降透明度、屏蔽指针事件，本体与移除按钮均不可点。 |
| className | `string` | - | - |

### FilterChipGroup

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| clearAllLabel | `ReactNode` | locale 的「清除全部」 | 覆盖行尾按钮文案。 |
| aria-label | `string` | locale 的「已应用的筛选条件」 | 覆盖分组的无障碍名。 |
| className | `string` | - | - |
| children | `ReactNode` | - | FilterChip 列表。**一个都没有时整行不渲染**（含「清除全部」）。 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onRemove | `() => void` | 提供则在末尾渲染移除(×)按钮并触发回调。不提供就没有 × —— 组件不自管条件列表，删哪条由调用方决定。 |
| onClick | `() => void` | 提供则本体（主语/操作符/值三段）变成按钮，用于重新打开对应的筛选菜单。不提供时本体是纯展示，不可聚焦。 |
| onClearAll | `() => void` | FilterChipGroup：提供则在行尾渲染「清除全部」文字按钮。 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| subject | `ReactNode` | 主语段，可放图标 + 文字。 |
| operator | `ReactNode` | 操作符段，省略即不渲染该段与其分隔线。 |
| value | `ReactNode` | 值段，常放头像堆叠 / 状态图标 + 「已选 N 项」。 |

## 点 × 不会触发 onClick

移除按钮是本体按钮的**兄弟节点**而不是后代，所以点 × 天然冒泡不到本体上，消费方不需要自己写 `stopPropagation`；同时也避免了 `button` 套 `button` 的非法嵌套。同时传 `onClick` 和 `onRemove` 是预期用法。

## 值是富节点

`value` 收 `ReactNode` 而不是 `string`：真实的筛选回显里，值往往是「最多 3 个头像/状态图标负重叠 + 一句『已选 2 项』」，而不是一段纯文字。值段本身是 `flex items-center gap-1`，直接把多个节点并排塞进去即可。

注意胶囊本体只有 24px（`sm`）/ 28px（`md`）高，[Avatar](../avatar/avatar.md) 最小档 `size="sm"` 是 32px，塞进来会顶破胶囊；值段里的头像请用自己的小尺寸节点。

## 无障碍

- 移除按钮的名字带上主语（「移除筛选条件：状态」/ enUS「Remove filter: Status」），否则一行五个胶囊对读屏就是五个同名的「移除」。`subject` 传节点时靠 `subjectLabel` 提供这段纯文本。
- FilterChipGroup 是 `role="group"`，默认名「已应用的筛选条件」，可用 `aria-label` 覆盖。
- 文案全部走 `ConfigProvider` 的 `locale`，未配置 `filterChip` 词条的旧自定义 locale 会保留中文默认值。

## 示例
```tsx
// 三段：主语 ｜ 操作符 ｜ 值 ｜ ×
<FilterChip
  subject="状态"
  operator="属于以下任一项"
  value="已选 2 项"
  onRemove={() => remove("status")}
/>

// 两段：省略 operator
<FilterChip subject="负责人" value="张三" onRemove={() => remove("owner")} />

// 成行 + 清除全部；点本体重开筛选菜单，点 × 只删这一条
<FilterChipGroup onClearAll={() => setConditions([])}>
  {conditions.map((c) => (
    <FilterChip
      key={c.id}
      subject={c.subject}
      operator={c.operator}
      value={c.value}
      onClick={() => openFilterMenu(c.id)}
      onRemove={() => setConditions((s) => s.filter((x) => x.id !== c.id))}
    />
  ))}
</FilterChipGroup>
```
