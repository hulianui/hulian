---
slug: login-form
name: LoginForm
category: forms
group: framework
tags: []
exports: [LoginForm]
status: enriched
---

# LoginForm

> 登录模板 · 自管 useForm(账号/密码必填+记住我) + 提交 loading + logo/footer 插槽(复用 Field/Input/Checkbox/Button·文案接 i18n) · forms/framework

## 何时用

直接落地后台/应用的登录页时用：账号 + 密码 + 记住我的表单状态、必填校验、提交 loading 都由它内部托管，你只接 `onFinish`。与 [Form](../form/form.md)/[ProForm](../pro-form/pro-form.md) 的区别：那两个是通用表单骨架，需要自己拼字段；LoginForm 是开箱即用的成品模板，登录场景之外不用它。

## 导入
```ts
import { LoginForm } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| title | `ReactNode` | `locale.loginForm.title` | 标题 |
| subtitle | `ReactNode` | — | 副标题（标题下方引导文案，左对齐·muted） |
| logo | `ReactNode` | — | 品牌 logo（头部左上） |
| onFinish | `(values: LoginValues) => void \| Promise<void>` | — | 校验通过后提交；返回 Promise → 提交按钮 loading |
| loading | `boolean` | — | 外部 loading 覆盖（父层托管提交态时用） |
| showRemember | `boolean` | `true` | 是否显示「记住我」 |
| footer | `ReactNode` | — | 底部附加区（忘记密码 / 注册链接等） |
| className | `string` | — | 根节点类名 |

`LoginValues = { username: string; password: string; remember: boolean }`。

## 示例
```tsx
<LoginForm
  logo={<Logo />}
  subtitle="欢迎回来，请登录你的管理后台"
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
  footer={
    <div className="flex justify-between text-sm">
      <Link href="/forgot">忘记密码</Link>
      <Link href="/signup">注册账号</Link>
    </div>
  }
/>
```

## 禁忌 / 坑

- 表单状态由组件内部托管，外部拿不到 username/password 的实时值——只能在 `onFinish` 拿到最终 `values`。若父层自己也在管提交态（如全局 loading），用 `loading` prop 覆盖内置 loading，别另写一份。
- `onFinish` 返回 Promise 时提交按钮自动转 loading 并禁用，无需手动 disable。

## 相关
[Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
