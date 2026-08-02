import { render, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { RegionSelect } from "./region-select";
import {
  applyAspect,
  boxMinSide,
  normalizeBox,
  roundBox,
  strokeWidthFor,
  toImagePoint,
} from "./region-box";

const NAT = { width: 1000, height: 500 };
// 画布被 CSS 缩到 500×250（缩放比 2）：折算必须按两轴各自的比例来。
const RECT = { left: 0, top: 0, width: 500, height: 250 };

// 除不尽的缩放比（756/396 = 1.909…）。整数倍缩放时坐标本就落在整数上，
// 取整缺陷会被整个测出不来 —— 出口取整的测试必须用这一组。
const NAT_ODD = { width: 756, height: 1033 };
const RECT_ODD = { left: 0, top: 0, width: 396, height: 541 };

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

describe("roundBox", () => {
  const FLOAT: [number, number, number, number] = [
    187.0909090909091, 116.16402685532775, 378, 307.0736427952642,
  ];

  it("expand：左上 floor、右下 ceil —— 不缩小框", () => {
    expect(roundBox(FLOAT, "expand")).toEqual([187, 116, 378, 308]);
  });

  it("expand 是默认档", () => {
    expect(roundBox(FLOAT)).toEqual(roundBox(FLOAT, "expand"));
  });

  it("nearest：四舍五入（可能各边内收，故不作默认）", () => {
    expect(roundBox(FLOAT, "nearest")).toEqual([187, 116, 378, 307]);
  });

  it("none：原样保留浮点", () => {
    expect(roundBox(FLOAT, "none")).toEqual(FLOAT);
  });

  it("expand 后的框恒不小于原框（这正是它优于 nearest 的地方）", () => {
    const out = roundBox(FLOAT, "expand");
    expect(out[2] - out[0]).toBeGreaterThanOrEqual(FLOAT[2] - FLOAT[0]);
    expect(out[3] - out[1]).toBeGreaterThanOrEqual(FLOAT[3] - FLOAT[1]);
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

// hulianui/hulian#72：出口必须是整数——落库（list[int]）、服务端裁图、等值判断三处都吃不下浮点。
describe("RegionSelect 出口取整", () => {
  const dragOdd = (onChange: ReturnType<typeof vi.fn>, props = {}) => {
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT_ODD} onChange={onChange} {...props} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg, RECT_ODD);
    fireEvent.pointerDown(svg, { clientX: 98, clientY: 61, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 198, clientY: 161, pointerId: 1 });
    return onChange.mock.calls[0][0] as number[];
  };

  it("除不尽的缩放比下，onChange 给的四个值全是整数", () => {
    const box = dragOdd(vi.fn());
    expect(box.every(Number.isInteger)).toBe(true);
  });

  it("默认 expand：左上 floor、右下 ceil", () => {
    // 98 * 756/396 = 187.09…；198 * 756/396 = 378（恰整）
    expect(dragOdd(vi.fn())).toEqual([187, 116, 378, 308]);
  });

  it("round=\"none\" 保留浮点（亚像素场景）", () => {
    const box = dragOdd(vi.fn(), { round: "none" });
    expect(box.every(Number.isInteger)).toBe(false);
  });

  it("round=\"nearest\" 走四舍五入", () => {
    expect(dragOdd(vi.fn(), { round: "nearest" })).toEqual([187, 116, 378, 307]);
  });

  it("拖拽预览（onDrafting）不取整，视觉跟手", () => {
    const onDrafting = vi.fn();
    const { container } = render(
      <RegionSelect src="/p.png" naturalSize={NAT_ODD} onDrafting={onDrafting} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg, RECT_ODD);
    fireEvent.pointerDown(svg, { clientX: 98, clientY: 61, button: 0, pointerId: 1 });
    fireEvent.pointerMove(svg, { clientX: 198, clientY: 161, pointerId: 1 });
    const draft = onDrafting.mock.calls.at(-1)![0] as number[];
    expect(draft.every(Number.isInteger)).toBe(false);
  });

  it("minSide 判定在取整之后：expand 撑够阈值的框不该被当误点丢掉", () => {
    const onChange = vi.fn();
    const { container } = render(
      // 取整前短边 19.09…（< 20 会被判误点），expand 后是 [x, y, x+20, y+20] → 恰好达标
      <RegionSelect src="/p.png" naturalSize={NAT_ODD} onChange={onChange} minSide={20} />,
    );
    const svg = container.querySelector("svg")!;
    stubRect(svg, RECT_ODD);
    fireEvent.pointerDown(svg, { clientX: 100, clientY: 100, button: 0, pointerId: 1 });
    fireEvent.pointerUp(svg, { clientX: 110, clientY: 110, pointerId: 1 });
    expect(onChange).toHaveBeenCalledTimes(1);
    const box = onChange.mock.calls[0][0] as number[];
    expect(Math.min(box[2] - box[0], box[3] - box[1])).toBeGreaterThanOrEqual(20);
  });
});

// hulianui/hulian#67：底图取不到时必须有出口，不能与「正在载入」长得一样。
describe("RegionSelect 加载失败", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  /** 替换 window.Image，把预读实例交出来手动烧事件（jsdom 不真的发请求）。 */
  function stubImage() {
    const probes: Array<{
      onload: (() => void) | null;
      onerror: ((e: unknown) => void) | null;
      naturalWidth: number;
      naturalHeight: number;
      complete: boolean;
      src: string;
    }> = [];
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      naturalWidth = 0;
      naturalHeight = 0;
      complete = false;
      src = "";
      constructor() {
        probes.push(this as unknown as (typeof probes)[number]);
      }
    }
    vi.stubGlobal("Image", FakeImage);
    return probes;
  }

  it("预读失败 → 出 errorPlaceholder，而不是永久停在 placeholder", () => {
    const probes = stubImage();
    const { getByText, queryByText } = render(
      <RegionSelect src="/404.png" placeholder="载入中" errorPlaceholder="这一页还没推上来" />,
    );
    expect(getByText("载入中")).toBeTruthy();
    act(() => probes[0].onerror?.(new Event("error")));
    expect(queryByText("载入中")).toBeNull();
    expect(getByText("这一页还没推上来")).toBeTruthy();
  });

  it("不传 errorPlaceholder 也有默认文案（与「载入中」可区分）", () => {
    const probes = stubImage();
    const { getByText } = render(<RegionSelect src="/404.png" />);
    act(() => probes[0].onerror?.(new Event("error")));
    expect(getByText("图片加载失败")).toBeTruthy();
  });

  it("失败回调 onError 触发一次", () => {
    const probes = stubImage();
    const onError = vi.fn();
    render(<RegionSelect src="/404.png" onError={onError} />);
    act(() => probes[0].onerror?.(new Event("error")));
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("缓存里的失败结果（complete 且 naturalWidth=0）同样进失败态", () => {
    const probes = stubImage();
    // 组件在 src 赋值后立刻查 complete；这里先让实例被创建，再模拟「已完成且宽为 0」
    class CachedFail {
      onload: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      naturalWidth = 0;
      naturalHeight = 0;
      complete = true;
      src = "";
    }
    vi.stubGlobal("Image", CachedFail);
    const { getByText } = render(<RegionSelect src="/cached-404.png" />);
    expect(getByText("图片加载失败")).toBeTruthy();
    expect(probes).toHaveLength(0);
  });

  it("画布 <image> 自身失败（如中途鉴权过期）走同一出口", () => {
    const { container, getByText } = render(
      <RegionSelect src="/expired.png" naturalSize={NAT} errorPlaceholder="链接已过期" />,
    );
    fireEvent.error(container.querySelector("image")!);
    expect(getByText("链接已过期")).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("换一张能取到的图，失败态复位", () => {
    const probes = stubImage();
    const { rerender, getByText, container } = render(<RegionSelect src="/404.png" />);
    act(() => probes[0].onerror?.(new Event("error")));
    expect(getByText("图片加载失败")).toBeTruthy();
    rerender(<RegionSelect src="/ok.png" naturalSize={NAT} />);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
