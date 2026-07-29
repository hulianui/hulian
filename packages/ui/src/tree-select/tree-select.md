---
slug: tree-select
name: TreeSelect
category: forms
group: advanced
tags: []
exports: [TreeSelect]
status: enriched
---

# TreeSelect

> 树选择器 · 触发器 + Popover 浮层内嵌 Tree + 单选/多选(checkable)对称 + 树内搜索 · 复用树引擎核 · forms/advanced

## 何时用

数据源本身是层级结构（组织架构、分类目录、地区），需要在收拢的触发器里选一个或多个节点时用。若选项是扁平列表用 [Combobox](../combobox/combobox.md)/[Listbox](../listbox/listbox.md)；若是固定的省市区级联用 [RegionCascader](../region-cascader/region-cascader.md)。

## 导入
```ts
import { TreeSelect } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| nodes* | `TreeNode[]` | — | 树数据源（含 key/label/children），从 `../tree/tree-core` 复用 |
| value | `string \| string[]` | — | 受控值；单选为 string，多选为 string[] |
| defaultValue | `string \| string[]` | — | 非受控初值 |
| multiple | `boolean` | `false` | 多选（checkable，父子级联勾选） |
| placeholder | `string` | — | 触发器占位文案 |
| disabled | `boolean` | `false` | 禁用 |
| invalid | `boolean` | `false` | 无效态（外壳变 danger） |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸 |
| clearable | `boolean` | `false` | 可清除：有值且未禁用时触发器右侧 hover/聚焦浮出清除按钮，点击回到未选态（单选回传 `""`，多选回传 `[]`）。与 [Select](../select/select.md) 的 `clearable` 语义一致 |
| searchable | `boolean` | `false` | 浮层内树搜索框，多层命中跳转 |
| showLine | `boolean` | — | 显示树连接线 |
| className | `string` | — | 透传到触发器 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(value: string \| string[]) => void` | 选择变更回调；单选回传 string，多选回传 string[] |

## 示例
```tsx
// 单选 + 搜索
const [v, setV] = useState<string | string[]>("");
<TreeSelect nodes={NODES} value={v} onChange={setV} placeholder="选择归属部门" searchable />

// 多选：父级勾选级联到叶，取消单叶父级落半选
const [v, setV] = useState<string | string[]>(["fe-web", "fe-mini"]);
<TreeSelect nodes={NODES} multiple value={v} onChange={setV} placeholder="勾选可见部门" />

// 可清除：作为可留空的筛选维度（留空 = 不限）
const [dept, setDept] = useState<string | string[]>("");
<TreeSelect nodes={NODES} clearable value={dept} onChange={setDept} placeholder="全部部门" />
```

## 禁忌 / 坑

- 单选默认**没有清除入口**，选中后无法在组件内回到未选态；凡是「可留空的筛选维度」都要开 `clearable`，否则筛选条件只能收窄不能放宽。
- `value` 受控时 `multiple` 切换会改变值的类型（string ↔ string[]），onChange 回调的入参类型随 `multiple` 而变，消费侧需按当前模式分支处理，不要混存。
- 多选下 `value` 只需传叶子/已选 key，父级半选态由组件依树结构派生，不要手动塞入半选父 key。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../_mui/rating.md)
