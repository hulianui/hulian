import { describe, it, expect, vi, afterEach } from "vitest";
import { StrictMode } from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { ElementSelectionOverlay } from "./element-selection-overlay";

// jsdom 下 getBoundingClientRect 恒为 0 —— 所以这里**一条像素断言都没有**（会假绿）。
// 只测：DOM 结构 / 事件绑定 / 回调契约 / 卸载清理 / 跨源报错。几何见 overlay-geometry.test.ts。

function makeTarget(html: string): HTMLDivElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

function overlayEl(): HTMLElement | null {
  return document.querySelector('[data-part="overlay"]');
}

/** 给 rect 打桩：jsdom 无布局引擎，不打桩则任何框都因「零面积」而不渲染。 */
function stubRects(rect = { top: 10, left: 20, width: 100, height: 40 }): () => void {
  const spy = vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => rect,
  } as DOMRect);
  return () => spy.mockRestore();
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("ElementSelectionOverlay · 渲染", () => {
  it("target 为 null 时不渲染叠加层", () => {
    render(<ElementSelectionOverlay target={null} />);
    expect(overlayEl()).toBeNull();
  });

  it("叠加层挂在宿主 body 上，且不在目标内部（不污染目标文档）", () => {
    const root = makeTarget("<button>a</button>");
    render(<ElementSelectionOverlay target={root} />);
    const overlay = overlayEl()!;
    expect(overlay).not.toBeNull();
    expect(document.body.contains(overlay)).toBe(true);
    expect(root.contains(overlay)).toBe(false);
    // 整层不吃指针事件，绝不挡住目标交互
    expect(overlay.className).toContain("pointer-events-none");
    expect(overlay.getAttribute("aria-hidden")).toBe("true");
  });

  it("hover / 点击后目标 DOM 一个字节都没被改写", () => {
    const root = makeTarget("<section><button>a</button></section>");
    const before = root.innerHTML;
    render(<ElementSelectionOverlay target={root} />);
    const btn = root.querySelector("button")!;
    fireEvent.pointerMove(btn);
    fireEvent.click(btn);
    expect(root.innerHTML).toBe(before);
    expect(btn.getAttribute("style")).toBeNull();
  });
});

