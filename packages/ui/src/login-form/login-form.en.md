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

> Ready-made login form · self-managed useForm state and validation + controlled `values` escape hatch + async `beforeSubmit` guard + logo/extra/footer slots + `fields` presentation slots + optional built-in `surface` · localized copy · forms/framework

## When to use

Use LoginForm for a conventional application or admin sign-in page. It owns the username, password, and remember-me state, required-field validation, and submission loading; consumers only need to handle `onFinish`. [Form](../form/form.md) and [ProForm](../pro-form/pro-form.md) are general-purpose shells whose fields you compose yourself, while LoginForm is specific to sign-in flows.

The template includes escape hatches for three common requirements:

- **Username or password format constraints** → `rules`, using the `useForm` `FormRule[]` shape; built-in required rules always run first.
- **External access to live field values** → controlled `values` + `onValuesChange`, for live hints or cross-field interactions.
- **An extra step before submission** → async `beforeSubmit` + the `extra` slot, for a CAPTCHA, confirmation, or tenant selector.

Compose Field, Input, Checkbox, and Button directly when the form needs reordered fields or several custom fields, such as tabs for password sign-in versus phone and SMS code.

## Import
```ts
import { LoginForm } from "@hulianui/ui"
```

## Props

| Name | Type | Default | Description |
|------|------|------|------|
| loading | `boolean` | — | External loading override for consumers that own submission state. |
| showRemember | `boolean` | `true` | Whether to display "Remember Me" |
| rememberLabel | `ReactNode` | Locale value | Overrides the remember-me label. |
| rememberDescription | `ReactNode` | — | Supporting text shown directly below the remember-me checkbox. |
| rules | `{ username?: FormRule[]; password?: FormRule[] }` | — | Field-level validation appended after built-in required rules. `FormRule` matches [Form](../form/form.md): `pattern`/`min`/`max`/`validator`/`message`. |
| values | `Partial<LoginValues>` | — | Controlled values. Pair with `onValuesChange`; omit to use internal state. |
| fields | `{ username?: LoginFieldSlot; password?: LoginFieldSlot }` | — | Presentation slots for the two primary fields: `label`, `placeholder`, `prefix`, `suffix`, `description`, and `autoComplete`. Values and validation remain owned by the template. |
| surface | `boolean` | `true` | Built-in card border, background, shadow, and padding. Set to `false` in a split login page or an existing card and let the parent own the surface. |
| className | `string` | — | Root node class name |

## Events

| Event | Type | Description |
|------|------|------|
| onFinish | `(values: LoginValues) => void \| Promise<void>` | Called after validation and `beforeSubmit` succeed. Returning a Promise keeps the submit button loading. |
| onValuesChange | `(changed: Partial<LoginValues>, all: LoginValues) => void` | Called for every field change; write controlled values back here or observe uncontrolled values. |
| beforeSubmit | `(values: LoginValues) => boolean \| void \| Promise<boolean \| void>` | Runs after validation and before `onFinish`. Returning `false` or throwing aborts submission; the button remains loading while it runs. |

## Slots

| Slot | Type | Description |
|------|------|------|
| title | `ReactNode` | Title (default `locale.loginForm.title`) |
| subtitle | `ReactNode` | Muted, left-aligned guidance below the title. |
| logo | `ReactNode` | Brand logo at the upper left of the header. |
| extra | `ReactNode` | Content between the password and remember-me fields, such as a CAPTCHA or tenant selector. |
| footer | `ReactNode` | Additional area at the bottom (forgot password/registration link, etc.) |

`LoginValues = { username: string; password: string; remember: boolean }`.

## Example
```tsx
<LoginForm
  logo={<Logo />}
  subtitle="Welcome back. Sign in to continue."
  onFinish={async ({ username, password, remember }) => {
    await api.login(username, password, remember);
  }}
  footer={
    <div className="flex justify-between text-sm">
      <Link href="/forgot">Forgot password?</Link>
      <Link href="/signup">Create account</Link>
    </div>
  }
/>
```

## Custom validation, controlled values, and CAPTCHA

```tsx
const [values, setValues] = useState({ username: "", password: "", remember: false });
const [points, setPoints] = useState<CaptchaPoint[]>([]);
const ticket = useRef<string | null>(null);

<LoginForm
  // 1. Field validation: built-in required rules run before these format rules.
  rules={{
    username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "Enter a valid username" }],
    password: [{ min: 6, max: 32, message: "Use 6–32 characters" }],
  }}
  // 2. Controlled: hold live values externally.
  values={values}
  onValuesChange={(_changed, all) => setValues(all)}
  // 3. Before submission: validate the CAPTCHA and retain its ticket.
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;                 // Incomplete verification: abort
    ticket.current = await api.verifyCaptcha(captcha.id, points);
  }}
  onFinish={({ username, password }) => api.login(username, password, ticket.current)}
/>
```

## Usage guidelines

- LoginForm is uncontrolled by default: without `values`, it owns state and exposes the final values through `onFinish`. Pass `values` with `onValuesChange` when live external state is required; controlled writeback does not emit a duplicate change or create a loop.
- Passing `values` without writing changes back in `onValuesChange` makes the inputs read-only, as with any controlled component.
- `rules` append to rather than replace the built-in required rules. Empty fields therefore report the required message before format errors.
- Throwing in `beforeSubmit` is equivalent to returning `false`; the component absorbs the error to avoid an unhandled rejection. Catch and present user-facing errors inside the callback when needed.
- The submit button remains loading while `beforeSubmit` runs, including asynchronous CAPTCHA or confirmation steps.
- When the parent already owns submission state, pass it through `loading` instead of implementing a second loading mechanism.
- Returning a Promise from `onFinish` automatically disables the submit button and shows its loading state until the Promise settles.

### Field presentation and surface for split login pages

```tsx
// The right pane already supplies layout, so avoid nesting another card.
<div className="grid xl:grid-cols-2">
  <AuthPanel title="Welcome back" description="Unified identity platform" />
  <div className="grid place-items-center p-8">
    <LoginForm
      surface={false}
      fields={{
        username: { label: "Administrator account", placeholder: "Enter your account", prefix: <UserRound /> },
        password: { placeholder: "Enter your password", prefix: <KeyRound /> },
      }}
    />
  </div>
</div>
```

`fields` changes presentation only. The template still owns values, validation, and default `autoComplete` behavior, so changing a label does not accidentally disable browser autofill. Override `fields.username.autoComplete` only when that behavior also needs to change.

`surface={false}` disables all four built-in surface layers together: border, background, shadow, and **padding**. Leaving padding behind would still force split-page consumers to add an `xl:p-0` override (hulianui/hulian#70).

### Remember-me label and description

Use `rememberLabel` to replace the label and `rememberDescription` to place one line of supporting text directly below the checkbox. Remember-me is not always a convenience meaning “skip sign-in next time”; in some systems it controls whether the server issues a refresh token, so the wording is part of the security contract rather than generic locale copy (hulianui/hulian#64). Use `rememberDescription` for that explanation; the `extra` slot appears between the password and remember-me fields and is therefore the wrong location.

## Related
[ClickCaptcha](../click-captcha/click-captcha.md) · [Form](../form/form.md) · [ModalForm / DrawerForm](../form-dialog/form-dialog.md) · [ProForm](../pro-form/pro-form.md) · [StepsForm](../steps-form/steps-form.md) · [Field](../field/field.md) · [SearchForm](../search-form/search-form.md)
