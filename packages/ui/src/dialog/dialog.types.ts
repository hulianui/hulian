import type { ReactNode } from "react";

export interface DialogContentProps {
  /**
   * 标题（必填，a11y label）。
   *
   * 收 `ReactNode` 而非 `string`（#179）：「标题左边一个图标」是对话框最常见的标题形态
   * （删除确认的警示号、导入的上传号）。运行时本来就直接进 `Dialog.Title` 的 children，
   * 此前只是类型把口封死，消费方要么摘掉图标、要么塞进正文（读屏拿到的名字就错了）。
   */
  title: ReactNode;
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
  className?: string;
}
