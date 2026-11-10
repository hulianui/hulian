---
slug: sequence-diagram
name: SequenceDiagram
category: data-display
group: collection
tags: []
exports: [SequenceDiagram, layoutSequence]
status: enriched
---

# SequenceDiagram

> 按时间顺序画出参与者之间的调用、异步消息和返回 · data-display/collection

## 何时用

讲清楚「一次请求里谁先找谁」：登录、支付回调、审批流转、服务之间的调用链。参与者从左到右排开，消息自上而下。要拖拽编排节点用 [Flow](../flow/flow.md)；只按时间列事件、不分参与者用 [Timeline](../timeline/timeline.md)。

## 导入
```ts
import { SequenceDiagram, layoutSequence } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLElement>`（不含 `title`），落在根 `<figure>` 上。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| participants * | `SequenceParticipant[]` | - | 参与者，`{ id, label, description? }`，按数组顺序从左到右 |
| messages * | `SequenceMessage[]` | - | 消息，`{ id, from, to, label, kind? }`，按数组顺序自上而下。`from === to` 画成自调用回环 |
| title | string | 「时序图」 | 整张图的可访问名称 |
| autoNumber | boolean | false | 每条消息前显示序号，读屏也念序号 |
| activeId | string ｜ null | - | 高亮当前这一步，并标 `aria-current="step"` |
| minColumnWidth | number | 160 | 每列最小宽度（px）。容器放不下时横向滚动 |

`kind` 取值：`sync`（默认，实线实心箭头）、`async`（实线开口箭头）、`reply`（虚线开口箭头，颜色更淡）。

## 示例
```tsx
<SequenceDiagram
  title="手机号登录"
  participants={[
    { id: "app", label: "小程序" },
    { id: "auth", label: "认证服务" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "提交验证码" },
    { id: "m2", from: "auth", to: "auth", label: "签发令牌" },
    { id: "m3", from: "auth", to: "app", label: "登录成功", kind: "reply" },
  ]}
/>
```

## 无障碍

根是带名称的 `<figure>`。参与者是一个 `<ul>`，消息是一个 `<ol>`。每条消息先念一段只给读屏看的前缀「小程序 发给 认证服务（同步调用）：」，再念文案；自调用念「认证服务 发给自己（同步调用）：」。箭头和生命线都在 `aria-hidden` 的装饰层里。前缀文案跟随 `ConfigProvider` 的语言。

## 禁忌 / 坑

- 只读首片：没有标注（note）、分组框（alt / loop）、激活条，也不能点选或拖动消息。
- `from` / `to` 引用了不存在的参与者 id，这条消息不画，序号会跳过它保持连续。参与者 id 重复时只认第一次出现的那一列。
- 文案按列宽换行，不截断。一条消息跨的列越少，可用宽度越窄；很长的说明放到图外面写。
- 自调用的回环画在该列右半边，文案借用右边一列。最右一列没有可借的列，文案只剩半列宽，必要时调大 `minColumnWidth`。
- 列多时整张图横向滚动，不会把列压到比 `minColumnWidth` 更窄。手机上参与者建议不超过 3 个。
- 客户端组件：读 `ConfigProvider` 的文案用到了 Context，不能在 server 组件里直接当静态件用。

## 相关
[Flow](../flow/flow.md) · [Timeline](../timeline/timeline.md) · [Steps](../steps/steps.md)
