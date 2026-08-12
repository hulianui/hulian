---
"@hulianui/ui": minor
---

`Upload` 三条来自消费方的缺口：接上原生表单提交（#234）、失败行补重试入口（#242）、落区补尺寸档（#243）。三条都是「不传新 prop 时渲染结果与上一版逐字相同」。

**原生 `<form>` + `FormData` 这条路（#234）。** 此前 `Upload` 只把文件回调给 JS：内层 `<input type="file">` 没有 `name`，被 `aria-hidden` + `tabIndex={-1}` 藏起来，`onChange` 里还**无条件**清 `value`。三件事合起来的结果是「原生表单」这条路整条接不住 —— 没有 `name` 的 input 压根不出现在 `FormData` 的 entries 里，`required` 也不会被浏览器校验，而这两件事都不会报错，只是静默不发生。消费仓的读数是 5 个上传弹窗全部卡在这条上，因此自留了一份渲染真实 input 的 `file-upload.tsx`：迁到瑚琏不是「换个组件」，是把 5 个表单改写成 state + 手拼 FormData，并丢掉原生 `required`。

现在 `name` / `required` / `inputRef` / `resetInputAfterSelect` 四个 prop 一起把这条路补全。**`name` 是这条路的开关**，挂上它同时改三处默认行为（都只在有 name 时发生，因此对既有调用点是零影响）：

1. 选完不再清 `value` —— 清了 FormData 就永远读到空控件。代价是「同一个文件连选两次不再触发 `onSelect`」，这是原生行为，想要哪一侧由 `resetInputAfterSelect` 显式决定，**二者不可兼得**（这也是为什么它是一个 prop 而不是内部聪明判断）。
2. 拖入的文件写回 `input.files` —— 原生拖放不会自己进去，消费方自留组件里那段 `DataTransfer` 就是在补这个。顺带把被 `accept` / `maxSize` / `limit` 拒掉的文件从 `input.files` 里剔出去：不剔的话就是「界面说拒了、表单照样提交」。写回依赖 `DataTransfer` 构造器，环境没有（jsdom）就静默跳过，`onSelect` 那条路不受影响。
3. 达到 `limit` 时 input **不**跟着禁用 —— 禁用控件会被 `FormData` 整个跳过，已选中的文件会在提交时凭空消失。触发器那侧照旧 blocked，选择框仍然点不开。

`aria-hidden` 也只在有 `name` 时撤掉：挂了 name 它就是这个表单里真实存在、会被提交、会被浏览器校验的控件，对辅助技术藏起来会让 `required` 拦下提交时无从解释；同时按 `label` / `buttonLabel`（非字符串则回落 locale）给它一个无障碍名。`tabIndex={-1}` 保留 —— 落区本身已经是 Tab 停靠点，再多一个指向同一动作的停靠点是退步。

**失败行的重试入口（#242）。** `useUpload` 从一开始就返回 `retry`，但 `upload.tsx` 全文 0 处引用 —— 能力做好了没接线，用户遇到网络抖动只能「移除该行 → 重新选一遍整个文件」，而网络抖动是最常见的失败原因。现在失败行（`status="error"`）右侧渲染重试按钮，文案走 locale（新增 `upload.retry`）。

按钮**要传 `onRetry` 才渲染**，与 `onRemove` 同口径，而不是内部直接调 `useUpload.retry`：`<Upload>` 是纯皮肤，它根本不认识传输层（受控用法下压根没有 `useUpload`），而「这个失败该不该给重试入口」也确实是消费方的决定 —— 比如已经换用别的补救路径时不该出现它。接法就是 `onRetry={up.retry}`。

**落区尺寸档 `size`（#243）。** 此前只有形态没有尺寸，落区高度写死。同一个应用里「页面主入口的大落区」与「弹窗里挤在其它字段之间的小落区」是两档真实需求，迁过来只能在每个调用处写 `className="h-44"` —— 那正是文档反对的「用覆盖去撤销组件刚加的东西」。现在 `size?: "sm" | "md" | "lg"`，与库内其它件同一口径；`md` 的内边距、图标尺寸、文案字号与上一版逐字相同，button 形态三档与 `<Button>` 的同名档等高（`h-8` / `h-10` / `h-12`）。
