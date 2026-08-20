---
"@hulianui/mcp": patch
---

`get_component_doc` 取 `props` 时把 Events 一并给出（#298）：此前只有 Slots 享受这个待遇，Events 会被 `sections` 过滤掉 —— 查 `Tag` 的 props 看不到 `onClose`，而那是它**唯一**的交互能力，照着查到的信息写出来的是一个裸 `<button>`，正好撞上「界面禁止裸 HTML 元素」的门禁。markdown 与 `format:"json"` 两条路径都已修；json 路径下 events 同时并进 `props` 数组（带 `kind:"event"`，函数签名仍在 `type` 里），遍历 props 生成校验/属性面板的工具链也不会再漏掉交互入口。反向的窄查询（单独要 `events`）行为不变。
