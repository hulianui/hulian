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
| multiline | `boolean` | `false` | 多行档（textarea + CSS `field-sizing: content` 自增高）；默认单行 input。要按运行时变量切换多行，请分支渲染两个 `CellEditor`，见「禁忌 / 坑」 |
| revertOnError | `boolean` | `false` | `onCommit` 的 Promise reject 时把草稿一并退回上一次提交值。判等基准无论开关都会退，见下 |
| blurOnCommit | `boolean` | `false` | Enter 提交后让出焦点。校验被拦下时不让出（错误就在这一格，得让用户接着改） |
| blurOnEscape | `boolean` | `false` | Esc 回滚后让出焦点 |
| variant | `"default" \| "cell"` | `"cell"` | 外观档，透传给内层 [Input](../input/input.md) / [Textarea](../textarea/textarea.md)。`"cell"` 无边框透明底；同一行里其余列是普通输入框时用 `"default"`，见下 |
| size | `"xs" \| "sm" \| "md" \| "lg"` | `"md"` | 字号档，透传给内层 Input / Textarea |
| disabled | `boolean` | `false` | 禁用。`onCommit` 返回 Promise 时组件在 pending 期间自己追加禁用，不必再传 |
| placeholder | `string` | — | 占位文案（核对表里一般写「未填写」） |
| className | `string` | — | 落在最外层节点上 |

其余属性按档透传到编辑控件本身：单行档收 `<input>` 的原生属性（`name` / `type` / `maxLength` / `autoComplete` …），多行档收 `<textarea>` 的（`name` / `rows` / `wrap` …）。`rows` 在多行档里是「最少几行」的下限，`cell` 档下默认 1 行。

原生 `size` 传不进来：它是 `<input>` 的字符宽度，与上表的档位 `size` 同名不同义，两者只能留一个。要按字符数定宽用 CSS 宽度。

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCommit | `(next: string) => void \| Promise<void>` | blur 与 Enter 触发。**值与上次提交相同时不会调用**；返回 Promise 则 pending 期间自身禁用。传了 `validate` 且它返回错误串时**不会调用** |
| onDraftChange | `(draft: string) => void` | 草稿每次变化时的**只读回声**（每敲一个键一次），判等 / 校验 / pending 的既有语义全不受影响。给「随打字变化的派生 UI」用：已填计数、实时预览、每键落 `localStorage`。**只反映键入** —— Esc 回滚与外部写回 `value` 不会广播 |

顺序是「判等 → `validate` → `onCommit`」：值没变根本不校验（那是上一次已经放行过的），校验没过则值不出去。

值真正出去仍然只看 `onCommit`。如果你在 `onDraftChange` 里落库，就把失焦即提交这条契约绕过去了 —— 判等与 `validate` 都拦不住它。

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

### variant：一行里有框无框不要混排

默认的 `cell` 档解的是「单元格本身就是输入框」——密集成片地铺时，边框 + 底色 + 焦点环会变成盒子套盒子，而焦点环还会溢出单元格顶到相邻格。

但如果同一行里其余可编辑列用的是普通 [Input](../input/input.md) / [Textarea](../textarea/textarea.md)，只有这几格无边框，用户就得靠记忆而不是靠看来判断哪些格子可以改。这种表把这几格也换成 `variant="default"`，跟邻居保持一致：

```tsx
<CellEditor variant="default" size="sm" value={row.months} onCommit={(next) => save("months", next)} />
```

### onCommit 失败：基准会自己退回来，回滚草稿是可选项

`onCommit` 返回的 Promise reject 时，组件把判等基准退回上一次提交值——reject 恰恰证明这个值没交出去，基准记成「已交出去」会让用户不改动直接再失焦时被判等短路，保存失败之后连重试都点不动。

草稿默认**不动**：用户刚打的那串还在，改一改再失焦就是重试。如果这一格的 `value` 来自服务端缓存（SWR / React Query / Redux selector），失败时缓存没动、`value` 原样，消费方手上没有任何能拿来回滚的东西 —— 那就开 `revertOnError`，界面一并回到失败前的样子：

