---
slug: toast
name: Toast
category: feedback
group: message
tags: []
exports: [toast, ToastProvider]
status: enriched
---

# Toast

> 命令式轻提示 · 自动消失 + 队列堆叠 + 手动关闭 · feedback/message

## 何时用

操作后命令式弹出的轻提示（已保存、已复制、保存失败），自动消失、队列堆叠（limit 3）。静态常驻的区块内提示用 [Alert](../alert/alert.md)；横贯顶部的公告 bar 用 [Banner](../banner/banner.md)；需要展开操作/富内容的通知用 [Notification](../notification/notification.md)。`ToastProvider` 在应用/段落 layout 单挂一次，业务侧只调 `toast()`。

## 导入
```ts
import { toast, ToastProvider } from "@hulianui/ui"
```

## Props

`toast(options)` 的 `ToastOptions`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"neutral"｜"info"｜"success"｜"warning"｜"danger"` | `"neutral"` | 语调，驱动左边条 + 标题着色（五档与 [Alert](../alert/alert.md) / [Tag](../tag/tag.md) 对齐，复用同一组语义 token） |
| timeout | `number` | `5000` | 自动消失毫秒数；`0` = 不自动消失（手动关闭）；缺省取 Provider 默认。`loading` 时缺省为 `0` |
| loading | `boolean` | `false` | 「进行中」态：标题前渲一个转圈图标，且 `timeout` 缺省值变成 `0`（不自动消失）。配 `toast.close(id)` 用 |

`ToastProvider` 的 `ToastProviderProps`：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| position | `"top-left"｜"top-center"｜"top-right"｜"bottom-left"｜"bottom-center"｜"bottom-right"` | `"top-right"` | 视口停靠位置。底部三档队列改成从下往上堆（最新一条永远贴着停靠边），入场滑动方向也跟着换手。全局值，单条 toast 不能各挑各的 |

## 伴生函数

| 名称 | 签名 | 说明 |
|------|------|------|
| `toast.close` | `(id?: string) => void` | 按 `toast()` 返回的 id 关掉某一条；不传 id 关掉全部。走正常出场过渡，不是硬拔 DOM |

## Slots

`toast(options)` 的 `ToastOptions`：

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题（加粗主行） |
| description | `ReactNode` | 描述（次行，恒 text-muted-foreground） |

`ToastProvider` 在根/段落 layout 单挂，承接命令式渲染。`children` 可选且透传渲染：包裹式 `<ToastProvider><App/></ToastProvider>` 与自闭合 `<ToastProvider />`（与页面内容并列兄弟）两种写法均可。

## 示例
```tsx
// 应用根布局挂一次：包裹式（透传渲染 children）
<ToastProvider>{children}</ToastProvider>
// 或自闭合 + 兄弟节点渲染应用，等价
<>
  <App />
  <ToastProvider />
</>

// 业务侧命令式调用
toast({ tone: "info", title: "有新版本", description: "点击刷新以更新。" })
toast({ tone: "success", title: "已保存", description: "更改已同步到云端。" })
toast({ tone: "warning", title: "部分失败", description: "3 条中 1 条未同步。" })
toast({ tone: "danger", title: "保存失败", description: "网络异常，请重试。" })
toast({ title: "需手动关闭", timeout: 0 }) // 0 = 常驻，点 × 才消失

// 视口换到左下角（全局，挂 Provider 时决定）
<ToastProvider position="bottom-left">{children}</ToastProvider>

// 「进行中 → 完成后关掉它 → 弹结果」
const id = toast({ title: "正在上传图片…", loading: true }); // 不自动消失
try {
  await upload();
  toast.close(id);
  toast({ tone: "success", title: "上传成功" });
} catch {
  toast.close(id);
  toast({ tone: "danger", title: "上传失败" });
}
```

## 禁忌 / 坑

- `ToastProvider` 全应用只挂一次（在段落 layout），别在 showcase/页面里重复挂，否则命令式渲染会重复。
- **`loading` 不是「第六档 tone」**：它与 `tone` 正交，进行中的提示照样可以是 `neutral` / `info`。它只做两件事——渲转圈图标、把 `timeout` 的缺省值从 5000 改成 0。
- `loading` 与 `timeout: 0` **不是两套常驻语义**，是同一个 `timeout` 的默认值之差：显式传 `timeout` 依然优先，`{ loading: true, timeout: 3000 }` 就是 3 秒后自己走。
- `loading` 恒走 `priority: "low"`（polite），即使同时传 `tone: "danger"` 也不升 assertive：「进行中」是陪跑不是结果，而且这条会长时间挂着，assertive 会反复插队打断读屏正在念的内容。
- 开了 `loading` 就**必须自己 `toast.close(id)`**，否则它永远不走。别指望用户去点 ×——「进行中」本来就该由代码收尾。
- 转圈图标在 `prefers-reduced-motion: reduce` 下是**减速到 2.4s 一圈，不是停转**（库内装饰性动效统一走 `[animation:none]`，这里有意不同）：这个圈是「进行中」在视觉上唯一的记号，定格成静止圆弧就跟普通装饰图标没区别，状态信息当场消失。
- `@hulianui/ui` < 0.8 的 `ToastProvider` **不渲染 children**：包裹式写法会静默吞掉整个应用子树（白屏、零报错）。0.8 起已修复为透传渲染；旧版本务必用自闭合写法。
- `@hulianui/ui` ≤ 0.8 的 `ToastTone` 只有 `info | danger | neutral`，成功/警告态只能降级成 `info` / `neutral`；0.8 之后已补齐 `success` / `warning`，升级后可直接换回语义正确的 tone。
- 仅 `danger` 走 `priority: "high"`（aria-live assertive 打断播报），`warning` 与其余 tone 一样是 polite——警告不抢读屏焦点是有意为之。
- 测试该组件时注意 Base UI Toast 的几个坑见 [[base-ui-toast-close-aria-hidden-query-dom-not-role]]：未聚焦的 Close 按钮带 `aria-hidden` 致 `getByRole("button")` 找不到（改查 DOM）、aria-live 公告会让标题文本重复匹配、全局 manager 持久化致 toast 跨测试泄漏需清理。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
