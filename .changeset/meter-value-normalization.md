---
"@hulianui/ui": patch
---

修 #108：Meter 的数值文案不再把原始 `value` 当百分比

指示条宽度一直是按 `(value - min) / (max - min)` 算的（对的），但 `showValue` 印出来的文字和 `aria-valuetext` 走的是 Base UI 的默认实现 —— 那是**原始 value 直接拼 `%`**。于是 `max ≠ 100` 时，同一个组件里的条和字互相矛盾：

```tsx
<Meter value={1041} max={1324} label="已挂教材章节" showValue />
// 条形 78.6%，屏幕上却印着「1,041%」，aria-valuetext="1041%"
```

`max` 存在的意义恰恰是「不是 100 分制」，所以 `showValue` 此前只在 `max === 100` 时是对的。`aria-valuetext` 尤其严重：`MeterProps` 不透传原生属性，可见文字还能靠自己算好塞进 `label` 规避，读屏念的那句消费方**没有任何办法修正**。

- 文案改由组件统一算：归一化到 0–100 后渲染，与指示条同口径，最多保留一位小数（`1041/1324` → `78.6%`，`50/200` → `25%`）
- 通过 `getAriaValueText` 让 `aria-valuetext` 用同一句 —— 可见与可听不允许有两套说法
- `aria-valuenow` / `aria-valuemin` / `aria-valuemax` 仍如实上报原始值，不受影响
- 越界值只在文案上夹到 0–100%，`aria-valuenow` 照实报（越界该在数据侧解决，组件不替你掩盖）
- `max === min` 不再产生 `NaN`

新增 `formatValue`：

```tsx
<Meter value={1041} max={1324} label="已挂教材章节" showValue
       formatValue={({ value, max }) => `${value} / ${max} 道题`} />
```

返回的字符串同时驱动可见文字与 `aria-valuetext`，两者结构上不可能不一致。`percent` 已归一并夹到 0–100（未取整）一并给到。

文档补了三条此前只能靠读源码才知道的事实：`label` 是给 `role="meter"` 挂无障碍名的**唯一**途径（自绘标题不会被 `aria-labelledby` 关联上）；Base UI 的 Root 末尾固定塞一个 `role="presentation"` 的视觉隐藏 `<span>x</span>`，按整树 `textContent` 断言时会撞上；越界值的处理口径。showcase 补了 `formatValue` 的例子 —— 顺带说明，原有那条「自定义量程」示例的描述写的就是「数值按区间换算占比」，只是组件当时并没有这么做。