```tsx
<CellEditor
  value={row.contact}
  revertOnError
  onCommit={async (next) => {
    try {
      await api.patch(row.id, { contact: next });
      await mutate();
    } catch (err) {
      toast({ title: "保存失败，已还原", tone: "danger" });
      throw err; // 必须重新抛出：吞掉异常等于告诉组件「存好了」
    }
  }}
/>
```

报错文案仍然由消费方决定，组件只负责把自己的内部状态退回真相。pending 期间外部把新值写进 `value` 时不回滚 —— 那是更近的真相，不该被一个旧请求的失败盖回去。

### blurOnCommit / blurOnEscape：改完这一格就走

默认两者都是 `false`，焦点留在格内。批量核对宽表时操作员改完一格按 Enter 就该「这格结束了」，焦点还亮在格里会让人以为没生效、回头再按一次 —— 那种手感开 `blurOnCommit`；Esc 之后也想直接走开就再开 `blurOnEscape`。两个分开是因为 Enter 与 Esc 在这里语义相反（一个是「我改完了」，一个是「我不改了」），常常只想开其中一个。

**别自己在 `onKeyDown` 里补 `blur()`**：`blur()` 是同步的，它会在草稿更新落到下一次渲染之前就触发提交，那时读到的还是旧草稿 —— Esc 会因此变成保存。

## 禁忌 / 坑

- **别在 `onCommit` 里自己判等**：组件已经判过了，值没变根本不会调进来。核对场景下用户会大量「点进去看一眼再点走」，判等这一层就是为了不让一整屏空提交打到后端。
- **Esc 之后的 blur 不会重发旧值**：Esc 把草稿写回上一次提交值，紧随其后的 blur 判等直接短路。消费方不需要再维护「刚按过 Esc」的标志位。Esc 默认只回滚不移走焦点，要它连焦点一起让出就开 `blurOnEscape`，别自己补 `blur()`。
- **`multiline` 要写成字面量**：属性集按 `multiline` 分叉（单行档收 `<input>` 的原生属性，多行档收 `<textarea>` 的），传一个 boolean 变量时 TS 认不出走哪一档。如果多行与否真的由运行时决定，分支渲染两个 `CellEditor`。
- **`onDraftChange` 不是提交口**：它每敲一个键响一次，判等与 `validate` 都不参与。在里面落库等于把失焦即提交这条契约整个绕过去。
- **Enter 提交，Shift+Enter 换行**：多行档里换行让给 Shift+Enter；单行档里 Enter 被 `preventDefault`，不会误提交所在的 form。
- **自增高是 CSS 的 `field-sizing: content`，不是 JS 测高**：表格里几十个格同时读 `scrollHeight` 会在滚动时明显掉帧，而且和列宽变化互相触发。别再往外面套一层测高逻辑。
- **能在客户端判的非法值走 `validate`，别放到 `onCommit` 里再回滚**：回滚发生时光标已经在下一格，用户只会看到自己改的东西自己变回去了。`onCommit` 里剩下的是只有服务端才知道的失败（重名、并发冲突），那类仍然要自己 catch。
- **`validate` 返回空串等于放行**：一条看不见的错误却拦着提交，比不校验更糟 —— 用户只看到这格存不进去，屏幕上什么都没有。想拦就给一句能读的话。
- **`onCommit` 失败时别把异常吞掉**：组件靠 Promise reject 才知道这次没存进去（据此退回判等基准，让用户能重试）。如果你在 `catch` 里 toast 完就不再抛出，组件看到的是一次成功的提交。报错文案与是否回滚草稿（`revertOnError`）仍然由消费方决定，组件不替你选。
- **父级必须把新值写回 `value`**：不写回时组件仍以自己的草稿显示，但下一次外部刷新会把界面拉回旧值。
- **放进 [Table](../table/table.md) 时 `columns` 必须 memo**：cell 函数经 TanStack 的 `flexRender` 当组件类型渲染，identity 一变整格卸载重挂 —— 挂了 `onBlur` 提交的编辑器会被重挂时的 blur 误触发。

## 相关
[EditableTable](../editable-table/editable-table.md) · [Table](../table/table.md) · [Input](../input/input.md) · [Textarea](../textarea/textarea.md) · [ProTable](../pro-table/pro-table.md)
