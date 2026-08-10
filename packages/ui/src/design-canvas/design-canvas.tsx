"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { cn } from "../lib/cn";
import { GridPattern } from "../grid-pattern";
import { hasInteractiveAncestorWithin } from "../lib/drag-guard";
import { fitViewport, screenToCanvas, zoomAtPoint } from "../flow/flow-geometry";
import { useComponentLocale } from "../config/locale-context";
import { canvasToScreen, itemsBounds, moveRect, resizeRect } from "./design-canvas-geometry";
import type {
  DesignCanvasApi,
  DesignCanvasItem,
  DesignCanvasLabels,
  DesignCanvasPoint,
  DesignCanvasProps,
  DesignCanvasRect,
  DesignCanvasResizeDirection,
  DesignCanvasViewport,
} from "./design-canvas.types";

// 视觉设计画布（"use client" · 零额外依赖 · 原生 Pointer Events）：
//  · 与 Flow 的分工：Flow 编排「节点 + 连线」的拓扑，DesignCanvas 编排「矩形在平面上的自由摆放」。
//    两者共用同一套视口数学（见 design-canvas-geometry 顶部注释），但语义与交互完全不同。
//  · 子元素识别走 **data 属性 + 事件委托**（closest("[data-canvas-item]")），消费方不必给每个子元素塞 ref。
//  · items 与 children 不是两套互斥 API：items 是「画布托管几何」的元素（可拖可 resize），
//    children 是自绘图层；两者都能被选中，区别只在画布认不认识它的矩形。
//  · 拖动 / resize 中途只改本地草稿，指针抬起才回吐 onItemsChange —— 与 Flow / Kanban 的受控范式一致。

const ZOOM_STEP = 1.2;
const FIT_PADDING = 48;
const DEFAULT_GRID = 40;
/** 网格线密到这个屏幕间距以下就不画了，否则缩小时整片糊成实色。 */
const MIN_GRID_SCREEN_GAP = 4;

// 内置兜底：没包 ConfigProvider 时 useComponentLocale() 取不到字典，仍要有可用的中文文案。
const FALLBACK_LABELS: DesignCanvasLabels = {
  canvas: "设计画布",
  item: "画布元素",
  zoomIn: "放大",
  zoomOut: "缩小",
  fitView: "适配视图",
  resetView: "复位视图",
};

