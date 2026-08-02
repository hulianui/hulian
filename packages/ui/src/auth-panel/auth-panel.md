---
slug: auth-panel
name: AuthPanel
category: forms
group: framework
tags: []
exports: [AuthPanel]
status: enriched
---

# AuthPanel

> 认证页宣传面板 · 分屏登录/注册页左侧那块（渐变底 + 品牌 + 标语 + 卖点 + 底部区）· 四档背景配方(radial/linear/mesh/none)由 token 混色写死在组件内 —— Tailwind 工具类给不出带 color-mix 的 radial-gradient，guard 又禁消费方传 style，两条一撞只剩裸 div + inline style · color 走 resolveTone 与 Brand/Dot 同路 · 配 LoginForm surface={false} 免卡中卡 · forms/framework

## 何时用

「左边一块渐变宣传面板 + 右边表单」是登录 / 注册 / 找回密码页的标准版式，这个件就是左边那块。

它存在的理由不是省几行 flex，而是**渐变此前没有正经的表达方式**（hulianui/hulian#71）：

- Tailwind 工具类给不出 `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, var(--color-primary) 12%, var(--color-bg)), …)` 这种带 token 混色的写法；
- guard 的 `no-style-override` 是 error 级，`style` 挂到任何库件上直接报错。

两条一撞，结论就是那块面板只能是**裸 `<div>` + inline style**——不是猜的，官方 `signup` block 自己就是这么写的。于是同一个版式里边框/圆角/表面都走 token，唯独最显眼的那块背景绕开了组件体系，换品牌色要满仓库找。

配方收进组件后：换色只动 `color`，暗色自动跟随（三档都以 `--color-bg` 打底做 `color-mix`）。

## 导入
```ts
import { AuthPanel } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| brand | `ReactNode` | — | 品牌位，通常直接放 [Brand](../brand/brand.md) |
| title | `ReactNode` | — | 主标语 |
| titleLevel | `1..6` | `2` | 标题语义级别（只换 `h1`–`h6` 标签，视觉尺寸不变） |
| description | `ReactNode` | — | 标语下的补充说明 |
| highlights | `ReactNode[]` | — | 卖点列表，每条自动带一枚勾选标记（跟随 `color`） |
| children | `ReactNode` | — | 中部自由内容（插画、统计数字、客户 logo 墙） |
| footer | `ReactNode` | — | 底部区（版权、备案号、次要链接） |
| color | `string` | `"primary"` | 品牌色：语义色名 / 任意 CSS 色 / 变量，走 `resolveTone`（同 [Brand](../brand/brand.md) `.color`、[Dot](../dot/dot.md) `.color`、`ChartSeries.color`） |
| gradient | `"radial" \| "linear" \| "mesh" \| "none"` | `"radial"` | 背景配方，见下 |
| className | `string` | — | 根节点类名 |

### 背景配方

| 档 | 长相 | 用在 |
|----|------|------|
| `radial`（默认） | 左上角起的柔和光晕 | 最百搭，后台登录页 |
| `linear` | 135° 斜向渐变，两端各带一点品牌色 | 想要方向感时 |
| `mesh` | 三处光斑叠加 | 设计感最强，注册页 / 落地页 |
| `none` | 纯 `surface` 底，不写 `background` | 想自己叠 [DotPattern](../dot-pattern/dot-pattern.md) / [GridPattern](../grid-pattern/grid-pattern.md) 之类图案时 |

## 示例
```tsx
// 分屏登录页：右半边关掉卡面，避免卡中卡
<div className="grid min-h-dvh xl:grid-cols-2">
  <AuthPanel
    brand={<Brand name="瀚云" description="全球边缘计算" />}
    title="把想法送上全球边缘"
    description="五分钟创建账号，开启第一个项目。无需信用卡。"
    highlights={["免费开始，闲时算力自动归零", "从 git push 到全球边缘上线"]}
    footer="© 2026 瀚云 · 京ICP备 000000 号"
    className="hidden xl:flex"
  />
  <div className="grid place-items-center p-8">
    <LoginForm
      surface={false}
      fields={{
        username: { label: "管理员账号", placeholder: "请输入账号", prefix: <UserRound /> },
        password: { placeholder: "请输入密码", prefix: <KeyRound /> },
      }}
    />
  </div>
</div>
```

```tsx
// 注册页：mesh 配方 + 自定义中部内容
<AuthPanel gradient="mesh" color="chart-2" title="开始使用">
  <img src="/illustration.svg" alt="" className="max-w-xs" />
</AuthPanel>
```

## 禁忌 / 坑

- **面板自己不定高度**（只写 `h-full`），高度交给外层栅格。分屏页通常是 `grid min-h-dvh xl:grid-cols-2`，面板自然铺满那一列。组件里写死 `h-dvh` 会在「嵌进已有卡片」的场景里炸掉，同 [AdminLayout 的 `fitViewport` 教训](../admin-layout/admin-layout.md)。
- **窄屏用 `className="hidden xl:flex"` 藏掉，而不是不渲染**——面板是纯装饰，小屏只留表单；靠条件渲染会让 SSR/CSR 两边的树不一致。
- 三档渐变都以 `--color-bg` 打底，所以**暗色不需要另写一套**。自己在外面套 `dark:` 覆盖背景等于把这个特性关掉。
- `gradient="none"` 是给「自己叠图案」用的，不是给「不要背景」用的——它仍有 `bg-surface`，因为面板要和右侧表单区在明暗上分开。
- 右半边表单记得传 `surface={false}`（[LoginForm](../login-form/login-form.md)）：视觉重量已由左侧面板承担，再套一张卡就是卡中卡。
- 消费方 `style` 仍能覆盖背景（整块换底图的逃生口），但那属于绕开组件体系——先想想是不是该给 `gradient` 加一档。

## 相关
[LoginForm](../login-form/login-form.md) · [Brand](../brand/brand.md) · [Field](../field/field.md) · [SocialButton](../social-button/social-button.md) · [ClickCaptcha](../click-captcha/click-captcha.md) · [DotPattern](../dot-pattern/dot-pattern.md)
