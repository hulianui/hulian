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

> 把带校验的表单装进弹窗或抽屉，管好提交与关闭 · forms/framework

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
| title * | `string` | - | 标题（a11y label） |
| open | `boolean` | - | 受控开关 |
| defaultOpen | `boolean` | - | 非受控初始开关 |
| form | `FormInstance` | - | useForm 实例：提供则提交前自动 `validate()`，校验不过保持打开 |
| submitText | `string` | `locale.modalForm.submit` | 提交按钮文案 |
| cancelText | `string` | `locale.modalForm.cancel` | 取消按钮文案 |
| className | `string` | - | 容器类名（控宽度等） |
| side | `DrawerSide` | `"right"` | 仅 `DrawerForm`：抽屉贴边方向 |
| draggable | `boolean` | `false` | 仅 `ModalForm`：允许按住标题拖动对话框（透传 [DialogContent.draggable](../dialog/dialog.md)） |
| dismissible | `boolean` | `false` | 点遮罩是否关闭。**与 `Dialog` / `Drawer` 原语相反**：编排件知道自己装着一张表单，填到一半被随手点没的代价太大（#343）。传 `true` 恢复原语行为 |
| confirmOnClose | `boolean` | `true` | 表单改动过时，关闭前先确认一次。判据来自 `form.isDirty()`，**没传 `form` 就不生效**；干净表单直接关；提交成功后的关闭也不问 |
| discardTitle | `ReactNode` | locale `modalForm.discardTitle` | 放弃确认的标题 |
| discardDescription | `ReactNode` | locale `modalForm.discardDescription` | 放弃确认的说明 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onOpenChange | `(open: boolean) => void` | 开关变化回调 |
| onFinish | `(values: FormValues) => void \| boolean \| Promise<void \| boolean>` | 提交回调；返回 Promise → 按钮 loading；resolve(非 false) 自动关闭；reject 或返回 false 保持打开 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| trigger | `ReactElement` | 触发元素（非受控打开用）；受控时可省 |
| children | `ReactNode` | 表单字段 |

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

### 关掉这张表单不是无代价的（#343）

`ModalForm` / `DrawerForm` 与裸 `Dialog` / `Drawer` 的默认值刻意不同：**点遮罩默认不关**。原语是通用容器，随手点外面关掉很合理；编排件装的一定是表单，填到第 8 个字段时鼠标落在窗外一点就全部清空，这个代价与那点便利完全不成比例。

退路仍在，只是加了一道确认：Esc 与右上角关闭键在 `form.isDirty()` 为真时先问一句「放弃未提交的内容？」，确认才关。三种情况不会打扰你：没传 `form`（编排件无从判断脏净）、表单一字未改、以及提交成功后的那次关闭。

```tsx
// 默认：点遮罩不关，改过就问一句
<ModalForm title="新增学校" form={form} onFinish={save}>…</ModalForm>

// 恢复原语行为
<ModalForm dismissible confirmOnClose={false} …>…</ModalForm>

// 自己判断要不要关：details.reason 区分点遮罩 / Esc / 关闭键
<ModalForm onOpenChange={(open, details) => {
  if (!open && details?.reason === "outside-press") details.cancel();
}} …>…</ModalForm>
```

确认框由编排件自己渲染（`AlertDialog`），**不要求你挂 `ModalProvider`** —— 命令式 `modal.confirm` 在没挂 Provider 的应用里什么都不显示，而关闭动作此时已被拦下，那会变成「窗关不掉又没有提示」的死局。

## 相关
[Form](../form/form.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [LoginForm](../login-form/login-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