describe("ElementSelectionOverlay · hover", () => {
  it("hover 回吐结构化路径与 detail", () => {
    const root = makeTarget("<section><button>a</button></section>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("button")!);
    expect(onHover).toHaveBeenCalledTimes(1);
    const [path, detail] = onHover.mock.calls[0]!;
    expect(path).toBe("section > button");
    expect(detail).toMatchObject({ source: "structural", tagName: "button", component: null });
  });

  it("有标记时优先读标记路径与组件名", () => {
    const root = makeTarget(
      "<div data-hulian-path='App/Header' data-hulian-component='Header'><span>x</span></div>",
    );
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("span")!);
    expect(onHover).toHaveBeenCalledWith(
      "App/Header",
      expect.objectContaining({ source: "marked", component: "Header" }),
    );
  });

  it("同一元素上连续移动只回吐一次", () => {
    const root = makeTarget("<button>a</button>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} onHover={onHover} />);
    const btn = root.querySelector("button")!;
    fireEvent.pointerMove(btn);
    fireEvent.pointerMove(btn);
    fireEvent.pointerMove(btn);
    expect(onHover).toHaveBeenCalledTimes(1);
  });

  it("highlightSelector 把落点上提到最近的匹配祖先", () => {
    const root = makeTarget("<div data-block><span><b>x</b></span></div>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} highlightSelector="[data-block]" onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("b")!);
    expect(onHover).toHaveBeenCalledWith("div", expect.objectContaining({ tagName: "div" }));
  });

  it("highlightSelector 未命中 → 不高亮", () => {
    const root = makeTarget("<span>x</span>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} highlightSelector="[data-block]" onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("span")!);
    expect(onHover).not.toHaveBeenCalled();
  });

  it("ignoreSelector 命中（含祖先命中）→ 不高亮", () => {
    const root = makeTarget("<div data-skip><b>x</b></div>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} ignoreSelector="[data-skip]" onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("b")!);
    expect(onHover).not.toHaveBeenCalled();
  });

  it("移出目标 → 回吐 (null, null)", () => {
    const root = makeTarget("<button>a</button>");
    const onHover = vi.fn();
    render(<ElementSelectionOverlay target={root} onHover={onHover} />);
    fireEvent.pointerMove(root.querySelector("button")!);
    fireEvent.pointerLeave(root);
    expect(onHover).toHaveBeenLastCalledWith(null, null);
  });
});

describe("ElementSelectionOverlay · 选中", () => {
  it("点击回吐 path + detail，并默认吞掉这次点击", () => {
    const root = makeTarget("<section><button>a</button></section>");
    const onSelect = vi.fn();
    render(<ElementSelectionOverlay target={root} onSelect={onSelect} />);
    const btn = root.querySelector("button")!;
    const prevented = !fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledWith(
      "section > button",
      expect.objectContaining({ source: "structural" }),
    );
    expect(prevented).toBe(true);
  });

  it("interceptClicks=false 时不拦点击，但依然回吐选中", () => {
    const root = makeTarget("<button>a</button>");
    const onSelect = vi.fn();
    const inner = vi.fn();
    root.querySelector("button")!.addEventListener("click", inner);
    render(<ElementSelectionOverlay target={root} onSelect={onSelect} interceptClicks={false} />);
    const prevented = !fireEvent.click(root.querySelector("button")!);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
    expect(prevented).toBe(false);
  });

  it("点在目标根（空白）→ onClear", () => {
    const root = makeTarget("<button>a</button>");
    const onClear = vi.fn();
    const onSelect = vi.fn();
    render(<ElementSelectionOverlay target={root} onClear={onClear} onSelect={onSelect} />);
    fireEvent.click(root);
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("Esc 清除选中", () => {
    const root = makeTarget("<button>a</button>");
    const onClear = vi.fn();
    render(<ElementSelectionOverlay target={root} onClear={onClear} />);
    fireEvent.keyDown(root.querySelector("button")!, { key: "Escape" });
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("键盘可达：焦点元素上按 Enter 即选中", () => {
    const root = makeTarget("<button>a</button>");
    const onSelect = vi.fn();
    render(<ElementSelectionOverlay target={root} onSelect={onSelect} />);
    const btn = root.querySelector("button")!;
    btn.focus();
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("button", expect.anything());
  });

  it("目标外的点击既不被拦截，也不触发 onClear（普通容器下不接管宿主页面）", () => {
    const root = makeTarget("<button>a</button>");
    const outside = document.createElement("button");
    outside.textContent = "宿主页面上的按钮";
    document.body.appendChild(outside);
    const outsideClick = vi.fn();
    outside.addEventListener("click", outsideClick);
    const onClear = vi.fn();
    render(<ElementSelectionOverlay target={root} onClear={onClear} />);
    const prevented = !fireEvent.click(outside);
    expect(outsideClick).toHaveBeenCalledTimes(1);
    expect(prevented).toBe(false);
    expect(onClear).not.toHaveBeenCalled();
  });

  it("目标外的 mousedown 默认行为不被挡（宿主输入框还能聚焦）", () => {
    const root = makeTarget("<button>a</button>");
    const outside = document.createElement("input");
    document.body.appendChild(outside);
    render(<ElementSelectionOverlay target={root} />);
    expect(!fireEvent.mouseDown(outside)).toBe(false);
    // 对照：目标内的 mousedown 仍然被挡
    expect(!fireEvent.mouseDown(root.querySelector("button")!)).toBe(true);
  });

  it("受控 selectedPath={null} 时点击只回吐、不自己记选中", () => {
    const root = makeTarget("<button>a</button>");
    const onSelect = vi.fn();
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} selectedPath={null} onSelect={onSelect} />);
      fireEvent.click(root.querySelector("button")!);
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(document.querySelector('[data-part="selected"]')).toBeNull();
    } finally {
      restore();
    }
  });
});

// 下面这组给 getBoundingClientRect 打桩，只为让「框该不该出现」可断言 ——
// 断言对象是结构（data-part / data-path / 标签文案），不是坐标：坐标来自桩，断它等于自证。
describe("ElementSelectionOverlay · 框与标签结构", () => {
  it("受控 selectedPath 按路径回查元素并画出选中框", () => {
    const root = makeTarget("<section><button>a</button></section>");
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} selectedPath="section > button" />);
      const box = document.querySelector('[data-part="selected"]')!;
      expect(box).not.toBeNull();
      expect(box.getAttribute("data-path")).toBe("section > button");
    } finally {
      restore();
    }
  });

  it("标记路径同样能回查；标签取组件名", () => {
    const root = makeTarget("<div data-hulian-path='App/Cta' data-hulian-component='Cta'>x</div>");
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} selectedPath="App/Cta" />);
      expect(document.querySelector('[data-part="selected"]')?.getAttribute("data-path")).toBe("App/Cta");
      expect(document.querySelector('[data-part="label"]')?.textContent).toBe("Cta");
    } finally {
      restore();
    }
  });

  it("showLabel=false 不画标签", () => {
    const root = makeTarget("<button>a</button>");
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} selectedPath="button" showLabel={false} />);
      expect(document.querySelector('[data-part="selected"]')).not.toBeNull();
      expect(document.querySelector('[data-part="label"]')).toBeNull();
    } finally {
      restore();
    }
  });

  it("hover 单独存在时画 hover 框（与选中框是两个不同的 part）", () => {
    const root = makeTarget("<button>a</button>");
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} />);
      fireEvent.pointerMove(root.querySelector("button")!);
      const box = document.querySelector('[data-part="hover"]')!;
      expect(box.getAttribute("data-path")).toBe("button");
      expect(box.className).toContain("border-dashed");
      expect(document.querySelector('[data-part="selected"]')).toBeNull();
    } finally {
      restore();
    }
  });

  it("hover 与选中落在同一元素时只画一个框", () => {
    const root = makeTarget("<button>a</button>");
    const restore = stubRects();
    try {
      render(<ElementSelectionOverlay target={root} selectedPath="button" />);
      fireEvent.pointerMove(root.querySelector("button")!);
      expect(document.querySelector('[data-part="selected"]')).not.toBeNull();
      expect(document.querySelector('[data-part="hover"]')).toBeNull();
    } finally {
      restore();
    }
  });
});

