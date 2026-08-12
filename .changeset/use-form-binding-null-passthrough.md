---
"@hulianui/ui": minor
---

`useForm` 的 `register().value` 不再把 `null` 归一成空串，`Input` / `Textarea` 把 `null` 当空串收住，`NumberField` 对签名外的值按空处理（#220）。

报告方最初把账记在 `NumberField` 头上（受控 `value={null}` 渲染成 `0`），我们在两个 Base UI 版本上各写探针跑了一遍都没复现——`value={null}`、`5 → null`、叠 `min`/`max`、`defaultValue={null}` 四种走法输出都是空串。追问后对方隔离了变量，根因浮出来在**上一层**：

```
form.values.viaForm:   null   (object)
register().value:      ""     (string)   ← 这里
传给 NumberField 的值:  ""
```

`register()` 里写的是 `values[name] ?? ""`。于是同一次渲染里 `form.values[name]` 是 `null`、binding 却给出 `""`，两处口径对不上；消费方在外面补 `?? null` 也兜不住（`??` 只对 `null` / `undefined` 生效，空串直接穿透），控件最终收到签名外的 `""`，被渲染成 `0`。

**为什么这是个真缺陷而不是用法问题**：拿 binding 驱动受控控件是文档推荐用法，而 `null` 是「显式清空 / 留空」这个**业务值**——与 `0`、`""` 一样是用户选出来的一档，不是「没值」。三态字段（`null` 沿用上级 / `0` 显式为零 / 正整数覆盖）在这条路上必然丢掉 `null` 这一档，而 `null` 与 `0` 恰是两个相反的业务结论。它也不限于数字输入：任何想区分「没填」与「填了空」的字段都会中招。

三处改动，各自守着不同的一段：

- **`useForm`（主因）**：`value` 原样反映 `form.values[name]`，只有 `undefined` 仍归一成 `""`——那是「这个字段没有初始值」，把 `undefined` 交给受控控件会被 React 当成非受控，第一次输入就是「非受控 → 受控」的告警。`null` 穿透。
- **`Input` / `Textarea`**：`value` 类型放开到收 `null`，渲染时折成空串。原生 `<input value={null}>` 会被 React 判成非受控并打告警，而文档推荐的绑法（`value={f.value as string}`）正是把 binding 直接交给这两个组件，所以由组件收口。只映射 `null`，`undefined` 仍是非受控。
- **`NumberField`（次因）**：`value` 不是 `number` 也不是 `null` 时按空处理，并在开发期 `warnOnce` 点名来源。主因修掉后这条路走不到，但受控值常常来自类型擦除的路径（`register().value` 是 `unknown`、接口回填是 `any`），而落成 `0` 在三态字段里是最坏的结果——`0` 与「留空」在界面上分不出来。`undefined` 不在其列（那是非受控）。

**升级注意**：如果你的代码依赖了「binding 把 `null` 变成 `""`」（例如直接把 `register().value` 展开到**原生** `<input>` 上），现在会拿到 `null` 并看到 React 的 "value prop should not be null" 告警——自己写 `value={v ?? ""}`，或改用瑚琏的 `Input` / `Textarea`（已收口）。库内唯一用到 `register()` 的 `LoginForm` 两个字段初始值都是字符串，不受影响。
