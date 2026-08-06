---
"@hulianui/ui": minor
---

修 #98：日期时间族 5 个组件补 `size`（**视觉 breaking**）

`DatePicker` / `TimePicker` / `DateTimePicker` / `DateRangePicker` / `TimeField` 的触发器高度过去全部硬编码 `h-9`(36px)，且**五个都没有 `size` prop** —— 与 `Input`(40px) 并排就是既有错位，而消费方连打补丁的口子都没有，只能往 `className` 里塞 `h-10`（这又违反「组件缺能力回库补组件」的约定）。

现在五个统一走 cva，刻度与 `Input` 完全一致（`sm` h-8 / `md` h-10 / `lg` h-12，默认 `md`），触发器内的图标尺寸随档位走。**升级后这五个组件的默认高度从 36px 变成 40px** —— 这正是要修的错位，需要 36px 的没有等价档位，请按语境改用 `size="sm"`(32) 或保持 `md`(40)。

`DateRangePicker` 面板内那处 `h-9` 是月份网格里包住日按钮的格子，与触发器无关，刻意不动。

与 #97（Button 的 `icon` 档）同源：库里存在一批游离于 32/40/48 刻度之外的 36px。两条一起清完，36px 这个孤立档就从表单层面消失了。
