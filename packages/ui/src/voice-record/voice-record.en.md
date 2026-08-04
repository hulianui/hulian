---
slug: voice-record
name: VoiceRecord
category: forms
group: advanced
tags: []
exports: [VoiceRecord]
status: enriched
---

> Voice recording trigger — circular record button with a pulsing halo and waveform animation

# VoiceRecord

Voice recording trigger whose `status` drives its visual feedback.

## States

| Status | Effect | Click behavior |
|--------|------|---------|
| idle | Default microphone icon | Calls `onToggle` to start recording. |
| recording | Pulsing halo, waveform, and compact danger button | Calls `onToggle` to stop. |
| processing | Spinner | No response. |
| disabled | Muted and noninteractive | No response. |

## Props

| Prop | Type | Default | Description |
|------|------|------|------|
| status | `"idle" \| "recording" \| "processing" \| "disabled"` | `"idle"` | Current status |
| onToggle | `(status) => void` | — | Called from idle or recording with the current status. |
| levels | `number[]` | `[]` | Waveform levels from 0–1; an empty array hides the waveform. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Button size. |
| labelIdle | `string` | `"\u6309\u4f4f\u8bf4\u8bdd"` | Idle-state label; the built-in Chinese copy means “Hold to speak.” |
| labelRecording | `string` | `"\u677e\u5f00\u7ed3\u675f"` | Recording-state label; the built-in Chinese copy means “Release to finish.” |
| labelProcessing | `string` | `"\u5904\u7406\u4e2d\u2026"` | Processing-state label; the built-in Chinese copy means “Processing…”. |

## Examples

```tsx
<VoiceRecord
  status={phase === "recording" ? "recording" : phase === "processing" ? "processing" : "idle"}
  levels={audioLevels}
  onToggle={(s) => s === "idle" ? onStart() : onStop()}
/>
```
