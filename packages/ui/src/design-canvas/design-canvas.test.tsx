import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { DesignCanvas } from "./design-canvas";
import type { DesignCanvasItem } from "./design-canvas.types";

afterEach(cleanup);

const items: DesignCanvasItem[] = [
  { id: "hero", x: 0, y: 0, width: 200, height: 100, label: "首屏" },
  { id: "cta", x: 240, y: 40, width: 120, height: 48 },
];

const canvasOf = (c: HTMLElement) => c.querySelector<HTMLElement>("[data-design-canvas]")!;
const itemEl = (c: HTMLElement, id: string) =>
  c.querySelector<HTMLElement>(`[data-canvas-item="${id}"]`)!;

/** window 上的 pointermove/up 监听：jsdom 里 PointerEvent 未必存在，用 MouseEvent 顶同名事件即可命中。 */
const windowPointer = (type: "pointermove" | "pointerup", clientX = 0, clientY = 0) => {
  fireEvent(window, new MouseEvent(type, { bubbles: true, clientX, clientY }));
};

describe("DesignCanvas 渲染", () => {
  it("每个 item 渲染成一个 data-canvas-item 节点", () => {
    const { container } = render(<DesignCanvas items={items} />);
    expect(container.querySelectorAll("[data-canvas-item]").length).toBe(2);
    expect(itemEl(container, "hero")).not.toBeNull();
  });

  it("画布是 role=application 且可聚焦", () => {
    const { container } = render(<DesignCanvas items={items} />);
    const canvas = canvasOf(container);
    expect(canvas.getAttribute("role")).toBe("application");
    expect(canvas.getAttribute("aria-label")).toBe("设计画布");
    expect(canvas.getAttribute("tabindex")).toBe("0");
  });

  it("item 可 Tab 到，label 缺省回落到 id", () => {
    const { container } = render(<DesignCanvas items={items} />);
    expect(itemEl(container, "hero").getAttribute("aria-label")).toBe("首屏");
    expect(itemEl(container, "cta").getAttribute("aria-label")).toBe("cta");
    expect(itemEl(container, "cta").getAttribute("tabindex")).toBe("0");
  });

  it("renderItem 渲染自定义内容并拿到 selected 态", () => {
    const { container } = render(
      <DesignCanvas
        items={items}
        selectedElement="cta"
        renderItem={(item, s) => <span>{`${item.id}:${s.selected}`}</span>}
      />,
    );
    expect(container.textContent).toContain("hero:false");
    expect(container.textContent).toContain("cta:true");
  });

  it("children 挂进世界层且不被当成 item 计数", () => {
    const { container } = render(
      <DesignCanvas items={items}>
        <div data-canvas-item="guide">辅助线</div>
      </DesignCanvas>,
    );
    expect(container.textContent).toContain("辅助线");
    // children 里自带标记的节点同样能被委托选中，所以计数是 3
    expect(container.querySelectorAll("[data-canvas-item]").length).toBe(3);
  });

  it("默认画网格，grid={false} 不画", () => {
    const { container: withGrid } = render(<DesignCanvas items={items} />);
    expect(withGrid.querySelector("pattern")).not.toBeNull();
    const { container: noGrid } = render(<DesignCanvas items={items} grid={false} />);
    expect(noGrid.querySelector("pattern")).toBeNull();
  });

  it("缩放到网格间距小于 4px 时不画网格（避免糊成实色）", () => {
    const { container } = render(<DesignCanvas items={items} grid={40} zoom={0.05} />);
    expect(container.querySelector("pattern")).toBeNull();
  });

  it("controls={false} 不渲染缩放工具条", () => {
    const { container } = render(<DesignCanvas items={items} controls={false} />);
    expect(container.querySelector('[aria-label="放大"]')).toBeNull();
  });

  it("labels 可覆盖内置文案", () => {
    const { container } = render(
      <DesignCanvas items={items} labels={{ canvas: "Design canvas", zoomIn: "Zoom in" }} />,
    );
    expect(canvasOf(container).getAttribute("aria-label")).toBe("Design canvas");
    expect(container.querySelector('[aria-label="Zoom in"]')).not.toBeNull();
  });

  it("世界层 transform 反映受控 zoom / pan", () => {
    const { container } = render(
      <DesignCanvas items={items} zoom={2} pan={{ x: 30, y: -10 }} />,
    );
    const world = itemEl(container, "hero").parentElement!;
    expect(world.style.transform).toBe("translate(30px, -10px) scale(2)");
  });
});

