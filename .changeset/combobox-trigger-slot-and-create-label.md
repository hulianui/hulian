---
"@hulianui/ui": minor
---

`Combobox` 三条：`ComboboxTrigger` 开内容槽、图4 范式下不再预填搜索框、创建项文案可单点覆盖

**`ComboboxTrigger` 收 `children`（#257）。** 此前触发钮的内容写死是「已选 label ?? placeholder」，类型上还显式 `Omit` 掉了 `children`——于是它**无法退化成一枚状态图标**，而那是表格窄单元格里唯一放得下的形态：格子里已经有一个字段在显示这个名字了，触发钮再显示一遍，同一个值出现两遍，看起来像两个字段。`placeholder` 顶不了这件事（只接字符串，且只在未选中时出现，一选中就掉回显示名字），把 `label` 造成图标节点会让弹层列表也变成一排图标。现在传节点即固定内容，传函数即按已选值分叉（`已绑定 / 未绑定` 换两个图标是最常见的形态）；同时补 `showChevron`，口径与 `ComboboxInput` 的同名 prop 一致——一枚图标旁边挂个 chevron 就又占回了宽度，而省宽度正是走这条路的理由。不传 `children` = 原行为。

**`creatable` 在「触发钮 + 弹层内搜索」范式下不再把搜索框预填成已选 label（#258）。** `creatable` 会注入一个 `defaultInputValue` 用来接管输入串（防第一个字符被 Base UI 的 items 同步抹掉），值取的是选中项的 label。在内联 `ComboboxInput` 下这是对的——输入框自己就是字段；但配 `ComboboxTrigger` 时，被预填的是**弹层里的搜索框**：首次打开时里面已经躺着已选项的全名，用户打的字直接追加在后面，创建项跟着变成拼接串，选下去就落库。而且只有首次会踩（选过一次之后查询被更新，二次打开就空了），是最容易漏测的那一类。现在按范式取值：内联取 label，图4 范式取空串。

范式靠扫 `children` 里有没有 `ComboboxTrigger` 认出来——不能让 Trigger 往 context 里注册，因为 `defaultInputValue` 在 Root 挂载那一刻就被消费掉、而子节点是之后才渲染的，注册永远晚一步。Trigger 被消费方自己的包装组件裹起来时认不出，那种情况回落到内联档的行为（即改动前的现状，不是新引入的坑），显式传 `defaultInputValue=""` 即可。

**`createLabel`（#259）。** 创建项那一行的文案此前只认全局 locale 的 `combobox.create`，同一个应用里两个 `creatable` 想说不同的话，只能嵌一层 `ConfigProvider` 覆盖全局那份（而且覆盖时要把整个 `combobox` 段 spread 一遍才不丢 `clear` / `remove`）。现在挂在 `Combobox` 上单点可覆盖，不传就回落 locale，口径与 `emptyMessage` 一致。
