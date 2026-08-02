---
"@hulianui/ui": minor
---

新增 AuthPanel，六处逃生口清掉消费方缺口（closes #67 #69 #70 #71 #72 #73）

两个下游（hulian-admin 的分屏登录/注册页、cairn 的试卷标注）一次报来六条，共同点是**查完文档后仍绕不过去**：分屏认证页的渐变面板只能裸 `<div>` + inline style，后台登录页的字段外观只能 `className` 覆盖，主导航为了保住 link 语义只能手写 `<Link>` 行，图例色点只能裸 `<span>`，框选坐标只能在调用处包一层 floor/ceil——全是 conventions 明令禁止的「业务侧打补丁」。这批把它们收回库内。

**新组件**

- `AuthPanel`：分屏登录/注册/找回密码页左侧那块宣传面板（渐变底 + 品牌 + 标语 + 卖点 + 底部区）。它存在的理由不是省几行 flex，而是**渐变此前没有正经的表达方式**——Tailwind 工具类给不出 `radial-gradient(125% 125% at 0% 0%, color-mix(in oklab, …), …)` 这种带 token 混色的写法，而 guard 的 `no-style-override` 是 error 级，两条一撞只剩裸 `<div>` + inline style 一条路（官方 `signup` block 自己就是这么写的，本次已换掉）。四档配方 `radial` / `linear` / `mesh` / `none` 都以 `--color-bg` 打底做 `color-mix`，**暗色自动跟随，不必另写一套**；`color` 走 `resolveTone`，与 `Brand.color` / `Dot.color` / `ChartSeries.color` 同一条路径（#71）。

  ```tsx
  <div className="grid min-h-dvh xl:grid-cols-2">
    <AuthPanel
      brand={<Brand name="瀚云" />}
      title="把想法送上全球边缘"
      highlights={["免费开始", "从 git push 到全球边缘上线"]}
      className="hidden xl:flex"
    />
    <div className="grid place-items-center p-8">
      <LoginForm surface={false} />   {/* 左面板已承担视觉重量，右边再套卡就是卡中卡 */}
    </div>
  </div>
  ```

**能力增强**

- `LoginForm` 补 `fields` 与 `surface`：前者是两个主字段的**外观槽**（`label` / `placeholder` / `prefix` / `suffix` / `description` / `autoComplete`），只覆盖外观，取值与校验仍由模板托管，所以换 label 不会把浏览器的账号/密码自动填充弄丢；后者关掉自带卡面时把边框 / 底色 / 阴影 / **内距**四件一起关——只关三件会逼消费方再写 `xl:p-0` 补最后一刀，等于没关（#70）。
- `NavMenu` 补 `semantics?: "tree" | "list"`（默认 `tree`，既有消费方零改动）。`#59` 的 `render` 逃生口虽然渲出了真 `<a>`，但行上的 `role="treeitem"` 会压过它的隐式 link role：中键新标签页 / 右键复制链接回来了，无障碍树里它仍是 treeitem，读屏最常用的「列出页面所有链接」一条主导航都列不出来。`list` 档不写 role（`<a>` 是 link、`<button>` 是 button），选中态改用 `aria-current="page"`，键盘退回「Tab 逐项 + 原生激活」——站点主导航在 ARIA APG 里本就是 list + link，`tree` 留给文件树 / 大纲树（#69）。
- `Dot` 补 `color?: string`：走 `resolveTone` 接任意色。五档 `tone` 接不住图表序列色（默认取值就是 `chart-1..6`），而图例色点要的正是「跟序列同色」。与 `tone` 同传时 `color` 优先（#73）。
- `AreaChart` / `BarChart` / `LineChart` 补 `legend?: boolean | "top" | "bottom"`：多序列图不给图例，读者无从知道哪条线是哪条序列。内部复用 `Dot` + `series.label`，色点与序列色同源。`height` 仍是**组件总高**——开图例时画布相应变矮，不会把总高撑高（#73）。
- `RegionSelect` 补 `errorPlaceholder` / `onError`：底图 404 / 403 / 跨域 / 网络失败时有出口，不再永久停在「载入图片…」。预读此前只挂 `onload` 不挂 `onerror`；现在预读与画布 `<image>` 共用同一失败态（中途鉴权过期只让 SVG 那次请求失败时同样有出口），缓存里的失败结果（`complete` 且 `naturalWidth` 为 0）也进失败态，`src` 变化会复位。后端按需渲染的底图（页图还没推到当前环境、签名 URL 过期、权限不足）这不是边缘情况，是常态（#67）。

**行为变更**

- `RegionSelect` 的 `onChange` 现在给**整数**坐标（新增 `round?: "expand" | "nearest" | "none"`，默认 `expand`；另导出纯函数 `roundBox`）。此前给的是浮点，而组件自称的坐标系是「原图像素」——落库（`list[int]` 之类的列约束）、服务端裁图（PIL / OpenCV / sharp 的 crop 都要整数，各自的隐式取整方向还不一致，裁出来差一两像素且没人解释得清）、`box === savedBox` 这种「有没有改过」的判断，三处都吃不下浮点。

  默认选 `expand`（左上 `floor`、右下 `ceil`）而不是 `nearest`：**取整不缩小框**，否则一个刚好拖够 `minSide` 的框会被收成 `minSide - 1`，人明明拖够了却存不上，症状是「拖了没反应」。`minSide` 的判定也相应移到取整之后，与最终出口一致。拖拽预览（`onDrafting`）仍是浮点，视觉更跟手。要亚像素传 `round="none"` 即回到旧行为；已在调用处自己包 floor/ceil 的可以删掉了（#72）。

**文档**

两条会**静默失效**、光看代码看不出来的坑写进了对应的 `<slug>.md`：

- `<Dot style={{ color }} />` 改不动圆点颜色——圆点是背景色，`color` 管的是文字色。那样写编译通过、guard 只报 `no-style-override`、页面上一律灰点，写的人以为生效了。自定义颜色只走 `color` prop。
- `RegionSelect` 的取整缺陷在 1:1 或整数倍缩放下完全测不出来（坐标本就落在整数上）。自己写测试请用除不尽的比例，库内用的是 756→396。

`nav-menu.md` 里那句「`render` 让读屏按链接播报」按实现更正为**需配 `semantics="list"`**——消费方正是照着这句话选型的。
