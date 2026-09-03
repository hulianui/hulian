import type { ReactNode } from "react";

export interface DialogContentProps {
  /**
   * 标题（a11y label 的常规来源）。
   *
   * 收 `ReactNode` 而非 `string`（#179）：「标题左边一个图标」是对话框最常见的标题形态
   * （删除确认的警示号、导入的上传号）。运行时本来就直接进 `Dialog.Title` 的 children，
   * 此前只是类型把口封死，消费方要么摘掉图标、要么塞进正文（读屏拿到的名字就错了）。
   *
   * 承载元素是 `<h2>`，**只收 phrasing content**：标题旁边要摆按钮时放 `extra`，
   * 别把整行塞进这里（非法嵌套，且读屏会把按钮文案念进对话框的名字里）。
   *
   * 0.47.0 起由必填改为可选（#272）：改前的「必填」并不真的保证有名字 —— `title={null}`
   * 一样过类型检查，渲染出的是个空 `<h2>`，读屏拿到的名字是空串。真正的保证换成了运行时告警：
   * `title` / `aria-label` / `aria-labelledby` 三者全无时开发期会喊。
   */
  title?: ReactNode;
  /**
   * 标题右侧的操作区（#272）。与 `title` 同排一行，右对齐，不参与 a11y 名字。
   * 形状同 [CardHeader.extra](../card/card.md) 与 [DrawerContent.extra](../drawer/drawer.md)。
   */
  extra?: ReactNode;
  /**
   * 说明文案（可选）。
   *
   * **只能放 phrasing content**（文本、`<span>`、`<strong>`、`<a>`…）：Base UI 的
   * `Dialog.Description` 渲染成 `<p>`，塞 `<div>` / `<ul>` / 卡片这类块级内容是非法嵌套，
   * 浏览器会提前闭合 `<p>`，React 当场报 hydration mismatch。块级正文放 `children`。
   */
  description?: ReactNode;
  children?: ReactNode;
  /** 底部操作区（如取消/确定按钮）。渲染在正文下方，顶部分隔线 + 右对齐，与 DrawerContent 对齐。 */
  footer?: ReactNode;
  /**
   * 右上角关闭按钮（#279）。形状与默认值都与 `DrawerContent` 对齐 —— #63 的理由对
   * 对话框一字不改地成立：只读详情型对话框（没有 footer、正文没有关闭控件）此前唯一的
   * 可见退路只有点遮罩，键盘用户只剩 Esc，读屏用户对话框里根本没有「关闭」可达元素。
   *
   * 开着时标题/`extra` 行自动让出右上角 40px（`pr-10`），长标题不会钻到按钮底下。
   * 全局搜索框这类自带关闭手段的弹层传 `false` 关掉。
   * @default true
   */
  showClose?: boolean;
  /** 关闭按钮的无障碍名。缺省吃 ConfigProvider locale（`dialog.close`，zh「关闭」/ en "Close"）。 */
  closeLabel?: string;
  /** 追加到标题（默认 `text-lg font-semibold`）。走 twMerge，可压成正文字号。 */
  titleClassName?: string;
  /**
   * 追加到说明文案（默认 `text-sm text-muted-foreground`）。走 twMerge。
   * 传 `"sr-only"` 即「只给读屏的说明」：可见区域只留标题，读屏仍拿得到那句话。
   */
  descriptionClassName?: string;
  /**
   * 是否渲染遮罩层。默认 `true`。
   *
   * 关掉它才能得到真正的**非模态**浮层（进度、通知这类「陪跑型」自动弹出的面板）：
   * 只给 Root 传 `modal={false}` 是不够的 —— 遮罩那层 `inset-0` 即使透明也照样吃掉整屏点击，
   * 两边要一起关（#185）。
   */
  backdrop?: boolean;
  /**
   * 追加到遮罩层（默认 `bg-black/40 backdrop-blur-sm`）。走 twMerge，
   * 传 `bg-black/10 backdrop-blur-none` 即可把浓度调成自家设计系统的口径。
   */
  backdropClassName?: string;
  /**
   * 正文区是否自带纵向滚动。默认 `true`。
   *
   * 关掉它，正文区变成列向 flex 容器：确定高度直接传给 children，
   * 于是「左清单 + 右预览各自滚动」这类版式只要给子级写 `flex-1 min-h-0` 即可，
   * 不必再拍一个 `h-[58vh]` 去凑「max-h 减标题减 footer」（#188）。
   * 此时纵向滚动由消费方在自己的子容器上负责。
   */
  scrollable?: boolean;
  /** 追加到正文区容器（与 `scrollable` 配合，可把 `overflow-y-auto` 换成自家排版）。 */
  bodyClassName?: string;
  /**
   * 允许按住标题行拖动对话框。默认 `false`。
   *
   * 把手是标题行（`title` 与 `extra` 所在的那一行），行里的按钮等交互元素照常点击、不起拖。
   * 没有 `title` / `extra`、可见 header 由你自己画时，给自家把手元素加 `data-drag-handle` 即可。
   *
   * 位移写在 popup 的内联 `left` / `top`，不碰 `translate` / `transform`（它们在浮层的过渡列表里，
   * 拿来承载拖拽会让每一步都吃缓动）：你用 className 改的
   * 初始位置（`top-10 translate-y-0` 之类）照常生效，拖动只在它的结果上累加。整块不会被拖出视口。
   * 位置不跨开关保留：每次打开都回到初始位置。这只是鼠标 / 触控的便利，没有键盘等价操作，
   * 所以别把「能挪开看底下的内容」当成功能前提 —— 需要边看边填的场景用非模态（`backdrop={false}`）。
   */
  draggable?: boolean;
  className?: string;
  /**
   * 对话框的无障碍名，直接落到 popup 上（#272）。
   *
   * 铺满型对话框（`className="p-0 [--hl-overlay-pad:0px]"`）的可见 header 由消费方自己画时，
   * 那一行控件进不了 `<h2>`；此时不给 `title`、只写 `aria-label="通知"` 即可，
   * 不必再渲一个 `sr-only` 的假标题。
   */
  "aria-label"?: string;
  /**
   * 对话框无障碍名的来源元素 id（#272）。指向页面上已有的可见标题时用它，
   * 优先于 `title` 自动生成的那个 id。与 `aria-label` 二选一即可。
   */
  "aria-labelledby"?: string;
}
