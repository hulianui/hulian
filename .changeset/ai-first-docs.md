---
"@hulianui/ui": minor
---

AI-first 组件文档体系 + Vant 式 examples API + 12 组件 bug 修复

- 新增 `ExampleSpec` 类型与 `ShowcaseSpec.examples` 字段：Vant 式「用法」场景（标题 + 说明 + 可复制代码 + 活预览）。
- 353 组件逐件使用文档（`<slug>.md`），API 表按 Props / Events / Slots 拆分；产出 `llms.txt` / `llms-full.txt` / `registry.json` 供 AI 消费。
- 修 Markdown 表格 GFM 转义管道解析（`\|` 与代码段内裸管道不再劈列）。
- 修 12 个组件 bug（含 conversation 自动贴底打断上滚、message-actions/lanyard 卸载未清理、true-focus/gantt 越界、cubes 背面重叠等），10 个附单测。
