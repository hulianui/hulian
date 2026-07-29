# InterceptCard 拦截卡

「某个动作被规则挡下了」的完整交代：规则是什么 · 出处在哪 · 违反点在哪 · 该怎么改 · 我要不要放行。

## 什么时候用

- 策略 / 权限拦截的说明与放行
- 风控命中项的人工复核
- 合规检查、审批驳回、告警确认

## 什么时候不用

| 场景 | 用什么 | 为什么 |
|---|---|---|
| 一句话提示 | `Alert` | 无出处、无动作、看完即走 |
| 整页结果态 | `Result` | 占满视野，是页面主体 |
| 表单字段级校验 | `Field` 自带错误态 | 就地反馈，不需要卡片 |

## 用法

```tsx
import { InterceptCard } from "@hulianui/ui";

<InterceptCard
  severity="block"
  title="并行子任务上限"
  message="同一会话最多允许 2 个并行子任务"
  source="团队约定 · 硬约束 4"
  violation="本次为第 3 个子任务"
  suggestion="先让前两个跑完再派"
  onOverride={async (reason) => api.override(id, reason)}
/>
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `severity` | `"block" \| "confirm" \| "notice"` | — | 拦截强度 |
| `title` | `ReactNode` | — | 规则名或事由 |
| `message` | `ReactNode` | — | 规则原文或说明 |
| `source` | `ReactNode` | — | 溯源。强烈建议给 |
| `violation` | `ReactNode` | — | 具体违反了什么（等宽渲染） |
| `suggestion` | `ReactNode` | — | 建议的合规改法 |
| `onOverride` | `(reason: string) => void \| Promise<void>` | — | 给了才渲染放行入口 |
| `overrideLabel` | `ReactNode` | `"放行本次"` | 放行按钮文案 |
| `overridePlaceholder` | `string` | 见默认值 | 理由输入占位符 |
| `overridden` | `{ reason, at? }` | — | 已放行，展示既有理由 |

## 设计取舍

**溯源是一等公民。** 一条说不清出处的拦截，用户第一反应是关掉它而不是遵守它。`source` 虽是可选，但缺了它这个组件就失去大半价值。

**放行理由必填，且由组件强制。** 理由为空时确认按钮禁用，`onOverride` 根本不会被调用。这是刻意的硬约束——一次没写理由的放行，半年后没人记得当时为什么放行，那等于没有治理。

**左缘色条是严重度的唯一视觉锚点。** 不给整卡染色：拦截卡常成列出现，整卡染色会让列表糊成一片色块，反而失去分级作用。

**放行是两步的。** 点「放行本次」先展开理由输入，不直接生效。破坏性动作不该一击即中。
