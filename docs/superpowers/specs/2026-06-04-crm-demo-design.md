# CRM 后台 Demo 设计 — 用真实场景 dogfood 倒逼组件库迭代

- 日期：2026-06-04
- 团队：hulian（@hulianui/ui 组件库 + apps/www 文档站）
- 状态：设计已与用户对齐，待落地

## 0. 目的（第一性）

这个内置 demo **不是为了展示一个 CRM**，而是为了：

> 用一个真实、完整的中后台业务场景持续 dogfood @hulianui/ui，把"用起来才暴露的缺口/不好用"变成组件库的迭代驱动力。

因此最高优先级约束是：

- **100% 用 @hulianui/ui 组件搭**。不允许在 demo 层手搓库本该提供的通用件、不允许绕过库直接写原生控件凑数。
- **缺口处理优先级**：
  1. 现有组件能组合 → 在 demo 的 `_components/` 里做**业务级组装**（业务拼装本就属于 demo 层，不算违规）。
  2. 库里组件**能力不足/不好用** → **改 `packages/ui` 对应组件**补能力或优化体验，同步其 `*.types.ts` / `*.showcase.tsx` / 测试。
  3. 库里**完全没有**的通用后台原语 → **在 `packages/ui` 新建组件**，按目录约定落盘并注册（`index.ts` + `apps/www/lib/manifest.ts`）。
- 每次动到 `packages/ui`，在该阶段的提交信息与回报里明确写出"为 CRM demo 补了什么库能力"，形成 dogfood → 库迭代的可追溯链路。

## 1. 范围

完整 6 页后台 + 登录页（跨多个 session 推进，本 spec 是所有 session 的共同依据）：

| 页面 | 路由 | 主要 hulian 组件 |
|------|------|------------------|
| 工作台 Dashboard | `/demos/crm` | `Stat`×4、`Chart`(转化趋势/阶段分布)、`Card`、最近客户 `Table`、待办 `List`、`Tag` |
| 客户列表 | `/demos/crm/customers` | `SearchForm`、`ProTable`(列设置/密度/分页)、`ModalForm`(新建/编辑)、`Tag`、`Dropdown`/`Menu`(行操作)、`Avatar` |
| 客户详情 | `/demos/crm/customers/[id]` | `Breadcrumb`、`Descriptions`、`Tabs`(跟进/商机/订单/附件)、`Timeline`、`Drawer`(加跟进)、`Button` |
| 商机看板 | `/demos/crm/opportunities` | `Card` 列、`Badge`/`Tag`、`Stat`(列汇总)、`Avatar`（DnD 见 §5） |
| 订单列表 | `/demos/crm/orders` | `ProTable`、`SearchForm`、状态 `Tag`、`Pagination` |
| 系统设置 | `/demos/crm/settings` | `Tabs`、`ProForm`/`Form`(企业资料/成员/通知)、`Upload`、`Toggle` |
| 登录页 | `/demos/crm/login` | `LoginForm`（库已有，独立铺底，无后台外壳） |

## 2. 目录结构

用 route group `(app)` 把后台外壳套在 6 个业务页上，登录页排除在外。

```
apps/www/app/demos/
├── page.tsx                      # /demos —— gallery 占位(最简卡片列表，正式版由另一会话做)
├── lib/demos.ts                  # demo 元数据清单(slug/标题/描述/封面/路由/状态)，gallery 与本 CRM 共读
└── crm/
    ├── login/page.tsx            # /demos/crm/login —— LoginForm，无外壳
    ├── _data/                    # 内置静态 mock：customers.ts / opportunities.ts / orders.ts / follows.ts
    ├── _components/              # CRM 内部业务组装：状态→Tag 映射、看板列、详情区块等
    └── (app)/                    # route group：不进 URL，只套后台外壳
        ├── layout.tsx            # AdminLayout(侧栏 NavMenu 可折叠 + 顶栏 + 面包屑)
        ├── page.tsx              # 工作台
        ├── customers/page.tsx
        ├── customers/[id]/page.tsx
        ├── opportunities/page.tsx
        ├── orders/page.tsx
        └── settings/page.tsx
```

