# 瑚琏内置 Demo 制作要求

> 谁要新建 / 改造 `apps/www/app/demos/**` 下的 demo，先读这份。
> 配套审计与执行清单：`docs/superpowers/specs/2026-06-04-demos-realism-audit.md`。

## 0. 第一性原则：demo 是给用户照抄的教学材料，不是给自己看的橱窗

用户回到自己真实项目里，会照着 demo 用我们的组件。**demo 怎么用，用户就怎么用。**

- demo 不用 `toast` 反馈 → 用户也不会做操作反馈。
- demo 不演加载骨架 → 用户的真实项目首屏白屏。
- demo 不做危险二次确认 → 用户线上误删。
- demo 里某个组件从没出现 → 用户根本不知道它存在、不敢用 → 这组件等于白做。

所以 demo 的合格线不是「页面好看」，而是**演完一个真实项目会经历的完整交互，并尽可能多地展示库里组件的真实用例**。

## 1. 三条铁律

### 铁律一 · 100% dogfood，零手搓等价物
demo 里的每个 UI 元素都必须来自 `@hulian/ui`。**禁止**在 demo 里手搓一个库里已有的东西（自己写 toast、自己写 modal、自己写 table）。
撞到组件缺口（必须 CSS override / 行为 hack 才好用）→ **回 `@hulian/ui` 修组件**，不在 demo 打补丁。
（依据见记忆 `fix-component-not-demo-css-patch`。）

### 铁律二 · 演完整交互生命周期，不许只摆 happy-path
每个 demo 的数据区/操作必须走过这条链，缺一环就是不合格：

```
加载（Skeleton / Spinner）
  → 空 / 异常（Empty / Alert / Result + 重试）
    → 操作
      → 反馈（toast / Notification）
        → 危险二次确认（Popconfirm 行内 / AlertDialog 重操作）
```

同步内存 mock 瞬间渲染、永远没有 loading 帧 = 最大反模式。用共享基建（见 §3）把 mock 包成异步。

### 铁律三 · 覆盖优先，漏才是危险信号
> 「补多了没关系——能把组件塞进真实场景，说明它做对了、有用途。**漏了才是最危险的信号**。」

宁可在合理场景里多塞一个组件，也不要漏。**唯一的边界是「合理」**——不为凑数把组件硬塞进不搭的场景（堆砌是另一种不真实）。判断标准：这个场景里真实产品会不会用它？会就上。

## 2. 强制交互态清单（验收门槛）

新建 / 改造任一 demo，提交前逐条自检：

- [ ] 首次进列表 / 详情，**≥300ms 可见 Skeleton / Spinner 加载态**（真实浏览器肉眼可见）。
- [ ] **每个**增 / 删 / 改动作都有 `toast` 反馈（成功 info / 失败 danger），零静默。
- [ ] 危险操作（删除 / 作废 / 清空 / 注销 / 结单）有 `Popconfirm` 或 `AlertDialog` 二次确认。
- [ ] **纯图标按钮**全部有 `Tooltip`。
- [ ] 列表筛选无结果显示 `Empty`；模拟一次加载失败显示 `Alert` / `Result` + 重试按钮。
- [ ] 该场景真实产品会用到的高频件尽量都有用例（搜索→Command/Combobox，日期→DatePicker，多端预览→设备外壳 mockups …）。

## 3. 共享基建（统一用，别各搓一套）

`app/demos/lib/async.ts`（详见审计报告 §4）：

| 工具 | 用途 |
|---|---|
| `useMockData(seed, { delay?, failOnce? })` | 首屏加载态：seed 延迟返回，驱动 `Skeleton` / `ProTable loading`；`failOnce` 模拟一次失败 + `reload` 重试 |
| `usePending()` → `[pending, run]` | 提交 / 动作 pending：`run(fn)` 自动包延迟 + try/finally，配 `Spinner` + `disabled` |
| `sleep(ms)` | 裸延迟 |

> `ProTable` 已内置 `loading` prop，list 页直接 `loading={loading}` 喂 `useMockData` 的数据即可，无需手搓骨架。

## 4. 覆盖率自检（量化「漏=危险信号」）

```bash
pnpm --filter www demos:coverage          # 打印覆盖率 + 未覆盖（危险盲区）清单
pnpm --filter www demos:coverage -- --min 60   # 低于阈值 exit 1，可进 CI
```

口径：分母 = `lib/manifest.ts` 公开组件；分子 = demos 里 `from "@hulian/ui"` 命中的条目。
**当前 48%，目标 ≥ 60%。** 提交新 demo / 改造后必须让覆盖率只升不降。

## 5. 验证要求（眼见为实）

- 视觉验证用**真实浏览器**截图，不用 headless CLI——apps/www 在 headless 下截图全站空白（记忆 `www-msw-gate-blanks-headless-screenshots`）。
- MCP 浏览器被占时起隔离的 Chrome-for-Testing（记忆 `mcp-browser-busy-launch-isolated-chromium-via-executablepath`）。
- 验「加载态真的出现过」要截加载中那一帧，不能只 DOM eval（记忆 `ui-layout-verify-needs-screenshot-not-screenshot`）。
- 起预览用 `pnpm --filter www dev`，别在根目录 `pnpm dev`（会连桌面 app 5514 一起杀，记忆 `hulian-pnpm-dev-killstale-kills-5514`）。

## 6. 落盘注意

- 共享文件（`demos/lib/*`、`lib/manifest.ts`、`lib/registry.tsx`）常带其它会话未提交 WIP，落盘用 **hunk 级 `git apply --cached`** 只暂存自己改动，别 `git add -A` 卷走别人的 WIP。
- 静态导出下 `[id]` 动态路由必须 `generateStaticParams` 且拆 server page + client 子组件（记忆 `hulian-output-export-dynamic-route`）。

## 7. 已知 backlog

- **移动端 demo（第 7 个）**：`mobile` 整类 7 件（TabBar/Fab/ActionSheet/Picker/SwipeAction/PullToRefresh/SafeArea）目前 0 覆盖——没有任何移动端 demo。需单独立项 spec。
- 设备外壳 mockups（Chrome/iPhone/Android/Tablet/Watch）：并入 website 产品多端预览区。
