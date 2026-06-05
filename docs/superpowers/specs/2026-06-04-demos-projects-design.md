# 内置 Demo：工程项目协同后台（上下游项目管理）

> 设计规格 · 2026-06-04
> slug: `projects` · 入口 `/demos/projects` · 类别「中后台」

## 1. 目标与约束

做一个**上下游项目管理** demo，承载在「工程/安装施工服务商」场景上：覆盖项目追踪、报价生成、开票回款、工作照片四条业务线 + 一个工作台。

**唯一硬约束**：100% 用 `@hulian/ui` 搭建。任何组件缺口或不好用，回流到组件库——**新造组件或优化既有组件，禁止在 demo 里手搓 UI 绕路**。这个 demo 的首要价值是 dogfood 驱动组件库迭代，业务真实性服务于此。

**非目标（YAGNI）**：
- 不做真实后端 / 持久化（全部内存 mock 数据驱动）
- 不做上下游双方门户（仅我方单一操作台视角；上下游通过数据字段体现）
- 不做鉴权 / 多租户 / 国际化（沿用 CRM demo 的简化口径）

## 2. 叙事与角色模型

我方 = **工程/安装施工服务商**（如机电安装、装饰工程、设备实施）。

| 关系 | 角色 | 在数据中的体现 |
|---|---|---|
| 上游 | 发包甲方 / 客户 | 项目的 `client` 字段、报价单/发票抬头 |
| 我方 | 工程服务商（操作台主体） | 项目负责人、报价制单人 |
| 下游 | 施工班组 / 材料供应商 | 项目的 `crew` 字段、报价/成本的行项来源 |

一条主线贯穿：**承接项目 → 出报价单（甲方确认）→ 施工（里程碑推进 + 现场照片留证）→ 完工开票 → 回款**。各模块共享同一批项目实体，互相引用（报价单挂在项目下，发票引用报价单，照片归属项目+阶段）。

## 3. 模块清单与组件映射

### 3.1 工作台 Dashboard — `/demos/projects`
项目概览看板。
- **Stat**：在建项目数、本月报价额、待开票额、待回款额（带环比）
- **Chart**：月度产值/回款趋势（line/area）、项目阶段分布（bar/pie）
- **Timeline**：近期关键动态（报价确认、里程碑完成、回款到账）
- **Card + Progress**：重点在建项目的进度卡片
- 已有组件全覆盖，无缺口。

### 3.2 项目追踪 — `/projects` + `/projects/[id]`
- **列表页**：ProTable（项目编号/名称/甲方/负责班组/阶段/进度/合同额/状态）+ SearchForm 查询 + 状态 Tag。
- **详情页**：
  - **Steps**：里程碑流程（勘测 → 报价 → 进场 → 施工 → 验收 → 结算）
  - **Gantt★（新组件）**：施工排期甘特图（各工序起止 + 进度填充）
  - **Timeline**：项目动态流水
  - **Kanban**（列表页可切换视图）：按阶段泳道展示项目卡片
  - 关联区：本项目的报价单 / 发票 / 照片入口（跳转其它模块并带 projectId 过滤）

### 3.3 报价生成器 — `/quotes` + `/quotes/[id]`
- **列表页**：ProTable（报价单号/项目/甲方/金额/有效期/状态：草稿·已发送·已确认·已失效）。
- **报价单编辑/预览页**：
  - **ProForm**：抬头（甲方、项目、有效期、币种、税率、备注）
  - **EditableTable**：明细行项（名称/规格/单位/数量/单价/小计），**实时算价**——行小计、合计、税额、价税合计联动；金额大写。
    - 若 EditableTable 缺合计页脚行能力 → 就地为组件加 `summary` / footer 支持。
  - **DocumentSheet★（新组件）**：A4 单据预览态（甲方/我方抬头、明细表、合计、签章位、打印按钮 + `@media print` 样式）。
  - 编辑态 ↔ 预览态切换（Segmented / Tabs）。

### 3.4 开票与回款 — `/invoices`
- **列表页**：ProTable（发票号/关联项目+报价单/开票金额/类型：增专·增普/状态：待开·已开·已寄送/回款状态）+ Statistic 汇总条。
- **发票详情（抽屉或单页）**：
  - **DocumentSheet★**：发票单据预览（复用报价单的 DocumentSheet，换字段映射）
  - **Steps / Result**：开票流转（申请 → 审核 → 开具 → 寄送）
  - **Timeline**：回款记录（分次到账、剩余应收）
- 与报价单的字段映射通过适配函数完成，DocumentSheet 本身只认通用单据数据结构。

### 3.5 工作照片 — `/photos`
- **分组网格**：按项目/施工阶段分组的照片墙。
  - **Masonry★（新组件）**：瀑布流照片墙（不等高图片）
  - **Upload + Image**：上传态 + 缩略图
- **ImageViewer★（新组件）**：点开缩略图进全屏查看器——前后翻页、滚轮/双击缩放、底部缩略图条、键盘导航（←/→/Esc）、当前序号/EXIF 简要信息位。
- 照片带元数据：所属项目、阶段、拍摄时间、上传人、标签（隐患/进度/验收）。

