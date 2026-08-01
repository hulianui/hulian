import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RegionSelect } from "./region-select";
import {
  applyAspect,
  boxMinSide,
  normalizeBox,
  strokeWidthFor,
  toImagePoint,
} from "./region-box";

const NAT = { width: 1000, height: 500 };
// 画布被 CSS 缩到 500×250（缩放比 2）：折算必须按两轴各自的比例来。
const RECT = { left: 0, top: 0, width: 500, height: 250 };

function stubRect(svg: SVGSVGElement, rect = RECT) {
  vi.spyOn(svg, "getBoundingClientRect").mockReturnValue({
    ...rect,
    right: rect.left + rect.width,
    bottom: rect.top + rect.height,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

describe("toImagePoint", () => {
  it("按两轴缩放比折算到原图像素", () => {
    expect(toImagePoint(100, 50, RECT, 1000, 500)).toEqual([200, 100]);
  });

  it("扣掉画布在页面中的偏移", () => {
    const rect = { left: 40, top: 10, width: 500, height: 250 };
    expect(toImagePoint(140, 60, rect, 1000, 500)).toEqual([200, 100]);
  });

  it("超出图边界钳位，不给负数或越界值", () => {
    expect(toImagePoint(-50, -50, RECT, 1000, 500)).toEqual([0, 0]);
    expect(toImagePoint(9999, 9999, RECT, 1000, 500)).toEqual([1000, 500]);
  });

  it("画布尺寸为 0（未布局完）不做除法", () => {
    const p = toImagePoint(10, 10, { left: 0, top: 0, width: 0, height: 0 }, 1000, 500);
    expect(p.every(Number.isFinite)).toBe(true);
  });
});

describe("normalizeBox", () => {
  it("反向拖也得到 x1<x2 / y1<y2", () => {
    expect(normalizeBox([300, 200], [100, 50])).toEqual([100, 50, 300, 200]);
  });
});

describe("applyAspect", () => {
  it("按较大的一边定尺寸，另一边按比例推出", () => {
    // 拖出 400×50，aspect=2 → 以宽为准，高 = 200
    expect(applyAspect([0, 0], [400, 50], 2, 1000, 500)).toEqual([0, 0, 400, 200]);
  });

  it("方向跟随拖拽方向（往左上拖）", () => {
    expect(applyAspect([400, 300], [0, 250], 2, 1000, 500)).toEqual([0, 100, 400, 300]);
  });

  it("撞边界时整体缩，不靠单轴钳位破坏比例", () => {
    const box = applyAspect([900, 0], [1400, 400], 2, 1000, 500);
    const w = box[2] - box[0];
    const h = box[3] - box[1];
    expect(box[2]).toBeLessThanOrEqual(1000);
    expect(w / h).toBeCloseTo(2, 5);
  });
});

describe("boxMinSide / strokeWidthFor", () => {
  it("短边取宽高较小者", () => {
    expect(boxMinSide([0, 0, 100, 20])).toBe(20);
  });

  it("描边按图宽给，且不细于 2", () => {
    expect(strokeWidthFor(3000)).toBe(7.5);
    expect(strokeWidthFor(400)).toBe(2);
  });
});

describe("RegionSelect", () => {
  it("量到自然尺寸前只出占位，不画框", () => {
    const { container, getByText } = render(
      <RegionSelect src="/p.png" placeholder="载入中" value={[0, 0, 10, 10]} />,
    );
    expect(getByText("载入中")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("viewBox 用原图像素，底图铺满", () => {
    const { container } = render(<RegionSelect src="/p.png" naturalSize={NAT} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("viewBox")).toBe("0 0 1000 500");
    const img = container.querySelector("image")!;
    expect(img.getAttribute("width")).toBe("1000");
  });

  it("拖一个框 → onChange 给原图像素坐标", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith([100, 50, 300, 200]);
  });

  it("反向拖（右下往左上）同样给规范化框", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 150, clientY: 100, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 50, clientY: 25, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith([100, 50, 300, 200]);
  });

  it("短边小于 minSide 视为误点，不触发 onChange", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onChange={onChange} minSide={20} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 54, clientY: 29, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("setPointerCapture 抛错也不打断拖拽（合成事件场景）", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    svg.setPointerCapture = () => {
      throw new Error("no pointer");
    };
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onChange).toHaveBeenCalledWith([100, 50, 300, 200]);
  });

  it("拖拽中实时回 onDrafting，结束回 null", () => {
    const onDrafting = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onDrafting={onDrafting} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onDrafting).toHaveBeenLastCalledWith([100, 50, 300, 200]);
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onDrafting).toHaveBeenLastCalledWith(null);
  });

  it("pointercancel 放弃本次拖拽", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerCancel(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("readOnly 不响应拖拽但仍显示已有框", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} value={[10, 10, 90, 90]} readOnly onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 50, clientY: 25, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 150, clientY: 100, pointerId: 1 });
    expect(onChange).not.toHaveBeenCalled();
    expect(container.querySelector("[data-region-active]")).toBeTruthy();
  });

  it("aspect 固定比例", () => {
    const onChange = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT} aspect={2} onChange={onChange} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg);
    fireEvent.pointerDown(svg, { clientX: 0, clientY: 0, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 200, clientY: 25, pointerId: 1 });
    const [x1, y1, x2, y2] = onChange.mock.calls[0][0];
    expect((x2 - x1) / (y2 - y1)).toBeCloseTo(2, 5);
  });

  it("boxes 只读框一并显示并带标注", () => {
    const { container, getByText } = render(
      <RegionSelect
        src="/p.png"
        naturalSize={NAT}
        boxes={[{ id: "a", box: [0, 0, 100, 100], label: "题 1", color: "chart-2" }]}
      />,
    );
    expect(getByText("题 1")).toBeTruthy();
    expect(container.querySelectorAll("rect")).toHaveLength(1);
  });

  it("画布带 touch-none，触屏拖框不滚页面", () => {
    const { container } = render(<RegionSelect src="/p.png" naturalSize={NAT} />);
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("touch-none");
  });
});
