---
"@hulianui/ui": patch
---

fix(pro-table): 受控行选择（传了 `rowSelection` + `onRowSelectionChange`）下 `clearSelection` 是空操作——它写死了清内部 state，而受控模式渲染读的是传进来的那份，于是批量条不消失、行仍是选中态、消费方 state 不变，按钮却在、能点、有 hover 态，和 #202 一样安静。三条出口是同一个函数，此前一起失效：批量条里内置的「清空」、`batchActions` ctx 给的 `clearSelection`、`actionRef.clearSelection()`。现在跟着 `setSelection` 分流（受控走 `onRowSelectionChange`，非受控仍清内部 state）。顺带把 `actionRef` 的实现体改走 ref：句柄此前只在 `managed` 变化时重建，闭包里的 `onReload` / `onRowSelectionChange` 定格在首次渲染那一份，而这两个 prop 写成内联箭头是常态——命令式那条路会调到旧回调，修完分流之后这一点尤其要命 (#356)
