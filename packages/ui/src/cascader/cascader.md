---
slug: cascader
name: Cascader
category: forms
group: advanced
tags: []
exports: [Cascader, flattenLeafPaths, filterLeafPaths, type CascaderLeafPath]
status: enriched
---

# Cascader

> 级联选择 · 触发器 + Popover 横向逐级面板列 + 路径数组受控 + click/hover 展开 + changeOnSelect · 复用树引擎核 · forms/advanced

## 何时用

省/市/区、分类/子类、组织层级等「有父子层级、要逐级下钻选一条完整路径」的场景用。值是从根到所选节点的 `key` 路径数组。默认须选到叶子；开 `changeOnSelect` 允许任意层提交。若数据是扁平的单层选项，用 [Combobox](../combobox/combobox.md)/[Listbox](../listbox/listbox.md) 即可，不必引入级联。

## 导入
```ts
import { Cascader, flattenLeafPaths, filterLeafPaths, type CascaderLeafPath } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes* | `TreeNode[]` | — | 层级数据（复用 tree-core 的 `TreeNode`，含 `key`/`label`/`children`/`disabled`） |
| value | `string[]` | — | 受控路径（从根到所选节点的 key 数组） |
| defaultValue | `string[]` | — | 非受控初始路径 |
| expandTrigger | `"click" \| "hover"` | `"click"` | 逐级展开触发方式 |
| changeOnSelect | `boolean` | `false` | 任意层节点都可提交（非仅叶子） |
| showSearch | `boolean` | — | 浮层顶部出搜索框：扁平成叶子路径模糊匹配，命中行选中即提交全路径 |
| searchPlaceholder | `string` | — | 搜索框占位符 |
| placeholder | `string` | — | 触发器占位符 |
| disabled | `boolean` | — | 禁用 |
| invalid | `boolean` | — | 校验失败态 |
| size | `"sm" \| "md" \| "lg"` | — | 触发器尺寸 |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(path: string[], nodes: TreeNode[]) => void` | 选中变化，回传 key 路径与对应节点链 |

## 示例
```tsx
const [value, setValue] = useState<string[]>([]);
<Cascader
  nodes={nodes}
  expandTrigger="click"
  value={value}
  onChange={(path) => setValue(path)}
/>
```

任意层可提交（如选到省或市即可）：
```tsx
<Cascader nodes={nodes} changeOnSelect value={value} onChange={(path) => setValue(path)} />
```

## 禁忌 / 坑

- `value` 是**完整 key 路径数组**（如 `["zhejiang","hangzhou","xihu"]`），不是单个叶子 key；回填时要给全路径，否则展开列对不上。
- `disabled` 的节点不可选、其子树也不会因它而展开。
- `onChange` 第二参是节点链（`TreeNode[]`），需要 label 做回显时取它而非自己再查表。
- 触发器是 `role="combobox"` 的按钮：未在 Props 里列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**它**身上，不是外层容器 —— 读屏念的、能聚焦的都是它（#293）。
- 放进 [Field](../field/field.md) 时，`label` 的 `htmlFor`、`aria-describedby`、`invalid` 与 `disabled` 会自动串到触发器上；`<Field required>` 注入的 `aria-required` 同理。**0.54.0 之前这条链是断的**（label 指向一个不存在的 id，读屏念不出字段名），升级后无需改调用代码。
- 测试里按角色取触发器要用 `getByRole("combobox")`，不再是 `"button"`。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
