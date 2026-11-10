---
slug: sequence-diagram
name: SequenceDiagram
category: data-display
group: collection
tags: []
exports: [SequenceDiagram, layoutSequence, validateSequence, analyzeSequence]
status: enriched
---

# SequenceDiagram

> 按时间顺序画出参与者之间的调用、异步消息、返回和注释 · data-display/collection

## 何时用

讲清楚「一次请求里谁先找谁」：登录、支付回调、审批流转、服务之间的调用链。参与者从左到右排开，消息自上而下。要拖拽编排节点用 [Flow](../flow/flow.md)；只按时间列事件、不分参与者用 [Timeline](../timeline/timeline.md)。

## 导入
```ts
import { SequenceDiagram, validateSequence } from "@hulianui/ui"
import type { SequenceParticipant, SequenceItem } from "@hulianui/ui"
```

## Props

继承 `HTMLAttributes<HTMLElement>`（不含 `title`），连同 `ref` 落在根 `<figure>` 上，它也是横向滚动容器。

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| participants * | `SequenceParticipant[]` | - | 参与者，按数组顺序从左到右 |
| messages * | `SequenceItem[]` | - | 消息与注释，按数组顺序自上而下。顺序就是时间，组件不重排、不看坐标 |
| title | string | 「时序图」 | 整张图的可访问名称 |
| autoNumber | boolean | false | 每条消息前显示序号（注释不编号），读屏也念序号 |
| activeId | string ｜ null | - | 高亮当前这一步（消息或注释的 id），并标 `aria-current="step"` |
| minColumnWidth | number | 160 | 每列最小宽度（px）。容器放不下时图内横向滚动 |

## 数据类型

```ts
interface SequenceParticipant {
  id: string;            // 稳定 id，被消息和注释引用
  label: string;         // 列头名称，也是读屏念的名字
  description?: string;  // 列头第二行
}

interface SequenceMessage {
  type?: "message";      // 可省略
  id: string;            // 稳定 id，activeId 靠它
  from: string;          // 发送方参与者 id
  to: string;            // 接收方参与者 id；与 from 相同即自调用
  label: string;
  kind?: "sync" | "async" | "reply";  // 默认 sync
}

interface SequenceNote {
  type: "note";
  id: string;
  over: string | [string, string];  // 一个 id：贴在这条生命线上；两个 id：横跨这两条生命线
  label: string;
}

type SequenceItem = SequenceMessage | SequenceNote;
```

## 消息语义

| kind | 含义 | 画法 |
|------|------|------|
| `sync` | 同步调用：发送方等着对方处理完 | 实线 + 实心三角箭头 |
| `async` | 异步消息：发出去就不等了（投递、通知、回调） | 实线 + 开口箭头 |
| `reply` | 返回：对之前某次调用的应答 | 虚线 + 开口箭头，文字颜色更淡 |

三种之间首先靠**线型和箭头形状**区分，颜色只是第二通道：同步用 `primary`、异步用 `info`、返回用 `muted-foreground`，注释用 `warning-subtle` 底 + `warning-border` 边，列头顶边用 `primary`。全部是语义令牌，明暗主题和运行时换肤自动跟随；去掉颜色（灰度打印、色弱）照样分得清。箭头指向接收方。

- **自调用**（`from === to`）：画成从自己生命线出发、绕回自己的回环，不是普通的跨列箭头。回环在这一列右半边，文案借用右边一列（最右一列没得借，只有半列宽）。
- **注释**：在时间轴上占自己的一行，位置就是它在数组里的位置。`over: "a"` 时贴在 a 的生命线上、宽度不超过这一列；`over: ["a", "c"]` 时横跨 a 到 c，两端略越过生命线。注释不编号、没有箭头。

## 示例
```tsx
<SequenceDiagram
  title="短信验证码登录"
  participants={[
    { id: "app", label: "小程序" },
    { id: "auth", label: "认证服务" },
    { id: "sms", label: "短信服务" },
  ]}
  messages={[
    { id: "m1", from: "app", to: "auth", label: "请求验证码" },
    { id: "m2", from: "auth", to: "sms", label: "发送短信", kind: "async" },
    { id: "n1", type: "note", over: "auth", label: "同一手机号 60 秒内只发一次" },
    { id: "m3", from: "auth", to: "app", label: "已发送", kind: "reply" },
    { id: "m4", from: "auth", to: "auth", label: "签发令牌" },
  ]}
/>
```

