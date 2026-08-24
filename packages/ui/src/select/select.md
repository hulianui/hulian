---
slug: select
name: Select
category: forms
group: basic
tags: []
exports: [Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel]
status: enriched
---

# Select

> 下拉选择 · Base UI overlay 单选/多选（multiple）+ items 自动 label + clearable / searchable / loading / 分组 · forms/basic

## 何时用

从一组固定选项里选一项或多项（选项较多、需要收纳成下拉）。多选传 `multiple`，受控值变 `string[]`，Trigger 平铺已选 label、超出折叠 +N。选项少且需全部可见用 [Radio](../radio/radio.md) 或 [CheckboxGroup](../checkbox-group/checkbox-group.md)（多选平铺）；自由文本用 [Input](../input/input.md)。给 `items`（`{value,label}` 数组）让 Trigger 显示选中项 label 而非 raw value。

对标 el-select 的 `clearable` / `filterable` 心智：本组件的 `clearable` 即前者，`searchable` 即后者（内部切到 [Combobox](../combobox/combobox.md) 的搜索皮肤，过滤逻辑直接复用 Base UI Combobox，不另造）。需要 chips 多选输入、异步远程补全、自由输入等更重的场景仍直接用 [Combobox](../combobox/combobox.md)。

## 导入
```ts
import { Select, SelectTrigger, SelectContent, SelectItem, SelectGroup, SelectGroupLabel } from "@hulianui/ui"
```

## Props

`Select` 继承 Base UI `Select.Root` 属性（除 `items` 被下方覆盖外，如 `value`/`defaultValue`/`onValueChange`/`disabled`…）。

### Select
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ReadonlyArray<{ value: string ｜ null; label: ReactNode }>` | - | 选项数据；Base UI 据此让 Trigger 显示选中项 label |
| defaultValue | `string ｜ string[] ｜ null` | `null` | 非受控初值：单选 `string ｜ null`，`multiple` 时 `string[]` |
| placeholder | `ReactNode` | - | 无选中值时的占位文本（单选注入 value:null 项实现；空 chips 只在真实 Trigger Value 挂载一次，并以稳定关联提供 SSR 可访问名称） |
| multiple | `boolean` | `false` | 多选模式：value/defaultValue/onValueChange 均为 `string[]`；选中后浮层保持打开 |
| selectedFirst | `boolean` | `false` | 仅多选：按当前 value 数组顺序将已选项置顶，未选项保持原顺序 |
| clearable | `boolean` | `false` | 有值时 Trigger 右侧 hover/focus 浮出清除按钮，点击置空（单选回传 `null`，多选回传 `[]`） |
| searchable | `boolean` | `false` | 切到 Combobox 搜索皮肤：浮层顶部搜索框 + Base UI 过滤（依赖 `items`） |
| searchPlaceholder | `string` | `"搜索"` | searchable 时搜索框占位 |
| emptyMessage | `ReactNode` | `"无匹配项"` | searchable 时无命中的空态文案 |
| virtualized | `boolean` | `items` ≥ 100 时为 `true` | searchable 皮肤下的列表虚拟化；标准皮肤不涉及。见「禁忌 / 坑」 |
| loading | `boolean` | `false` | 加载态：Trigger 图标换 Spinner，浮层只出加载占位（不渲染选项） |
| loadingText | `ReactNode` | `"加载中"` | 加载占位文案 |

### SelectGroup / SelectGroupLabel
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| children* | `ReactNode` | - | `SelectGroup` 内放一个 `SelectGroupLabel` + 若干 `SelectItem` |
| className | `string` | - | 透传类名 |

### SelectTrigger
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"xs" ｜ "sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸。`xs` 与 Input / Textarea 的 `xs` 等高（密集表格里同一行三种控件必须对齐） |
| invalid | `boolean` | `false` | 独立使用（非 Field 内）时手动置无效态皮肤 |
| maxDisplay | `number` | `2` | 多选模式下最多平铺几个已选 label，超出折叠为 +N 计数 |
| display | `"text" ｜ "chips"` | `"text"` | 多选值的展示方式；`chips` 用标签视觉回显 |
| removable | `boolean` | `false` | `display="chips"` 时显示单项删除按钮 |
| className | `string` | - | 透传类名 |

### SelectContent
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| side | `"top" ｜ "bottom"` | `"bottom"` | 弹出方向 |
| align | `"start" ｜ "center" ｜ "end"` | - | 对齐 |
| sideOffset | `number` | - | 偏移量 |

### SelectItem
| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | - | 选项值（本批仅 string 值） |
| disabled | `boolean` | `false` | 禁用此项 |

## Events

`Select` 透传 Base UI `Select.Root` 的常用事件。

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value: string ｜ null, eventDetails) => void`（多选时 `(value: string[], …)`） | 选中值变化回调（透传 Base UI `Select.Root`） |
| onOpenChange | `(open: boolean, eventDetails) => void` | 下拉开合变化回调（透传 Base UI `Select.Root`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| SelectContent.children* | `ReactNode` | 一组 `SelectItem`（可外套 `SelectGroup`） |
| SelectItem.children* | `ReactNode` | 选项展示内容 |
| SelectGroupLabel.children* | `ReactNode` | 分组标题 |

