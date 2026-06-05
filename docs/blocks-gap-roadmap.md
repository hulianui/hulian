# 区块查缺补漏路线图 —— 对标 shadcnblocks，更胜一筹

> 立项 2026-06-05。竞品 shadcnblocks.com/blocks 实测 **1,645 个区块**；我们当前 **28 个**。
> 结论：**不拼总数**（它是付费 SKU 站，全职刷皮肤，1645 ≈ 94 archetype × 17 变体），
> 拼**三条它打不过的线**：archetype 全覆盖 + 活区块质量代差 + 整页模板/真 demo。

## 竞品真实分布（抓取实测）

| 大类 | 区块数 | 头部 archetype |
|---|---|---|
| Marketing 营销 | 1,217 | Hero 225 · Feature 311 · Pricing 95 · Footer 44 · CTA 38 |
| App 应用 | 211 | Data Table 32 · Chart Card 27 · Sidebar 21 · Dashboard 18 |
| Ecommerce 电商 | 142 | Product Card 14 · Cart 11 · Product List/Detail 各 10 |
| Background 背景 | 72 | Pattern 52 · Shader 20 |

**它多的本质**：同一 archetype 换皮肤，纯静态拷贝零依赖，加法生产成本极低。

## 我们的差异化定位

- 背后是 **@hulianui/ui 300+ 真组件 + 17 个能跑的完整 demo 应用**。
- 区块是「从真 demo 抽出、dogfood 组件库、themed/暗色/可访问」的**活区块**——人家是死截图。
- **护城河 = 组件库 + 整页真 demo**，竞品完全没有。

---

## 三批路线

### 批一：archetype 全覆盖（table-stakes，整类为 0 的标准货架）

目标：「它有的标准货架我们都有」。12 个新区块，全部 dogfood 现有组件。

**营销页**
| slug | 名称 | dogfood 主件 |
|---|---|---|
| `navbar` | 顶部导航栏 | navbar / nav-menu / Button / 移动 Drawer |
| `footer` | 营销页脚 | 多列链接 + newsletter Input + social-button |
| `login` | 登录卡 | login-form / Field / social-button / Checkbox |
| `signup` | 注册卡 | Field / Checkbox 条款 / social-button |
| `about` | 关于区 | Heading / Text / 图文 / 价值观网格 |
| `team` | 团队网格 | Avatar / Card / social icons |
| `blog-list` | 博客列表 | Card 网格 / Tag 分类 / 特色文 |
| `logo-cloud` | 客户 Logo 墙(静态) | logo-loop / 灰度网格（区别 trust-bar 的 marquee） |
| `banner` | 顶部通栏公告 | Banner / Button / 可关闭 |
| `error-page` | 404 / 错误页 | Result / Button |

**应用骨架**
| slug | 名称 | dogfood 主件 |
|---|---|---|
| `sidebar-nav` | 侧边导航 | admin-layout / 分组菜单 / 折叠 |
| `onboarding` | 引导步骤 | Steps / Card / Progress |

### 批二：高流量 archetype 加变体深度（不刷皮肤，几款精品）

在最高频的 archetype 上各做 3-5 个**风格差异明显**的变体：
- Hero：居中渐变 / 左文右图 / 全屏背景特效 / 终端演示 / 视频
- Pricing：三栏卡 / 对比表格 / 单卡 + 用量滑杆
- Feature：Bento / 交替图文 / 图标三列 / Tab 切换
- CTA：流星 / 渐变卡 / 内嵌表单 / 全宽横幅

### 批三：整页模板 + 真 demo（护城河，竞品没有）

持续产「能跑的整页」：落地页模板、后台模板、电商模板。区块作为模板副产物自然沉淀。
已有 17 demo 是基础，继续扩品类并把可复用段回抽为区块。

---

## 执行约束

- 每个区块自包含 `.tsx`，导出 `XxxBlock`，住 `app/blocks/_blocks/`。
- 元数据进 `_meta.ts`（纯数据 SSOT，client 可读）；预览映射进 `_registry.tsx`。
- 文案中文，沿用「瀚云 / 瀚X」品牌语气；mock 内联，复制即用。
- 用组件前先读 `packages/ui/src/<name>/` 源码确认 props，禁止凭空猜 API。
- 色彩 token 须 `var(--color-*)` 前缀；有阴影组件亮色去 border 用 hairline。

## 进度

- [x] 批一 ×10 净新增（archetype 全覆盖）—— 2026-06-05 完成接线，tsc 零报错，三方一致
  - 营销：navbar / banner / logo-cloud / about / login / signup / error-page / footer
  - 应用：sidebar-nav / onboarding
  - 注：team（让位并行 session 的 team-grid）、blog-list（并行 session 已建）未重复
  - 并行 session 同期补：feature-split / team-grid / blog-list / article-body / changelog（共享 barrel）
  - **区块总数 28 → 43**；未 commit（barrel 混并行 WIP）
- [x] 批二 ×12（高流量 archetype 变体）—— 2026-06-05 完成接线，tsc 零报错，三方一致
  - Hero +4：hero-split(Safari 产品图) / hero-video(HeroVideoDialog) / hero-terminal(Terminal) / hero-waitlist(AvatarCircles+内嵌订阅) → Hero 货架共 5 款
  - Pricing +3：pricing-compare(对比矩阵 Table) / pricing-usage(Slider 计价器) / pricing-credits(Choicebox 积分包) → 共 4 款
  - Feature +2：feature-tabs(Tabs 切换) / feature-spotlight(CardSpotlight) → 共 4 款（含 features/feature-split）
  - CTA +3：cta-newsletter(内嵌订阅) / cta-card(BorderBeam) / cta-banner(全宽横幅) → 共 4 款
  - **区块总数 43 → 57**（含并行 session milestone-timeline/article-toc）；未 commit
  - 坑：Heading 无 size=md；Button 无 secondary(合法 solid/outline/ghost/link)；data: URI 本地内联不触发 demo 远程门禁
- [ ] 批三（整页模板：落地页/后台/电商整页能跑模板，可复用段回抽为区块）
