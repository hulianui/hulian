import type { MutableRefObject, ReactNode } from "react";

/** 画布坐标点（世界坐标，未经视口变换）。平移量 pan 也用这个形状。 */
export interface DesignCanvasPoint {
  x: number;
  y: number;
}

/**
 * 视口变换：平移 (x,y) 屏幕像素 + 缩放 zoom。
 * 约定与 Flow 完全一致 —— 屏幕点 = 世界点 * zoom + (x, y)，(x,y) 相对画布容器左上角。
 */
export interface DesignCanvasViewport {
  x: number;
  y: number;
  zoom: number;
}

/** 世界坐标下的矩形（左上角 + 宽高，宽高恒为非负——组件内部只在 resize 中途允许出现负值并即时归一）。 */
export interface DesignCanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 世界坐标包围盒（与 Flow 的 fitViewport 入参结构一致，可直接喂给它）。 */
export interface DesignCanvasBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** 八向 resize 手柄方位（n/s/e/w 组合，字母集合固定，可用 includes 逐轴判定）。 */
export type DesignCanvasResizeDirection = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw";

/** 画布托管几何的元素。id 同时是 onSelect 回吐的 elementPath，可用 "root/header/logo" 这类路径串。 */
export interface DesignCanvasItem extends DesignCanvasRect {
  id: string;
  /** 锁定：不可拖动、不出 resize 手柄（仍可选中、仍可 Tab 到）。 */
  locked?: boolean;
  /** 无障碍名。缺省用 id。 */
  label?: string;
}

/** renderItem 拿到的渲染态。 */
export interface DesignCanvasItemState {
  selected: boolean;
  /** 正被拖动（此帧的矩形是本地草稿，尚未回吐 onItemsChange）。 */
  dragging: boolean;
  /** 正被 resize。 */
  resizing: boolean;
}

/** 组件内的可配文案（无障碍名 + 工具条按钮）。传部分即可，其余取内置简体中文。 */
export interface DesignCanvasLabels {
  canvas: string;
  item: string;
  zoomIn: string;
  zoomOut: string;
  fitView: string;
  resetView: string;
}

export interface DesignCanvasProps {
  /**
   * 受控元素数组 —— 画布**托管**这些元素的几何（拖动 / resize / 方向键微调都改它们）。
   * 不传则画布只是一块可平移缩放的空白世界，几何全交给 children 自己。
   */
  items?: DesignCanvasItem[];
  /** 渲染元素内容（定位、选中框、手柄由组件负责）。不传则渲染一个占位空框。 */
  renderItem?: (item: DesignCanvasItem, state: DesignCanvasItemState) => ReactNode;
  /** 几何变化后回吐**整组**新 items（拖动/resize 在指针抬起时提交一次，方向键每次按下提交一次）。 */
  onItemsChange?: (items: DesignCanvasItem[]) => void;
  /** 选中元素后按 Delete / Backspace。不传则不响应删除键。 */
  onItemDelete?: (id: string) => void;

  /**
   * 自绘图层，直接挂进世界坐标层（跟随平移缩放）。
   * 标了 `data-canvas-item="<id>"` 的子树同样可被点选 / 事件委托选中，但几何由你自己摆——
   * 画布不认识它的矩形，因而不出 resize 手柄、拖不动。要托管几何就把它放进 `items`。
   */
  children?: ReactNode;

  /** 缩放受控。传了就以它为准，组件只回吐 onZoomChange。 */
  zoom?: number;
  /** 非受控初始缩放。默认 1。 */
  defaultZoom?: number;
  onZoomChange?: (zoom: number) => void;

  /** 平移受控（画布原点在容器内的屏幕像素偏移）。 */
  pan?: DesignCanvasPoint;
  /** 非受控初始平移。默认 `{ x: 0, y: 0 }`。 */
  defaultPan?: DesignCanvasPoint;
  onPanChange?: (pan: DesignCanvasPoint) => void;

  /** 选中受控（元素 id / 路径；null = 无选中）。 */
  selectedElement?: string | null;
  /** 非受控初始选中。默认 null。 */
  defaultSelectedElement?: string | null;
  /** 选中变化（点元素 = 它的 id，点空白 = null）。 */
  onSelect?: (elementPath: string | null) => void;

  /** 缩放下限 / 上限。默认 0.1 / 4（设计画布比 Flow 需要更大的行程）。 */
  minZoom?: number;
  maxZoom?: number;
  /** 网格底纹：true = 40 世界单位，数字 = 自定义边长，false 关闭。默认 true。 */
  grid?: boolean | number;
  /** 拖动 / resize / 方向键的吸附步长（世界单位）。0 = 不吸附。默认 0。 */
  snap?: number;
  /** 元素最小宽高（世界单位）。默认 8。 */
  minItemSize?: number;
  /** 滚轮默认行为，按住 Ctrl/⌘ 反转。默认 "zoom"（以指针为锚点）。 */
  wheelBehavior?: "zoom" | "pan";
  /** 是否显示右下角缩放工具条。默认 true。 */
  controls?: boolean;
  /** 只读：禁用拖动 / resize / 删除，仍可选中、平移、缩放。 */
  readOnly?: boolean;
  /** 画布外层类名（须有确定高度，组件填满）。 */
  className?: string;
  /** 覆盖内置文案。 */
  labels?: Partial<DesignCanvasLabels>;
  /** 命令式句柄。 */
  apiRef?: MutableRefObject<DesignCanvasApi | null>;
}

/** 命令式画布句柄。 */
export interface DesignCanvasApi {
  zoomIn: () => void;
  zoomOut: () => void;
  /** 复位到 zoom=1、pan=(0,0)。 */
  reset: () => void;
  /** 缩放平移到刚好装下所有 items（无 items 时不动）。 */
  fitView: () => void;
  /** 屏幕坐标（相对画布容器左上角）→ 世界坐标。 */
  screenToCanvas: (screenX: number, screenY: number) => DesignCanvasPoint;
}
