---
"@hulianui/ui": minor
---

feat(table): 首次加载时半透明遮罩底下透出「暂无数据」，转圈与空态同时各说各话；现在 Table 新增 `loading` / `loadingRows`，一行都没有时改渲染骨架行并压住空态，ProTable 首轮也随之只出骨架不出遮罩，已有数据的刷新/翻页仍保留原来的遮罩语义 (#349)
