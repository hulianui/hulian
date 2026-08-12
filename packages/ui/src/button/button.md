---
slug: button
name: Button
category: forms
group: button
tags: []
exports: [Button, buttonVariants]
status: enriched
---

# Button

> 按钮 · CVA 变体 + press 动效 · forms/button

## 何时用

最常用的操作按钮，含 solid/soft/outline/ghost/link 变体、brand/danger 色调、loading 态与 press 缩放动效。需要特效吸睛 CTA 用 [ShimmerButton](../shimmer-button/shimmer-button.md)/[RainbowButton](../rainbow-button/rainbow-button.md)/[PulsatingButton](../pulsating-button/pulsating-button.md)；多按钮成组用 [ButtonGroup](../button-group/button-group.md)；只要按钮样式不要 `<button>` 语义用 `buttonVariants(...)` 拿 className。

## 导入
```ts
import { Button, buttonVariants } from "@hulianui/ui"
```

## Props

| 名称 | 类型 | 默认 | 说明 |
|------|------|------|------|
| variant | `"solid" ｜ "soft" ｜ "outline" ｜ "ghost" ｜ "link"` | `"solid"` | 视觉变体；`soft` 是浅语义底 + 同色文字，权重介于 `outline` 与 `solid` 之间（见下文） |
| tone | `"brand" ｜ "success" ｜ "warning" ｜ "danger" ｜ "neutral" ｜ "current"` | `"brand"` | 语义色调（见下表）。`current` 不是语义色，是「别设色、跟随容器继承」，**只对 `ghost` / `outline` 有效**（见「跟随容器的 tone="current"」） |
| size | `"xs" ｜ "sm" ｜ "md" ｜ "lg" ｜ "icon" ｜ "iconSm" ｜ "iconLg" ｜ "iconXs" ｜ "icon24" ｜ "icon28"` | `"md"` | 尺寸；`xs` 是 24px 密集档（中后台工具栏 / 表格行内）。`iconSm` / `icon` / `iconLg` 三档为正方形图标按钮，边长与同名文字档一一对应。密集端另有三个图标档 `iconXs`(20) / `icon24`(24) / `icon28`(28)，各钉一条行刻度（见下表） |
| block | `boolean` | `false` | 块级铺满容器宽度（移动端主操作、表单底部提交） |
| muted | `boolean` | `false` | 层级档：静息色降一档到次要灰，hover 回到本 tone 的色。**只对 `ghost` / `link` / `outline` 有效**（见「muted 层级档」） |
| loading | `boolean` | `false` | 加载态，显示 spinner 并自动禁用 |
| type | `"button" ｜ "submit" ｜ "reset"` | `"button"` | **默认是 `button` 而不是原生 `<button>` 的 `submit`**——表单里的辅助按钮不写 `type` 时不会误提交。提交按钮请显式写 `type="submit"` |
| ...ButtonHTMLAttributes | `ButtonHTMLAttributes<HTMLButtonElement>` | — | 透传原生属性（disabled 等） |

## Events

| 事件 | 类型 | 说明 |
|------|------|------|
| onClick | `(e: MouseEvent<HTMLButtonElement>) => void` | 点击回调，经 `ButtonHTMLAttributes` 透传 |

## Slots

| 插槽 | 类型 | 说明 |
|------|------|------|
| children | `ReactNode` | 按钮文案 |
| render | `ReactElement` | 渲染为自定义元素（如 `<a>`/Next `<Link>`），用于按钮样式的链接 CTA；样式与 `aria-disabled` 合并进该元素 |

## 语义档（tone）

按钮是 **`variant`（形态）× `tone`（语义）** 的二维模型，不是一维的 `type` 平铺 —— 「实心的成功按钮」和「描边的成功按钮」是两个正交选择，不必各开一个枚举值。

| tone | 用在什么操作上 | solid 形态 |
|------|---------------|-----------|
| `brand`（默认） | 页面主操作：提交、保存、下一步 | 品牌底 + 白字 |
| `success` | 确认类正向操作：通过、发布、启用 | 成功底 + 对应前景 |
| `warning` | 有代价但不销毁数据：驳回、下架、强制同步 | 警告底 + 对应前景 |
| `danger` | 不可逆的销毁操作：删除、注销、清空 | 危险底 + 对应前景 |
| `neutral` | 与主操作等重的次操作：取消并返回、跳过 | 反色底（前景色作底） |

```tsx
<Button tone="success">通过</Button>
<Button tone="warning" variant="outline">驳回</Button>
<Button tone="danger">删除</Button>
<Button tone="neutral">跳过</Button>
```

