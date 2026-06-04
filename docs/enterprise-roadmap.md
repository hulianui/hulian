# 瑚琏 UI · 企业中后台能力 Roadmap

> 场景假设：第一落地场景 = **企业内部管理系统（中后台 admin）**。
> 本文档记录「能不能用这个库搭出一套企业管理系统」的能力缺口与优先级。
> 维护：随能力补齐，把已完成项移到「已交付」并更新日期。

## 判断基线

原子组件层已基本对标 Ant Design 全集（143+ 组件 / 8 大类）。
**真正的缺口不在原子件，而在「中后台解决方案层」**——把原子件预编排好的区块、应用骨架、基础设施。
企业 admin 开发 80% 的时间花在「列表页」和「表单/详情页」，二者都依赖 Pro 区块层。

---

## ✅ 本轮已交付（2026-06-03）

| 组件 | 层 | 说明 |
|------|----|------|
| **Tag** 状态标签 | 原子补缺 | 5 语气状态色 + 状态圆点 + 呼吸进行态(pulse) + 图标 + 可关闭。区别 Badge(计数)/Chip(令牌)，专司「订单/审批/在线」等状态标记 |
| **Steps** 步骤条(原生) | 导航 | 零依赖数据驱动 `items` + 水平/垂直 + wait/process/finish/error 状态派生 + 可点击受控。替代重型 MUI Stepper 桥，服务分步表单/审批流 |
| **ProTable** 高级表格 | 🔴 Pro 区块 | 列表页编排层：查询区(复用 SearchForm) + 工具栏(密度/列设置/刷新/全屏) + Table(复用 TanStack) + 集成分页。**覆盖列表页 80% 工作量** |
| **AdminLayout** 中后台骨架 | 🔴 应用骨架 | 侧栏(品牌+NavMenu可折叠) + 顶栏(折叠/面包屑/扩展区) + **多页签导航**(开/切/关·关闭其他/全部·受控接路由或菜单点击自动维护) + 内容区 |

附带：给 `Table` 增加了 `density` prop（default/middle/compact），ProTable 与未来组件共用。

### ✅ 续批基础设施（2026-06-04）

| 能力 | 层 | 说明 |
|------|----|------|
| **Access** 权限控制 | 🔴 基础设施 | `AccessProvider`(下发用户权限集) + `useAccess()`(has/hasAny/hasAll·缺 Provider 即抛) + `<Access permission\|accessible mode fallback>`(声明式门禁)。按 ThemeProvider 先例·不进画廊 |
| **ConfigProvider / i18n** | 🔴 基础设施 | `ConfigProvider`(下发 locale) + `useLocale()`(缺 Provider 回退 zhCN·不抛) + `zhCN`/`enUS` 字典。已接入 ProTable/AdminLayout/ModalForm/EditableTable 文案(包 enUS 即切英文)。后续可扩 size/主题 |
| **ModalForm / DrawerForm** | 🔴 Pro 区块 | 弹窗/抽屉表单(复用 Dialog/Drawer + useForm + Button footer)·提交前自动 validate·async onFinish 成功关闭/失败保持 |
| **EditableTable** | 🔴 Pro 区块 | 行内编辑表格·行级编辑(草稿/保存校验/取消还原) + 自定义编辑器逃生舱 + 增删行 |

---

## 🔴 P0 — 仍缺的高优先级（决定「能不能当框架用」）

### 基础设施
- [x] ~~**权限体系（Access）**~~ ✅ 2026-06-04
- [x] ~~**ConfigProvider + i18n（基础）**~~ ✅ 2026-06-04（locale 已落；ProTable/AdminLayout 已接）
- [ ] **i18n 续**：原子组件文案渐进迁移到 `Locale`（Table 暂无数据 / Pagination / 表单校验等仍硬编码 zh）。
- [ ] **ConfigProvider 续**：全局默认 `size`（控件尺寸）+ 表单校验配置（需各表单控件读 context，是较大 retrofit）。

### Pro 区块（继 ProTable 之后）
- [x] ~~**ModalForm / DrawerForm**~~ ✅ 2026-06-04
- [x] ~~**EditableTable**~~ ✅ 2026-06-04
- [ ] **QueryFilter 独立件**：当前查询区借 SearchForm(已能折叠/响应式列/重置查询)；如需一等公民可再抽，但 **SearchForm 已基本覆盖**，优先级降低。

---

## 🟡 P1 — 中优先级

- [x] ~~**ProForm**~~ ✅ 2026-06-04（内联表单编排·useForm + footer + async submit）
- [x] ~~**StepsForm**~~ ✅ 2026-06-04（分步表单·复用 Steps + 逐步校验）
- [x] ~~**Form.List**~~ ✅ 已存在（form/ 内 useForm/FormList/validateValue 引擎）
- [x] ~~**登录模板 LoginForm**~~ ✅ 2026-06-04（账号/密码/记住我·异常页 403/404/500 由 Result 原子件直接覆盖）
- [ ] **VirtualList**：独立虚拟滚动列表（Table 已支持虚拟，列表场景另需）。企业数据动辄上万行。
- [ ] **ProDescriptions**：详情页 schema 驱动 + 编辑态联动（扩展已有 Descriptions）。
- [ ] **ProTable 增强**：列拖拽排序、行拖拽、`pageSize` 切换器、导出 CSV、列固定与设置持久化。
- [ ] **AdminLayout 增强**：页签右键菜单、页签持久化(localStorage)、多级面包屑自动从菜单派生、用户菜单成品件。

---

## 🟢 P2 — 业务级重组件（按场景补，可标「重依赖延后」）

- [ ] 富文本编辑器 / Markdown 编辑器
- [ ] QRCode 二维码
- [ ] 图片裁剪 ImageCrop
- [ ] Excel / PDF 导出、打印
- [ ] 工作流 / 审批流可视化（流程图）
- [ ] 看板 Kanban / 甘特图 Gantt

---

## 优先级建议

落地企业管理系统的推荐顺序：

```
已完成：AdminLayout + ProTable + EditableTable + ModalForm/DrawerForm + ProForm + StepsForm + LoginForm + Steps + Tag + Access + ConfigProvider/i18n
P0 + 大部分 P1 表单族收口。剩余：VirtualList · ProDescriptions · ProTable/AdminLayout 增强 · i18n 续(原子件文案) · ConfigProvider 全局 size · 浏览器视觉验收(6+3 新组件截图)
```

一个 ProTable + AdminLayout(多页签) 带来的「能搭系统」感知，远超再加 20 个原子组件——
继续沿「解决方案层」推进，而非回头堆原子件或装饰件。
