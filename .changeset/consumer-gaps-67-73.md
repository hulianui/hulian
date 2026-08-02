---
"@hulianui/ui": minor
"@hulianui/mcp": patch
---

清掉消费方报来的 7 个缺口（#67–#73）：新增 AuthPanel，RegionSelect / LoginForm / NavMenu / Dot / Chart 各补一处逃生口

**新组件**

- **AuthPanel**（#71）：分屏登录/注册页左侧那块宣传面板。四档背景配方（`radial` / `linear` / `mesh` / `none`）由 token 混色写死在组件内，以 `--color-bg` 打底所以暗色自动跟随。此前这块只能是裸 `<div>` + inline style——Tailwind 工具类给不出带 `color-mix` 的 `radial-gradient`，而 guard 的 `no-style-override` 是 error 级，两条一撞没有第三条路（官方 signup block 自己就是这么写的，现已换成本组件）。`color` 走 `resolveTone`，与 `Brand.color` / `Dot.color` / `ChartSeries.color` 同一条路径。

**RegionSelect**

- 新增 `round?: "expand" | "nearest" | "none"`（默认 `expand`）：`onChange` 的出口坐标取整（#72）。此前给的是浮点，而组件自称的坐标系是「原图像素」——落库（`list[int]` 列约束）、服务端裁图（PIL / OpenCV / sharp 的 crop 都要整数）、`box === savedBox` 的等值判断三处都吃不下。默认 `expand`（左上 `floor`、右下 `ceil`）**不缩小框**，否则刚好拖够 `minSide` 的框会被收成 `minSide - 1`，症状是「拖了没反应」；`minSide` 的判定也相应移到取整之后。导出纯函数 `roundBox`。
- 新增 `errorPlaceholder` / `onError`（#67）：底图 404 / 403 / 跨域 / 网络失败时有出口，不再永久停在「载入图片…」。预读此前只挂 `onload` 不挂 `onerror`；现在预读与画布 `<image>` 共用同一个失败状态（中途鉴权过期只让 SVG 那次请求失败时同样有出口），缓存里的失败结果（`complete` 且 `naturalWidth` 为 0）也进失败态，`src` 变化会复位。

**LoginForm**

- 新增 `fields`（#70）：两个主字段的外观槽（`label` / `placeholder` / `prefix` / `suffix` / `description` / `autoComplete`）。只覆盖外观，取值与校验仍由模板托管，所以换 label 不会把浏览器的账号/密码自动填充弄丢。
- 新增 `surface`（默认 `true`）：`false` 时把边框 / 底色 / 阴影 / **内距**一起关掉。分屏登录页与「已经有卡的容器里嵌表单」两种场景不必再用 `className` 一条条抵消库件自己的表面。

**NavMenu**

- 新增 `semantics?: "tree" | "list"`（默认 `tree`，向后兼容）（#69）。`list` 档外层出 `role="list"`，行**不强加 role**——`<a>` 保住 link 语义、`<button>` 保住 button 语义，选中态改用 `aria-current="page"`，键盘退回「Tab 逐项 + 原生激活」。此前 `render` 逃生口（#59）虽然渲出了真 `<a>`，但 `role="treeitem"` 会压过它的隐式 link role，读屏最常用的「列出页面所有链接」一条主导航都列不出来，测试也只能退化成 `getAllByRole("treeitem")`。`nav-menu.md` 里那句「读屏按链接播报」同步更正为需配 `semantics="list"`。

**Dot / Chart**

- `Dot` 新增 `color?: string`（#73）：走 `resolveTone` 接任意色，五档 `tone` 接不住图表序列色（默认取值就是 `chart-1..6`）。同传时 `color` 优先。`dot.md` 记下 `style={{ color }}` **静默失效**这个坑——圆点是背景色，那样写编译通过、页面上一律灰点。
- `AreaChart` / `BarChart` / `LineChart` 新增 `legend?: boolean | "top" | "bottom"`（默认 `false`）：内部复用 `Dot` + `series.label`，色点与序列色同源。`height` 仍是组件总高，开图例时画布相应变矮而不是把总高撑高。

**@hulianui/mcp**

- 修复 monorepo 子项目里的普通 registry 包被误判为 `local-link`（#68）。`linkKindOf` 的逃逸基准从「发现该包的那一层 `node_modules`」改为「沿途每一层」：pnpm workspace 子项目的 `apps/web/node_modules/@hulianui/ui` 指向的是**仓库根**的 `.pnpm` store，天然逃出 `apps/web` 那层。后果与 #45 相同——`linked` 恒 true 让版本漂移门禁静默失效，外加导入策略给出错误原因、`@hulianui/tokens` 一并误判。补了真实 workspace fixture 的回归测试（含「软链指向仓库内源码目录仍算本地接入」的负向边界）。