describe("DesignCanvas 选择框", () => {
  it("未选中时无选择框", () => {
    const { container } = render(<DesignCanvas items={items} />);
    expect(container.querySelector("[data-canvas-selection]")).toBeNull();
  });

  it("选中托管元素渲染选择框 + 八向手柄", () => {
    const { container } = render(<DesignCanvas items={items} selectedElement="hero" />);
    const box = container.querySelector<HTMLElement>("[data-canvas-selection]")!;
    expect(box).not.toBeNull();
    expect(container.querySelectorAll("[data-resize-handle]").length).toBe(8);
    for (const dir of ["n", "ne", "e", "se", "s", "sw", "w", "nw"]) {
      expect(container.querySelector(`[data-resize-handle="${dir}"]`)).not.toBeNull();
    }
  });

  it("选择框画在屏幕空间（尺寸已乘 zoom，不随世界层再缩一次）", () => {
    const { container } = render(
      <DesignCanvas items={items} selectedElement="hero" zoom={2} pan={{ x: 10, y: 5 }} />,
    );
    const box = container.querySelector<HTMLElement>("[data-canvas-selection]")!;
    expect(box.style.width).toBe("400px");
    expect(box.style.height).toBe("200px");
    expect(box.style.transform).toBe("translate(10px, 5px)");
  });

  it("locked / readOnly 不出手柄，但选择框仍在", () => {
    const locked = render(
      <DesignCanvas items={[{ ...items[0], locked: true }]} selectedElement="hero" />,
    );
    expect(locked.container.querySelector("[data-canvas-selection]")).not.toBeNull();
    expect(locked.container.querySelectorAll("[data-resize-handle]").length).toBe(0);
    cleanup();

    const ro = render(<DesignCanvas items={items} selectedElement="hero" readOnly />);
    expect(ro.container.querySelectorAll("[data-resize-handle]").length).toBe(0);
  });

  it("选中 children 里的自绘元素不出选择框（画布不认识它的矩形）", () => {
    const { container } = render(
      <DesignCanvas items={items} selectedElement="guide">
        <div data-canvas-item="guide">辅助线</div>
      </DesignCanvas>,
    );
    expect(container.querySelector("[data-canvas-selection]")).toBeNull();
  });
});

describe("DesignCanvas 选择", () => {
  it("点元素回吐它的 id，点空白回吐 null", () => {
    const onSelect = vi.fn();
    const { container } = render(<DesignCanvas items={items} onSelect={onSelect} />);
    fireEvent.pointerDown(itemEl(container, "cta"), { button: 0 });
    expect(onSelect).toHaveBeenLastCalledWith("cta");
    windowPointer("pointerup");
    fireEvent.pointerDown(canvasOf(container), { button: 0 });
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("委托到最近的 data-canvas-item（点元素内部的深层子节点也算）", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        onSelect={onSelect}
        renderItem={(item) => (
          <span>
            <b data-testid={`deep-${item.id}`}>{item.id}</b>
          </span>
        )}
      />,
    );
    fireEvent.pointerDown(container.querySelector('[data-testid="deep-hero"]')!, { button: 0 });
    expect(onSelect).toHaveBeenLastCalledWith("hero");
  });

  it("同一元素重复点不重复回吐 onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(<DesignCanvas items={items} onSelect={onSelect} />);
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0 });
    windowPointer("pointerup");
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0 });
    windowPointer("pointerup");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("非受控时自己维护选中态（无 onSelect 也能出选择框）", () => {
    const { container } = render(<DesignCanvas items={items} />);
    fireEvent.pointerDown(itemEl(container, "cta"), { button: 0 });
    windowPointer("pointerup");
    expect(container.querySelector("[data-canvas-selection]")?.getAttribute("data-canvas-selection")).toBe("cta");
  });

  it("受控 selectedElement 不被内部点击改写", () => {
    const { container } = render(<DesignCanvas items={items} selectedElement="hero" />);
    fireEvent.pointerDown(itemEl(container, "cta"), { button: 0 });
    windowPointer("pointerup");
    expect(container.querySelector("[data-canvas-selection]")?.getAttribute("data-canvas-selection")).toBe("hero");
  });

  it("聚焦元素即选中（Tab 走查也能带出选择框）", () => {
    const onSelect = vi.fn();
    const { container } = render(<DesignCanvas items={items} onSelect={onSelect} />);
    fireEvent.focus(itemEl(container, "cta"));
    expect(onSelect).toHaveBeenLastCalledWith("cta");
  });
});

