---
"@hulianui/ui": minor
---

Toast 语调补齐五档：`ToastTone` 由 `info | danger | neutral` 扩到 `neutral | info | success | warning | danger`，与 Alert / Tag 对齐。

`success` / `warning` 复用 tokens 里早已存在的 `--color-success` / `--color-warning`（此前类型注释所述「token 无」与事实不符），左边条与标题着色随之补 `border-l-success` / `text-success` 与 `border-l-warning` / `text-warning`。消费端不必再把成功态降级成 `info`、警告态降级成 `neutral`。

`priority` 维持现状：仅 `danger` 走 `high`（assertive 打断播报），`warning` 与其余 tone 一样是 polite。纯新增，无破坏性变更。
