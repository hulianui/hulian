# 新 Session 提示词 — 吸取阶段 A1（motion 动效基元）

> 复制下面整段，粘进新 session。`/clear` 后从这里继续，不丢上下文。

---

```
接手「瑚琏 Hulian」设计系统项目，进入【吸取阶段 A1】。

## 项目位置与现状
- 路径：/Users/zhangzhiwei/Desktop/code/hulian（独立 git repo，已有提交，最新见 git log）
- 已完成 P0+P1：pnpm+Turborepo monorepo
  - packages/tokens：OKLCH 两层 token(原始层+语义层) + Tailwind v4 preset，明暗切换走 [data-theme] 变量值切换，0 闪烁
  - packages/ui：ThemeProvider(框架无关) + Button/Switch/Dialog 三组件 + showcase 四件套约定(ShowcaseSpec/Control/StateSpec)
  - packages/mocks：faker 确定性种子工厂 + MSW 分页 handlers
  - apps/www：Next 16 文档站(端口 5512，写死)，dogfood 模型A，anti-FOUC inline script，四 mock 全亮(真实数据/全状态/MSW/playground)
  - apps/desktop：Tauri 2.11 桌面壳，加载 www(devUrl 5512)，dark overlay 标题栏，瑚字图标，single-instance，已编译实跑
- 实测栈：React 19.2 / Next 16.2 / Base UI 1.0.0-rc.0 / Tailwind 4.3 / vitest 3.2(避开v4 rolldown node22坑) / faker 10 / msw 2.14 / pnpm 8.15

## 先读这三份（必读，按序）
1. docs/superpowers/specs/2026-06-02-hulian-absorption-model-v3.md —— 吸取式聚合模型 + 每组件选源表 + 执行分期(必读，这是当前方向)
2. docs/superpowers/specs/2026-06-02-hulian-design-system-design.md —— 原始设计 spec(分发模型A/主题接缝/四件套约定)
3. CLAUDE.md 总指挥 + ~/.claude 记忆里的 hulian-project / local-port-conflict-avoidance

## 核心模型（别再做成"纯自造"）
瑚琏是【吸取式聚合器】：从各家 React 库吸取「最好的那个实现」，统一成瑚琏自己一套 API + 一套明暗 token 主题。
- 策略=博采众长：每个组件概念只留 1 个瑚琏组件，不整库吸纳。
- 吸取来源(用户选定)：
  - 无缝家族(Tailwind/CSS变量,直接桥token)：HeroUI v3 + shadcn + Base UI + React Aria Components + Tremor(图表) + Magic UI(magicui.design,motion动效组件) + motion + lucide
  - 付代价家族(自带样式引擎要桥接)：MUI(emotion) + Ant Design(cssinjs)

## 本次任务：A1 — motion 动效基元（见效最快，先让用户看到 favorites 真落地）
1. 装 motion(Framer Motion fork)，加进 packages/ui peerDeps
2. 建瑚琏动效约定：进场/press/转场的统一 token 或预设(如 motion variants 常量)，放 packages/ui/src/motion/
3. 给 Button 上 press 反馈(whileTap scale)——注意会让 Button 变 "use client"，确认首页(server component)仍能用
4. 给 Dialog 进出场上 motion(替换现有 Base UI data-[starting-style] CSS 过渡，或与之协调，别冲突)
5. 顺手把 Button 观感往 HeroUI v3 靠(更圆润/微阴影/font-medium)，作为"HeroUI 味吸取"的第一步
6. 在 www 组件页能看到动效；浏览器实测截图 light/dark；过三道门(typecheck/test/build)
7. 每步小步提交

## 硬约束（沿用）
- 只消费语义 token，禁写死颜色
- 同一交互族(所有 overlay)只用一套库——overlay 全走 Base UI，别混
- 组件四件套：*.tsx / *.types.ts / *.showcase.tsx(手写 control schema，非 Storybook) / index.ts
- 端口固定 5512(www)/5514(Tauri)，别撞本地热门口
- 成本规则：本 session 只做 A1 这一件事，做完即停/clear；≤3 个 agent；不重复 Read 同文件
- 用中文跟我交流

## 待我确认的一点
"magic" 我按 Magic UI(magicui.design) 理解了，A1 不碰它(A2 才吸取动效组件)，先确认对不对。

A1 做完截图给我看动效实感，再停。
```