从一维 `type` 模型（Vant / Element 那套）迁过来时的对照：`type="primary"` → 默认 `<Button>`；`type="success"` → `tone="success"`；`type="default"` / `plain` → `variant="outline"`；`hairline` 已是全库默认，不必显式写。

## 浅色语义底（soft）

`soft` = 浅语义底 + 同色文字（Radix 叫 soft，MUI 叫 tonal，Ant 叫 filled），视觉权重介于
`outline` 与 `solid` 之间。**「浅色底」不等于「描边」**：`outline` 是画布同色底 + 语义色描边，
底色并没有变。要浅底就用 `soft`，不要去 `className` 里写 `bg-*-50`。

三个典型位置：

- **次主操作**：比 `solid` 弱（不抢页面主 CTA），比 `outline` 强（一眼看得出是品牌动作）。
- **成对出现的取消 / 放弃**：`variant="soft" tone="danger"` —— 带危险语义但不是满屏红块。
- **状态化触发器**：`variant={isActive ? "soft" : "outline"}` 表达「这个筛选开着」。

```tsx
<Button variant="soft">次主操作</Button>
<Button variant="soft" tone="danger">取消</Button>
<Button variant="soft" tone="success" size="xs">已启用</Button>
```

底色走的是库内既有的 `bg-{tone}/12` 透明度口径（hover 加深到 20%，`neutral` 用 `bg-foreground/8`
亮暗自适应），与 [Tag](../tag/tag.md) / [Chip](../chip/chip.md) / [Alert](../alert/alert.md) 的 `soft` 完全一致——
**刻意不用 `--color-*-subtle` 那族 token**：改用它，brand 得新造一个 `--color-primary-subtle`
再加四个 `*-subtle-hover`，库里就会同时存在两套 soft 配色，一处调色另一处不跟。

已知代价：底是半透明的，**会透出所在容器的背景色**。按钮坐在有色区块上时观感会偏，
遇到了带截图提 issue，别在 `className` 里自己补一层不透明底。

## muted 层级档

`ghost` / `link` / `outline` 的最弱色本来就是正文黑（`tone="neutral"` 也是），可日常界面里绝大多数**次要**文字链接与图标按钮，静息色是次要灰、hover 才回到正文黑。`muted` 补的就是这一档（#211、#221）：

```tsx
<Button variant="ghost" size="xs" muted>显示日志</Button>
<Button variant="link" muted>清空</Button>
<Button variant="link" tone="danger" muted>删除</Button>   {/* 静息灰，hover 才变红 */}
<Button variant="outline" size="xs" muted block>中止</Button>   {/* 描边留着，只降文字 */}
```

规则一句话：**静息色降到 `--color-muted-foreground`，hover 回到该 `tone` 的本色**（`ghost` / `outline` 另有各自的 hover 底）。所以 `tone="danger" muted` 是「静息灰、悬停变红」的删除链接，不是把语义色丢了——中后台密集行里这是常见形态。

`outline` 上它**只动文字**：底色 `bg-surface`、`border-hairline`、`hover:bg-surface-hover` 全部保留，非中性 `tone` 的语义色描边（`border-danger` 等）也保留。要「边框留着、文字降级」就用它，别退回 `ghost muted`——那会连边框一起丢掉，而很多场景里边框正是「这是个可点的框」这句话本身。典型位置是两态触发器的未激活态：`variant={active ? "soft" : "outline"}` 里，未激活的那半本来就该比激活态弱一档。

三条边界：

- **只对 `ghost` / `link` / `outline` 有效。** 落在 `solid` / `soft` 上一个类都不加，开发期会打一条 `warnOnce` 点名——静默无效的 prop 比报错更难查。这两档的底色与前景是成对的，单降前景会做出对比度不合规的组合。
- **是 opt-in，不改默认观感。** 不传 `muted` 的 `ghost` 仍是正文黑，既有调用一个像素都不动。表格行里的「查看」「重新加载」这类**正常强度**动作本来就该是正文黑，只有真正次要的那批才加 `muted`。
- **不是 `tone` 的第六档。** `tone` 是语义色 SSOT、横跨 29 个组件，而 muted 是**层级**不是色相；塞进 `tone` 会逼 `solid` / `soft` 回答「muted 实心是什么」，而 `bg-muted` 实心看起来就是禁用态。

## 跟随容器的 `tone="current"`

彩色卡片 / 彩色行里的图标按钮要**跟着容器变色**，而不是被拉回正文黑。`tone="current"` 表示「别设色，交给继承」（#215）：

