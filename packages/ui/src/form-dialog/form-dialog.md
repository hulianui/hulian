---
slug: form-dialog
name: ModalForm / DrawerForm
category: forms
group: framework
tags: []
exports: [ModalForm, DrawerForm]
status: enriched
---

# ModalForm / DrawerForm

> 弹窗/抽屉表单 · 列表页新增/编辑编排件(复用 Dialog/Drawer + useForm + Button footer) · 提交前自动 validate · async onFinish 成功关闭/失败保持 · 文案接 i18n · forms/framework

## 何时用

列表页点「新增/编辑」弹出表单时用：`ModalForm` 居中弹窗、`DrawerForm` 贴边抽屉，二者 API 一致（抽屉多一个 `side`）。它把 Dialog/Drawer + 提交按钮 footer + 校验编排好了。页面内常驻表单用 [ProForm](../pro-form/pro-form.md)；裸表单容器用 [Form](../form/form.md)；多步向导用 [StepsForm](../steps-form/steps-form.md)。

## 导入
```ts
import { ModalForm, DrawerForm } from "@hulianui/ui"
```

## Props

公共（`ModalForm` = `FormDialogBaseProps`；`DrawerForm` 在此基础上加 `side`）：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title * | `string` | — | 标题（a11y label） |
| open | `boolean` | — | 受控开关 |
| defaultOpen | `boolean` | — | 非受控初始开关 |
| onOpenChange | `(open: boolean) => void` | — | 开关变化回调 |
| trigger | `ReactElement` | — | 触发元素（非受控打开用）；受控时可省 |
| form | `FormInstance` | — | useForm 实例：提供则提交前自动 `validate()`，校验不过保持打开 |
| onFinish | `(values: FormValues) => void \| boolean \| Promise<void \| boolean>` | — | 提交回调；返回 Promise → 按钮 loading；resolve(非 false) 自动关闭；reject 或返回 false 保持打开 |
| submitText | `string` | `locale.modalForm.submit` | 提交按钮文案 |
| cancelText | `string` | `locale.modalForm.cancel` | 取消按钮文案 |
| className | `string` | — | 容器类名（控宽度等） |
| children | `ReactNode` | — | 表单字段 |
| side | `DrawerSide` | `"right"` | 仅 `DrawerForm`：抽屉贴边方向 |

## 示例
```tsx
const form = useForm({ initialValues: { name: "" } });
const name = form.register("name", { rules: [{ required: true, message: "请输入姓名" }] });

<ModalForm
  title="新增员工"
  form={form}
  trigger={<Button>新增</Button>}
  onFinish={async (values) => { await api.create(values); }} // 校验通过+成功后自动关闭
>
  <Field label="姓名" error={name.error}>
    <Input value={name.value} onChange={name.onChange} onBlur={name.onBlur} />
  </Field>
</ModalForm>
```

## 禁忌 / 坑

- 关/不关由 `onFinish` 返回值决定：resolve 非 false → 自动关；想留在原地（如自处理错误）reject 或 return false。别在 onFinish 里手动调 onOpenChange(false) 跟自动关闭打架。
- 传了 `form` 才会提交前自动 `validate()` 并在校验不过时保持打开；不传 form 则不校验、直接把 values 交给 onFinish。
- 提交成功后想清空字段需自己调 `form.resetFields()`，组件不会替你重置。

## 相关
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
