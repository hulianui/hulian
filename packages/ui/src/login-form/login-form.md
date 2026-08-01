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

> 登录模板 · 自管 useForm(账号/密码必填+记住我) + rules 字段校验 + values 受控逃生口 + beforeSubmit 异步拦截 + extra/logo/footer 插槽(复用 Field/Input/Checkbox/Button·文案接 i18n) · forms/framework

## 何时用

直接落地后台/应用的登录页时用：账号 + 密码 + 记住我的表单状态、必填校验、提交 loading 都由它内部托管，你只接 `onFinish`。与 [Form](../form/form.md)/[ProForm](../pro-form/pro-form.md) 的区别：那两个是通用表单骨架，需要自己拼字段；LoginForm 是开箱即用的成品模板，登录场景之外不用它。

真实后台常见的三类需求都有逃生口，不必因此拆掉模板自己拼：

- **账号/密码有格式约束** → `rules`（沿用 `useForm` 的 `FormRule[]` 形状，内置必填规则始终先跑）
- **外部要拿字段实时值**（字段级实时提示、与其他控件联动）→ `values` + `onValuesChange` 受控
- **提交前要插一步**（人机验证码、二次确认、租户选择）→ `beforeSubmit` 异步拦截 + `extra` 插槽

仍然不建议用它的场景：登录表单本身要重排字段顺序 / 加多个自定义字段（如手机号+短信码 tab 切换）——那种直接用 Field/Input/Checkbox/Button 拼。

## 导入
```ts
import { LoginForm } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| loading | `boolean` | — | 外部 loading 覆盖（父层托管提交态时用） |
| showRemember | `boolean` | `true` | 是否显示「记住我」 |
| rules | `{ username?: FormRule[]; password?: FormRule[] }` | — | 字段级校验规则，追加在内置必填之后（`FormRule` 同 [Form](../form/form.md)：`pattern`/`min`/`max`/`validator`/`message`） |
| values | `Partial<LoginValues>` | — | 受控值：传入即受控，需配合 `onValuesChange` 回写；不传维持内部自管 |
| className | `string` | — | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onFinish | `(values: LoginValues) => void \| Promise<void>` | 校验 + `beforeSubmit` 通过后提交；返回 Promise → 提交按钮 loading |
| onValuesChange | `(changed: Partial<LoginValues>, all: LoginValues) => void` | 任一字段变化；受控时用它回写，非受控时可用于实时观察 |
| beforeSubmit | `(values: LoginValues) => boolean \| void \| Promise<boolean \| void>` | 校验通过后、`onFinish` 之前执行；返回 `false` 或抛错即中止。执行期间按钮保持 loading |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题（默认 `locale.loginForm.title`） |
| subtitle | `ReactNode` | 副标题（标题下方引导文案，左对齐·muted） |
| logo | `ReactNode` | 品牌 logo（头部左上） |
| extra | `ReactNode` | 密码字段与「记住我」之间（人机验证码、租户选择等） |
| footer | `ReactNode` | 底部附加区（忘记密码 / 注册链接等） |

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

## 自定义校验 / 受控 / 验证码

```tsx
const [values, setValues] = useState({ username: "", password: "", remember: false });
const [points, setPoints] = useState<CaptchaPoint[]>([]);
const ticket = useRef<string | null>(null);

<LoginForm
  // 1. 字段级校验：内置必填先跑，这里追加格式约束
  rules={{
    username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号格式不正确" }],
    password: [{ min: 6, max: 32, message: "密码 6~32 位" }],
  }}
  // 2. 受控：外部持有实时值
  values={values}
  onValuesChange={(_changed, all) => setValues(all)}
  // 3. 提交前插一步：过人机验证码，拿票据
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;                 // 未过验证 → 中止
    ticket.current = await api.verifyCaptcha(captcha.id, points);
  }}
  onFinish={({ username, password }) => api.login(username, password, ticket.current)}
/>
```

## 禁忌 / 坑

- 默认非受控：不传 `values` 时表单状态由组件托管，外部只能在 `onFinish` 拿最终值——需要实时值就传 `values` + `onValuesChange` 转受控（受控回写不会二次触发 `onValuesChange`，不会循环）。
- 传了 `values` 却不在 `onValuesChange` 里回写 = 输入框打不进字（与所有受控组件一致）。
- `rules` 只追加不替换：内置必填规则始终第一条先跑，所以空值时先出「请输入账号」，不会跳过必填直接报格式错。
- `beforeSubmit` 抛错等同返回 `false`（不中断也不上抛，避免未捕获 rejection）；要给用户错误提示请在自己的 catch 里做。
- `beforeSubmit` 执行期间提交按钮保持 loading，弹验证码这类异步步骤不需要自己再管 loading。
- 若父层自己也在管提交态（如全局 loading），用 `loading` prop 覆盖内置 loading，别另写一份。
- `onFinish` 返回 Promise 时提交按钮自动转 loading 并禁用，无需手动 disable。

## 相关
[ClickCaptcha](../click-captcha/click-captcha.md) · [Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
