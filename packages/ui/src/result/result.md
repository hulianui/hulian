---
slug: result
name: Result
category: feedback
group: message
tags: []
exports: [Result]
status: enriched
---

# Result

> 结果页 · 7 状态(success/error/info/warning/403/404/500)内置图标+语义色 + 标题/副标题/详情/操作槽(零依赖·RSC) · feedback/message

## 何时用

整页/整块展示一次操作的最终结果或异常页时用（支付成功、提交失败、403/404/500 错误页），居中大图标 + 标题 + 操作按钮。它是**占满区域的结果反馈**；行内/局部的轻量提示用 [Alert](../alert/alert.md)，瞬时反馈用 [Toast](../toast/toast.md)。零依赖、可作 RSC。

## 导入
```ts
import { Result } from "@hulianui/ui"
```

## Props

继承 `Omit<HTMLAttributes<HTMLDivElement>, "title" | "content">`。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| status | `"success"｜"error"｜"info"｜"warning"｜"403"｜"404"｜"500"` | `"info"` | 状态，决定内置图标与语义色 |
| icon | `ReactNode` | 按 status 派生 | 自定义图标覆盖内置；传 `null` 则不渲染图标区 |
| title | `ReactNode` | — | 主标题 |
| subTitle | `ReactNode` | — | 副标题/辅助说明 |
| content | `ReactNode` | — | 详情内容区（如错误堆栈），渲染在标题下方、操作区上方 |
| children | `ReactNode` | — | 操作区（按钮等），渲染在最下方 |

## 示例
```tsx
// 成功结果 + 操作按钮
<Result status="success" title="支付成功" subTitle="订单 #2024-0612 已完成，预计 3 天内发货。">
  <Button size="sm">查看订单</Button>
  <Button size="sm" variant="outline">返回首页</Button>
</Result>

// 失败 + 详情内容
<Result
  status="error"
  title="提交失败"
  subTitle="请检查并修改以下信息后重试。"
  content="账户名包含非法字符；手机号格式不正确。"
>
  <Button size="sm">返回修改</Button>
</Result>
```

## 禁忌 / 坑

- `status` 的 `"403"/"404"/"500"` 是字符串字面量，别写成数字 `404`。
- `icon={null}` 才彻底不渲染图标区；不传 `icon` 会按 status 用内置图标。
- 暂无其它已知坑。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [GiftFeed](../gift-feed/gift-feed.md)
