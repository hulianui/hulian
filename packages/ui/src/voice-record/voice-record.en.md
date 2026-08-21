---
slug: voice-record
name: VoiceRecord
category: forms
group: advanced
tags: []
exports: [VoiceRecord]
status: enriched
---

> Voice recording trigger: circular record button with a pulsing halo and waveform animation

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
| onToggle | `(status) => void` | - | Called from idle or recording with the current status. |
| levels | `number[]` | `[]` | Waveform levels from 0-1; an empty array hides the waveform. |
| size | `"sm" \| "md" \| "lg"` | `"md"` | Button size. |
| labelIdle | `string` | `"\u6309\u4f4f\u8bf4\u8bdd"` | Idle-state label; the built-in Chinese copy means “Hold to speak.” |
| labelRecording | `string` | `"\u677e\u5f00\u7ed3\u675f"` | Recording-state label; the built-in Chinese copy means “Release to finish.” |
| labelProcessing | `string` | `"\u5904\u7406\u4e2d\u2026"` | Processing-state label; the built-in Chinese copy means “Processing…”. |
| pressAndHold | `boolean` | `false` | Press-and-hold mode: press to start and release to stop, driving `onPress` / `onRelease`. When false the button toggles on click and drives `onToggle`. Release, pointer-leave, and the `pointercancel` iOS fires when the system interrupts a gesture all end the recording, so a hold can never get stuck. |
| onPress | `() => void` | - | Fires when an idle button is pressed (only while `pressAndHold` is true). |
| onRelease | `() => void` | - | Fires when a recording button is released (only while `pressAndHold` is true). |

## Examples

```tsx
<VoiceRecord
  status={phase === "recording" ? "recording" : phase === "processing" ? "processing" : "idle"}
  levels={audioLevels}
  onToggle={(s) => s === "idle" ? onStart() : onStop()}
/>
```
