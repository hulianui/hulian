---
slug: alert
name: Alert
category: feedback
group: message
tags: []
exports: [Alert, alertVariants]
status: enriched
---

# Alert

> 在页面里常驻一条信息、成功、警告或危险提示 · feedback/message

## 何时用

页面/区块内的静态提示卡片（表单校验汇总、状态说明、内联警告），常驻直到调用方移除。横贯容器顶部全宽公告 bar 用 [Banner](../banner/banner.md)；命令式自动消失的轻提示用 [Toast](../toast/toast.md)；四角弹出的富通知用 [Notification](../notification/notification.md)。

## 导入
```ts
import { Alert, alertVariants } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLDivElement>`（除 `title`）+ `alertVariants` 的变体：

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| tone | `"neutral"｜"brand"｜"info"｜"success"｜"warning"｜"danger"` | `"info"` | 语气色。`brand` 走主色，`info` 走独立的信息色（0.8.0 起两者不再同色） |
| variant | `"soft"｜"outline"` | `"soft"` | soft=浅底 / outline=描边 |
| closeLabel | `string` | `"关闭"` | 关闭按钮的无障碍标签 |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClose | `() => void` | 传入则渲染右上角关闭按钮，点击触发回调（关闭/消隐由调用方控制） |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| icon | `ReactNode` | 可选图标 slot（调用方自带 SVG/emoji；设计系统不绑图标库） |
| title | `ReactNode` | 标题（可选）；children 为正文 description |
| action | `ReactNode` | 右侧动作 slot（如 `<Button>Retry</Button>`），与关闭按钮并排 |

## 示例
```tsx
<Alert tone="success" icon={SuccessIcon} title="操作成功">
  个人资料已保存。
</Alert>

<Alert tone="danger" title="无法连接服务器" onClose={() => setShown(false)} action={<Button>重试</Button>}>
  出现连接问题，请稍后重试。
</Alert>
```

## 禁忌 / 坑

- `onClose` 只触发回调、不自行消隐，是否移除/隐藏由调用方控制（受控）；不传 `onClose` 则不渲染关闭按钮。
- 不绑图标库，`icon` 须调用方自带 SVG/emoji。
- 接口已 `Omit<…, "title">` 避开 HTML 原生 title 属性与 ReactNode title 冲突，直接传 `title` 即为标题。
- **`info` 与 `brand` 在 0.8.0 起是两个颜色，不能再互换**。此前 `info` 只是 `brand` 的别名（当时库里没有 info 语义色，只能借主色顶替）；`@hulianui/tokens` 补齐 `--color-info` 后，`brand` 仍是主色、`info` 改走与主色差 30° 色相的信息色。**升级后默认 Alert（`tone="info"`）的颜色会变**——想保持原来的品牌蓝，显式写 `tone="brand"`。选哪个按语义：这条在讲产品/主操作用 `brand`，只是说明性文字用 `info`。

## 相关
[Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md) · [GiftFeed](../gift-feed/gift-feed.md)
