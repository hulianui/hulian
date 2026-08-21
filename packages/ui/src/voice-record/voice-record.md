---
slug: voice-record
name: VoiceRecord
category: forms
group: advanced
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
| onToggle | `(status) => void` | - | 状态切换回调 |
| levels | `number[]` | `[]` | 波形级别(0-1)；空数组=无波形 |
| size | `"sm" \| "md" \| "lg"` | `"md"` | 按钮尺寸 |
| labelIdle | `string` | `"按住说话"` | idle 态文案 |
| labelRecording | `string` | `"松开结束"` | recording 态文案 |
| labelProcessing | `string` | `"处理中…"` | processing 态文案 |
| pressAndHold | `boolean` | `false` | 按住说话模式（GPT-Live 风格）：按下开始、松开结束，走 `onPress` / `onRelease`；`false` 时是点击切换，走 `onToggle`。松手、指针移出、以及 iOS 上手势被系统打断派发的 `pointercancel`，三条路径都会走 `onRelease`——少接一条就会卡在录音态下不来 |
| onPress | `() => void` | - | idle 态按下回调（仅 `pressAndHold` 为真时） |
| onRelease | `() => void` | - | recording 态松开回调（仅 `pressAndHold` 为真时） |

## 用法

```tsx
<VoiceRecord
  status={phase === "recording" ? "recording" : phase === "processing" ? "processing" : "idle"}
  levels={audioLevels}
  onToggle={(s) => s === "idle" ? onStart() : onStop()}
/>
```
