---
"@hulianui/ui": minor
---

修 #97：Button 的图标档不再游离于尺寸刻度之外（**视觉 breaking**）

`icon` 档过去是 `size-9`（36px），而文字档是 `sm` 32 / `md` 40 / `lg` 48 —— 它与**任何**文字档都不等高，所以 ButtonGroup 拆分按钮（`<Button>保存</Button>` + `<Button size="icon">`）连排时必然露出 4px 台阶。`iconSm` 早已对齐 `sm`，只有 `icon` 是孤例，说明 36px 是历史遗留而非设计意图（`page-header.tsx` 甚至用 `size="sm"` + `className="size-9 px-0"` 手贴出这个高度）。

- `icon` 改为 `size-10`（40px），对齐默认档 `md`
- 新增 `iconLg`（`size-12`，48px），对齐 `lg`
- 至此三条刻度一一对应：`iconSm`/`sm` 32、`icon`/`md` 40、`iconLg`/`lg` 48

**升级影响**：用了 `size="icon"` 的地方会从 36px 变 40px。实测不存在被撑破的容器（库内与文档站的全部调用点都在自适应高度的容器里）。需要保持 36px 的没有等价档位——请按语境改用 `iconSm`(32) 或 `icon`(40)，不要用 `className` 贴回 `size-9`（那正是这次要消灭的补丁）。

同批对齐的三处 36px 邻居：

- `AnimatedThemeToggler` 边长 36 → 40（它总与图标按钮并排在导航栏里，独自停在 36 会让整排错位）
- `PageHeader` 返回按钮：删掉 `size="sm" className="size-9 px-0"` 的手贴补丁，改用 `size="icon"`
- `Scheduler` 工具栏：前后翻页按钮 `icon` → `iconSm`，与同排的 `size="sm"` 今天按钮和 `Segmented size="sm"` 一起收在 32px 密集档

新增一条回归测试锁住「图标档边长 == 同名文字档高度」这个不变量，档位再被改歪会当场红。
