---
slug: floating-reactions
name: FloatingReactions
category: feedback
group: message
tags: [animated]
exports: [FloatingReactions]
status: enriched
---

# FloatingReactions

> 飘心点赞 · 命令式 ref.emit(content,{count}) 从底部喷射上浮表情 + 随机起点/横向漂移/缩放/时长扰动 + 上浮渐隐(keyframe)动画结束自移除 + palette 随机池 + rise/drift/duration 可调(forwardRef+useImperativeHandle·pointer-events none·可复用于任意点赞钮) · feedback/message · #animated

## 何时用

点赞/互动时从底部喷射上浮飘心表情的特效层用它：命令式 `ref.emit()` 触发，随机起点/漂移/缩放、上浮渐隐后自移除。它是**叠加特效层**（`pointer-events:none`），只管单个表情上浮动画；要做礼物连击合并计数横幅用 [GiftFeed](../gift-feed/gift-feed.md)。

## 导入
```ts
import { FloatingReactions } from "@hulianui/ui"
```

## Props

通过 `ref` 取 `FloatingReactionsHandle`，命令式调用 `emit(content?, opts?: { count?: number })`（不传 content 时从 palette 随机取）。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| palette | `ReactNode[]` | 一组心 | 不传 content 时随机取的表情池 |
| rise | `number` | `220` | 上浮高度 px |
| drift | `number` | `40` | 横向漂移幅度 px（左右随机） |
| duration | `number` | `2200` | 单个动画时长 ms |
| size | `number` | `24` | 字号 px |
| className | `string` | — | 容器类名 |

## 示例
```tsx
const ref = useRef<FloatingReactionsHandle>(null);

<div className="relative h-72 w-64 overflow-hidden">
  <button onClick={() => ref.current?.emit("❤️", { count: 3 })}>点赞 ❤</button>
  <FloatingReactions ref={ref} />
</div>
```

## 禁忌 / 坑

- 命令式 API：必须经 `ref` 调 `emit`，没有 props 控制触发。容器须 `position:relative` 且建议 `overflow-hidden`，否则上浮表情会溢出可视区。
- 表情元素 `pointer-events:none`，不会拦截点击；放在按钮上方安全。
- 暂无其它已知坑。

## 相关
[Alert](../alert/alert.md) · [Banner](../banner/banner.md) · [Toast](../toast/toast.md) · [Notification](../notification/notification.md) · [ServiceMessage](../service-message/service-message.md) · [Result](../result/result.md)
