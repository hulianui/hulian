---
"@hulianui/ui": minor
"@hulianui/tokens": minor
"@hulianui/mcp": patch
---

LoginForm 补三个逃生口 + 新增 ClickCaptcha 点选人机验证（closes #50 #51）

一个 BuildAdmin 系后台的两个登录页**查完文档后仍绕开 `LoginForm` 各自手写表单**——不是没查，是它接不住：校验只有必填、外部拿不到字段实时值、没有验证码位。以它为核心的 `page-login` / `block-login` 推荐链因此整条断掉（装了也得拆）。这批补上缺口，模板不再是"只能做 demo"。

**LoginForm 三个口子**（都向后兼容，不传行为与之前完全一致）：

```tsx
<LoginForm
  // 1. 字段级校验：沿用 useForm 的 FormRule[] 形状，内置必填始终先跑
  rules={{
    username: [{ pattern: /^[a-zA-Z][a-zA-Z0-9_]{2,15}$/, message: "账号格式不正确" }],
    password: [{ min: 6, max: 32, message: "密码 6~32 位" }],
  }}
  // 2. 受控逃生口：外部持有实时值（受控回写不会二次触发 onValuesChange，不会循环）
  values={values}
  onValuesChange={(_changed, all) => setValues(all)}
  // 3. 提交前异步拦截 + 表单内插槽：验证码链路终于能挂进来
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;            // 返回 false / 抛错即中止提交
    ticket.current = await api.verifyCaptcha(captcha.id, points);
  }}
  onFinish={({ username, password }) => api.login(username, password, ticket.current)}
/>
```

`beforeSubmit` 执行期间提交按钮保持 loading，弹验证码这类异步步骤不必自己再管 loading。

**新增 `ClickCaptcha`**：点选式人机验证的**纯 UI 层**——给定背景图与提示图，采集点击序列并回传**相对坐标（x/y ∈ [0,1]）**。

有意不做的事：不发请求、不认协议。`captchaId` 语义、`captchaInfo` 编码、接口路径各家后端不同（BuildAdmin / 极验 / 防水墙），进库就是 API 债。你在 `onComplete` 里编码成自家协议串再发请求，按结果把 `status` 置 `success` / `failed`。

组件吃掉的正是自建时最占篇幅、最容易做错的部分：坐标换算（相对值，容器缩放 / 响应式 / 高 DPI 都不错位）、序号标记与撤销、换一张、失败抖动并清空、加载遮罩、图片加载失败兜底，以及**键盘可达**（区域可聚焦，方向键移准星、Enter/Space 落点、Backspace 撤销）。抖动走 `motion-safe:`，`prefers-reduced-motion` 下不抖，失败仍有 `aria-live` 文案播报。

滑块拼图式（SliderCaptcha）本批不做——同一「纯 UI 层」原则，需要时单独提。

配套：`@hulianui/tokens` 新增关键帧 `hulian-captcha-shake`；`@hulianui/mcp` 搜索词表补「验证码 / 人机验证 / 点选」→ `click-captcha`（此前搜这些词只会命中 InputOTP / Slider，正是 #51 的起点）。
