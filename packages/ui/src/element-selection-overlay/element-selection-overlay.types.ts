import type { ElementPathSource } from "./element-path";
import type { OverlayRect } from "./overlay-geometry";

/** 一次 hover / 选中的完整信息（path 之外的东西都在这里，避免消费方再去查 DOM）。 */
export interface ElementSelectionDetail {
  /** 元素路径（marked 时是标记原值，structural 时是相对目标根的 CSS 选择器）。 */
  path: string;
  /** 路径来源，消费方据此判断可靠程度。 */
  source: ElementPathSource;
  /** 就近读到的组件名（`data-hulian-component`），没有则 null。 */
  component: string | null;
  /** 元素标签名（小写）。 */
  tagName: string;
  /** 路径指向的元素本体（跨 iframe 时属于 iframe 的 realm，不要 instanceof 判断）。 */
  element: Element;
  /** 元素在**宿主视口**里的位置（已叠加 iframe 偏移）。jsdom 下恒为 0。 */
  rect: OverlayRect;
}

/** 目标无法接管的原因。 */
export type ElementSelectionOverlayErrorCode =
  /** 跨源 iframe：读不到 contentDocument，本组件明确不支持（见文档「禁忌 / 坑」）。 */
  | "cross-origin"
  /** 目标是 iframe 但还没有可用文档（未插入 DOM / 已卸载）。 */
  | "no-document";

export interface ElementSelectionOverlayError {
  code: ElementSelectionOverlayErrorCode;
  /** 可直接展示给开发者的说明，语言跟随 ConfigProvider 的 locale（未包 Provider 时为内置中文）。分支判断请用 `code`。 */
  message: string;
  /** 出问题的目标节点。 */
  target: Element | null;
}

export interface ElementSelectionOverlayProps {
  /**
   * 目标区域：普通 DOM 容器（在其内部选择）或**同源** iframe（在其文档内选择）。
   * null / undefined → 组件不渲染也不监听（ref 尚未就绪时的正常状态）。
   */
  target: HTMLElement | HTMLIFrameElement | null | undefined;
  /** 是否处于选择模式。false 时停止 hover 拾取与点击拦截，但仍绘制已选中的框。默认 true。 */
  enabled?: boolean;
  /**
   * 可选中元素的 CSS 选择器。给定后，指针落点会向上找最近的匹配祖先，
   * 匹配不到则不高亮 —— 用来把选择范围限定在「组件级」而不是每个 span。
   */
  highlightSelector?: string;
  /** 排除选择器：命中（含祖先命中）的元素不可 hover / 选中。 */
  ignoreSelector?: string;
  /** 是否显示标签。默认 true。 */
  showLabel?: boolean;
  /** 标记路径的属性名。默认 `data-hulian-path`。 */
  pathAttribute?: string;
  /** 标记组件名的属性名。默认 `data-hulian-component`。 */
  componentAttribute?: string;
  /** 结构化路径是否在带 id 的祖先处锚定。默认 true。 */
  anchorOnId?: boolean;
  /**
   * 受控选中路径。传了（含 null）即视为受控：组件不再自行记选中态，
   * 只按此 path 在目标里回查元素并画框。不传则内部自管。
   */
  selectedPath?: string | null;
  /** 是否吞掉目标里的点击（阻止预览内的链接跳转 / 按钮触发）。默认 true。 */
  interceptClicks?: boolean;
  /** 选中（点击，或目标内按 Enter / 空格）。 */
  onSelect?: (path: string, detail: ElementSelectionDetail) => void;
  /** hover 变化；移出或落在不可选区域时给 (null, null)。 */
  onHover?: (path: string | null, detail: ElementSelectionDetail | null) => void;
  /** 清除选中（点空白处 / 按 Esc）。 */
  onClear?: () => void;
  /** 目标不可接管（跨源 iframe 等）。同一目标只报一次。 */
  onError?: (error: ElementSelectionOverlayError) => void;
  /** 叠加层 z-index。默认 100（同 Tour）。 */
  zIndex?: number;
  /** 叠加层容器类名。 */
  className?: string;
}
