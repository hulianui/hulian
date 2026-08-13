---
slug: row-actions
name: RowActions
category: data-display
group: collection
tags: []
exports: [RowActions]
status: enriched
---

# RowActions

> 表格行操作区 · 声明式动作表 + tone 层级 + 超出 max 收进溢出菜单 + 破坏性动作二次确认 · data-display/collection

## 何时用

表格「操作」列里那一排动作（查看 / 编辑 / 导出 / 删除）。它管的是**行操作这个模式本身**的形状：谁重谁轻、多了怎么收、破坏性的怎么拦、禁用的怎么解释。

页面级的批量操作栏用 [ProTable](../pro-table/pro-table.md) 的 `batchActions`；工具栏用 `toolbarActions`；单独一颗按钮就用 [Button](../button/button.md)，不必套这一层。

## 导入
```ts
import { RowActions } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| actions * | `RowActionItem[]` | — | 动作表。`hidden` 的项先剔掉，再算折叠 |
| variant | `"text" \| "button" \| "icon"` | `"text"` | 三档只差「有多明显」：文字档无边框、按钮档描边、图标档只有图标（要求每项都给 `icon`） |
| max | `number` | `3` | 最多**露出**几个。超出时露出前 `max - 1` 个，其余进溢出菜单 |
| size | `"sm" \| "md"` | `"sm"` | 密度档 |
| align | `"start" \| "center" \| "end"` | `"start"` | 列内对齐 |
| moreLabel | `string` | 本地化「更多操作」 | 溢出菜单触发器的无障碍名 |
| revealOnHover | `boolean` | `false` | 平时隐去、悬浮该行才显现。**需要父级行元素带 `group/row`**；键盘聚焦时同样显现，触屏恒显 |

`RowActionItem`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| key * | `string` | — | React key |
| label * | `string` | — | 动作名。**必须是纯字符串**：它同时当无障碍名、悬浮提示、菜单 type-ahead 检索词 |
| icon | `ReactNode` | — | 文字档作前缀，图标档是按钮的全部内容 |
| tone | `"neutral" \| "brand" \| "danger"` | `"neutral"` | 层级。主操作 `brand`、破坏性 `danger` |
| disabled | `boolean` | `false` | 不可用。仍可聚焦、仍能读到名字 |
| disabledReason | `ReactNode` | — | 为什么不可用。**给了 `disabled` 就该给它** |
| confirm | `RowActionConfirm` | — | 二次确认：`{ title, description?, confirmText?, cancelText? }` |
| hidden | `boolean` | `false` | 按权限藏起来 |
| onSelect | `() => void \| Promise<unknown>` | — | 点击回调；有 `confirm` 时在确认之后才调。**返回 Promise 时自动进 loading**（见下） |
| render | `ReactElement` | — | 换元素渲染，典型是路由 `<Link>` |

## 示例

```tsx
// 层级用 tone 表达，破坏性动作给 confirm
<RowActions
  actions={[
    { key: "view", label: "查看", tone: "brand", render: <Link href={`/orders/${row.id}`} /> },
    { key: "edit", label: "编辑", onSelect: () => openEdit(row) },
    {
      key: "del",
      label: "删除",
      tone: "danger",
      confirm: { title: "确认删除这条记录？", description: "删除后不可恢复。" },
      onSelect: () => remove(row.id),
    },
  ]}
/>

// 动作多：露出 2 个，其余进菜单
<RowActions max={3} actions={[view, edit, copy, exportPdf, voidInvoice]} />

// 密集表格用图标档
<RowActions
  variant="icon"
  actions={[
    { key: "view", label: "查看", icon: <Eye className="size-4" /> },
    { key: "del", label: "删除", tone: "danger", icon: <Trash2 className="size-4" />, confirm: { title: "确认删除？" } },
  ]}
/>

