---
slug: cell-editor
name: CellEditor
category: forms
group: basic
tags: []
exports: [CellEditor]
status: enriched
---

# CellEditor

> 单元格内联编辑器 · 逐格常驻编辑原语(静止态与纯文本同形/失焦或 Enter 即提交/值没变不发/Esc 回滚/missing 灰斜体/field-sizing 自增高/onCommit 返 Promise 自带 pending) · forms/basic

## 何时用

核对、补录已有数据的表格：用户扫一遍，看到不对的就地改一个字。这类表里每个单元格常驻一个「长得像文本、其实是输入框」的编辑器，没有编辑/保存按钮，失焦即提交该格。

和 [EditableTable](../editable-table/editable-table.md) 不是同一个东西的两种皮肤，是两种交互契约：

| | EditableTable（行级） | CellEditor（逐格） |
|------|------|------|
| 进入编辑 | 点「编辑」/ 新增行 | 不需要进入，永远可编辑 |
| 提交粒度 | 整行一次 | 单格 |
| 提交时机 | 点保存 | 失焦 / Enter |
| 撤销 | 取消整行 | Esc 回滚该格 |
| 视觉 | 明确的表单控件 | 无边框透明底，静止时和纯文本无异 |
| 典型场景 | 报价单、账单明细录入 | 核对 / 补录已有数据 |

本组件只做编辑器这一层，表格外壳交给 [Table](../table/table.md)（用 `align-top` + 不截断换行），这样排序 / 冻结列 / 虚拟滚动不必在编辑器里重造一遍。要「点编辑 → 改 → 保存整行」用 [EditableTable](../editable-table/editable-table.md)；要一个普通的带边框输入框用 [Input](../input/input.md) / [Textarea](../textarea/textarea.md)。

## 导入
```ts
import { CellEditor } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| value* | `string` | — | 已提交值（受控数据源）。提交成功后把新值写回这里，组件据此重置内部草稿与判等基准 |
| validate | `(next: string) => string \| undefined` | — | 提交前校验：返回字符串＝错误消息，拦住 `onCommit` 并把该串显示在格子下方；返回 `undefined`（或空串）放行。见下 |
| missing | `boolean` | `false` | 「这个字段还没填」：降成 muted + italic，让「空」和「填了空格」一眼可分 |
| multiline | `boolean` | `false` | 多行档（textarea + CSS `field-sizing: content` 自增高）；默认单行 input |
| disabled | `boolean` | `false` | 禁用。`onCommit` 返回 Promise 时组件在 pending 期间自己追加禁用，不必再传 |
| placeholder | `string` | — | 占位文案（核对表里一般写「未填写」） |
| className | `string` | — | 落在最外层节点上 |

其余原生属性（`aria-label` / `id` / `onFocus` / `data-*` …）透传到编辑控件本身：单行档是 `<input>`，多行档是 `<textarea>`。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCommit | `(next: string) => void \| Promise<void>` | blur 与 Enter 触发。**值与上次提交相同时不会调用**；返回 Promise 则 pending 期间自身禁用。传了 `validate` 且它返回错误串时**不会调用** |

顺序是「判等 → `validate` → `onCommit`」：值没变根本不校验（那是上一次已经放行过的），校验没过则值不出去。

## 示例
```tsx
const [row, setRow] = useState(initialRow);

<CellEditor
  aria-label="联系人"
  value={row.contact}
  missing={row.contact.trim() === ""}
  placeholder="未填写"
  onCommit={async (next) => {
    await api.patch(row.id, { contact: next });
    setRow((prev) => ({ ...prev, contact: next }));
  }}
/>
```

多行（开票地址、备注这类长文本）：
```tsx
<CellEditor multiline value={row.address} onCommit={(next) => save("address", next)} />
```

### validate：非法值不许先写进去再回滚

失焦即提交这条契约意味着，没有校验层时非法值会先交出去、由消费方回滚 —— 而那一刻光标已经在下一格，用户看到的是「我改的东西自己变回去了」。`validate` 把这一层前移：返回字符串就拦住 `onCommit`，值根本不出去，错误原地显示。

```tsx
<CellEditor
  value={row.months}
  validate={(next) => {
    if (!/^\d+$/.test(next)) return "只能填数字";
    if (Number(next) > 480) return "社保月数不能超过 480";
    return undefined;
  }}
  onCommit={(next) => save("months", Number(next))}
/>
```

被拦住时：草稿**不回滚**（让用户看着自己写错的那串继续改），判等基准也不推进 —— 所以同一个非法值再次失焦仍然会被拦，改对了才提交。红线复用 `Input` / `Textarea` 的 `cell` 档已有的内嵌下划线（`inset` 阴影，零布局位移），错误串用 `aria-describedby` 挂到控件上。

一开始输入、按 Esc 回滚、或把值改回上一次提交的样子，错误都会自动撤掉 —— 三条路径说的都是「屏幕上那条错误已经不是眼下这格的内容了」。

跨格约束（结束时间早于开始时间这类）照样写在这里：`validate` 是个闭包，直接读同一行的其它字段即可。

## 禁忌 / 坑

- **别在 `onCommit` 里自己判等**：组件已经判过了，值没变根本不会调进来。核对场景下用户会大量「点进去看一眼再点走」，判等这一层就是为了不让一整屏空提交打到后端。
- **Esc 之后的 blur 不会重发旧值**：Esc 把草稿写回上一次提交值，紧随其后的 blur 判等直接短路。消费方不需要再维护「刚按过 Esc」的标志位。Esc 只回滚，不移走焦点。
- **Enter 提交，Shift+Enter 换行**：多行档里换行让给 Shift+Enter；单行档里 Enter 被 `preventDefault`，不会误提交所在的 form。
- **自增高是 CSS 的 `field-sizing: content`，不是 JS 测高**：表格里几十个格同时读 `scrollHeight` 会在滚动时明显掉帧，而且和列宽变化互相触发。别再往外面套一层测高逻辑。
- **能在客户端判的非法值走 `validate`，别放到 `onCommit` 里再回滚**：回滚发生时光标已经在下一格，用户只会看到自己改的东西自己变回去了。`onCommit` 里剩下的是只有服务端才知道的失败（重名、并发冲突），那类仍然要自己 catch。
- **`validate` 返回空串等于放行**：一条看不见的错误却拦着提交，比不校验更糟 —— 用户只看到这格存不进去，屏幕上什么都没有。想拦就给一句能读的话。
- **`onCommit` 失败要自己 catch**：组件只负责结束 pending 态，回滚与报错文案要看业务语义，它不替你决定。
- **父级必须把新值写回 `value`**：不写回时组件仍以自己的草稿显示，但下一次外部刷新会把界面拉回旧值。
- **放进 [Table](../table/table.md) 时 `columns` 必须 memo**：cell 函数经 TanStack 的 `flexRender` 当组件类型渲染，identity 一变整格卸载重挂 —— 挂了 `onBlur` 提交的编辑器会被重挂时的 blur 误触发。

## 相关
[EditableTable](../editable-table/editable-table.md) · [Table](../table/table.md) · [Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [ProTable](../pro-table/pro-table.md)
