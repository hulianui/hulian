---
"@hulianui/ui": patch
---

MarkdownEditor：tiptap-markdown 0.8.x 类型绑 @tiptap/core v2，源码分发下消费方 tsc 报 Extension 与 AnyExtension 不匹配（vite 构建不受影响）——extensions 处显式收口为 AnyExtension，消费方 tsc 恢复干净。
