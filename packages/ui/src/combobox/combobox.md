---
slug: combobox
name: Combobox
category: forms
group: advanced
tags: []
exports: [Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip]
status: enriched
---

# Combobox

> 自动补全 · 触发按钮 + 弹层内搜索(图4 范式)，亦支持内联输入；浮层锚到字段等宽 · forms/advanced

## 何时用

选项较多需边打字边过滤（自动补全/可搜索下拉）时用；支持单选、`multiple` 多选 chips、触发按钮式弹层内搜索，以及内联输入直接过滤三种范式。选项少且全可见用 [Select](../select/select.md)；纯展示已有密钥用 [SecretField](../secret-field/secret-field.md)；@提及场景用 [Mentions](../mentions/mentions.md)。

## 导入
```ts
import { Combobox, ComboboxInput, ComboboxTrigger, ComboboxContent, ComboboxItem, ComboboxChips, ComboboxChip } from "@hulianui/ui"
```

## Props

`Combobox`（透传 Base UI `Combobox.Root<ComboboxItemData, Multiple>`，下表为瑚琏常用项）

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| items | `ComboboxItemData[]` | — | 选项数据 `{value,label}`，自动以 label 显示、value 提交 |
| value | `ComboboxItemData｜ComboboxItemData[]` | — | 受控选中（multiple 时为数组） |
| defaultValue | 同上 | — | 非受控初始选中 |
| multiple | `boolean` | `false` | true 时 value/onValueChange 自动变数组 |
| virtualized | `boolean` | `items` 长度 ≥ 100 时为 `true` | 列表虚拟化（只渲染视口内的项）。不传时按选项数自动决定，见「禁忌 / 坑」 |
| creatable | `boolean` | `false` | 自由输入创建新值：当前输入串在候选里没有完全相同的一项时，列表首位多出一条「使用 “xxx”」。见下 |
| onCreate | `(value: string) => void` | — | 创建项被选中时触发（与 `onValueChange` 同时发生，不是二选一）。见下 |
| disabled | `boolean` | `false` | 禁用 |

`ComboboxTrigger`（图4 范式：显示已选 label / placeholder，点击展开弹层内搜索）。继承原生 `<button>` 属性，剩余属性落到按钮自身。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| placeholder | `string` | — | 未选中时占位文案（按钮没有原生 placeholder，这是瑚琏语义） |
| invalid | `boolean` | `false` | 独立使用（非 Field 内）时手动置无效态皮肤 |
| className | `string` | — | — |

`ComboboxInput`（内联自动补全：输入框本身即可见字段）。继承原生 `<input>` 属性，剩余属性落到**内层 `<input>`**（不是外壳 span），见「禁忌 / 坑」。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"sm"｜"md"｜"lg"` | `"md"` | 尺寸 |
| placeholder | `string` | — | 占位（原生属性，透传到内层 input） |
| invalid | `boolean` | `false` | 手动置无效态皮肤 |
| clearable | `boolean` | `false` | 有值时渲染清除按钮 |
| prefix | `ReactNode` | — | 字段左侧图标槽（对齐 `Input.prefix`），搜索框放放大镜 |
| showChevron | `boolean` | `true` | 右侧展开箭头；搜索框形态传 `false` |
| className | `string` | — | 外壳类名（皮肤在外壳上，不随 rest 落到 input） |

`ComboboxContent`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| searchPlaceholder | `string` | — | 设置后在浮层顶部渲染搜索框（图4 范式，配合 Trigger）；不设则为内联补全态 |
| side | `"top"｜"bottom"` | — | 浮层方位 |
| align | `"start"｜"center"｜"end"` | — | 浮层对齐 |
| sideOffset | `number` | — | 偏移 |
| onListScroll | `UIEventHandler<HTMLDivElement>` | — | 列表滚动回调，`e.currentTarget` 即滚动容器（远程分页「滚到底加载更多」用，见 [RemoteSelect](../remote-select/remote-select.md)） |
| header | `ReactNode` | — | 列表**上方**常驻表头（用法提示、分组说明、批量操作），不随列表滚动。与 `emptyMessage` 不同：后者只在零结果时出现 |
| footer | `ReactNode` | — | 列表下方常驻页脚（加载中 / 计数 / 到底提示），不随列表滚动 |
| className | `string` | — | — |

`ComboboxItem`

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value * | `ComboboxItemData` | — | 选项 `{value,label}` 对象 |
| disabled | `boolean` | `false` | 禁用该项 |
| className | `string` | — | — |

`ComboboxChips`（多选 chips 外壳）：`size`、`invalid`、`placeholder`、`className`（外加 `children` 插槽，见 Slots）。继承原生 `<input>` 属性，剩余属性落到**内层 `<input>`**（chips 容器只是皮肤壳）。
`ComboboxChip`（单个已选 chip）：`className`（外加 `children` 插槽，见 Slots）。

## Events

`Combobox`（透传 Base UI `Combobox.Root`）

| 事件 | 类型 | 说明 |
|------|------|------|
| onValueChange | `(value) => void` | 选中变化回调（multiple 时 value 为数组） |

## Slots

`Combobox`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内放 Trigger/Input + Content |

`ComboboxContent`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `(item, index) => ReactNode` | 渲染函数，List 自动遍历已过滤项调用 |
| emptyMessage | `ReactNode` | 无匹配时文案 |

`ComboboxItem`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `ReactNode` | 渲染内容 |

`ComboboxChips`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 内含 chip 列 + 输入框 |

`ComboboxChip`

| 插槽 | 类型 | 说明 |
|------|------|------|
| children * | `ReactNode` | chip 内容 |

## 示例

触发按钮 + 弹层内搜索（图4 范式）：
```tsx
<Combobox items={FRUITS}>
  <ComboboxTrigger placeholder="选择水果" />
  <ComboboxContent searchPlaceholder="搜索水果…">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

