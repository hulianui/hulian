# 公司官网 Demo 设计规格（2026-06-04）

> 目标：在 `apps/www/app/demos/website/` 下，**100% 使用 `@hulianui/ui`** 搭一个可信的现代 B2B SaaS 公司官网。
> 任何缺失/不够好的组件，回 `packages/ui` 造或改 —— 这是本 demo 的核心 dogfood 目的。

## 1. 虚构品牌

- **品牌名**：瀚云 HanCloud
- **定位**：一体化云原生应用平台（部署 / 弹性算力 / 可观测）
- **语气**：专业、克制、技术感。文案中文为主。
- **主 CTA**：免费开始 / 预约演示

## 2. 路由与信息架构

`/demos/website`（路由组 `(site)` 共享营销外壳：Navbar + Footer）

| 路由 | 页面 | 说明 |
|------|------|------|
| `/demos/website` | 首页 Landing | 全站旗舰页，串起所有 section |
| `/demos/website/pricing` | 定价 | 套餐卡 + 月/年切换 + 定价 FAQ |
| `/demos/website/contact` | 联系我们 | 联系表单（hulian Form 族）+ 信息卡 |

共享外壳 `_components/site-shell`（Navbar 顶栏 + Footer 页脚）+ `_data`（features/pricing/faq/testimonials/stats SSoT）。

## 3. 首页 Section 蓝图（自上而下）

1. **Hero** — `AuroraText`/`SparklesText` 标题 + 副标题 + 双 CTA（`ShimmerButton` 主 / `Button` 次）+ `DotPattern`/`GridPattern` 背景。可选 `HeroVideoDialog`/设备截图。
2. **信任背书 Logo 墙** — `Marquee` 横向滚动客户 logo（用 Text/Icon 占位）。
3. **核心数据** — `NumberTicker` + `Statistic`：部署次数 / 客户数 / 可用性 / 节点。
4. **能力特性 Bento** — `BentoGrid` 展示 4-6 个能力卡（图标 + 标题 + 描述 + 视觉点缀如 `BorderBeam`/`Meteors`）。
5. **产品演示** — `Safari`/`Iphone` 设备外壳内嵌一张产品截图（用 hulian 组件拼一个迷你 dashboard 占位）。
6. **集成生态** — `OrbitingCircles` 或 `Marquee` 展示集成 logo。
7. **客户证言** — `Marquee`（双向）卡片墙，每张 `Card` + `Avatar` + 引言。
8. **定价预览** — 3 套餐 `Card`，链接到 /pricing。
9. **常见问题 FAQ** — `Accordion`。
10. **结尾 CTA** — `ShineBorder`/`MagicCard` 包裹的行动号召区。
11. **Footer** — 多列链接 + 版权（`Stack`/`Grid`/`Link`/`Divider` 组合）。

## 4. 定价页

- `Segmented` 月付/年付切换（年付打折）。
- 3 张套餐 `Card`（入门/专业/企业），专业版高亮（`ShineBorder` 或 `variant`）。每张：价格 + 功能 `List` + CTA。
- 定价 FAQ `Accordion`。

## 5. 联系页

- 左：联系表单 —— `Form` + `Field` + `Input` + `Textarea` + `Select`（需求类型）+ 提交 `Button`，`Toast` 反馈。
- 右：信息卡（地址/邮箱/电话）+ 可选 `WorldMap`/`Card`。

## 6. 100% hulian 硬约束

- 所有 UI 构件必须来自 `@hulianui/ui`。原生 HTML 仅用于无对应原语的语义/布局骨架，且优先用 `Stack`/`Grid`/`Spacer`/`Divider`/`Text`/`Heading`/`Link` 等 hulian 原语。
- 缺组件 → 回 `packages/ui/src/` 新建并走 manifest/showcase/index 注册流程。
- 组件不好用 → 直接改组件源（补 prop / 修样式），不在 demo 里 workaround。
- 预期可能补强：Footer 组合模式、PricingCard 模式（评估是否值得抽组件，倾向 demo 内组合）、LogoCloud（用 Marquee 组合即可）。

## 7. 验收

- `pnpm --filter www dev` 起预览，三页视觉走查（桌面 + 移动断点），暗色主题切换正常。
- demos.ts 注册 `website`，/demos 画廊出现卡片。
- 不引入新三方依赖；token 吃主题（亮/暗双跑）。

## 8. 范围外（YAGNI）

- 不做真实表单提交后端（前端 Toast 模拟）。
- 不做博客/文章列表、登录注册、i18n 多语言。
- 不做 SEO/metadata 深度优化（基础 title 即可）。
