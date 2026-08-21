---
"@hulianui/ui": patch
---

VoiceRecord 文档补上 `pressAndHold` 的收尾契约：松手、指针移出、以及 iOS 上手势被系统打断派发的 `pointercancel`，三条路径都会走 `onRelease`（#302）。

行为一直是这样的，只是过去只写在组件源码的注释里。这条对消费方是硬信息——少接一条路径就会卡在录音态下不来，而组件 md 随包发布、MCP `get_component_doc` 直读本地 `node_modules` 里的这份，写不进去等于 AI 消费方看不见。

同批把文档站 `apps/www/lib/manifest.ts` 的 391 条中文组件描述从实现备忘体改写成一句人话，那部分不发布，故不在本包变更内。