describe("DesignCanvas 指针手势", () => {
  it("中键拖拽平移，回吐 onPanChange", () => {
    const onPanChange = vi.fn();
    const { container } = render(<DesignCanvas items={items} onPanChange={onPanChange} />);
    fireEvent.pointerDown(canvasOf(container), { button: 1, clientX: 100, clientY: 100 });
    windowPointer("pointermove", 130, 120);
    expect(onPanChange).toHaveBeenLastCalledWith({ x: 30, y: 20 });
    windowPointer("pointerup", 130, 120);
  });

  it("左键拖空白同样平移", () => {
    const onPanChange = vi.fn();
    const { container } = render(<DesignCanvas items={items} onPanChange={onPanChange} />);
    fireEvent.pointerDown(canvasOf(container), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", -40, 10);
    expect(onPanChange).toHaveBeenLastCalledWith({ x: -40, y: 10 });
    windowPointer("pointerup", -40, 10);
  });

  it("拖元素：中途只改本地草稿，抬起才回吐 onItemsChange 一次", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", 60, 30);
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(itemEl(container, "hero").style.transform).toBe("translate(60px, 30px)");
    windowPointer("pointerup", 60, 30);
    expect(onItemsChange).toHaveBeenCalledTimes(1);
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ id: "hero", x: 60, y: 30 });
  });

  it("拖动增量按 zoom 折算（放大 2 倍时屏幕挪 60px = 世界挪 30）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} zoom={2} onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", 60, 0);
    windowPointer("pointerup", 60, 0);
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ x: 30, y: 0 });
  });

  it("snap 让拖动落到网格上", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} snap={25} onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", 31, 12);
    windowPointer("pointerup", 31, 12);
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ x: 25, y: 0 });
  });

  it("按在元素内的按钮上不起拖（控件自己吃事件）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        onItemsChange={onItemsChange}
        renderItem={(item) => <button type="button">{item.id}</button>}
      />,
    );
    fireEvent.pointerDown(container.querySelectorAll("button")[0], {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    windowPointer("pointermove", 60, 30);
    windowPointer("pointerup", 60, 30);
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("locked 元素拖不动（但仍被选中）", () => {
    const onItemsChange = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={[{ ...items[0], locked: true }]}
        onItemsChange={onItemsChange}
        onSelect={onSelect}
      />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", 60, 30);
    windowPointer("pointerup", 60, 30);
    expect(onSelect).toHaveBeenCalledWith("hero");
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("拖手柄 resize：se 只动右下角", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} selectedElement="hero" onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(container.querySelector('[data-resize-handle="se"]')!, {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    windowPointer("pointermove", 40, -20);
    windowPointer("pointerup", 40, -20);
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({
      x: 0,
      y: 0,
      width: 240,
      height: 80,
    });
  });

  it("resize 越过锚定边会翻转（宽高不留负值）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} selectedElement="hero" onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(container.querySelector('[data-resize-handle="e"]')!, {
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    windowPointer("pointermove", -260, 0);
    windowPointer("pointerup", -260, 0);
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ x: -60, width: 60 });
  });

  it("没挪动就抬起不回吐（纯点击不算一次编辑）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointerup", 0, 0);
    expect(onItemsChange).not.toHaveBeenCalled();
  });

  it("pointercancel 丢弃草稿而非提交（被打断的误触不写成编辑）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} onItemsChange={onItemsChange} />,
    );
    fireEvent.pointerDown(itemEl(container, "hero"), { button: 0, clientX: 0, clientY: 0 });
    windowPointer("pointermove", 60, 30);
    expect(itemEl(container, "hero").style.transform).toBe("translate(60px, 30px)");
    fireEvent(window, new MouseEvent("pointercancel", { bubbles: true }));
    expect(onItemsChange).not.toHaveBeenCalled();
    // 回到原位，且手势已解绑：再动指针不应继续改草稿
    expect(itemEl(container, "hero").style.transform).toBe("translate(0px, 0px)");
    windowPointer("pointermove", 999, 999);
    expect(itemEl(container, "hero").style.transform).toBe("translate(0px, 0px)");
  });
});

