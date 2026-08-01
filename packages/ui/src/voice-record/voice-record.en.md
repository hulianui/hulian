---
slug: voice-record
name: VoiceRecord
category: forms
group: advanced
tags: []
exports: [VoiceRecord]
status: enriched
---

> Voice recording trigger · circular button + pulsing halo + waveform feedback · forms/advanced

# VoiceRecord

## When to use

Use VoiceRecord as the press-to-record control in voice messages, notes, or transcription flows. The consumer owns microphone permission, capture, upload, and transcription; `status` drives only the interaction and visual feedback.

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
| labelIdle | `string` | `"Hold to speak"` | Idle-state label. |
| labelRecording | `string` | `"Release to finish"` | Recording-state label. |
| labelProcessing | `string` | `"Processing…"` | Processing-state label. |

## Example

```tsx
<VoiceRecord
  status={phase === "recording" ? "recording" : phase === "processing" ? "processing" : "idle"}
  levels={audioLevels}
  onToggle={(s) => s === "idle" ? onStart() : onStop()}
/>
```

## Usage guidelines

- VoiceRecord does not access `MediaRecorder` or request microphone permission. Start and stop capture in `onToggle`, then write the resulting `status` back.
- Normalize `levels` to 0–1. Values outside that range may produce misleading waveform heights.
- The processing and disabled states do not call `onToggle`; provide a separate cancel action if processing must be interruptible.
