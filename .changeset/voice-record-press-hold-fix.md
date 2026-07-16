---
"@hulianui/ui": minor
---

feat(voice-record): 新增 VoiceRecord 语音录制组件，并修复「按住说话」在移动端的交互死锁

- 交互改为纯 Pointer Events，移除叠加的 `onTouchStart/onTouchEnd`，消除触屏上 pointer 与 touch 各触发一次导致的双重 start，同时消掉 passive listener 里 `preventDefault` 的告警。
- 新增 `onPointerCancel` 处理：iOS 手势被系统打断时浏览器派发的是 pointercancel 而非 pointerup，此前会导致永远收不到「松手」而死锁在录音态。
- 松手判定改用本地按压 ref，不再依赖父组件异步 `status` prop 的回环，避免快速点按时停止被丢弃。
