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
| nodes* | `TreeNode[]` | - | 树数据源（含 key/label/children），从 `../tree/tree-core` 复用 |
| value | `string \| string[]` | - | 受控值；单选为 string，多选为 string[] |
| defaultValue | `string \| string[]` | - | 非受控初值 |
| multiple | `boolean` | `false` | 多选（checkable，父子级联勾选） |
| placeholder | `string` | - | 触发器占位文案 |
| disabled | `boolean` | `false` | 禁用 |
| invalid | `boolean` | `false` | 无效态（外壳变 danger） |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 触发器尺寸 |
| clearable | `boolean` | `false` | 可清除：有值且未禁用时触发器右侧 hover/聚焦浮出清除按钮，点击回到未选态（单选回传 `""`，多选回传 `[]`）。与 [Select](../select/select.md) 的 `clearable` 语义一致 |
| searchable | `boolean` | `false` | 浮层内树搜索框，多层命中跳转 |
| expandTrigger | `"row" \| "icon"` | `"row"` | 什么东西触发展开/收起，透传给内部 [Tree](../tree/tree.md)。**默认 `"row"` 下单选只有叶子选得中**；要「选到中间层」（某个部门 / 某个大类 / 某一册）传 `"icon"`：箭头管展开、行管选中 |
| showLine | `boolean` | - | 显示树连接线 |
| className | `string` | - | 透传到触发器 |

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

// 选到中间层：分类目录/组织架构里选一个大类，而不是只能选到最末级
const [cat, setCat] = useState<string | string[]>("");
<TreeSelect nodes={NODES} expandTrigger="icon" value={cat} onChange={setCat} placeholder="选择章节" />

// 可清除：作为可留空的筛选维度（留空 = 不限）
const [dept, setDept] = useState<string | string[]>("");
<TreeSelect nodes={NODES} clearable value={dept} onChange={setDept} placeholder="全部部门" />
```

## 禁忌 / 坑

- 单选默认**没有清除入口**，选中后无法在组件内回到未选态；凡是「可留空的筛选维度」都要开 `clearable`，否则筛选条件只能收窄不能放宽。
- `value` 受控时 `multiple` 切换会改变值的类型（string ↔ string[]），onChange 回调的入参类型随 `multiple` 而变，消费侧需按当前模式分支处理，不要混存。
- 多选下 `value` 只需传叶子/已选 key，父级半选态由组件依树结构派生，不要手动塞入半选父 key。
- **单选默认只有叶子节点可选**：`expandTrigger` 缺省是 `"row"`，有子节点的行点了只展开、不回传 `onChange`，点几次都选不中。需要提交任意层级就传 `expandTrigger="icon"`（箭头管展开、行管选中），或改用 [Cascader](../cascader/cascader.md) 的 `changeOnSelect`。多选不受影响——勾选框是独立命中区。
- 触发器是 `role="combobox"` 的按钮：未在 Props 里列出的原生属性（`aria-*` / `data-*` / `id` / `title` / `onBlur` …）落到**它**身上，不是外层容器 —— 读屏念的、能聚焦的都是它（#293）。
- 放进 [Field](../field/field.md) 时，`label` 的 `htmlFor`、`aria-describedby`、`invalid` 与 `disabled` 会自动串到触发器上；`<Field required>` 注入的 `aria-required` 同理。**0.54.0 之前这条链是断的**（label 指向一个不存在的 id，读屏念不出字段名），升级后无需改调用代码。
- 测试里按角色取触发器要用 `getByRole("combobox")`，不再是 `"button"`。

## 相关
[SecretField](../secret-field/secret-field.md) · [Combobox](../combobox/combobox.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md)
