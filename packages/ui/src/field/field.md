---
slug: field
name: Field
category: forms
group: framework
tags: []
exports: [Field]
status: enriched
---

# Field

> 字段包装 · label/help/error a11y 串联 · forms/framework

## 何时用

给单个输入控件（Input/Textarea 等）套 label + 帮助文案 + 错误提示，并自动把三者用 `aria-describedby`/`aria-invalid` 串好无障碍关系时用。它是表单的最小积木——[Form](../form/form.md)/[ProForm](../pro-form/pro-form.md) 内部就靠它布字段；你手搓一行字段、或在 [StepsForm](../steps-form/steps-form.md) 各步里放控件时也直接用它。

## 导入
```ts
import { Field } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| invalid | `boolean` | `false` | 显式覆盖 invalid；缺省时由 error 是否非空推导 |
| disabled | `boolean` | `false` | 禁用 |
| name | `string` | — | 提交标识，透传 Field.Root |
| orientation | `"vertical" \| "horizontal"` | `"vertical"` | 排列方向。`horizontal` = 标签区在左、控件在右、错误另起一行占满整行（设置页「一行一个设置项」版式），a11y 串联与错误渲染完全一致 |
| colSpan | `"full"` | — | 在 ProForm columns 栅格中跨整行；栅格外无副作用 |
| className | `string` | — | 落在 Field.Root（竖排为 flex 列容器，横排为两列网格） |
| labelClassName | `string` | — | 追加到 label（默认 `text-sm font-medium text-foreground`）；走 twMerge，传 `text-xs` 会顶掉默认字号 |
| descriptionClassName | `string` | — | 追加到 description（默认 `text-xs text-muted-foreground`） |
| errorClassName | `string` | — | 追加到 error（默认 `text-xs text-danger`） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children* | `ReactNode` | 控件（hulian Input / Textarea，= Field.Control） |
| label | `ReactNode` | 标签 |
| description | `ReactNode` | help 文案 |
| error | `ReactNode` | 错误文案；**非空即隐含 invalid 并强制显错** |

## 示例
```tsx
// 基础
<Field label="邮箱" description="我们不会公开你的邮箱">
  <Input placeholder="you@work.com" />
</Field>

// 带错误（error 非空自动标红 + 显错 + 串 aria）
<Field label="邮箱" error="邮箱格式不正确">
  <Input defaultValue="not-an-email" />
</Field>

// 横排设置行：标签在左、控件在右、错误另起一行
<Field orientation="horizontal" label="主题" description="选择你偏好的配色方案">
  <Select items={themes} />
</Field>

// 横排 + 定宽标签列：顶掉默认列模板即可，不需要额外的 prop
<Field orientation="horizontal" label="邮箱" className="grid-cols-[8rem_1fr]">
  <Input placeholder="you@work.com" />
</Field>
```

## 禁忌 / 坑

- `error` 字符串非空时已隐含 `invalid`，无需再传 `invalid`；想强制无错状态下也标红才单独传 `invalid`。
- 底层是 Base UI Field，错误文本通过 `match={true}` 强制渲染——别在 Field 外另起一个 `<p>` 写错误，会丢失自动的 `aria-describedby` 串联。详见 [[base-ui-field-error-match-true-for-external-controlled-error]]：外部受控 error 不走 Base UI 校验时，默认分支会让错误文本「框红字没」。
- 若 children 是 Textarea，注意 render-as 的类型问题，见 [[base-ui-field-control-render-textarea-type-safe]]。
- 横排的标签列宽度**没有**单独的 prop：`orientation="horizontal"` 下 Field.Root 是 `grid-cols-[1fr_auto]` 的网格，传 `className="grid-cols-[8rem_1fr]"` 顶掉默认列模板即可。默认的 `auto` 列让控件贴右边缘（设置行），换成 `1fr` 则让控件填满（表单行）。
- 只要一个标签、不要 help/error 三段与 a11y 串联时，用 [Label](../label/label.md)，别为了拿标签皮肤而空套一层 Field。

## 相关
[Label](../label/label.md) · [Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [SearchForm](../search-form/search-form.md)
