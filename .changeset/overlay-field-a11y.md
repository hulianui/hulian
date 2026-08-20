---
"@hulianui/ui": minor
---

浮层型控件接上 Field 的 a11y 链（#293 / #294）：`Cascader` / `RegionCascader` / `TreeSelect` / `DatePicker` / `DateTimePicker` / `DateRangePicker` 的触发器改为 `role="combobox"`，并接入 Base UI 的 Field 控件上下文 —— label 的 `htmlFor`、`aria-labelledby`、`aria-describedby`、`invalid`、`disabled` 这才真正串到触发器上（此前 label 指向一个不存在的 id，读屏念不出字段名）；这六个组件连同 `RemoteSelect` / `CountrySelect` 也把未列出的原生属性透传到那个可聚焦元素，`<Field required>` 注入的 `aria-required` 不再被静默吃掉。`Upload` 的必填改用 sr-only 说明表达（落区是 `role="button"`，`aria-required` 在该 role 上无效）。**测试里按角色取这些触发器要从 `getByRole("button")` 改成 `getByRole("combobox")`。**