```tsx
{/* 箭头跟着卡片一起是 green-700，而不是正文黑 */}
<div className="rounded-md border border-green-400 bg-green-100 p-2 text-green-700">
  <span className="text-xs font-medium">开始节点</span>
  <Button variant="ghost" size="iconXs" tone="current" aria-label="上移">
    <ChevronUp className="size-3" />
  </Button>
</div>
```

它和五个语义档的区别是：那五档给的都是**绝对色**，而这里要表达的是「容器已经决定了颜色，按钮别插手」。卡片可能是绿的也可能是蓝的，不该为每种卡片色新开一档。`muted` 同样是绝对色，方向还相反（钉到次要灰）。词沿用 `Spinner` 已有的 `tone="current"`。

- **只对 `ghost` / `outline` 有效**，落在 `solid` / `soft` / `link` 上渲染结果与不传时完全一致，并打一条 `warnOnce`。`solid` / `soft` 自带背景，前景色必须与背景成对，跟随容器会直接做出对比度不合规的组合；`link` 的静息色是主色，那是链接的身份而不是容器的。
- **是 opt-in**：不传 `tone` 的 `ghost` / `outline` 仍是 `text-foreground`。
- 调用点自己写了颜色类（`className="text-red-500"`）时**本来就赢**（`cn` 是 tailwind-merge）。`current` 补的是另一种情况：调用点**什么都不想写**、只要继承。

## 直接用 `buttonVariants(...)` 拿 className

出口已经过了一遍 tailwind-merge，可以原样贴到任意元素上：

```tsx
<a href="/docs" className={buttonVariants({ variant: "ghost", tone: "danger" })}>删除</a>
```

0.36.0 及更早版本**不是这样**：`cva` 只拼接不消解冲突，`buttonVariants()` 返回的串里同一个 CSS 属性会有多条并存（base 的 `text-foreground` 与 `text-danger`），贴到 `<a>` 上时谁生效由**样式表顺序**决定——16 个常用组合里有 6 个渲染成错的颜色，其中 3 个是「危险按钮丢掉红色」（#217）。`<Button>` 组件一直没有这个问题（内部有 `cn()`）。

需要再拼自己的类时照常用 `cn()`，两次 merge 是幂等的。

## 尺寸档

常规刻度三档，图标档的边长等于同名文字档的高度——**图标按钮与文字按钮混排一定要取同名的一对**，否则连排（[ButtonGroup](../button-group/button-group.md)）会露出台阶。

| 文字档 | 高度 | 字号 | 配套图标档 | 边长 |
|--------|------|------|-----------|------|
| `sm` | 32px | 14px | `iconSm` | 32px |
| `md`（默认） | 40px | 14px | `icon` | 40px |
| `lg` | 48px | 16px | `iconLg` | 48px |

密集端另有四档，**它们互相不等高**，各钉一条行刻度：

| 密集档 | 尺寸 | 字号 | 配它的是谁 | 用在哪 |
|--------|------|------|-----------|--------|
| `xs` | 高 24px | 12px | `icon24` | 中后台工具栏、表格行内、面板头部的文字按钮 |
| `iconXs` | 20px 见方 | — | 无（比任何文字档都矮） | 表格行内的纯图标微操作：树形展开箭头、拖拽手柄 |
| `icon24` | 24px 见方 | — | `xs` 文字档、[Tag](../tag/tag.md) 的 `md`、[Chip](../chip/chip.md) 的 `sm` | 与 `xs` 文字按钮同排的图标按钮 |
| `icon28` | 28px 见方 | — | [Chip](../chip/chip.md) 的 `md`、[Sidebar](../sidebar/sidebar.md) 菜单项的 `sm` | 28px 那条行刻度上的图标按钮（筛选胶囊行的清空键等） |

`xs` 是密集界面的最小文字档：一屏十几个操作时 `sm`（32px/14px）是**大一档**而不是最小档，
用它去接 24px 的工具栏，就得写一串覆盖类去撤销 `sm` 自己刚加的高度、内边距、字号和圆角。
`xs` 已经把圆角降到 4px、图文间距收到 4px，直接用即可，不要再加 `className` 补丁。

**`xs` 的配套图标档是 `icon24` 而不是 `iconXs`。** 名字带 `Xs` 的那个是 20px：它比 `xs` 还矮 4px，
是刻意的——把它抬到 24px 会把 `density="compact"` 的表格行撑高，而它存在的全部理由就是不撑高行。
两个名字看着像一对，实际是两条刻度，要等高就取 `icon24`（#222）。

