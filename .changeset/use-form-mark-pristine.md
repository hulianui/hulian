---
"@hulianui/ui": minor
---

`useForm` 新增 `markPristine()` 与 `setFieldsValue(values, { markPristine: true })`，修掉异步回填的编辑表单 `isDirty()` 恒为真（#345）。

0.62.0 的「改动过的表单关闭前先确认」对编辑弹窗必然误报：脏基线取的是**首帧**的 `initialValues`，而编辑弹窗的首帧多半只有空壳、详情还在路上，回填一跑完当前值就与空壳全字段不同，从此 `isDirty()` 恒为 `true` —— 用户一个字没改，按 Esc 也会被问「放弃未提交的内容？」。

现在回填时把那批值一并声明为初始态即可：

```tsx
form.setFieldsValue({ title: d.title, type: String(d.type) }, { markPristine: true });
```

值已经由别的途径进去时（逐字段 `setFieldValue`、控件自填默认值）用 `form.markPristine()`。两者不要拆成两步写，中间隔着一轮渲染，那期间的 `isDirty()` 仍会读到「已改动」。

顺带修掉 `resetFields` 的闭包陷阱：它此前锁死在首帧的 `initialValues`（`useCallback` 空依赖 + `eslint-disable`），消费方换了初始值再 reset 会回到旧值，于是「把新数据当 `initialValues` 传进来再 reset」这条路也是堵的。现在它读当前的 `initialValues`。刻意**不**给它加「新初始值」参数：那会把值类型放到参数位置，`FormInstance<具体类型>` 从此不能再赋给 `FormInstance<FormValues>`，编排件的 `form?: FormInstance` 会当场拒收所有带具体值类型的实例。

<!-- changelog-en:start -->
`useForm` gains `markPristine()` and `setFieldsValue(values, { markPristine: true })`, fixing `isDirty()` staying true forever on edit forms filled in asynchronously (#345).

The confirm-before-closing behaviour added in 0.62.0 misfired on every edit dialog. The dirty baseline came from the `initialValues` of the **first render**, and an edit dialog usually renders that frame with an empty shell while the record is still in flight. Once the data landed, every field differed from the shell, `isDirty()` returned true from then on, and pressing Esc without touching anything still asked whether to discard.

Declare the incoming values as the initial state while writing them:

```tsx
form.setFieldsValue({ title: d.title, type: String(d.type) }, { markPristine: true });
```

Use `form.markPristine()` when the values arrive by another route, such as per-field `setFieldValue` calls or defaults written by the controls. Do not split either into two steps, because a render sits in between and `isDirty()` still reads as edited during that window.

This also fixes a closure trap in `resetFields`, which was pinned to the first render's `initialValues` by an empty dependency array. Replacing the initial values and resetting went back to the old ones, which closed off "pass the new data as `initialValues` and reset" as a workaround. It now reads the current `initialValues`. It deliberately takes **no** "next initial values" argument: that would place the value type in an argument position, so `FormInstance<SpecificValues>` could no longer be assigned to `FormInstance<FormValues>`, and the `form?: FormInstance` prop on the dialog components would reject every typed instance.
<!-- changelog-en:end -->