describe("ElementSelectionOverlay · enabled / 卸载", () => {
  it("enabled=false 时不拾取也不拦点击", () => {
    const root = makeTarget("<button>a</button>");
    const onHover = vi.fn();
    const onSelect = vi.fn();
    render(
      <ElementSelectionOverlay target={root} enabled={false} onHover={onHover} onSelect={onSelect} />,
    );
    const btn = root.querySelector("button")!;
    fireEvent.pointerMove(btn);
    const prevented = !fireEvent.click(btn);
    expect(onHover).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
  });

  it("卸载后目标文档上不再有本组件的监听", () => {
    const root = makeTarget("<button>a</button>");
    const onHover = vi.fn();
    const onSelect = vi.fn();
    const view = render(<ElementSelectionOverlay target={root} onHover={onHover} onSelect={onSelect} />);
    view.unmount();
    const btn = root.querySelector("button")!;
    fireEvent.pointerMove(btn);
    const prevented = !fireEvent.click(btn);
    expect(onHover).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(prevented).toBe(false);
    expect(overlayEl()).toBeNull();
  });

  it("StrictMode 双挂载不会重复绑定（回调仍只触发一次）", () => {
    const root = makeTarget("<button>a</button>");
    const onHover = vi.fn();
    const onSelect = vi.fn();
    render(
      <StrictMode>
        <ElementSelectionOverlay target={root} onHover={onHover} onSelect={onSelect} />
      </StrictMode>,
    );
    const btn = root.querySelector("button")!;
    fireEvent.pointerMove(btn);
    fireEvent.click(btn);
    expect(onHover).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('[data-part="overlay"]').length).toBe(1);
  });

  it("卸载时断开 MutationObserver / ResizeObserver", () => {
    const root = makeTarget("<button>a</button>");
    const disconnect = vi.fn();
    const RealMO = window.MutationObserver;
    class SpyMO extends RealMO {
      override disconnect() {
        disconnect();
        super.disconnect();
      }
    }
    window.MutationObserver = SpyMO as unknown as typeof MutationObserver;
    try {
      const view = render(<ElementSelectionOverlay target={root} />);
      view.unmount();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      window.MutationObserver = RealMO;
    }
  });
});

describe("ElementSelectionOverlay · iframe", () => {
  it("同源 iframe：监听装在 iframe 文档里，路径相对 iframe body", () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    const doc = frame.contentDocument!;
    doc.body.innerHTML = "<section><button>a</button></section>";
    const onSelect = vi.fn();
    render(<ElementSelectionOverlay target={frame} onSelect={onSelect} />);
    fireEvent.click(doc.querySelector("button")!);
    expect(onSelect).toHaveBeenCalledWith("section > button", expect.anything());
  });

  it("跨源 iframe：明确报 cross-origin 并且不渲染（不假装接上了）", () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    Object.defineProperty(frame, "contentDocument", {
      configurable: true,
      get() {
        throw new Error("SecurityError");
      },
    });
    const onError = vi.fn();
    render(<ElementSelectionOverlay target={frame} onError={onError} />);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({ code: "cross-origin", target: frame });
    expect(overlayEl()).toBeNull();
  });
});
