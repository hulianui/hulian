# @hulianui/ui

## 0.2.0

### Minor Changes

- 54d02ff: DialogContent 新增 `footer` 槽：渲染在正文下方、顶部分隔线 + 右对齐的操作区（取消/确定等），与 `DrawerContent` 的 `footer` API 对齐。补齐二者不一致的缺口。
- 9debc9e: ProTable 升级为浮起卡片表面 + Table 新增 `bordered` prop（mock-pilot dogfood 驱动）：

  - **ProTable**：根容器从「漂在页面底色上的透明描边框」改为完整的浮起卡片——`bg-surface` 表面 + 发丝边 `border-hairline` + `shadow-sm` 阴影 + `p-4`，与 `Card` 同层级。工具栏/表格/分页统一在卡内。全屏态不变。
  - **Table**：新增 `bordered?: boolean`（默认 `true`）。`false` 时去掉表格自身的描边框 + 圆角；ProTable 内层 Table 传 `bordered={false}`，由外层卡片提供外框，避免双框。基础 `Table` 独立使用时仍默认带框，行为不变。

- b8db07a: 表格表头与刷新键打磨（mock-pilot dogfood 驱动）：

  - **Table**：表头文字由 `text-muted` + `font-medium`（灰、中等）改为 `text-foreground` + `font-semibold`（黑/白、加粗），列标题更突出、层级更清晰。
  - **ProTable**：刷新键改为「仅在传入 `onReload` 时才渲染」。原先无论是否提供 `onReload` 都渲染刷新图标，未提供时点击无任何反应（死按钮）。现在无 handler 即不渲染；整条工具栏仍可用 `toolbar={false}` 或逐项 `toolbar={{ reload: false }}` 隐藏。

### Patch Changes

- 14c3b6d: 两处暗色/观感修复（mock-pilot dogfood 驱动）：

  - **Switch**：旋钮由 `bg-surface` 改为恒白 `bg-white`。原 `bg-surface` 在暗色=gray-900，比 off 轨道 gray-800 还暗且与面板同色，导致暗色 off 态整个开关「黑融黑」不可见；白旋钮在灰轨道与蓝轨道、亮暗两态都保证对比。
  - **Table**：虚拟滚动 sticky 表头背景由 `bg-bg` 改为 `bg-surface`，匹配卡片表面而非页面底色。表头保持透明（muted + medium 文字 + 行底分隔线），不加填充灰底——表格本身已是 surface 卡片/带框原语，灰底带反而割裂观感。

## 0.1.2

### Patch Changes

- 新增主题感知的发丝边框令牌 `--color-hairline`（亮色 transparent / 暗色取 border）。有阴影的组件亮色去硬 border、暗色保留发丝轮缘，~34 处 `border-border` → `hairline`。

## 0.1.1

### Patch Changes

- video 组件 SSR 安全：MediaPlayer 加挂载守卫，首帧渲同比例占位、挂载后再渲真播放器，避免 Vidstack 在 SSR/静态导出时摸 `window` 报错。