## 示例
```tsx
const FONTS = [
  { value: "sans", label: "无衬线 Sans" },
  { value: "serif", label: "衬线 Serif" },
  { value: "mono", label: "等宽 Mono" },
];

<Select items={FONTS} placeholder="请选择字体" defaultValue="serif">
  <SelectTrigger />
  <SelectContent>
    {FONTS.map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// 多选：考点覆盖 / 报表维度等中后台多选筛选
const [points, setPoints] = useState<string[]>([]);

<Select items={KNOWLEDGE_POINTS} placeholder="选择考点" multiple value={points} onValueChange={setPoints}>
  <SelectTrigger maxDisplay={2} />
  <SelectContent>
    {KNOWLEDGE_POINTS.map((p) => (
      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// chips 多选：已选值置顶、可搜索、单项删除
const cities = [
  { value: "shanghai", label: "上海" },
  { value: "beijing", label: "北京" },
  { value: "shenzhen", label: "深圳" },
];

<Select
  items={cities}
  multiple
  searchable
  selectedFirst
  defaultValue={["shanghai", "beijing"]}
>
  <SelectTrigger display="chips" removable maxDisplay={3} />
  <SelectContent>
    {cities.map((city) => (
      <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// 可清除 + 可搜索：对标 el-select 的 clearable / filterable
<Select items={FONTS} placeholder="请选择字体" clearable searchable searchPlaceholder="搜索字体">
  <SelectTrigger />
  <SelectContent>
    {FONTS.map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// 加载态（异步拉选项）
const { data, isLoading } = useFonts();

<Select items={data ?? []} placeholder="请选择字体" loading={isLoading}>
  <SelectTrigger />
  <SelectContent>
    {(data ?? []).map((f) => (
      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
    ))}
  </SelectContent>
</Select>

// 选项分组
<Select items={FONTS} placeholder="请选择字体">
  <SelectTrigger />
  <SelectContent>
    <SelectGroup>
      <SelectGroupLabel>西文</SelectGroupLabel>
      <SelectItem value="sans">无衬线 Sans</SelectItem>
      <SelectItem value="serif">衬线 Serif</SelectItem>
    </SelectGroup>
    <SelectGroup>
      <SelectGroupLabel>代码</SelectGroupLabel>
      <SelectItem value="mono">等宽 Mono</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>
```

## 禁忌 / 坑

