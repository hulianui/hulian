---
slug: steps-form
name: StepsForm
category: forms
group: framework
tags: []
exports: [StepsForm]
status: enriched
---

# StepsForm

> 把长表单拆成多步，逐步校验并保留已填内容 · forms/framework

## 何时用

向导式录入（注册、开户、导入流程）需要把长表单切成多步、逐步校验时用。和 [Form](../form/form.md)/[ProForm](../pro-form/pro-form.md) 的区别：后者一屏铺所有字段、一次提交；StepsForm 只渲染当前步、按步前进。值由**消费者自己的 useForm 持有**（本组件不托管表单状态），所以跨步切换不丢值。

## 导入
```ts
import { StepsForm } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| steps* | `StepsFormStep[]` | - | 步骤数组，每项含 `title`/`description`/`content`/`nextDisabled`/`nextText`/`showNav` |
| current | `number` | - | 受控当前步（0 起） |
| defaultCurrent | `number` | - | 非受控初始步 |
| direction | `"horizontal" \| "vertical"` | - | Steps 指示器方向 |
| className | `string` | - | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onCurrentChange | `(current: number) => void` | 步骤变化回调 |
| onStepValidate | `(currentStep: number) => boolean \| Promise<boolean>` | 前进/提交前校验，收到即将离开的步号；返回 false 或 reject 阻止前进；pending 期间前进按钮 loading 防重复点击 |
| onFinish | `() => void \| Promise<void>` | 最后一步提交；返回 Promise → 提交按钮 loading |

`StepsFormStep` 字段：`title: ReactNode`（必填）、`description?`、`content: ReactNode`（必填，仅当前步渲染）、`nextDisabled?`（默认 false，禁本步前进）、`nextText?`（本步前进按钮文案，缺省走 locale）、`showNav?`（默认 true，false 时不渲染本步底部导航，用于结果步自带操作）。

## 示例
```tsx
const form = useForm({ initialValues: { name: "", company: "" } });
const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });

<StepsForm
  onStepValidate={async (step) => {
    if (step === 0) return (await form.validateField("name")) == null;
    return true;
  }}
  onFinish={async () => {
    const r = await form.validate();
    if (r.ok) await api.save(r.values);
  }}
  steps={[
    { title: "基本信息", content: (
        <Field label="姓名" error={name.error}>
          <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
        </Field>
      ) },
    { title: "公司信息", content: <Field label="公司">{/* ... */}</Field> },
  ]}
/>
```

## 禁忌 / 坑

- 本组件**不持有字段值**——必须由消费者的 `useForm` 持有，否则切步会丢输入。`onStepValidate` 里只校验本步字段（用 `form.validateField`），别一上来 `form.validate()` 全量校验把后续步的空字段也判错。
- `current` 受控时务必同时接 `onCurrentChange`，否则点导航不动步。
- 结果步要自带「再来一遍」之类操作时，给该步 `showNav: false` 关掉内置上一步/下一步。

## 相关
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
