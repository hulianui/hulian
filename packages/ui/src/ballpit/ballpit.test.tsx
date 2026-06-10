import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup, act } from "@testing-library/react";
import { Ballpit } from "./ballpit";
import {
  fitToContainer,
  stepPhysics,
  MAX_FILL,
  MAX_RADIUS_FRACTION,
  type BallBody,
} from "./ballpit.physics";

// ---------------------------------------------------------------------------
// jsdom 环境说明
//
// ① jsdom 无 window.matchMedia → 必须 stub，否则组件内 matchMedia 调用抛。
// ② jsdom 的 <canvas>.getContext("2d") 返回 null → 组件走「静默降级」分支：
//    移除 canvas、不启动 RAF 物理。根容器 div 仍在，不抛错。
// ③ matchMedia.matches=true → reduced=true → 渲染静态小球占位 div（不建 canvas）。
// ---------------------------------------------------------------------------

function makeMatchMedia(matches: boolean) {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: makeMatchMedia(false),
  });
  Object.defineProperty(window, "devicePixelRatio", {
    writable: true,
    configurable: true,
    value: 1,
  });
  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(0), 16) as unknown as number;
    window.cancelAnimationFrame = (id) => clearTimeout(id as unknown as number);
  }
  if (!globalThis.ResizeObserver) {
    (globalThis as unknown as Record<string, unknown>).ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (!globalThis.IntersectionObserver) {
    (globalThis as unknown as Record<string, unknown>).IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
      constructor(_cb: unknown, _opts?: unknown) {}
    };
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Ballpit · 正常路径（canvas 分支，jsdom 下 getContext 为 null 静默降级）", () => {
  it("渲染根容器 div，带 absolute inset-0 z-0 + 装饰属性，不抛错", async () => {
    const { container } = render(<Ballpit />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("inset-0");
    expect(root.className).toContain("z-0");
    expect(root.getAttribute("aria-hidden")).toBe("true");
  });

  it("followCursor=true 时根容器可接收指针事件（pointer-events-auto）", async () => {
    const { container } = render(<Ballpit followCursor />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "pointer-events-auto",
    );
  });

  it("followCursor=false 时根容器 pointer-events-none（纯背景不挡交互）", async () => {
    const { container } = render(<Ballpit followCursor={false} />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "pointer-events-none",
    );
  });

  it("className prop 透传到根容器", async () => {
    const { container } = render(<Ballpit className="test-ballpit-class" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "test-ballpit-class",
    );
  });

  it("自定义 props（count/gravity/bounce/colors/sizeRange）全不抛", async () => {
    await expect(
      act(async () => {
        render(
          <Ballpit
            count={120}
            gravity={400}
            bounce={0.7}
            colors={["#6366f1", "oklch(0.7 0.2 30)"]}
            sizeRange={[8, 20]}
          />,
        );
      }),
    ).resolves.not.toThrow();
  });

  it("卸载不崩", async () => {
    const { unmount } = render(<Ballpit />);
    await act(async () => {});
    expect(() => unmount()).not.toThrow();
  });
});

describe("Ballpit · reduced-motion 路径（静态占位）", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: makeMatchMedia(true),
    });
  });

  it("渲染静态占位 div（aria-hidden + pointer-events-none），不建 canvas", async () => {
    const { container } = render(<Ballpit />);
    await act(async () => {});
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.className).toContain("pointer-events-none");
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("z-0");
    // reduced 分支不挂 canvas（占位用 span 小球）
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("自定义 fallback 内容被渲染", async () => {
    const { getByTestId } = render(
      <Ballpit fallback={<span data-testid="bp-fallback">静态球池</span>} />,
    );
    await act(async () => {});
    expect(getByTestId("bp-fallback").textContent).toBe("静态球池");
  });

  it("className 透传到 reduced 占位 div", async () => {
    const { container } = render(<Ballpit className="reduced-bp" />);
    await act(async () => {});
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "reduced-bp",
    );
  });
});

// ---------------------------------------------------------------------------
// 物理纯函数（ballpit.physics.ts）
// ---------------------------------------------------------------------------

/** 半径均匀分布时单球期望面积 */
function expectedBallArea(rMin: number, rMax: number) {
  return (Math.PI * (rMin * rMin + rMin * rMax + rMax * rMax)) / 3;
}