这两档的名字是**数字**而不是 t-shirt 档，因为 `xs` 与 `sm` 之间的 t-shirt 名早被 `iconXs`(20px) 占了，
而那一档不能改边长（改了会无声地压扁所有靠它的展开器）。数字就是这两档的全部含义：钉住某个像素刻度。

圆角随边长分组：`icon24` 与 `xs` / `iconXs` 同为 4px（10px 的 `--radius` 落在 24px 方块上接近圆片），
`icon28` 保持 `--radius`，与 `iconSm`(32px) 同组。

**密集档只跟密集档混排**：`iconXs` 与 `xs` 同排差 4px，在 `items-center` 下看不出来；
但拿 `iconXs` 去配 `sm` 及以上的文字档会矮 12px 以上，`icon24` 配 `md` 同理。

```tsx
{/* 密集工具栏：xs 文字按钮 + icon24 图标按钮（等高），行内微操作用 iconXs */}
<Button size="xs" variant="outline">录制</Button>
<Button size="xs" variant="soft">已筛选</Button>
<Button size="icon24" variant="ghost" muted aria-label="更多">
  <ChevronRight className="size-4" />
</Button>

{/* 28px 那条行刻度：筛选胶囊 + 清空键 */}
<Chip>状态：进行中</Chip>
<Button size="icon28" variant="outline" muted aria-label="清空筛选">
  <X className="size-3.5" />
</Button>
```

```tsx
{/* ✅ 同名一对，等高 */}
<ButtonGroup><Button>保存</Button><Button size="icon"><ChevronDown className="size-4" /></Button></ButtonGroup>
{/* ❌ 跨档混排，差 8px */}
<ButtonGroup><Button>保存</Button><Button size="iconSm"><ChevronDown className="size-4" /></Button></ButtonGroup>
```

## 示例
```tsx
<Button>默认</Button>
<Button variant="soft">浅底次主操作</Button>
<Button variant="outline">描边</Button>
<Button tone="danger">危险</Button>
<Button tone="success" variant="soft">通过</Button>
<Button size="xs" variant="outline">密集工具栏</Button>
<Button block>块级主操作</Button>
<Button loading>加载中</Button>
```

## 禁忌 / 坑

- `render` 模式为降低风险**不套 motion**，故无 press 缩放动效（颜色/hover 过渡仍在）；文案优先取 Button 的 children。
- `loading` 会自动禁用按钮，无需再手动加 `disabled`。
- 按钮文字**不可被选中**（base 带 `select-none`）。按钮文案是控件标签不是内容，连点场景下浏览器会把连续点击识别成双击选词把文字刷成蓝底。要让用户复制的文本请别做成按钮。
- `tone` 只换语义色，不换形态。想要「浅色底的成功按钮」用 `tone="success" variant="soft"`，别去 `className` 里覆盖背景色。**注意不是 `variant="outline"`**：`outline` 给的是画布同色底 + 语义色描边，底色不会变浅，照着做会发现没效果然后转头去写 `bg-green-50`——那正是这条禁的事。
- `tone="neutral"` 的 `solid` 是**反色**（亮色下深底白字、暗色下浅底深字），不是灰底。灰底实心与 `variant="outline"` 几乎不可分辨，等于白开一档。
- 自定义往按钮里塞图标+文字（尤其在特效按钮里）若图标掉到下一行，是 Tailwind Preflight 把 `svg{display:block}` 撑成块级所致，见 [[tailwind-preflight-svg-block-breaks-icon-text-in-nonflex-button]]——容器要 `inline-flex`，本 Button 已处理，自搓 wrapper 时注意。
- 次级控件要表达「开/关」用 `variant="soft"`（浅语义底 + 语义文字），别在 `className` 里写 `bg-primary/10 text-primary` 顶色，也别退回 `solid` —— 一排 h-7 的工具栏控件里冒出一个实心主色块，视觉权重会盖过页面主操作。`soft` 与 `tone` 全族组合，典型写法是 `variant={isActive ? "soft" : "outline"}`。注意它不渲染 `aria-pressed`：真正的开关请用 [Toggle](../toggle/toggle.md)，`soft` 只适合「本身不 toggle、只是显示当前已生效」的触发器（如打开菜单的排序芯片）。

## 相关
[ShimmerButton](../shimmer-button/shimmer-button.md) · [RainbowButton](../rainbow-button/rainbow-button.md) · [PulsatingButton](../pulsating-button/pulsating-button.md) · [RippleButton](../ripple-button/ripple-button.md) · [ButtonGroup](../button-group/button-group.md) · [SocialButton](../social-button/social-button.md)