describe("DesignCanvas 键盘", () => {
  it("方向键微调位置（默认 1 单位，Shift 十倍）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} onItemsChange={onItemsChange} />,
    );
    const el = itemEl(container, "hero");
    fireEvent.keyDown(el, { key: "ArrowRight" });
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ x: 1, y: 0 });
    fireEvent.keyDown(el, { key: "ArrowUp", shiftKey: true });
    expect(onItemsChange.mock.calls[1][0][0]).toMatchObject({ x: 0, y: -10 });
  });

  it("开了 snap 时方向键按网格步进", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} snap={8} onItemsChange={onItemsChange} />,
    );
    fireEvent.keyDown(itemEl(container, "hero"), { key: "ArrowDown" });
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ x: 0, y: 8 });
  });

  it("Alt + 方向键改尺寸（键盘也能 resize）", () => {
    const onItemsChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} onItemsChange={onItemsChange} />,
    );
    fireEvent.keyDown(itemEl(container, "hero"), { key: "ArrowRight", altKey: true });
    expect(onItemsChange.mock.calls[0][0][0]).toMatchObject({ width: 201, height: 100 });
  });

  it("Delete 删除选中元素", () => {
    const onItemDelete = vi.fn();
    const { container } = render(<DesignCanvas items={items} onItemDelete={onItemDelete} />);
    fireEvent.keyDown(itemEl(container, "cta"), { key: "Delete" });
    expect(onItemDelete).toHaveBeenCalledWith("cta");
  });

  it("readOnly 下方向键与 Delete 都不生效", () => {
    const onItemsChange = vi.fn();
    const onItemDelete = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        readOnly
        onItemsChange={onItemsChange}
        onItemDelete={onItemDelete}
      />,
    );
    const el = itemEl(container, "hero");
    fireEvent.keyDown(el, { key: "ArrowRight" });
    fireEvent.keyDown(el, { key: "Delete" });
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(onItemDelete).not.toHaveBeenCalled();
  });

  it("焦点在元素内的输入框里时不劫持方向键 / Delete", () => {
    const onItemsChange = vi.fn();
    const onItemDelete = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        onItemsChange={onItemsChange}
        onItemDelete={onItemDelete}
        renderItem={() => <input defaultValue="标题" />}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.keyDown(input, { key: "ArrowRight" });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(onItemDelete).not.toHaveBeenCalled();
  });
});

