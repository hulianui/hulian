import { cloneElement, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { cn } from "../lib/cn";

// Button 底座里**与配色无关**的那一半，单独拆出来给 effects 分类下自绘背景的特效按钮共享
// （ShimmerButton / RainbowButton / PulsatingButton / RippleButton，见 #126）。
//
// 为什么不让它们内部直接渲染 <Button>：特效件的背景是自己的（微光 / 彩虹渐变 / 脉冲 / 波纹），
// 吃不了 bg-primary。也不给 Button 加 effect prop：那会把特效代码拖进核心 Button 的打包路径，
// 而 Button 的首屏体积本来就紧张。
//
// 为什么这些字符串不放在 button.tsx 里：那个文件是 "use client" 且引了 motion，四个特效件里有
// 三个是 RSC 安全的纯 CSS 组件，从那边 import 会把 client 边界和 motion 一起拖进来。本模块无副作用、
// 无 client 依赖，两边都能引。

/**
 * 排布：图标与文案同行居中、不换行。与状态、配色、圆角都无关。
 *
 * `shrink-0` 是防御性的（#216）：按钮作为 flex 子项时 `flex-shrink` 默认是 1，在空间不够的行里
 * 会被压到**比它声明的尺寸更窄**。`whitespace-nowrap` 只保证文字不折行，不保证盒子不被压缩——
 * 两者一起作用的结果是内容溢出按钮的可视边界，而不是按钮守住尺寸把兄弟挤走。
 * 消费方实测：拥挤的工具栏行里 24px 的按钮渲染成 18.2px。
 * 它不改变任何现有渲染尺寸，与 `block`（`w-full`）也不冲突——「铺满但不被压」正是想要的。
 */
const LAYOUT =
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap font-medium";

/**
 * 交互态：焦点环、禁用态、文本不可选。
 * 这三样此前四个特效件各漏一遍 —— 焦点样式与全库不统一（同一页面两套焦点语言）、
 * 传了 disabled 只是点不动但看上去和可用状态一模一样、连点会把按钮文字刷成蓝底。
 */
const INTERACTION =
  "select-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

/** 普通 Button 的 base：排布 + 圆角 + 颜色过渡 + 交互态。 */
export const BUTTON_BASE_CLASS = `${LAYOUT} rounded-[var(--radius)] transition-colors ${INTERACTION}`;

/**
 * 特效按钮的 base：只有排布与交互态。
 * **刻意不含圆角**——特效件各自用 var(--hulian-…) 形态的自定义圆角类，
 * （这行注释刻意不写成任意值类的方括号形态：Tailwind v4 的扫描器不区分注释与代码，
 *   带通配符的那一份会被当成真类名，生成 `border-radius: var(--hulian-*)` 让消费方 CSS 解析直接失败）
 * 两条规则都生成 `border-radius` 时谁赢由样式表顺序决定，不由 className 顺序决定，
 * 混在一起就是不可预测的。也不含 `transition-colors`：它们变的是背景动画不是颜色。
 */
export const EFFECT_BUTTON_BASE_CLASS = `${LAYOUT} ${INTERACTION}`;

/**
 * 尺寸档。同名的图标档边长严格等于文字档的高度（32/40/48），
 * 这样图标按钮与任意文字按钮、与特效按钮混排都等高。
 * 密集端（xs 24 / "28" / iconXs 20 / icon24 / icon28）不走同名对应，见下面各自的注释。
 * 其中只有 `"28"` 与 `icon28` 是一对（边长 = 高度），其余各钉一条独立的行刻度。
 */
export const BUTTON_SIZE_CLASS = {
  // 24px 密集文字档（#204）：与 iconXs 一起构成「密集刻度」。
  // sm(32px/14px) 对中后台工具栏与表格行内是**大一档**而不是最小档——消费仓实测「本该能迁」
  // 的 195 处裸 <button> 里有 134 处落在 20~28px 高、10~12px 字上，用 sm 强行迁要写 6 个覆盖类
  // 去撤销 sm 与 base 刚加的东西（h-8 / px-3 / text-sm 加 base 那条 10px 圆角），那种迁移只会被原样退回。
  //
  // 尺寸取 h-6 px-2 text-xs：与 Tag 的 md 档同一组数值（tag.tsx），密集区里 Button 与 Tag
  // 并排时上下沿对齐。gap 也随之从 base 的 gap-2 收到 gap-1 —— 24px 高、8px 内边距的按钮里
  // 再留 8px 图文间距，图标会飘得离文字太远；Tag 在同一高度上用的也是 gap-1。
  //
  // 圆角与 iconXs 同为 rounded-sm(4px)：这两档常在同一条工具栏里并排，半径不一致会看出来。
  // 同样**不能写裸 `rounded`**，理由见下面 iconXs 那段。
  //
  // 配套的图标档是 icon24（0.38.0 / #222 补），不是 iconXs——后者是 20px，服务的是表格行内的
  // 纯图标微操作，把它抬到 24px 会把 density="compact" 的行撑高（#146 的原始诉求），
  // 所以两档并存而不是二选一。
  xs: "h-6 gap-1 px-2 text-xs rounded-sm",
  // 28px 密集文字档（#228）。名字是**裸数字**，与 icon24 / icon28 同一条口径（见下面那段）：
  // xs(24) 与 sm(32) 之间的 t-shirt 名早被占满，图标档在这一格已经直接写边长了，文字档没有
  // `icon` 前缀，对称的名字就是 `"28"`。造 `xsPlus` / `smMinus` 只会越描越黑。
  //
  // 补它的理由是「同一行里图标钮迁得了、紧挨着的文字按钮迁不了」：0.38.0 补完 icon28 之后，
  // 28px 那条行刻度上的清空键能用库了，左边的「筛选」文字按钮却只能继续裸 <button>——
  // 套 xs 会矮 4px，在一行只有两个控件的地方看得一清二楚；套 sm 会把整行撑高 4px。
  // 这与 #222 描述的症状是同一个，只是换了个方向重演。
  //
  // 三个数值各有判据，不是在 xs 与 sm 之间随手取中点：
  //   · 高度 h-7：28px 是库内既有刻度，对齐对象与 icon28 相同（Chip 的 md、Sidebar 菜单项的 sm）。
  //   · 字号 text-xs(12px)：跟 xs 走而不是跟 sm 走。密集端的字号口径记在 xs 那段里——消费仓实测
  //     「本该能迁」的裸 <button> 有 134 处落在 **20~28px 高、10~12px 字**上，28 就在那条带的顶端。
  //     给 14px 会让这批调用点一律补写 text-xs，那正是 xs 那段反对的「写覆盖类撤销刚加的东西」。
  //     Chip md / Sidebar sm 在同一高度上用 text-sm，但它们是本档的**高度**对齐对象不是字号对齐对象：
  //     一个是胶囊令牌、一个是整行导航项，都不是密集工具栏里的按钮。
  //   · 内边距 px-2.5(10px) 与图文间距 gap-1.5(6px)：按高度在 xs 与 sm 之间线性插值
  //     （高 24/28/32 → 内边距 8/10/12，间距 4/6/8），两个值都落在 Tailwind 既有刻度上，
  //     其中 gap-1.5 与 Chip 的 md 档在同一高度上取的是同一个值。
  //
  // 圆角**不覆盖**，保持 base 的 --radius：判据同 icon28——10px 半径落在 28px 上是 0.36，
  // 与 iconSm(32px) 的 0.31 同组，读不成圆片。所以这一档与 icon28 并排时半径也一致。
  "28": "h-7 gap-1.5 px-2.5 text-xs",
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  // 纯图标方形按钮（无文字内边距）：免去消费方手贴 size-10 px-0 之类补丁。
  // 0.26.0 前 icon 是孤立的 36px，与任何文字档都对不齐（见 #97）。
  icon: "size-10 p-0",
  iconSm: "size-8 p-0",
  iconLg: "size-12 p-0",
  // 20px 档：**不与任何文字档等高**（离它最近的 xs 是 24px，差 4px），故意不叫 iconXs 之外的
  // 名字。它服务的是「密集表格行内的微型操作」——树形展开箭头、拖拽手柄、单元格里的小动作，
  // 常见就是 16–20px。最小的 iconSm(32px) 塞进 density="compact" 的行会把行高撑起来，
  // 信息密度当场垮掉（#146）。
  //
  // 这个档一直真实存在，只是此前只有库内部享受得到：Table 的展开器与拖拽手柄都手写了
  // 同一份 size-5，既没收编回 Button，也没导出给消费方 —— 于是「别写裸 button」的建议
  // 和「库里没有能用的按钮」形成闭环。
  //
  // 圆角必须显式降档，否则 base 的 --radius(10px) 落在 20px 方块上就是个圆片。
  //
  // ⚠️ 这里**不能写裸 `rounded`**：本库在 @theme 里注册了 `--radius`，于是 Tailwind v4 的
  // 裸 `rounded` 就是 `border-radius: var(--radius)` —— 与 base 那条完全同义，twMerge 去重
  // 之后仍然是 10px。Table 内建展开器此前手写的正是裸 `rounded`，所以它一直渲染成圆片。
  // 用 `rounded-sm`（Tailwind 默认 --radius-sm，本库未覆盖 = 4px）才真的降下来。
  // 判据只能靠实机量 borderRadius：className 断言在这上面是绿的，因为两个类名确实不同。
  iconXs: "size-5 rounded-sm p-0",
  // 24 / 28 两档密集图标档（#222）。名字是**数字**而不是 t-shirt 档，因为 xs~sm 之间的
  // t-shirt 名早就被占了：iconXs 是 20px（且不能动，消费方的树形展开器正靠它，改边长等于
  // 无声破坏），而 24px 才是 xs 文字档的配套。与其造 icon2xs / iconXsPlus 这类越描越黑的名字，
  // 不如直接写边长——这两档本来就是「钉住某个像素刻度」的插档，数字是它们的全部含义。
  //
  // 两档都不是拍脑袋的刻度，各有库内的对齐对象（同 #204 定 xs=24 时「与 Tag md 同高」的判据）：
  //   24px → Button 的 xs 文字档、Tag 的 md 档、Chip 的 sm 档
  //   28px → Button 的 "28" 文字档（#228 补，此前这一格只有图标形态）、Chip 的 md 档、Sidebar 菜单项的 sm 档
  // 缺了它们，密集行里「文字按钮用库、图标按钮手写 size-6 / size-7」就是必然结果。
  //
  // 圆角刻意不同，判据是 10px 的 --radius 落在这个边长上是否读成圆片（半径/边长越接近 0.5
  // 越像圆）：24px 上是 0.42（与 xs / iconXs 同组，降到 rounded-sm），28px 上是 0.36，
  // 与 iconSm(32px) 的 0.31 同组，故保持 base 的 --radius 不覆盖——Sidebar 的 28px 菜单项
  // 用的也正是 rounded-[var(--radius)]。
  icon24: "size-6 rounded-sm p-0",
  icon28: "size-7 p-0",
} as const;

/**
 * 特效按钮只开放三档文字尺寸——它们没有纯图标形态。
 *
 * 也**刻意不含 xs**（#204）：特效件是「吸睛 CTA」，微光扫过、彩虹描边、脉冲光晕都需要面积才读得出来，
 * 24px 高的密集档上这些效果只剩噪点；而且它们的 base 刻意不带圆角（各自用 var(--hulian-…) 的自定义
 * 半径），xs 里的 rounded-sm 到了那边不生效，等于给出一档「看着像 xs 但圆角不对」的假档。
 * 密集工具栏本来也不该出现特效 CTA。
 */
export type EffectButtonSize = "sm" | "md" | "lg";

/**
 * `render`：把按钮样式套到自定义元素上（`<a>` / Next `<Link>`），用于「按钮样式的链接」CTA。
 *
 * 抽成公共 helper 而不是各写一份：ShimmerButton 早已把这段逻辑抄过一遍，再来一个特效件就是
 * 第三份拷贝。合并规则是「本组件的 props/style/className 在前，render 元素自带的在后」——
 * 调用方在 render 元素上写的东西永远能覆盖默认值。
 */
export function renderAsElement(
  render: ReactElement,
  props: Record<string, unknown>,
  className: string,
  style: CSSProperties | undefined,
  children: ReactNode,
): ReactElement {
  const own = render.props as Record<string, unknown>;
  return cloneElement(
    render,
    {
      ...props,
      style: { ...style, ...((own.style as CSSProperties) ?? {}) },
      className: cn(className, own.className as string | undefined),
    } as Record<string, unknown>,
    children,
  );
}
