---
slug: form
name: Form
category: forms
group: framework
tags: []
exports: [Form, useForm, validateValue, FormList]
status: enriched
---

# Form

> 表单容器 · Base UI 结构化提交 + errors 按 name + 与 Field 协同 · forms/framework

## 何时用

页面内布置一组字段、自己管提交与校验时用。`Form` 是结构化提交容器（按原生 name 收集 values）；`useForm` 是更强的校验/联动控制器（规则引擎 + 字段依赖 + register/submit）；`FormList` 管动态增删行。需要弹窗/抽屉里提交用 [ModalForm / DrawerForm](../form-dialog/form-dialog.md)；要自带 footer + 栅格的内联表单用 [ProForm](../pro-form/pro-form.md)；纯查询条件用 [SearchForm](../search-form/search-form.md)。

## 导入
```ts
import { Form, useForm, validateValue, FormList } from "@hulianui/ui"
```

## Props

`Form`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| validationMode | `"onSubmit" \| "onBlur" \| "onChange"` | `"onSubmit"` | 校验时机 |
| errors | `Record<string, string \| string[]>` | — | 外部/服务端校验错误，按 `<Field name>` 映射（展示需 Field 内有 Field.Error） |
| className | `string` | — | 容器类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onFormSubmit | `(formValues: Record<string, unknown>) => void` | 提交时拿到结构化 values（已 preventDefault 原生提交） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 字段内容 |

`useForm` 控制器用法（详见示例）：`form.register(name, { rules, dependencies })`、`form.submit(onValid, onInvalid)`、`form.resetFields()`。

## 示例
```tsx
<Form className="w-72" onFormSubmit={(v) => console.log(v)}>
  <Field label="邮箱" name="email">
    <Input name="email" type="email" required />
  </Field>
  <Button type="submit" size="sm">提交</Button>
</Form>
```
```tsx
// useForm：规则引擎 + 字段联动
const form = useForm({ initialValues: { pwd: "", confirm: "" } });
const pwd = form.register("pwd", { rules: [{ required: true, min: 6, message: "至少 6 位" }] });
const confirm = form.register("confirm", {
  dependencies: ["pwd"],
  rules: [{ validator: (v, values) => { if (v !== values.pwd) throw new Error("两次密码不一致"); } }],
});
<form onSubmit={form.submit((values) => save(values))} noValidate>
  <Field label="密码" error={pwd.error}>
    <Input type="password" value={pwd.value as string} onChange={pwd.onChange} onBlur={pwd.onBlur} />
  </Field>
  <Field label="确认密码" error={confirm.error}>
    <Input type="password" value={confirm.value as string} onChange={confirm.onChange} onBlur={confirm.onBlur} />
  </Field>
</form>
```

## 禁忌 / 坑

- `validator` 报错靠 `throw new Error("...")` 抛出，不是 return false；联动字段记得在 `dependencies` 里声明被依赖字段，否则不会重算。
- `errors`（外部/服务端错误）要显示出来，对应 `Field` 内必须有 `Field.Error`，且 key 与 `<Field name>` 严格对齐。
- 用 `useForm` 时给原生 `<form>` 加 `noValidate`，避免浏览器原生校验抢在规则引擎前弹气泡。

## 相关
[ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
