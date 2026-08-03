---
"@hulianui/ui": minor
---

运行时性能首轮：Combobox 大集合虚拟化 + 19 个组件跳过无谓重渲染

新建的内部扫描器（`packages/hulian-scan`，private 不发布）用 react-scan + Playwright 把全部 372 个公开组件场景跑了一遍 React Profiler，首轮拿到 125 条硬 finding（55 avoidable-render、41 cascade-fanout、16 long-task、13 dropped-frames）。本次发版是把其中**在 packed 消费态下仍可复现**的那部分修掉，每项都在 workspace 与仓库外 tarball 两种环境复测过。

**Combobox / Select / RemoteSelect：大集合自动虚拟化（默认行为变更）**

`items` 给到 100 项及以上时列表自动虚拟化，只渲染视口内的项（`@tanstack/react-virtual`，已是既有依赖，不新增包体）。千项候选的展开从「一次挂载上千个 `<li>`」变成「挂载二三十个」。`Select` 的 `searchable` 皮肤与 `RemoteSelect` 的候选列表走同一条路径，同样自动生效——RemoteSelect 是远程分页累积，翻够页数后会切过去。

代价要说清楚：**行高按 32px 固定估算，不做逐项测量**。默认 `ComboboxItem` / `SelectItem` 恰好是 32px，所以绝大多数用法无感；但如果你的选项是两行文案、带头像、或用 `className` 改了 padding/字号，那么在 ≥100 项时滚动条长度与项的落位会逐渐偏移——**不报错，短列表也复现不出来**，只有滚到列表中后段才看得出跳动。三个组件因此都补了 `virtualized` 逃生口，这种选项显式传 `virtualized={false}` 即可回到全量渲染：

```tsx
{/* 单行项 → 什么都不用改，≥100 项自动虚拟化 */}
<Combobox items={CITIES}>…</Combobox>

{/* renderOption 渲染「姓名 + 邮箱」两行 → 行高 ≠ 32px，关掉 */}
<RemoteSelect fetcher={searchUsers} virtualized={false} renderOption={…} />
```

依赖「选项全在 DOM 里」的测试同理：虚拟化后 `getAllByRole("option")` 只拿得到视口内那几条，断言总数改用列表容器上的 `data-hulian-virtual-count`，或对该用例传 `virtualized={false}`。

**19 个组件跳过稳定 props 的重渲染**

Button、Calendar、Cascader、Checkbox、CodeDiff、CodeReviewThread、ColorSwatchPicker、ContributionGraph、CountrySelect、DatePicker、DateTimePicker、Gantt、Glimpse、Markdown、PricingTable、QRCode、Scheduler、TimePicker、TreeSelect 接了 `memo`。判据是扫描证据而非手感：只有当浅比较能安全跳过时才加，函数/ReactNode/可变对象 props 的组件单独看证据，没有批量塞自定义深比较。对外行为与 DOM 不变。

**其余定点优化**

- `Select`：`searchable` 皮肤下按 value 找候选从每项 `find()` 线性扫改为 Map 查表，选项多时 trigger 与列表的每次渲染都少一轮 O(n)。
- `CircularGallery`：削掉每帧重复的几何计算与纹理编码。
- `GhostCursor`：降低 shader 每帧开销。
- React 18 兼容回填：`SelectTriggerProps` 改用 `ComponentPropsWithoutRef` + 显式 `ref`，`SwipeAction` 的 ref 写法同步调整——两处此前只在 React 19 的类型下成立。
