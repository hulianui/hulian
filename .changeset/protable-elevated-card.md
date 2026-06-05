---
"@hulianui/ui": minor
---

ProTable 升级为浮起卡片表面 + Table 新增 `bordered` prop（mock-pilot dogfood 驱动）：

- **ProTable**：根容器从「漂在页面底色上的透明描边框」改为完整的浮起卡片——`bg-surface` 表面 + 发丝边 `border-hairline` + `shadow-sm` 阴影 + `p-4`，与 `Card` 同层级。工具栏/表格/分页统一在卡内。全屏态不变。
- **Table**：新增 `bordered?: boolean`（默认 `true`）。`false` 时去掉表格自身的描边框 + 圆角；ProTable 内层 Table 传 `bordered={false}`，由外层卡片提供外框，避免双框。基础 `Table` 独立使用时仍默认带框，行为不变。
