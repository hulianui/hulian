---
slug: banner
name: Banner
category: feedback
group: message
tags: []
exports: [Banner]
status: enriched
---

# Banner

> 公告条 · 横贯容器顶部全宽 bar(站点维护/促销/版本更新) · 6 语气×soft/solid + 前导图标/操作区/可关闭 + 居中或左对齐 + 长文案 dogfood Marquee 单行无缝滚动 · 区别 Alert(局部卡片)/Notification(命令式四角) · feedback/message

## 何时用

横贯容器顶部的全宽公告 bar（站点维护、促销、版本更新），全局级、横向铺满。局部区块内的静态提示卡片用 [Alert](../alert/alert.md)；命令式自动消失的轻提示用 [Toast](../toast/toast.md)；四角弹出的富通知用 [Notification](../notification/notification.md)。

## 导入
```ts
import { Banner } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"neutral"｜"info"｜"brand"｜"success"｜"warning"｜"danger"` | `"info"` | 语气色 |
| variant | `"soft"｜"solid"` | `"soft"` | soft=浅底 / solid=实色填充（更醒目，适合促销/重大公告） |
| align | `"start"｜"center"` | `"center"` | 内容对齐 |
| scrollable | `boolean` | `false` | 文案过长时单行无缝滚动（纯 CSS marquee·hover 暂停） |
| closeLabel | `string` | — | 关闭按钮无障碍标签 |
| className | `string` | — | 额外类名 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 传入则渲染关闭按钮 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 前导图标（传入 svg；随 tone 自动着色） |
| children | `ReactNode` | 文案主体 |
| action | `ReactNode` | 右侧操作区（如「查看详情」链接/按钮） |

## 示例
```tsx
<Banner tone="success" icon={<Rocket />}>部署成功，服务已切换到新版本</Banner>

<Banner
  variant="solid"
  tone="brand"
  icon={<Sparkles />}
  action={<Link href="#" className="text-current underline">立即查看</Link>}
  onClose={() => setOpen(false)}
>
  双十一大促开启，全场组件五折
</Banner>
```

## 禁忌 / 坑

- `onClose` 只触发回调、不自管显隐，显示/隐藏由调用方 state 控制（受控）；不传则不渲染关闭按钮。
- `scrollable` 走纯 CSS marquee（hover 暂停），仅用于单行长文案；多行内容别开。
- `solid` 变体下 `action` 里的链接用 `text-current` 跟随实色底的前景色，别硬编码颜色。

## 相关
[Alert](../alert/alert.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