describe("DesignCanvas 视口控制", () => {
  it("工具条放大 / 缩小回吐 onZoomChange", () => {
    const onZoomChange = vi.fn();
    const { container } = render(<DesignCanvas items={items} onZoomChange={onZoomChange} />);
    fireEvent.click(container.querySelector('[aria-label="放大"]')!);
    expect(onZoomChange).toHaveBeenLastCalledWith(1.2);
    fireEvent.click(container.querySelector('[aria-label="缩小"]')!);
  });

  it("缩放被 minZoom / maxZoom 钳住", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} zoom={2} maxZoom={2} onZoomChange={onZoomChange} />,
    );
    fireEvent.click(container.querySelector('[aria-label="放大"]')!);
    expect(onZoomChange).not.toHaveBeenCalled();
  });

  it("复位视图回到 zoom=1 / pan=0", () => {
    const onZoomChange = vi.fn();
    const onPanChange = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        zoom={2}
        pan={{ x: 50, y: 50 }}
        onZoomChange={onZoomChange}
        onPanChange={onPanChange}
      />,
    );
    fireEvent.click(container.querySelector('[aria-label="复位视图"]')!);
    expect(onZoomChange).toHaveBeenCalledWith(1);
    expect(onPanChange).toHaveBeenCalledWith({ x: 0, y: 0 });
  });

  it("apiRef 暴露 screenToCanvas（用当前视口反算）", () => {
    const ref = { current: null } as { current: import("./design-canvas.types").DesignCanvasApi | null };
    render(<DesignCanvas items={items} zoom={2} pan={{ x: 100, y: 50 }} apiRef={ref} />);
    expect(ref.current?.screenToCanvas(120, 90)).toEqual({ x: 10, y: 20 });
  });

  it("非受控时自己维护 zoom（无 onZoomChange 也能缩放）", () => {
    const { container } = render(<DesignCanvas items={items} defaultZoom={1} />);
    fireEvent.click(container.querySelector('[aria-label="放大"]')!);
    const world = itemEl(container, "hero").parentElement!;
    expect(world.style.transform).toContain("scale(1.2)");
  });
});

describe("DesignCanvas 滚轮语义", () => {
  const wheel = (c: HTMLElement, init: WheelEventInit) =>
    fireEvent.wheel(canvasOf(c), { deltaX: 0, deltaY: 0, deltaMode: 0, ...init });

  it("无修饰键的滚轮默认平移（与系统惯例、与 Flow 一致）", () => {
    const onPanChange = vi.fn();
    const onZoomChange = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        pan={{ x: 0, y: 0 }}
        zoom={1}
        onPanChange={onPanChange}
        onZoomChange={onZoomChange}
      />,
    );
    wheel(container, { deltaY: 100 });
    expect(onPanChange).toHaveBeenCalledWith({ x: 0, y: -100 });
    expect(onZoomChange).not.toHaveBeenCalled();
  });

  it("ctrlKey（触控板捏合）恒为缩放，不被 wheelBehavior 反转", () => {
    for (const behavior of ["pan", "zoom"] as const) {
      const onZoomChange = vi.fn();
      const { container, unmount } = render(
        <DesignCanvas
          items={items}
          pan={{ x: 0, y: 0 }}
          zoom={1}
          wheelBehavior={behavior}
          onZoomChange={onZoomChange}
        />,
      );
      wheel(container, { deltaY: -100, ctrlKey: true });
      expect(onZoomChange).toHaveBeenCalledTimes(1);
      expect(onZoomChange.mock.calls[0][0]).toBeGreaterThan(1);
      unmount();
    }
  });

  it("⌘+滚轮不缩放（macOS 上 ⌘ 没有缩放语义）", () => {
    const onZoomChange = vi.fn();
    const onPanChange = vi.fn();
    const { container } = render(
      <DesignCanvas
        items={items}
        pan={{ x: 0, y: 0 }}
        zoom={1}
        onZoomChange={onZoomChange}
        onPanChange={onPanChange}
      />,
    );
    wheel(container, { deltaY: 100, metaKey: true });
    expect(onZoomChange).not.toHaveBeenCalled();
    expect(onPanChange).toHaveBeenCalledWith({ x: 0, y: -100 });
  });

  it("wheelBehavior='zoom' 时无修饰键才缩放", () => {
    const onZoomChange = vi.fn();
    const { container } = render(
      <DesignCanvas items={items} zoom={1} wheelBehavior="zoom" onZoomChange={onZoomChange} />,
    );
    wheel(container, { deltaY: -100 });
    expect(onZoomChange).toHaveBeenCalledTimes(1);
  });

  it("画布抑制文本选择，但可编辑内容留逃生口", () => {
    const { container } = render(<DesignCanvas items={items} />);
    const cls = canvasOf(container).className;
    expect(cls).toContain("select-none");
    expect(cls).toContain("[&_[contenteditable]]:select-text");
    expect(cls).toContain("[&_input]:select-text");
    expect(cls).toContain("[&_textarea]:select-text");
  });
});