内联自动补全（输入框即字段）：
```tsx
<Combobox items={FRUITS}>
  <ComboboxInput placeholder="搜索水果…" clearable />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

搜索框形态（字段本身即搜索框，不是弹层内搜索）：
```tsx
<Combobox items={TASKS}>
  <ComboboxInput
    size="sm"
    prefix={<SearchIcon />}
    showChevron={false}
    placeholder="搜索任务、客户、文件"
    aria-label="搜索任务、客户、文件"
  />
  <ComboboxContent>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

大集合：≥100 项自动虚拟化，不必配置；但项高度不是默认 32px 时要显式关掉：
```tsx
{/* 1000 个城市，单行项 → 自动虚拟化，写法与短列表完全一样 */}
<Combobox items={CITIES}>
  <ComboboxTrigger placeholder="选择城市" />
  <ComboboxContent searchPlaceholder="搜索城市…">
    {(item) => <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>}
  </ComboboxContent>
</Combobox>

{/* 项是「姓名 + 邮箱」两行，高度 ≠ 32px → 关掉虚拟化，否则滚动落位会偏 */}
<Combobox items={USERS} virtualized={false}>
  <ComboboxTrigger placeholder="选择成员" />
  <ComboboxContent searchPlaceholder="搜索成员…">
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        <span className="flex flex-col">
          <span>{item.label}</span>
          <span className="text-xs text-muted-foreground">{item.value}</span>
        </span>
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

### creatable：长尾字段要能手填

发证机构、单位名称这类字段有几百个常见值，做成选项能让绝大多数人少打字；但运营手里就是有一张列表上没有的证书。做成纯选择会逼他们挑一个近似值，那比自由输入更糟。`creatable` 就是这一档：

```tsx
const [issuers, setIssuers] = useState(ISSUERS);

<Combobox
  items={issuers}
  creatable
  onCreate={(value) => setIssuers((prev) => [...prev, { value, label: value }])}
  onValueChange={(item) => form.setValue("issuer", item.value)}
>
  <ComboboxInput aria-label="发证机构" placeholder="选择或直接输入" />
  <ComboboxContent header={<p className="px-2 py-1 text-xs text-muted-foreground">找不到就直接输入</p>}>
    {(item) => (
      <ComboboxItem key={item.value} value={item}>
        {item.label}
      </ComboboxItem>
    )}
  </ComboboxContent>
