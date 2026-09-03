---
"@hulianui/ui": minor
---

`ModalForm` / `DrawerForm` 点遮罩不再关闭，改动过的表单关闭前先确认（#343）。`useForm` 新增 `isDirty()`。

原来点一下遮罩就把填了一半的表单清空，没有任何确认，消费方也没有旋钮可关。编排件与裸 `Dialog` / `Drawer` 的区别正在于它知道自己装着一张表单：随手点外面关掉的便利，和丢掉八个已填字段的代价完全不成比例。所以这两个编排件的默认值与原语刻意相反 —— `dismissible` 默认 `false`。

退路仍在，只是加了一道确认：Esc 与右上角关闭键在表单被改动过时先问一句「放弃未提交的内容？」。三种情况不打扰 - 没传 `form`（无从判断脏净）、表单一字未改、提交成功后的那次关闭。确认框由编排件自己渲染（`AlertDialog`），**不要求消费方挂 `ModalProvider`**：命令式 `modal.confirm` 在没挂 Provider 的应用里什么都不显示，而关闭此时已被拦下，那会变成「窗关不掉又没有提示」的死局。

新增 `dismissible` / `confirmOnClose` / `discardTitle` / `discardDescription` 四个旋钮，`onOpenChange` 补上第二个参数透出 Base UI 的事件详情（`details.reason` 区分点遮罩 / Esc / 关闭键，`details.cancel()` 可自行否决）。原来写 `(open) => …` 的消费方不受影响。

配套 `useForm` 新增 `isDirty()`：当前值与 `initialValues` 逐字段比**值**（多选是数组、级联是对象，每次 onChange 都是新引用，比引用会让「改了又改回来」也算脏）。离开页面拦截、无改动时置灰提交键同样用得上。

<!-- changelog-en:start -->
`ModalForm` and `DrawerForm` no longer close on a backdrop press, and an edited form asks before closing (#343). `useForm` gains `isDirty()`.

A single stray click on the backdrop used to wipe out a half-filled form with no confirmation, and consumers had no prop to turn that off. What separates these components from a bare `Dialog` or `Drawer` is that they know they hold a form: the convenience of dismissing by clicking outside is nowhere near worth losing eight filled fields. Their default is therefore the opposite of the primitives, with `dismissible` defaulting to `false`.

The exits remain, with one confirmation added: Esc and the top-right close button first ask whether to discard whenever the form has been edited. Three cases never interrupt: no `form` was passed, so dirtiness cannot be judged; the form is untouched; and the close that follows a successful submit. The confirmation renders from inside the component through `AlertDialog`, so it **does not require a `ModalProvider`**. The imperative `modal.confirm` shows nothing in an app that never mounted the provider, and the close has already been intercepted by then, which would leave a dialog that neither closes nor explains itself.

Four new props arrive: `dismissible`, `confirmOnClose`, `discardTitle` and `discardDescription`. `onOpenChange` gains a second argument carrying the Base UI event details, where `reason` separates a backdrop press from Esc and the close button, and `cancel()` lets you veto the change yourself. Consumers written as `(open) => …` are unaffected.

`useForm` gains `isDirty()` to support it, comparing current values against `initialValues` field by field **by value**. Multi-select fields are arrays and cascading fields are objects, so every change produces a fresh reference, and comparing references would report an edit that was undone as still dirty. Navigation guards and disabling submit while nothing changed can use it too.
<!-- changelog-en:end -->