const HANDLES: DesignCanvasResizeDirection[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

// 手柄定位：锚在选框的边 / 角上再各自回退半个身位，八个方位共用同一套 -translate-1/2。
const HANDLE_CLASS: Record<DesignCanvasResizeDirection, string> = {
  nw: "left-0 top-0 cursor-nwse-resize",
  n: "left-1/2 top-0 cursor-ns-resize",
  ne: "left-full top-0 cursor-nesw-resize",
  e: "left-full top-1/2 cursor-ew-resize",
  se: "left-full top-full cursor-nwse-resize",
  s: "left-1/2 top-full cursor-ns-resize",
  sw: "left-0 top-full cursor-nesw-resize",
  w: "left-0 top-1/2 cursor-ew-resize",
};

const ARROW_DELTA: Record<string, DesignCanvasPoint> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

type Gesture =
  | { kind: "pan"; startX: number; startY: number; pan: DesignCanvasPoint }
  | { kind: "move"; id: string; startX: number; startY: number; rect: DesignCanvasRect }
  | {
      kind: "resize";
      id: string;
      dir: DesignCanvasResizeDirection;
      startX: number;
      startY: number;
      rect: DesignCanvasRect;
    };

const EMPTY_ITEMS: DesignCanvasItem[] = [];

export function DesignCanvas({
  items = EMPTY_ITEMS,
  renderItem,
  onItemsChange,
  onItemDelete,
  children,
  zoom,
  defaultZoom = 1,
  onZoomChange,
  pan,
  defaultPan,
  onPanChange,
  selectedElement,
  defaultSelectedElement = null,
  onSelect,
  minZoom = 0.1,
  maxZoom = 4,
  grid = true,
  snap = 0,
  minItemSize = 8,
  wheelBehavior = "pan",
  controls = true,
  readOnly = false,
  className,
  labels,
  apiRef,
}: DesignCanvasProps) {
  // 优先级：labels prop > ConfigProvider 的 locale > 内置中文兜底。
  const localeLabels = useComponentLocale().designCanvas ?? FALLBACK_LABELS;
  const L = { ...localeLabels, ...labels };
  const containerRef = useRef<HTMLDivElement>(null);

  // ─── 受控 / 非受控视口 ────────────────────────────────────────────
  const [innerZoom, setInnerZoom] = useState(defaultZoom);
  const [innerPan, setInnerPan] = useState<DesignCanvasPoint>(defaultPan ?? { x: 0, y: 0 });
  const zoomControlled = zoom !== undefined;
  const panControlled = pan !== undefined;
  const curZoom = zoomControlled ? zoom : innerZoom;
  const curPan = panControlled ? pan : innerPan;
  const vp: DesignCanvasViewport = { x: curPan.x, y: curPan.y, zoom: curZoom };

  // ─── 受控 / 非受控选中 ────────────────────────────────────────────
  const [innerSel, setInnerSel] = useState<string | null>(defaultSelectedElement);
  const selControlled = selectedElement !== undefined;
  const sel = selControlled ? selectedElement : innerSel;

  const [draft, setDraft] = useState<{ id: string; rect: DesignCanvasRect } | null>(null);
  const [activeGesture, setActiveGesture] = useState<Gesture["kind"] | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);

  const gesture = useRef<Gesture | null>(null);
  const moved = useRef(false);
  const suppressContextMenu = useRef(false);

  const itemById = useMemo(() => {
    const m = new Map<string, DesignCanvasItem>();
    for (const it of items) m.set(it.id, it);
    return m;
  }, [items]);

  // 最新值快照：window 监听是一次性稳定函数，靠它读到最新 props/state，杜绝过期闭包（照 Flow）。
  const latest = useRef({
    vp,
    sel,
    items,
    draft,
    snap,
    minItemSize,
    minZoom,
    maxZoom,
    wheelBehavior,
    zoomControlled,
    panControlled,
    selControlled,
    onZoomChange,
    onPanChange,
    onSelect,
    onItemsChange,
  });
  latest.current = {
    vp,
    sel,
    items,
    draft,
    snap,
    minItemSize,
    minZoom,
    maxZoom,
    wheelBehavior,
    zoomControlled,
    panControlled,
    selControlled,
    onZoomChange,
    onPanChange,
    onSelect,
    onItemsChange,
  };

  /** 写视口：zoom / pan 各自判断是否受控，只回吐真正变了的那一半。 */
  const applyViewport = useCallback((next: DesignCanvasViewport) => {
    const l = latest.current;
    if (next.zoom !== l.vp.zoom) {
      if (!l.zoomControlled) setInnerZoom(next.zoom);
      l.onZoomChange?.(next.zoom);
    }
    if (next.x !== l.vp.x || next.y !== l.vp.y) {
      const p = { x: next.x, y: next.y };
      if (!l.panControlled) setInnerPan(p);
      l.onPanChange?.(p);
    }
  }, []);

  const select = useCallback((id: string | null) => {
    const l = latest.current;
    if (l.sel === id) return;
    if (!l.selControlled) setInnerSel(id);
    l.onSelect?.(id);
  }, []);

  const commitRect = useCallback((id: string, rect: DesignCanvasRect) => {
    const l = latest.current;
    l.onItemsChange?.(l.items.map((it) => (it.id === id ? { ...it, ...rect } : it)));
  }, []);

  // ─── 指针手势 ────────────────────────────────────────────────────
  // 一次性创建、互相引用以便彼此解绑（稳定身份，全程不重建）。
  const handlers = useRef<{
    move: (e: PointerEvent) => void;
    up: (e: PointerEvent) => void;
    cancel: (e: PointerEvent) => void;
  } | null>(null);
  if (!handlers.current) {
    const move = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      const l = latest.current;
      moved.current = true;
      if (g.kind === "pan") {
        applyViewport({
          zoom: l.vp.zoom,
          x: g.pan.x + (e.clientX - g.startX),
          y: g.pan.y + (e.clientY - g.startY),
        });
        return;
      }
      const dx = (e.clientX - g.startX) / l.vp.zoom;
      const dy = (e.clientY - g.startY) / l.vp.zoom;
      if (g.kind === "move") {
        setDraft({ id: g.id, rect: moveRect(g.rect, dx, dy, l.snap) });
      } else {
        setDraft({
          id: g.id,
          rect: resizeRect(g.rect, g.dir, dx, dy, {
            minWidth: l.minItemSize,
            minHeight: l.minItemSize,
            snap: l.snap,
          }),
        });
      }
    };
    const disarm = () => {
      gesture.current = null;
      setDraft(null);
      setActiveGesture(null);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
    const up = () => {
      const g = gesture.current;
      const l = latest.current;
      if (g && g.kind !== "pan" && l.draft && moved.current) {
        commitRect(l.draft.id, l.draft.rect);
      }
      disarm();
    };
    // pointercancel = 浏览器抢走了这次指针（触摸被滚动接管、系统手势介入…）。
    // 用户并没有「放手确认」，所以丢弃草稿而不是提交 —— 提交会把一次被打断的误触写成真实编辑。
    // 平移是即时生效的，无草稿可丢，取消即停在当前位置。
    const cancel = () => disarm();
    handlers.current = { move, up, cancel };
  }

  useEffect(() => {
    return () => {
      const h = handlers.current;
      if (!h) return;
      window.removeEventListener("pointermove", h.move);
      window.removeEventListener("pointerup", h.up);
      window.removeEventListener("pointercancel", h.cancel);
    };
  }, []);

  const arm = (g: Gesture, e: ReactPointerEvent) => {
    gesture.current = g;
    moved.current = false;
    setActiveGesture(g.kind);
    // best-effort：捕获失败（jsdom / 指针已释放 / 非可捕获设备）不影响手势 ——
    // 真正驱动手势的是下面的 window 监听，捕获只是让光标与 hover 态在拖出元素后仍然跟手。
    try {
      (e.currentTarget as Element | null)?.setPointerCapture?.(e.pointerId);
    } catch {
      /* 忽略：捕获是锦上添花，不是手势的前提 */
    }
    const h = handlers.current!;
    window.addEventListener("pointermove", h.move);
    window.addEventListener("pointerup", h.up);
    window.addEventListener("pointercancel", h.cancel);
  };

  const onCanvasPointerDown = (e: ReactPointerEvent) => {
    if (e.button === 2) suppressContextMenu.current = true;
    const wantsPan = e.button === 1 || e.button === 2 || (e.button === 0 && spaceDown);
    if (wantsPan) {
      arm({ kind: "pan", startX: e.clientX, startY: e.clientY, pan: { x: vp.x, y: vp.y } }, e);
      return;
    }
    if (e.button !== 0) return;

    const target = e.target instanceof Element ? e.target : null;
    const itemEl = target?.closest<HTMLElement>("[data-canvas-item]") ?? null;
    if (!itemEl) {
      select(null);
      arm({ kind: "pan", startX: e.clientX, startY: e.clientY, pan: { x: vp.x, y: vp.y } }, e);
      return;
    }

    const id = itemEl.dataset.canvasItem;
    if (!id) return;
    select(id);
    if (readOnly) return;
    const item = itemById.get(id);
    // children 里的自绘元素（不在 items 中）画布不认识它的矩形 → 只选中，不起拖。
    if (!item || item.locked) return;
    // 落在按钮 / 输入框等控件上：让控件自己吃事件，不劫持成拖拽（与 Kanban / Sortable 同一口径）。
    if (hasInteractiveAncestorWithin(e.target, itemEl)) return;
    arm({ kind: "move", id, startX: e.clientX, startY: e.clientY, rect: rectOf(item) }, e);
  };

  const onHandlePointerDown = (e: ReactPointerEvent, dir: DesignCanvasResizeDirection) => {
    if (e.button !== 0 || readOnly || !sel) return;
    const item = itemById.get(sel);
    if (!item || item.locked) return;
    e.stopPropagation();
    arm({ kind: "resize", id: sel, dir, startX: e.clientX, startY: e.clientY, rect: rectOf(item) }, e);
  };

  const onContextMenu = (e: { preventDefault: () => void }) => {
    if (!suppressContextMenu.current) return;
    // 右键在设计画布里是「拖拽平移」手势的一部分，弹出系统菜单会打断它。
    suppressContextMenu.current = false;
    e.preventDefault();
  };

  // ─── 滚轮 ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const l = latest.current;
      const rect = el.getBoundingClientRect();
      // 触控板捏合被浏览器合成为 ctrlKey + wheel，捏合永远是缩放意图 —— 所以 ctrlKey 直接判缩放，
      // 不参与「反转」（参与就会把捏合反转成平移）。⌘ 在 macOS 不是缩放修饰键，不纳入判断。
      const wantZoom = e.ctrlKey || l.wheelBehavior === "zoom";
      if (wantZoom) {
        // 归一 deltaMode：行模式(×~16)/页模式(×容器高)折算成像素，跨鼠标/触控板手感一致。
        const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rect.height : 1;
        const factor = Math.exp(-e.deltaY * unit * 0.0012);
        applyViewport(
          zoomAtPoint(
            l.vp,
            factor,
            e.clientX - rect.left,
            e.clientY - rect.top,
            l.minZoom,
            l.maxZoom,
          ),
        );
      } else {
        applyViewport({ zoom: l.vp.zoom, x: l.vp.x - e.deltaX, y: l.vp.y - e.deltaY });
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [applyViewport]);

  // ─── 视口命令 ────────────────────────────────────────────────────
  const zoomBy = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      const l = latest.current;
      const w = el?.clientWidth ?? 0;
      const h = el?.clientHeight ?? 0;
      applyViewport(zoomAtPoint(l.vp, factor, w / 2, h / 2, l.minZoom, l.maxZoom));
    },
    [applyViewport],
  );

  const fitView = useCallback(() => {
    const el = containerRef.current;
    const l = latest.current;
    const b = itemsBounds(l.items);
    if (!el || !b) return;
    applyViewport(
      fitViewport(
        b,
        { width: el.clientWidth, height: el.clientHeight },
        FIT_PADDING,
        l.minZoom,
        l.maxZoom,
      ),
    );
  }, [applyViewport]);

  const reset = useCallback(() => applyViewport({ x: 0, y: 0, zoom: 1 }), [applyViewport]);

  useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      zoomIn: () => zoomBy(ZOOM_STEP),
      zoomOut: () => zoomBy(1 / ZOOM_STEP),
      reset,
      fitView,
      screenToCanvas: (x, y) => screenToCanvas(x, y, latest.current.vp),
    } satisfies DesignCanvasApi;
  }, [apiRef, zoomBy, reset, fitView]);

  // ─── 键盘 ────────────────────────────────────────────────────────
  const onCanvasKeyDown = (e: ReactKeyboardEvent) => {
    if (e.code !== "Space" || spaceDown) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active.closest('input,textarea,[contenteditable="true"]'))
      return;
    e.preventDefault(); // 防止空格滚动页面 / 激活聚焦的按钮
    setSpaceDown(true);
  };
  const onCanvasKeyUp = (e: ReactKeyboardEvent) => {
    if (e.code === "Space") setSpaceDown(false);
  };

  const onItemKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>, item: DesignCanvasItem) => {
    if (hasInteractiveAncestorWithin(e.target, e.currentTarget)) return;

    if (e.key === "Delete" || e.key === "Backspace") {
      if (readOnly || !onItemDelete) return;
      e.preventDefault();
      onItemDelete(item.id);
      return;
    }
    const d = ARROW_DELTA[e.key];
    if (!d) return;
    if (readOnly || item.locked || !onItemsChange) return;
    e.preventDefault();
    // 步长跟随吸附网格（未开吸附则 1 世界单位），Shift 放大十倍作粗调。
    const step = (snap > 0 ? snap : 1) * (e.shiftKey ? 10 : 1);
    const rect = rectOf(item);
    if (e.altKey) {
      // Alt + 方向键 = 改尺寸（右/下边），让 resize 也有纯键盘通路，手柄因此可以纯装饰。
      const dir: DesignCanvasResizeDirection = d.x !== 0 ? "e" : "s";
      commitRect(
        item.id,
        resizeRect(rect, dir, d.x * step, d.y * step, {
          minWidth: minItemSize,
          minHeight: minItemSize,
          snap,
        }),
      );
    } else {
      commitRect(item.id, moveRect(rect, d.x * step, d.y * step, snap));
    }
  };

  // ─── 渲染 ────────────────────────────────────────────────────────
  const worldStyle = {
    transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
    transformOrigin: "0 0" as const,
  };

  const gridSize = grid === false ? 0 : grid === true ? DEFAULT_GRID : grid;
  const gridGap = gridSize * vp.zoom;
  const showGrid = gridSize > 0 && gridGap >= MIN_GRID_SCREEN_GAP;

  const displayRect = (item: DesignCanvasItem): DesignCanvasRect =>
    draft && draft.id === item.id ? draft.rect : rectOf(item);

  const selItem = sel !== null ? itemById.get(sel) : undefined;
  const selRect = selItem ? displayRect(selItem) : null;
  const selScreen = selRect ? canvasToScreen({ x: selRect.x, y: selRect.y }, vp) : null;
  const showHandles = !!selItem && !selItem.locked && !readOnly;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="application"
      aria-label={L.canvas}
      data-design-canvas=""
      onPointerDown={onCanvasPointerDown}
      onContextMenu={onContextMenu}
      onKeyDown={onCanvasKeyDown}
      onKeyUp={onCanvasKeyUp}
      onBlur={() => setSpaceDown(false)}
      className={cn(
        // select-none：画布上的点选/拖动本不该建立文本选区（指针被 setPointerCapture 捕获后，
        // 浏览器「新 mousedown 重置选区」的兜底也失效，选区会从上一个元素一路蔓延过来）。
        // 后面三条是逃生口：消费方经 renderItem 塞进来的真实可编辑内容仍然可选可编辑。
        "relative h-full w-full select-none overflow-hidden bg-bg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "[&_[contenteditable]]:select-text [&_input]:select-text [&_textarea]:select-text",
        activeGesture === "pan" ? "cursor-grabbing" : spaceDown && "cursor-grab",
        className,
      )}
    >
      {showGrid && (
        <GridPattern
          className="text-border"
          width={gridGap}
          height={gridGap}
          x={vp.x}
          y={vp.y}
        />
      )}

      {/* 世界坐标层：所有内容共享同一个 transform，子元素只写自己的世界坐标 */}
      <div className="absolute left-0 top-0 h-0 w-0" style={worldStyle}>
        {items.map((item) => {
          const r = displayRect(item);
          const selected = sel === item.id;
          const dragging = activeGesture === "move" && draft?.id === item.id;
          const resizing = activeGesture === "resize" && draft?.id === item.id;
          return (
            <div
              key={item.id}
              data-canvas-item={item.id}
              data-selected={selected ? "" : undefined}
              data-locked={item.locked ? "" : undefined}
              tabIndex={0}
              role="group"
              aria-label={item.label ?? item.id}
              aria-current={selected ? "true" : undefined}
              onFocus={() => select(item.id)}
              onKeyDown={(e) => onItemKeyDown(e, item)}
              style={{ transform: `translate(${r.x}px, ${r.y}px)`, width: r.width, height: r.height }}
              className={cn(
                "absolute left-0 top-0 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !readOnly && !item.locked && "cursor-move",
              )}
            >
              {renderItem ? (
                renderItem(item, { selected, dragging, resizing })
              ) : (
                <div className="h-full w-full rounded-[var(--radius)] border border-hairline bg-surface" />
              )}
            </div>
          );
        })}
        {children}
      </div>

      {/* 选择框：画在**屏幕空间**而非世界层，手柄与描边才不会跟着 zoom 变粗变大 */}
      {selRect && selScreen && (
        <div
          data-canvas-selection={sel ?? ""}
          className="pointer-events-none absolute left-0 top-0"
          style={{
            transform: `translate(${selScreen.x}px, ${selScreen.y}px)`,
            width: selRect.width * vp.zoom,
            height: selRect.height * vp.zoom,
          }}
        >
          <div className="absolute inset-0 border-2 border-primary" aria-hidden />
          {showHandles &&
            HANDLES.map((dir) => (
              <span
                key={dir}
                aria-hidden
                data-resize-handle={dir}
                onPointerDown={(e) => onHandlePointerDown(e, dir)}
                className={cn(
                  "pointer-events-auto absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border border-primary bg-bg",
                  HANDLE_CLASS[dir],
                )}
              />
            ))}
        </div>
      )}

      {controls && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-[var(--radius)] border border-hairline bg-surface shadow-sm">
          <ControlBtn label={L.zoomIn} onClick={() => zoomBy(ZOOM_STEP)}>
            <path d="M10 5v10M5 10h10" strokeLinecap="round" />
          </ControlBtn>
          <ControlBtn label={L.zoomOut} onClick={() => zoomBy(1 / ZOOM_STEP)}>
            <path d="M5 10h10" strokeLinecap="round" />
          </ControlBtn>
          <ControlBtn label={L.fitView} onClick={fitView}>
            <path
              d="M4 7V4h3M16 7V4h-3M4 13v3h3M16 13v3h-3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ControlBtn>
          <ControlBtn label={L.resetView} onClick={reset}>
            <path
              d="M10 4a6 6 0 1 1-5.2 3M4 4v3.5h3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </ControlBtn>
        </div>
      )}
    </div>
  );
}

function rectOf(item: DesignCanvasItem): DesignCanvasRect {
  return { x: item.x, y: item.y, width: item.width, height: item.height };
}

function ControlBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className="grid size-8 place-items-center text-muted-foreground transition-colors hover:bg-surface-hover hover:text-fg [&+button]:border-t [&+button]:border-border"
    >
      <svg
        viewBox="0 0 20 20"
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden
      >
        {children}
      </svg>
    </button>
  );
}