// 不可用要说明原因
{ key: "del", label: "删除", tone: "danger", disabled: row.invoiced, disabledReason: "已开票不可删除" }
```

## 动效

动作按钮（含溢出菜单键）接的是库的**按压反馈**（`pressableClass`）：按下轻微缩放，时长与曲线取自动效体系的 fast 档，`prefers-reduced-motion: reduce` 下自动去掉——这条偏好一律由库负责，不必在调用处关。

`revealOnHover` 的显隐同样走 fast 档的过渡，减弱动效下变成直接切换。

> 注意：**`Button` 本身当前不带按压反馈**（基类只有颜色过渡），这份反馈是 `RowActions` 主动接上的。所以同一页里自己手搓的按钮不会有这个手感——想统一得去改 `Button`。

## 异步动作

`onSelect` 返回 Promise 时组件自己处理这一整套，消费方不必再传 `loading` / `disabled`：

- 这个动作转圈，**同一行里其他动作暂时点不动**——一行里同时发两个写操作，服务端看到的顺序基本是随机的
- 有 `confirm` 时确认键跟着转圈，**成功才关框**；失败留在原地让用户能重试
- 执行期间 Esc / 点遮罩 / 取消键都关不掉框：动作还在飞就关掉，用户会以为自己取消了，而它根本没被取消
- reject 时组件只结束 loading，**不显示任何错误文案**——那是业务语义，请在 `onSelect` 里自己 catch 并 toast

```tsx
{ key: "del", label: "删除", tone: "danger",
  confirm: { title: "确认删除？" },
  onSelect: async () => {
    try { await api.remove(row.id); await mutate() }
    catch (e) { toast({ title: "删除失败", tone: "danger" }); throw e }  // 抛出去，框才会留在原地
  } }
```

## 三档怎么选

| 档位 | 长相 | 什么时候用 |
|---|---|---|
| `text`（默认） | 无边框文字 | 动作以「只读跳转」为主的列表。一排边框会把表格切碎 |
| `button` | 描边按钮 | 动作真的会改数据。可点性与点击范围不该靠猜 |
| `icon` | 只有图标 | 密集表、列宽紧张。名字改由无障碍名与悬浮提示承担 |

三档的语气色一致（`tone` 说了算），溢出菜单键也跟着档位走——按钮档里不会冒出一颗无边框的「⋯」。

## 设计判据

- **超出时露出 `max - 1` 个而不是 `max` 个**：菜单键本身也占一格，露满 `max` 再加一颗「⋯」，实际控件数就是 `max + 1`，列宽会比调用方以为的宽一格。
- **破坏性动作在菜单里排最后并用分隔线隔开**：菜单是「手滑就点中」的地方，把删除排在编辑旁边等于鼓励误触。
- **禁用不用原生 `disabled`**：原生禁用的按钮既不可聚焦、也不派发指针事件，于是「这个按钮为什么是灰的」这条提示永远弹不出来——而那正是最需要它的时候。组件改用 `aria-disabled` + 点击短路，名字仍可读、提示仍可弹、键盘仍可到达。
- **确认框由组件自己持有**，不走命令式 `modal.confirm`：后者要求消费方在根上挂 `<ModalProvider />`，漏挂时是**静默无事发生**——用户点了删除、什么都没弹、动作也没跑，控制台一声不响。行操作是最不该踩这个的地方。自持还有一个好处：同一个动作被折进菜单前后，确认体验完全一致。
- **导航型动作走 `render`**：用 `onSelect` 做 `router.push` 会丢掉 Cmd+点击开新标签、中键、右键复制链接——这些是后台用户天天用的原生能力，只有真的渲染成 `<a>` 才有。

## 禁忌 / 坑

- `label` 是 `string` 不是 `ReactNode`，因为它要同时当无障碍名、提示文案与菜单检索词，这三处都只认字符串。要富文本请重新想想这个动作名是不是太长了。
- 图标档里每项都该有 `icon`：没有的话按钮会是空的，只剩无障碍名——那是能读不能看。
- `hidden` 与 `disabled` 别混：**没权限用 `hidden`**（不该让人知道有这个动作），**当前状态不允许用 `disabled` + `disabledReason`**（该让人知道为什么现在不行）。
- **窄屏不会自动少露几个**：`max` 是个定值。列宽紧张时请自己按断点传更小的 `max`，或者换 `variant="icon"`。刻意没做容器查询自动降档——操作列的宽度本身就由内容决定，再让内容反过来跟着宽度变会绕成循环，实测不稳定。
- 全部动作被 `hidden` 筛掉时组件**什么都不渲染**（不是留个空壳），所以别指望它撑出列宽。
- 一行超过 5 个动作时先想想是不是该做成批量操作或详情页里的操作，而不是继续加 `max`。

## 相关
[Table](../table/table.md) · [ProTable](../pro-table/pro-table.md) · [Button](../button/button.md) · [Menu](../menu/menu.md) · [AlertDialog](../alert-dialog/alert-dialog.md) · [Popconfirm](../popconfirm/popconfirm.md)
