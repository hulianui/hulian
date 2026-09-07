---
"@hulianui/ui": minor
---

feat(form-dialog): 此前 ModalForm / DrawerForm 的关闭守门只认 `form.isDirty()`，弹窗里自持 state 的复合控件（区划级联、权限勾选组、标签编辑器）改了照样不问就关；现在可传 `hasExternalChanges` 回调，在真要关的那一刻与 `form.isDirty()` 取或求值，不传则行为不变 (#351)