Next 行为校验：route group `(app)` 不进 URL，故 `(app)/page.tsx` → `/demos/crm`；`login/page.tsx` 不被 `(app)/layout.tsx` 包裹，故登录页无后台外壳。

## 3. 数据流

- `_data/*.ts` 导出写死的数组：客户 ~30 条、商机 ~15、订单 ~40、跟进记录若干，字段见 §6。
- 搜索/排序/分页/新增/编辑全部在客户端 `useState` 内存里跑，刷新还原。**不接后端、不接 MSW**（demo 永远能跑，零外部依赖）。
- 业务页均为 `'use client'`（ProTable/看板/表单皆交互件）。
- 列表与详情之间通过 `_data` 同一份数组的 id 关联；详情页用 `customerId` 反查商机/订单/跟进。

## 4. 消费 @hulianui/ui 的方式（沿用文档站既有约定）

- `import { ... } from "@hulianui/ui"`；token 已由 `apps/www/app/globals.css` 全局引入，无需额外处理。
- 主题切换、`MuiBridgeProvider` 等 Provider 由 `apps/www/app/layout.tsx` 顶层提供，demo 页直接享用。
- demos 段如需局部约束（如固定满高、隐藏文档站导航），在 `demos/layout.tsx` 或 `crm/(app)/layout.tsx` 内处理。

## 5. 商机看板的 DnD 决策

- **先做静态分列展示**：按阶段分列，卡片在列内罗列，列头显示 `Stat` 汇总；改阶段通过卡片上的 `Dropdown` 选择目标列。
- **真拖拽（卡片跨列拖动）作为后续可选的库级组件**：若要做，应在 `packages/ui` 新建通用 `Kanban`/`Board` 原语（含 DnD），而不是在 demo 层手搓拖拽绕过库。本期不阻塞在此。

## 6. Mock 数据模型

- **Customer**：`id, name, company, contactName, phone, email, level(重要|普通|潜在), status(待分配|跟进中|已成交|已流失), owner, industry, region, amount(累计成交), lastFollowAt, createdAt, tags[]`
- **Opportunity**：`id, title, customerId, customerName, stage(线索|初步接触|方案报价|商务谈判|赢单|输单), amount, owner, probability, expectedCloseAt`
- **Order**：`id, orderNo, customerId, customerName, amount, status(待付款|已付款|已发货|已完成|已退款), createdAt, items[]`
- **Follow**：`id, customerId, type(电话|拜访|微信|邮件), content, owner, createdAt`

Dashboard 统计由以上数据现算：客户总数、本月新增、商机金额、成交金额、转化趋势(按月)、商机阶段分布、最近客户表、待办列表。

## 7. 与 gallery 衔接

`apps/www/app/demos/lib/demos.ts` 导出 demo 清单，本 CRM 注册一条；`/demos` 占位页读它渲染最简卡片网格。另一会话做正式 gallery 时复用同一清单，互不冲突。

## 8. 推进顺序（每块独立可跑，到节点提交）

1. demos 落点骨架：`demos/page.tsx` 占位 + `lib/demos.ts` + `crm/(app)/layout.tsx` 外壳
2. 工作台 Dashboard
3. 客户列表
4. 客户详情
5. 登录页
6. 商机看板（静态分列）
7. 订单列表
8. 系统设置

做不完的下个 session 接着按本 spec 走。每发现一处库缺口/不好用，回 `packages/ui` 补，并在提交信息记录。

## 9. 测试与验收

- 验收以**实物为准**：`pnpm --filter www dev` 起文档站，逐页人工走查（不可用根 `pnpm dev`，会误杀桌面 app 5514）。
- 动到 `packages/ui` 的组件，补/改其单测，跑 `pnpm --filter @hulianui/ui test`。
- 每页交付时附"用到的库组件 + 本页触发的库改动"清单。

## 10. 非目标（YAGNI）

- 不接真后端、不做鉴权、不做国际化、不做响应式移动端适配（后台以桌面宽屏为主）。
- gallery 正式版不在本 spec（另会话）。
- 看板真 DnD 不在本期。
