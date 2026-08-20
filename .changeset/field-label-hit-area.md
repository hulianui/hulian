---
"@hulianui/ui": patch
---

`Field` 的 label 默认按文字宽收窄（#296）：它是带 `htmlFor` 的真 `<label>`，被 flex 拉满整行后，行尾那片看不见的空白照样把点击转发给控件 —— 对 `Select` / `DatePicker` 这类浮层控件表现为「点了下拉框上方的空处，浮层凭空弹开」。需要满宽 label 时传 `labelClassName="w-full"` 顶掉。
