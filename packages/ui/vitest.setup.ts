// 测试环境补丁：jsdom 缺指针事件能力。
// 1) 无 PointerEvent 构造器 → @testing-library fireEvent.pointer* 退化为无 clientX/Y 的事件，
//    导致 SwipeAction / PullToRefresh / Picker 等跟手组件的坐标读不到。用 MouseEvent 兜底透传坐标。
// 2) 元素无 setPointerCapture/releasePointerCapture → 拖拽组件调用会抛错，补 no-op。
if (typeof globalThis.PointerEvent === "undefined") {
  class PointerEventPolyfill extends MouseEvent {
    pointerId: number;
    pointerType: string;
    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      this.pointerId = params.pointerId ?? 0;
      this.pointerType = params.pointerType ?? "";
    }
  }
  globalThis.PointerEvent = PointerEventPolyfill as unknown as typeof PointerEvent;
}

for (const m of ["setPointerCapture", "releasePointerCapture", "hasPointerCapture"] as const) {
  if (!(m in HTMLElement.prototype)) {
    // @ts-expect-error 运行时补 no-op
    HTMLElement.prototype[m] = m === "hasPointerCapture" ? () => false : () => {};
  }
}
