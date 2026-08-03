---
"@hulianui/ui": minor
---

三件「照文档写就是错的」：Navbar 居中段真的居中、极坐标图例可关、TreeSelect 选得到中间层

三个 issue 的共同点是**没有报错**：写法照着文档，结果不对，肉眼容易当成自己写错了。

**Navbar：`NavbarBrand` 默认可伸长（默认行为变更）** — [#81](https://github.com/hulianui/hulian/issues/81)

`NavbarContent justify="center"` 此前并不在导航栏中心。根因是三段伸缩性不对称：`NavbarBrand` 是 `shrink-0`，两个 `NavbarContent` 各 `flex-1` 平分**剩余**空间，于是居中段只居中在「自己那一格」里，整体随品牌名长度左偏（1440 宽、100px 品牌名实测偏左 265px；品牌名越长偏得越多，同一份代码在不同租户站点上偏移还不一样）。

`NavbarBrand` 改为默认 `flex-1 basis-0`，三段等分。品牌内容仍靠 `justify-start` 贴左，且 flex 项默认 `min-width: auto` 不会被压小，**brand 段与 end 段的视觉不变**，变的只有中段真的落到了中心。

有一种版式会因此改变：**品牌 + 一段紧贴品牌的 `justify="start"` 内容**（没有居中段）。等分后那段内容会被推到 1/3 处。这种版式传 `grow={false}` 回到旧行为：

```tsx
<Navbar>
  <NavbarBrand grow={false}>瑚琏</NavbarBrand>
  <NavbarContent justify="start">…</NavbarContent>  {/* 仍紧贴品牌 */}
</Navbar>
```

品牌区要在窄屏截断时，除 `truncate` 外仍需自行加 `min-w-0`（解开 flex 项的 `min-width: auto`），这点没变。

**Chart：`RadarChart` / `PieChart` / `RadialChart` 补 `legend`，六件全部补 `legendScroll`** — [#80](https://github.com/hulianui/hulian/issues/80)

0.19.0 给 Area/Bar/Line 补了 `legend` 后，极坐标三件没跟上：它们的 `<Legend>` 写死在图内，消费方**既关不掉也挪不动**，自绘就变成两份图例并排（`legendStyle` 是内部常量，`className` 只到外层 `div`）。28 条序列时图例铺满 5 行，吃掉 `height={320}` 的一半有余，雷达盘被压扁、图例文字盖住角轴标签。

现在三件都吃 `legend?: boolean | "top" | "bottom"`，签名与笛卡尔三件一致。**默认 `true`**（它们历来自带图例），既有调用零改动；`legend={false}` 关掉。注意这是库内唯一一处默认值按图种分档的 prop：笛卡尔三件默认 `false`、极坐标三件默认 `true`。

代价说清楚：这三件的图例不再是 recharts 的 `<Legend>`，而是与其它三件同一套自绘图例（`Dot` 色点 + token 字号），**色块从方形变圆点、间距字号略有差异**；同时它不再参与 recharts 的内部高度分配，改由 `height` 精确让出一行。色点颜色与扇区/序列走同一条解析路径，不会对不上。

另补 `legendScroll`（六件通用，默认 `false`）：图例恒为单行 + 横向滚动，对齐 echarts 的 `legend.type: "scroll"`。序列多到换行时，「把 `height` 调大」并不成立——28 条序列的图例是 5 行，要把雷达盘撑回可读尺寸得把总高翻倍。开了它图例永远只占一行（让出 32px 给常显细滚动条），画布拿走其余全部：

```tsx
{/* 关掉自带图例，自己画 */}
<RadarChart legend={false} data={data} series={series} xKey="indicator" height={320} />

{/* 28 条序列：图例单行横滚，不吃画布 */}
<RadarChart legendScroll data={data} series={series28} xKey="indicator" height={320} />
```

超出部分要横滑才看得到——序列多到几十条时这是取舍，不是免费的。

**TreeSelect：透传 `expandTrigger`，单选可以选到中间层** — [#78](https://github.com/hulianui/hulian/issues/78)

单选 `TreeSelect` 此前**只有叶子节点选得中**：内部 `Tree` 的 `expandTrigger` 默认 `"row"`，有子节点的行点了只展开就 return，走不到 `setSelected`，`onChange` 永远不触发，点几次都选不中，而这个能力没有开放给消费方。

`TreeSelect` 现在透传 `expandTrigger?: "row" | "icon"`，默认仍是 `"row"`（既有行为不变）。要「选到中间层」——选到某个部门、某个大类、某一册教材——传 `"icon"`：箭头管展开、行的其余部分管选中，与多选态「勾选框管选、行管展开」在心智上对称。

```tsx
<TreeSelect nodes={NODES} expandTrigger="icon" value={v} onChange={setV} placeholder="选择章节" />
```

多选（`checkable`）不受影响：勾选框是独立命中区。三件的「禁忌 / 坑」都已补上对应说明——这三条此前在文档里全看不出来。
