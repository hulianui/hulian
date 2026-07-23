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
| tone | `"info"｜"danger"｜"neutral"` | `"neutral"` | 语调，驱动左边条 + 标题着色（复用 Alert 语义，无 success：token 无） |
| timeout | `number` | `5000` | 自动消失毫秒数；`0` = 不自动消失（手动关闭）；缺省取 Provider 默认 |

## Slots

`toast(options)` 的 `ToastOptions`：

| 插槽 | 类型 | 说明 |
|------|------|------|
| title | `ReactNode` | 标题（加粗主行） |
| description | `ReactNode` | 描述（次行，恒 text-muted） |

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
toast({ tone: "danger", title: "保存失败", description: "网络异常，请重试。" })
toast({ title: "需手动关闭", timeout: 0 }) // 0 = 常驻，点 × 才消失
```

## 禁忌 / 坑

- `ToastProvider` 全应用只挂一次（在段落 layout），别在 showcase/页面里重复挂，否则命令式渲染会重复。
- `@hulianui/ui` < 0.8 的 `ToastProvider` **不渲染 children**：包裹式写法会静默吞掉整个应用子树（白屏、零报错）。0.8 起已修复为透传渲染；旧版本务必用自闭合写法。
- 无 `success` 语调（token 无），成功态用 `info` 或 `neutral`。
- 测试该组件时注意 Base UI Toast 的几个坑见 [[base-ui-toast-close-aria-hidden-query-dom-not-role]]：未聚焦的 Close 按钮带 `aria-hidden` 致 `getByRole("button")` 找不到（改查 DOM）、aria-live 公告会让标题文本重复匹配、全局 manager 持久化致 toast 跨测试泄漏需清理。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
