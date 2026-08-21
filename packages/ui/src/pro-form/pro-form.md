---
slug: pro-form
name: ProForm
category: forms
group: framework
tags: []
exports: [ProForm]
status: enriched
---

# ProForm

> 内联表单编排，自动配好提交与重置底栏 · forms/framework

## 何时用

页面内**常驻**一个表单、要自带提交/重置 footer 和响应式栅格时用（详情页编辑、设置页）。它是 [ModalForm / DrawerForm](../form-dialog/form-dialog.md) 的内联姊妹件——同样 useForm + 自动 footer，只是不弹层。要弹窗/抽屉提交用 ModalForm/DrawerForm；只要裸容器、自己管 footer 用 [Form](../form/form.md)；查询条件用 [SearchForm](../search-form/search-form.md)。

## 导入
```ts
import { ProForm } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| form | `FormInstance` | - | useForm 实例：提供则提交前自动 `validate()`，重置走 `form.resetFields()` |
| submitText | `string` | `locale.proForm.submit` | 提交按钮文案 |
| resetText | `string` | `locale.proForm.reset` | 重置按钮文案 |
| showReset | `boolean` | `true` | 是否显示重置按钮（需 form 才有意义） |
| columns | `1 \| 2 \| 3` | `1` | 字段栅格列数；≥2 时按容器宽度自适应（窄塌单列），跨整行用 `<Field colSpan="full">` |
| footerAlign | `"left" \| "right"` | `"left"` | 底部操作区对齐 |
| className | `string` | - | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onFinish | `(values: FormValues) => void \| boolean \| Promise<void \| boolean>` | 提交回调；返回 Promise → 提交按钮 loading；reject 不抛断（错误反馈交消费者） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| footer | `ReactNode` | 自定义底部操作区（覆盖默认提交/重置按钮） |
| children | `ReactNode` | 表单字段 |

## 示例
```tsx
const form = useForm({ initialValues: { name: "", email: "" } });
const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });
const email = form.register("email", { rules: [{ pattern: /@/, message: "邮箱需含 @" }] });

<ProForm form={form} onFinish={async (v) => { await api.save(v); }}>
  <Field label="姓名" error={name.error}>
    <Input value={name.value as string} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
  <Field label="邮箱" error={email.error}>
    <Input value={email.value as string} onChange={email.onChange} onBlur={email.onBlur} />
  </Field>
</ProForm>
```
```tsx
// 响应式栅格：columns 走容器查询(窄自动塌单列)，跨行字段用 colSpan="full"
<ProForm form={form} columns={2} submitText="保存" onFinish={() => {}}>
  <Field label="名"><Input {...bind(reg.first)} /></Field>
  <Field label="姓"><Input {...bind(reg.last)} /></Field>
  <Field label="详细地址" colSpan="full"><Input {...bind(reg.addr)} /></Field>
</ProForm>
```

## 禁忌 / 坑

- `columns` 是**容器查询**自适应（按表单容器实际宽度塌列），不是视口断点；别再手搓 grid + media query，跨整行字段用 `<Field colSpan="full">`。
- 与 ModalForm 不同，ProForm 的 `onFinish` reject **不抛断**——错误反馈（toast 等）由消费者自己处理。
- 重置按钮只有传了 `form` 才有意义（走 `form.resetFields()`）；用 `footer` 自定义底部会**覆盖**默认提交/重置按钮，此时需自己接提交逻辑。

## 相关
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
