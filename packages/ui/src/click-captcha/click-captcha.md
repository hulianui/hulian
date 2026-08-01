---
slug: click-captcha
name: ClickCaptcha
category: forms
group: framework
tags: []
exports: [ClickCaptcha]
status: enriched
---

# ClickCaptcha

> 点选式人机验证 UI · 采集点击序列回传相对坐标(0~1) + 序号标记/撤销/换一张 + 键盘准星可达 + 失败抖动清空(零协议·不碰网络) · forms/framework

## 何时用

中后台登录页开人机验证时用：它只做「给定背景图 + 提示图 → 采集用户点击序列 → 回传相对坐标」这一段纯交互，坐标换算、点位标记、撤销/刷新、键盘可达、reduced-motion 都由组件吃掉。

**有意不做的事**：不发请求、不认协议。验证码的接口路径、`captchaId` 会话语义、`captchaInfo` 编码各家后端不同（BuildAdmin、腾讯防水墙、极验……），进库就是 API 债。你在 `onComplete` 里把点位编码成自家协议串再发请求，按结果把 `status` 置 `success` / `failed`。

与 [InputOTP](../input-otp/input-otp.md) 的区别：那个是短信/邮箱验证码的**数字输入**，与人机验证无关。配合 [LoginForm](../login-form/login-form.md) 的 `extra` 插槽 + `beforeSubmit` 可组成「点提交 → 过验证码 → 再登录」的链路。

## 导入
```ts
import { ClickCaptcha } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| backgroundSrc | `string` | — | 背景图 URL（必填，业务自己取） |
| hintSrc | `string` | — | 提示图 URL（「请依次点击：书 山 水」那条），渲染在提示行右侧 |
| hintText | `ReactNode` | `locale.clickCaptcha.hint` | 提示文案 |
| maxPoints | `number` | `3` | 采集点位数，采满触发 `onComplete` |
| points | `CaptchaPoint[]` | — | 受控点位；不传则内部自管 |
| defaultPoints | `CaptchaPoint[]` | `[]` | 非受控初始点位 |
| loading | `boolean` | `false` | 盖遮罩 + 禁点选（等后端换图时用） |
| status | `"idle" \| "verifying" \| "failed" \| "success"` | `"idle"` | 校验态；`failed` 抖动并清空点位，`verifying`/`success` 锁交互 |
| disabled | `boolean` | `false` | 禁用（连「换一张」也禁） |
| aspectRatio | `number` | `2` | 图片区宽高比（BuildAdmin 系点选图常见 310×155） |
| keyboardStep | `number` | `0.02` | 键盘准星单次步进（相对坐标） |
| className | `string` | — | 根节点类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onPointsChange | `(points: CaptchaPoint[]) => void` | 点位变化（新增 / 撤销 / 清空）；受控时用它回写 |
| onComplete | `(points: CaptchaPoint[]) => void` | 采满 `maxPoints` 时触发——在此编码协议串并发请求 |
| onRefresh | `() => void` | 点「换一张」；组件只清点位，换图由你改 `backgroundSrc` |

`CaptchaPoint = { x: number; y: number }`，**相对坐标 x/y ∈ [0,1]**（相对图片显示区域左上角）。

## 示例
```tsx
const [status, setStatus] = useState<ClickCaptchaStatus>("idle");
const [captcha, setCaptcha] = useState(() => fetchCaptcha());

<ClickCaptcha
  backgroundSrc={captcha.background}
  hintSrc={captcha.hint}
  status={status}
  onComplete={async (points) => {
    setStatus("verifying");
    // 相对坐标 → 后端要的原图像素基准（原图尺寸由你的后端定义）
    const encoded = points.map((p) => `${Math.round(p.x * 310)},${Math.round(p.y * 155)}`).join("|");
    const ok = await api.verifyCaptcha(captcha.id, encoded);
    setStatus(ok ? "success" : "failed");
  }}
  onRefresh={() => setCaptcha(fetchCaptcha())}
/>
```

与 LoginForm 组合（点提交 → 弹验证码 → 再登录）：

```tsx
<LoginForm
  extra={<ClickCaptcha backgroundSrc={captcha.background} onComplete={setPoints} />}
  beforeSubmit={async () => {
    if (points.length < 3) return false;           // 未过验证码 → 中止提交
    captchaInfo.current = await verify(points);    // 拿到票据，onFinish 里带上
  }}
  onFinish={({ username, password }) => api.login(username, password, captchaInfo.current)}
/>
```

## 禁忌 / 坑

- **别把协议塞进组件**：`captchaId`、`captchaInfo` 编码、接口路径都留在业务侧。组件只回坐标，换成任何后端都不用改。
- **坐标是相对值不是像素**：容器缩放 / 响应式 / 高 DPI 下 `x*原图宽` 才是后端要的像素；直接把 `x` 当像素发过去必然对不上。
- **受控模式必须回写**：传了 `points` 却不在 `onPointsChange` 里 `setState`，点了也不会出标记（与所有受控组件一致）。
- 校验失败请把 `status` 置 `failed`：组件负责抖动 + 清空点位；自己再手动清一次会让点位闪两下。
- 抖动走 `motion-safe:`，`prefers-reduced-motion` 下不抖——失败反馈仍有文案播报，不依赖动画。
- 图片加载失败会显示兜底文案而非空白框，用户可直接点「换一张」自救。
- 键盘用户：区域可聚焦，方向键移准星、Enter/Space 落点、Backspace 撤销；别再往区域上套 `pointer-events-none` 或自定义 `tabIndex`。
- 滑块拼图式（SliderCaptcha）目前不在库内，需要的话按同一「纯 UI 层」原则单独提。

## 相关
[LoginForm](../login-form/login-form.md) · [InputOTP](../input-otp/input-otp.md) · [Field](../field/field.md) · [ImageCropper](../image-cropper/image-cropper.md)
