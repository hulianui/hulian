---
slug: voice-record
name: VoiceRecord
category: forms
group: 高级录入
tags: []
exports: [VoiceRecord]
status: enriched
---

> 语音录制触发器 — 带光环脉动 + 波形动画的圆形录音按钮

# VoiceRecord

语音录制触发器，通过 `status` 驱动视觉反馈。

## 状态

| status | 效果 | 点击行为 |
|--------|------|---------|
| idle | 默认 mic 图标 | 触发 onToggle → 开始录音 |
| recording | 脉动光环 + 波形条 + 按钮缩小红色 | 触发 onToggle → 停止 |
| processing | 旋转加载态 | 无点击响应 |
| disabled | 灰色不可交互 | 无 |

## Props

| Prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| status | `"idle" \| "recording" \| "processing" \| "disabled"` | `"idle"` | 当前状态 |
| onToggle | `(status) => void` | — | 状态切换回调 |
| levels | `number[]` | `[]` | 波形级别(0-1)；空数组=无波形 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 按钮尺寸 |
| labelIdle | `string` | `"按住说话"` | idle 态文案 |
| labelRecording | `string` | `"松开结束"` | recording 态文案 |
| labelProcessing | `string` | `"处理中…"` | processing 态文案 |

## 用法

```tsx
<VoiceRecord
  status={phase === "recording" ? "recording" : phase === "processing" ? "processing" : "idle"}
  levels={audioLevels}
  onToggle={(s) => s === "idle" ? onStart() : onStop()}
/>
```