- 占位文本通过 `Select` 的 `placeholder` prop 传，**不要**给 `Select.Value` 传 placeholder——见 [[base-ui-select-rc0-no-value-placeholder-prop-inject-null-item]]：本项目锁 Base UI rc.0，其 `Select.Value` 没有 placeholder prop（那是 v1.2+），瑚琏靠注入一个 `value:null` 的 items 项实现占位 label。`items` 与 `SelectItem` 的 value 要对应，否则 Trigger 显示 raw value 而非 label。
- `multiple` 下 value 必须是数组：给 `defaultValue="a"`（字符串）会被当成无选中处理。多选模式不注入 null 占位项（数组值命不中 null 项），占位由 Trigger 内函数式 Value 渲染，因此**多选的 placeholder/label 解析依赖 `items` prop**——不传 items 时 Trigger 只能显示 raw value。
- 多选 Trigger 的平铺条数由 `SelectTrigger` 的 `maxDisplay` 控制（默认 2），不在 `Select` 上。
- `selectedFirst` **只影响多选**。`searchable` 时先过滤、再把仍命中的已选项按 value 数组顺序置顶；未命中的已选值不会被强插回结果。标准皮肤的 `SelectGroup` 保持组顺序，只在各组内部重排。
- `display="chips"` 只改变多选 Trigger 的视觉回显。空数组时，`placeholder`（支持 ReactNode）**只在真实 Trigger Value 中挂载一次**：它以 muted 样式直接可见，并带稳定 id；不会再复制到 chips overlay，也不会产生重复 consumer id 或双生命周期。没有消费方显式 `aria-label`/`aria-labelledby` 时，服务端首帧即以 `aria-labelledby` 关联这份唯一内容，组件型 placeholder 因而在 SSR 中也能命名控件；显式 aria 属性始终立即优先。子组件在 SSR 时无法检查祖先原生标签，因此带 `Field` 或原生 `<label>` 的服务端标记可能暂由 placeholder 命名；hydration 检出真实标签后会撤销 fallback，让外部标签恢复优先。已有选中值时，视觉 chip overlay 仍保持 `aria-hidden`，真实 Trigger 使用完整选中 label 命名。`removable` 需要同时开启 `display="chips"`，每个删除按钮都是 Trigger 的兄弟节点。`clearable` 仍清空所有值，和单项删除可同时使用。
- 值归属：`clearable` 需要内部 mirror 执行清空；`multiple` 为 chips 单项删除也始终由该 mirror 驱动 Base UI，**即使 `clearable=false`**。这不改变受控语义：外部传 `value` 时仍以外部值为准，外部不回写时清空或单删只回调、不乐观改显示；非受控时 mirror 在未取消的变更后同步更新。
- 清除按钮是 `Trigger` 的**兄弟**节点（绝对定位盖在箭头位上），不是子节点——`<button>` 里嵌 `<button>` 是非法 HTML，且嵌套后点击会冒泡到 Trigger 顺手把浮层打开。常态 `hidden`，靠外层 `group-hover` / `group-focus-within` 浮出。
- `searchable` 依赖 `items`：该皮肤下列表由 `items` 过滤结果驱动渲染（消费者写的 `SelectItem` 按 value 建索引后复用，自定义内容不丢；`items` 有而 `SelectItem` 没写的项兜底用 label 渲染）。**不传 `items` 就没有候选，浮层恒为空态。**
- `searchable` 下选项会被**拍平**，`SelectGroup` 不生效（Base UI Combobox 的分组要求 `items` 本身是分组结构，与 Select 的声明式分组不是一套）。需要"搜索 + 分组"直接用 [Combobox](../combobox/combobox.md)。
- `searchable` 的过滤匹配 label 的**字符串**形态；label 传 ReactNode（如带图标的 JSX）时退回按 `value` 匹配。要按中文/拼音/编码多字段搜，走 [Combobox](../combobox/combobox.md) 自带 `filter`。
- `searchable` 下 `items` **给到 100 项及以上时列表自动虚拟化**（底层 Combobox 的策略）：只有视口内的选项在 DOM 里，行高按 32px 固定估算、不逐项测量。默认 `SelectItem` 恰好 32px，通常无感。**如果**你的 `SelectItem` 高度不是 32px（两行文案、带头像、自定义 padding/字号），那么在 ≥100 项时滚动落位会逐渐偏移——**不报错、短列表也复现不出来**，请显式传 `virtualized={false}`。同理，测试里 `getAllByRole("option")` 在虚拟化后只拿得到视口内那几条。
- `loading` 期间浮层只出占位、**不渲染任何选项**（避免展示上一轮的陈旧数据），且不给清除按钮（值可能正在刷新）。`loading` 是展示态，**不改值**：浮层开着时把选项卸掉，Base UI 会把「已卸载」的选中项当成被移除而回调剔除后的值，本组件在加载期间把这类内部回调吞掉（受控不触发 `onValueChange`，非受控内部值也保留），加载结束后已选项照常显示。注意这只覆盖 `loading` 括住的窗口：浮层开着时直接换掉 `items` 且新列表不含已选项，Base UI 仍会回调剔除后的值——远程搜索请让已选项留在 `items` 里，或改用 `searchable`（Combobox 皮肤没有这条剔除逻辑）。

## 相关
[Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
