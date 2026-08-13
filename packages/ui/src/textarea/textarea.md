---
slug: textarea
name: Textarea
category: forms
group: basic
tags: []
exports: [Textarea, textareaVariants]
status: enriched
---

# Textarea

> 多行输入 · 自适应高度 · forms/basic

## 何时用

多行文本输入（备注、描述、留言）。单行输入用 [Input](../input/input.md)；从固定选项选一项用 [Select](../select/select.md)。开 `autoResize` 让高度随内容增长，`rows` 作为下限。放进 hulian Field 内会自动接管 label/error/aria 关联。

## 导入
```ts
import { Textarea, textareaVariants } from "@hulianui/ui"
```

## Props

继承原生 `<textarea>` 属性（除 `size` 被覆盖外，如 `value`/`onChange`/`rows`/`placeholder`/`disabled`…）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| size | `"xs" ｜ "sm" ｜ "md" ｜ "lg"` | `"md"` | 尺寸（CVA 变体，覆盖原生 size）。`xs` 与 Input / SelectTrigger 的 `xs` 等高，用于密集数据表。`variant="cell"` 下只影响字号，不再有内距 |
| ref | `Ref<HTMLTextAreaElement>` | — | 转发到**内层原生 `<textarea>`**。`focus()` / `select()` / 取 `.value` / react-hook-form 的 `register()` 都靠它；与内部 `autoResize` 用的 ref 自动并存 |
| variant | `"default" ｜ "cell"` | `"default"` | 外壳形态。`cell` = 表格单元格里的就地编辑器：无边框、透明底、零内距，高度由 CSS `field-sizing: content` 跟随内容，焦点态用浅底 + 内嵌下划线代替焦点环 |
| value | `string ｜ number ｜ readonly string[] ｜ null` | — | 受控值。除原生类型外**还收 `null`，按空串渲染**（#220，同 [Input](../input/input.md)）：[`useForm`](../form/form.md) 的 `register().value` 会把「显式清空」的 `null` 原样给出来。不传（`undefined`）仍是非受控 |
| invalid | `boolean` | `false` | 独立使用时标红；在 hulian Field 内由 Field.Root invalid 自动驱动 |
| autoResize | `boolean` | `false` | 随内容自适应高度（JS scrollHeight，`rows` 为下限） |
| rows | `number` | `3`（`variant="cell"` 时 `1`） | 初始/最小行高 |
| disabled | `boolean` | `false` | 禁用 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onChange | `(e: ChangeEvent<HTMLTextAreaElement>) => void` | 透传原生输入回调（受控时配合 `value` 使用） |

## 示例
```tsx
<Textarea placeholder="写点什么…" className="w-64" />
```
```tsx
{/* 自适应高度 */}
<Textarea autoResize defaultValue={"随内容长高\n第二行\n第三行"} className="w-64" />
```
```tsx
{/* 表格内联编辑：单元格本身就是自增高的多行输入，不需要任何 className */}
<Textarea variant="cell" value={value} onChange={(e) => setValue(e.target.value)} aria-label="备注" />
```

## 禁忌 / 坑

- `variant="cell"` 与 `autoResize` 是同一件事的两条路：前者交给 CSS `field-sizing: content`（浏览器原生，无 JS 往返），后者是 JS 读 `scrollHeight`。**默认只需要 `cell`**；`field-sizing` 是较新的 CSS 特性，不支持的浏览器会退回按 `rows` 的固定高度（不破版，只是不自增），需要覆盖到那些浏览器时把 `autoResize` 一起传上——`autoResize` 写的是内联 `style.height`，优先级高于 `field-sizing` 的固有尺寸，叠加不冲突。
- 表格里就地编辑用 `variant="cell"`，不要在调用处写 `className="border-0 bg-transparent p-0 resize-none field-sizing-content …"` 覆盖默认外壳；同时 `rows` 的下限在 `cell` 下已默认为 `1`，不必每格再传 `rows={1}`。
- `variant="cell"` / `autoResize` 这一档不接受 `resize-*` 覆盖，而且**覆盖只会成功一半**：这一档发出的是 `resize-none overflow-hidden`，两者在 tailwind-merge 里分属不同组，`className="resize-y"` 只顶得掉 `resize-none`，`overflow-hidden` 原样留下——手柄能拖，但往小拖时内容直接被裁且不出滚动条（同时 `field-sizing-content` 还在按内容算高度，跟手柄写出的内联 height 抢）。组件会在开发期 `console.warn` 点名（每档只喊一次）。要一个可拖的框请改用 `variant="default"` 且不传 `autoResize`。
- 实现/扩展 field-aware Textarea 时见 [[base-ui-field-control-render-textarea-type-safe]]：Base UI Field 无 Textarea 原语，textarea 专属 props（ref/rows/onInput）要放在 `render` 元素上而非 `Field.Control`，否则 TS 报 ref 类型错或静默丢 Field a11y 接线。
- 在 hulian Field 内不要重复传 `invalid`，由 Field.Root 自动驱动。

## 相关
[Input](../input/input.md) · [Select](../select/select.md) · [Checkbox](../checkbox/checkbox.md) · [CheckboxGroup](../checkbox-group/checkbox-group.md) · [Radio](../radio/radio.md) · [Switch](../switch/switch.md)