## 4. 要新造的组件（核心增量）

落 `packages/ui/src/<name>/`，接入流程对齐库内既有组件：导出进 `src/index.ts`、补 `.showcase.tsx`、登记 `showcase.ts` 与 `apps/www/lib/manifest.ts` / `registry.tsx`，token 走主题 CSS 变量单一真源。

| 组件 | 目录 | 职责 | 设计要点 |
|---|---|---|---|
| **DocumentSheet** | `document-sheet/` | A4 单据容器 + 打印态 | 受控宽高比纸张容器；插槽：抬头/正文/页脚/签章；`@media print` 隐藏非单据 chrome；导出 `<DocumentSheet>` + 可选 `useDocumentPrint()`。报价单与发票共用。 |
| **ImageViewer** | `image-viewer/` | 全屏图片查看器 / Lightbox | 受控 `open/index`；前后翻、滚轮+双击缩放、拖拽平移、缩略图条、键盘导航；基于库内 overlay/portal 约定（参考 dialog/lens 实现），可与 Masonry/Image 组合。 |
| **Gantt** | `gantt/` | 项目排期甘特图 | 数据：任务行 `{id,name,start,end,progress,group?}`；时间轴表头（日/周/月刻度）；条形进度填充；只读优先，拖拽改期列为 backlog。零额外依赖，纯 CSS grid + 计算。 |
| **Masonry** | `masonry/` | 瀑布流布局 | 多列不等高排布；响应式列数（断点）；纯 CSS columns 或 JS 测高二选一（优先 CSS columns，简单零依赖）。 |

**过程中就地优化的既有组件**（按实际缺口，发现即改，不在 demo 里绕路）：
- `EditableTable`：报价明细可能需要合计页脚行 / 列级聚合 → 加 footer/summary 能力
- `ProTable` / `SearchForm`：若某筛选或工具栏能力缺失，补到组件而非页面
- 任何在 demo 中发现的「不够好用」都回流组件库，并在 commit message 注明

## 5. 目录结构（镜像 CRM demo）

```
apps/www/app/demos/projects/
  (app)/
    layout.tsx                  # ProjectsShell 外壳（route group）
    page.tsx                    # 工作台 Dashboard
    projects/page.tsx           # 项目列表
    projects/[id]/page.tsx      # 项目详情（Steps + Gantt + Timeline）
    quotes/page.tsx             # 报价列表
    quotes/[id]/page.tsx        # 报价单编辑/预览（EditableTable + DocumentSheet）
    invoices/page.tsx           # 开票与回款
    photos/page.tsx             # 工作照片（Masonry + ImageViewer）
  _components/
    projects-shell.tsx          # 绑 AdminLayout ↔ Next 路由（镜像 crm-shell）
    nav-config.tsx              # 菜单/面包屑/选中推导
  _data/
    types.ts                    # 实体类型（Project/Quote/Invoice/Photo/...）
    projects.ts quotes.ts invoices.ts photos.ts metrics.ts  # mock 数据
```

新组件：`packages/ui/src/document-sheet/`、`image-viewer/`、`gantt/`、`masonry/`，各带 `index.ts(x)` + `<name>.showcase.tsx`。

画廊登记：`apps/www/app/demos/lib/demos.ts` 追加 `projects` 条目（category「中后台」，tags 体现 DocumentSheet/Gantt/ImageViewer/EditableTable）。

## 6. 交付切片（供实施计划拆分）

按可独立交付、完成即可 `/clear` 的粒度切（呼应成本规则）：

- **Slice 0**：脚手架 —— shell + nav-config + route group + 空页占位 + demos.ts 登记 + 基础 mock 类型与数据
- **Slice 1**：工作台 Dashboard（纯已有组件，先验证骨架）
- **Slice 2**：项目追踪（列表 ProTable + 详情 Steps/Timeline/Kanban；Gantt 占位或纳入 Slice 5）
- **Slice 3**：新组件 `DocumentSheet` + 报价生成器（EditableTable 实时算价 + 单据预览；含 EditableTable 合计能力优化）
- **Slice 4**：开票与回款（复用 DocumentSheet + 状态流 + 回款 Timeline）
- **Slice 5**：新组件 `Masonry` + `ImageViewer` + 工作照片模块
- **Slice 6**：新组件 `Gantt` + 接入项目详情 + 收尾打磨（暗色、响应式、画廊卡片）

每个新组件 slice 独立：先建组件 + showcase + manifest（库内自洽可用），再在 demo 页消费。

## 7. 验收口径

- 五个模块均可用真实 mock 数据交互，0 手搓 UI。
- 报价单：改明细行 → 合计/税额/价税合计实时联动；可切换预览打印态。
- 发票：有开票状态流 + 回款记录；单据复用 DocumentSheet。
- 照片：瀑布流展示 → 点开全屏查看器，可翻页/缩放/键盘导航。
- 项目详情：Steps 里程碑 + Gantt 排期可视。
- 四个新组件在组件库 showcase 内独立可用、token 吃主题、暗色正常。
- 挂进 `/demos` 画廊卡片可达。