</Combobox>
```

几条口径：

- **判重按去空白 + 忽略大小写，`value` 和 `label` 两边都比**：消费方看到的是 label（“北京市公安局”），value 常常是编号；只比一边，另一边完全相同时仍会冒出创建项，选下去就是给已有条目造了个重复。
- **`onCreate` 与 `onValueChange` 同时发生，不是二选一**：值的变化照常走 `onValueChange`（拿到的是 `{ value: 输入串, label: 输入串 }`，两端空白已去除），`onCreate` 只负责「这是一个新值，去建它」—— 落库、追加进 `items` 都在这里做。
- **创建项是塞进 `items` 里的一条真选项**，不是浮层里多画的一行。所以键盘上下键、highlight、Enter 选中、`Empty` 的判空全都自动一致，超过 100 项自动虚拟化时也照常工作。
- **`creatable` 需要 `items`**：选项写死在 `children` 里的用法没有可插入的地方，这一档不生效（开发期会有一条告警）。
- **`creatable` 开着时输入串由组件接管一份**（内部补了 `defaultInputValue`）。带来的唯一差异：用 `value` 从外部改选中项时，输入框里的文字不会跟着变。需要联动请自己传 `inputValue`。

### header：常驻在列表上方的一行

`emptyMessage` 只在零结果时出现，所以「找不到就直接输入」这类**始终**该看见的提示挂不上去 —— 有历史值时它永远不显示。`header` 与 `footer` 对称：一个在列表上、一个在列表下，两个都不参与列表滚动。

## 禁忌 / 坑

- `ComboboxItem` 的 `value` 是整个 `{value,label}` 对象（非字符串）——render fn 里直接传 `value={item}`，Base UI 自动派生 label/value。
- 浮层内搜索框由 `ComboboxContent` 的 `searchPlaceholder` 触发：配 `ComboboxTrigger` 用就给它（图4 范式），配 `ComboboxInput` 内联补全则不设（输入框本身即搜索）。
- `multiple` 一开 value/onValueChange 即变数组，受控时 state 类型要跟着变。
- `invalid` 仅用于「非 Field 内」独立使用时手动置无效皮肤；在 Field 内由 Field 接管，不用手传。
- **`ComboboxInput` / `ComboboxChips` 的剩余原生属性落在内层 `<input>`，不是外壳**：`role="combobox"`、可聚焦性、表单归属都在内层，`aria-label` / `id` / `name` / `onBlur` 挂在外壳 `<span>` / chips 容器上一律无效。所以独立使用（不放在 [Field](../field/field.md) 里）时，直接 `<ComboboxInput aria-label="搜索任务" />` 就够了，不用再包一层 `<label>` + `.sr-only`；接 react-hook-form 的 `Controller` 时 `field.onBlur` 也是直接传。要给外层容器加钩子请用 `className`。`ComboboxTrigger` 没有外壳，剩余属性就落在按钮自身。
- 组件自身的 `data-invalid` / 皮肤类名顶不掉：`rest` 展开在最前（同 `docs/consuming.md` 第 7 节的全库口径），传 `aria-invalid={false}` 不会关掉 `invalid` 的无效态。
- 搜索框形态要**同时**给 `prefix` 和 `showChevron={false}`：只加放大镜、右边还留着 chevron 的字段读起来仍是「下拉选择」。反过来，弹层内搜索（图4 范式）的搜索框由 `ComboboxContent` 的 `searchPlaceholder` 提供，自带放大镜，不需要动 `ComboboxInput`。
- **`items` 给到 100 项及以上时列表会自动虚拟化**（无需传 `virtualized`）：只有视口内的项在 DOM 里，行高按 **32px 固定估算**，不做逐项测量。默认 `ComboboxItem` 恰好是 32px，所以通常无感。**如果**你的 render fn 返回的项高度不是 32px（两行文案、带头像/副标题、自定义 `className` 改了 padding 或字号），那么在 ≥100 项时滚动条长度与项的落位会逐渐偏移——**页面不会报任何错，短列表下也复现不出来**，只有滚到列表中后段才看得出跳动。这种项请显式传 `virtualized={false}` 关掉，或把项高度对齐到 32px。
- 虚拟化同样影响**依赖「选项全在 DOM 里」的测试与脚本**：`getAllByRole("option")` 只会拿到视口内那几条，`document.querySelector` 找不到未滚动到的项。断言总数请改用列表容器上的 `data-hulian-virtual-count`，或对该用例传 `virtualized={false}`。
- 走 Combobox 的上层组件同样吃这条：[Select](../select/select.md) 的 `searchable` 皮肤、[RemoteSelect](../remote-select/remote-select.md) 的候选列表，选项攒到 100 条后都会自动虚拟化。

## 相关
[SecretField](../secret-field/secret-field.md) · [Listbox](../listbox/listbox.md) · [Mentions](../mentions/mentions.md) · [InputOTP](../input-otp/input-otp.md) · [Rating](../rating/rating.md) · [Upload](../upload/upload.md)