describe("ballpit.physics · 容器自适应（fitToContainer）", () => {
  it("宽裕容器（主预览 950×420）不动原参数", () => {
    const fit = fitToContainer(80, 10, 26, 950, 420);
    expect(fit.count).toBe(80);
    expect(fit.rMin).toBeCloseTo(10);
    expect(fit.rMax).toBeCloseTo(26);
  });

  it("窄卡（380×256）默认参数超填充 → 压到面积占用率上限内", () => {
    const fit = fitToContainer(80, 10, 26, 380, 256);
    const used = fit.count * expectedBallArea(fit.rMin, fit.rMax);
    expect(used).toBeLessThanOrEqual(380 * 256 * MAX_FILL * 1.001);
    expect(fit.count).toBeGreaterThan(0);
    // 半径被缩但不至于看不见
    expect(fit.rMin).toBeGreaterThanOrEqual(1);
    expect(fit.rMax).toBeLessThan(26);
  });

  it("大球少量在窄竖卡（200×256）：球径受短边比例上限约束 + 不超填充", () => {
    const fit = fitToContainer(28, 24, 44, 200, 256);
    expect(fit.rMax).toBeLessThanOrEqual(200 * MAX_RADIUS_FRACTION + 1e-9);
    const used = fit.count * expectedBallArea(fit.rMin, fit.rMax);
    expect(used).toBeLessThanOrEqual(200 * 256 * MAX_FILL * 1.001);
  });

  it("极小容器不抛、count=0 直通", () => {
    expect(() => fitToContainer(80, 10, 26, 4, 4)).not.toThrow();
    const fit = fitToContainer(0, 10, 26, 380, 256);
    expect(fit.count).toBe(0);
  });
});

describe("ballpit.physics · 超填充收敛（stepPhysics）", () => {
  it("故意超填充重叠初始化的小容器，跑 900 步后平均速度低于阈值且位置稳定（无稳态抖动）", () => {
    // 200×150 容器塞 48 颗 r=12（面积占用 ~72%，远超 MAX_FILL），
    // 网格间距 20 < 直径 24 → 初始即大量互相重叠。全程确定性（不用 Math.random）。
    const balls: BallBody[] = [];
    for (let i = 0; i < 48; i++) {
      balls.push({
        x: 14 + (i % 8) * 20,
        y: 14 + Math.floor(i / 8) * 20,
        vx: ((i * 37) % 120) - 60,
        vy: ((i * 53) % 120) - 60,
        r: 12,
      });
    }
    const opts = { dt: 1 / 60, w: 200, h: 150, gravity: 900, bounce: 0.86 };
    for (let k = 0; k < 840; k++) stepPhysics(balls, opts);
    const snapshot = balls.map((b) => ({ x: b.x, y: b.y }));
    for (let k = 0; k < 60; k++) stepPhysics(balls, opts);

    // 1) 平均速度收敛（堆积静止，不许稳态持续抖动）
    const avgSpeed =
      balls.reduce((s, b) => s + Math.hypot(b.vx, b.vy), 0) / balls.length;
    expect(avgSpeed).toBeLessThan(30);

    // 2) 最后 1 秒内位置基本不动（无位置校正来回猛推）
    let maxDrift = 0;
    for (let i = 0; i < balls.length; i++) {
      maxDrift = Math.max(
        maxDrift,
        Math.hypot(balls[i]!.x - snapshot[i]!.x, balls[i]!.y - snapshot[i]!.y),
      );
    }
    expect(maxDrift).toBeLessThan(3);

    // 3) 全部仍在容器内
    for (const b of balls) {
      expect(b.x).toBeGreaterThanOrEqual(b.r - 0.001);
      expect(b.x).toBeLessThanOrEqual(200 - b.r + 0.001);
      expect(b.y).toBeGreaterThanOrEqual(b.r - 0.001);
      expect(b.y).toBeLessThanOrEqual(150 - b.r + 0.001);
    }
  });

  it("速度有硬上限：极端初速一帧后被钳制", () => {
    const balls: BallBody[] = [
      { x: 100, y: 75, vx: 99999, vy: -99999, r: 10 },
    ];
    stepPhysics(balls, { dt: 1 / 60, w: 200, h: 150, gravity: 900, bounce: 0.86 });
    expect(Math.hypot(balls[0]!.vx, balls[0]!.vy)).toBeLessThanOrEqual(1600 * 1.001);
  });

  it("失重（gravity=0, bounce=1）不被 sleep 阻尼冻结：单球匀速巡游", () => {
    const balls: BallBody[] = [{ x: 100, y: 75, vx: 50, vy: 0, r: 10 }];
    for (let k = 0; k < 120; k++) {
      stepPhysics(balls, { dt: 1 / 60, w: 400, h: 300, gravity: 0, bounce: 1 });
    }
    // 仅 0.999/帧 轻阻尼，2 秒后仍接近原速
    expect(Math.abs(balls[0]!.vx)).toBeGreaterThan(40);
  });
});