## 动效

只在挂载时播一次，不自动播放：

- 消息和注释按数组顺序依次淡入（每行错开 40ms，第 15 行之后不再往后错）。
- 箭头线从发送方一端伸到接收方，随后箭头头部出现——方向本身就是动画在讲的事。
- `activeId` 变化时，当前一步的高亮底色平滑过渡；若图在横向滚动且这一步不在视野里，图会自己横向滚过去（不动页面的纵向滚动）。
- 系统开启「减弱动态效果」时，以上动画全部不播、滚动瞬时完成。
- 关键帧 `hulian-sequence-in` / `hulian-sequence-draw` 在 `@hulianui/tokens` 的 `preset-core.css` 里。tokens 版本过旧找不到关键帧时，元素直接显示终态，不会卡在透明。

## 无效输入

组件不会把有问题的数据画到错的地方——这些项直接不画，开发环境在控制台告警（每种问题告警一次）：

| 情况 | 处理 |
|------|------|
| 参与者 id 重复 | 第一次出现的成列，后面的不成列（不会多出一条空生命线） |
| 消息 / 注释 id 重复 | 第一条画，后面的不画 |
| `from` / `to` / `over` 引用了不存在的参与者 | 这一条不画；序号跳过它，画出来的序号仍然连续 |

生产环境没有告警。要把问题展示给用户，用 `validateSequence(participants, messages)` 拿到 `SequenceIssue[]`（`{ code, index, id, ref? }`），空数组表示全部可画。`analyzeSequence` 一次返回去重后的参与者、行和问题，`layoutSequence` 只返回行，二者都是纯函数。

没有可画的消息时显示「暂无消息」空态；没有参与者时连列头也不画。

## 窄屏

列宽不低于 `minColumnWidth`，名称和文案按列宽换行、撑高所在的行，**不截断、不缩小字号**；不带空格的长英文和 URL 也会在任意位置断开。列放不下时整张图在自己的区域里横向滚动，页面本身不横向溢出。此时图进入 Tab 顺序（有可见焦点环），聚焦后用方向键左右滚；宽度够、不需要滚动时它不占 Tab 焦点。手机上参与者建议不超过 3 个。

## 无障碍

- 根是带名称的 `<figure>`。参与者是 `<ul>`，消息与注释同在一个 `<ol>` 里，按时间顺序朗读。
- 每条消息先念一段只给读屏看的前缀「小程序 发给 认证服务（同步调用）：」，再念完整文案；自调用念「认证服务 发给自己（同步调用）：」；注释念「注释（认证服务）：」或「注释（小程序 与 短信服务 之间）：」。
- 箭头、生命线、可见序号在 `aria-hidden` 的装饰层里，同一信息不会念两遍。没有任何内容只放在 hover 提示里。
- 前缀文案跟随 `ConfigProvider` 的语言。
- 自动化检查（axe、单测）覆盖了结构和名称；真实读屏器（VoiceOver / NVDA）的朗读体验仍需人工确认。

## 不支持

这是只读图，不包含：拖拽编排、循环 / 条件 / 可选等分组框（alt / loop / opt）、嵌套片段、激活条、消息点选、自动逐条播放（逐步讲解请自己用 `activeId` 驱动）、从文本（如 Mermaid）解析、导出图片。

## 禁忌 / 坑

- 不要靠坐标或时间戳排序——组件只认数组顺序，先排好再传。
- 一条消息跨的列越少，文案可用宽度越窄；很长的说明放进注释或图外。
- 最右一列的自调用文案只有半列宽，必要时调大 `minColumnWidth` 或把那个参与者往左挪。
- 客户端组件：读 `ConfigProvider` 的文案用到了 Context，还会量一次自己是否溢出，不能在 server 组件里当静态件用。

## 相关
[Flow](../flow/flow.md) · [Timeline](../timeline/timeline.md) · [Steps](../steps/steps.md)
