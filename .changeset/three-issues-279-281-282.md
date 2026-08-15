---
"@hulianui/ui": minor
---

图表交互修复与轴口子，Dialog 补关闭键（#279 / #281 / #282）

- **修复（#281）**：笛卡尔图（Area/Bar/Line/Composed）的 `onPointClick` 从不触发 —— recharts 3.x 的 `activeTooltipIndex` 恒为字符串，旧的 `typeof !== "number"` 判据把点击全拦在门外且不报错。现改为安全数值化（`null` / 空串 / Sankey 式 `"children[0]"` 仍被正确挡掉），「tooltip 亮了点下去就一定有回调」的承诺恢复成立。PieChart/RadialChart 走扇区级路径，不受影响。
- **新增（#282）**：值轴 domain 口子。单轴笛卡尔图加 `yAxisDomain`，`ComposedChart` 加 `leftAxisDomain` / `rightAxisDomain`（与 `leftAxisLabel`/`rightAxisLabel` 对称），形如 `[0, 100]`，任一端可写 `"auto"`。百分比右轴（帕累托累计占比、退货率、达成率）锁 `[0, 100]` 满量程后，越界参考线（如 95 线）不再被 recharts 静默丢弃，「82%」也不会画到顶格读成快满。
- **新增（#279）**：`DialogContent` 补 `showClose` / `closeLabel`，形状与默认值都与 `DrawerContent`（#63）对齐 —— **默认 `true`**，右上角渲染可见、可聚焦、读屏可达的关闭按钮；开着时标题/`extra` 行自动让出右上角 40px（`pr-10`），长标题不钻到按钮底下。无障碍名接 ConfigProvider locale 新增的 `dialog.close` 段（zh「关闭」/ en "Close"）。全局搜索框这类自带关闭手段的弹层传 `showClose={false}` 即回到旧观感。
