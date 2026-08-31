import { describe, it, expect, afterEach, vi } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { render, cleanup, act } from "@testing-library/react";
import { HulianMascot, cellsToPath, CELL, GRID } from "./hulian-mascot";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * 定位 public/logo.svg。
 * 不用 `new URL(..., import.meta.url)`：jsdom 环境下 `import.meta.url` 是 http: 而非 file:，
 * `fileURLToPath` 会抛 "The URL must be of scheme file"。改从 cwd 向上找，
 * 这样从 apps/www 跑还是从仓库根用 turbo 跑都定位得到。
 */
function logoPath(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    for (const candidate of [join(dir, "public/logo.svg"), join(dir, "apps/www/public/logo.svg")]) {
      if (existsSync(candidate)) return candidate;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error(`找不到 public/logo.svg（从 ${resolve(process.cwd())} 向上找了 6 层）`);
}

/** 从 public/logo.svg 解出网格坐标集合 —— 器灵的器型必须与它逐格相同。 */
function logoCells(): Set<string> {
  const svg = readFileSync(logoPath(), "utf8");
  const out = new Set<string>();
  for (const m of svg.matchAll(/<rect x="(\d+)" y="(\d+)" width="(\d+)" height="(\d+)"\/>/g)) {
    const [, x, y, w, h] = m;
    expect(Number(w)).toBe(CELL);
    expect(Number(h)).toBe(CELL);
    out.add(`${Number(x) / CELL},${Number(y) / CELL}`);
  }
  return out;
}

/** 从 path 的 d 里反解格子坐标（每格一个 `M x yh60v60h-60Z` 子路径）。 */
function pathCells(d: string): Set<string> {
  const out = new Set<string>();
  for (const m of d.matchAll(/M(\d+) (\d+)h/g)) {
    out.add(`${Number(m[1]) / CELL},${Number(m[2]) / CELL}`);
  }
  return out;
}

const bodyPathOf = (container: HTMLElement) =>
  container.querySelector("svg > path")!.getAttribute("d")!;

describe("器灵器型与 logo.svg 同源", () => {
  it("器身格子 = logo.svg 的格子（改了 logo 没同步这里就该红）", () => {
    const { container } = render(<HulianMascot mood="serve" blinking={false} />);
    const drawn = pathCells(bodyPathOf(container));
    const logo = logoCells();
    // 器身路径 = logo 格 ∪ 眼睛格（眼睛落在器身内，靠 evenodd 挖成洞）
    for (const cell of logo) expect(drawn.has(cell)).toBe(true);
    // 多出来的只能是眼睛，且必须落在 logo 的实心格之内
    for (const cell of drawn) {
      if (!logo.has(cell)) throw new Error(`器灵画了 logo 之外的器身格：${cell}`);
    }
  });

  it("默认 viewBox 与 logo.svg 一致（1140 = 19 × 60），保证两者可无缝互变", () => {
    const { container } = render(<HulianMascot blinking={false} />);
    expect(container.querySelector("svg")!.getAttribute("viewBox")).toBe(
      `0 0 ${GRID * CELL} ${GRID * CELL}`,
    );
    expect(GRID * CELL).toBe(1140);
  });

  it("tight 收紧 viewBox，且六种表情共用同一个框（原地切表情不跳尺寸）", () => {
    const boxes = new Set<string>();
    for (const mood of ["idle", "blink", "happy", "wink", "sleep", "serve"] as const) {
      const { container, unmount } = render(<HulianMascot mood={mood} tight blinking={false} />);
      boxes.add(container.querySelector("svg")!.getAttribute("viewBox")!);
      unmount();
    }
    expect(boxes.size).toBe(1);
    const [box] = [...boxes];
    expect(box).not.toBe(`0 0 ${GRID * CELL} ${GRID * CELL}`);

    // 收紧框必须真的框住所有画得出来的格子（含 sleep 的 zZ 与 serve 的积木）
    const [bx, by, bw, bh] = box!.split(" ").map(Number);
    for (const mood of ["idle", "sleep", "serve"] as const) {
      const { container, unmount } = render(<HulianMascot mood={mood} tight blinking={false} />);
      for (const path of container.querySelectorAll("path")) {
        for (const m of path.getAttribute("d")!.matchAll(/M(\d+) (\d+)h/g)) {
          const x = Number(m[1]);
          const y = Number(m[2]);
          expect(x).toBeGreaterThanOrEqual(bx!);
          expect(y).toBeGreaterThanOrEqual(by!);
          expect(x + CELL).toBeLessThanOrEqual(bx! + bw!);
          expect(y + CELL).toBeLessThanOrEqual(by! + bh!);
        }
      }
      unmount();
    }
  });

  it("器身用 currentColor + evenodd —— 眼睛是洞，不是实心色块", () => {
    const { container } = render(<HulianMascot blinking={false} />);
    const path = container.querySelector("svg > path")!;
    expect(path.getAttribute("fill")).toBe("currentColor");
    expect(path.getAttribute("fill-rule")).toBe("evenodd");
    // 全图不许出现除 currentColor 之外的填充色（否则暗色主题下会是死色块）
    for (const p of container.querySelectorAll("path")) {
      expect(p.getAttribute("fill")).toBe("currentColor");
    }
  });

  it("crispEdges 不能丢，否则像素边缘会被抗锯齿糊掉", () => {
    const { container } = render(<HulianMascot blinking={false} />);
    expect(container.querySelector("svg")!.getAttribute("shape-rendering")).toBe("crispEdges");
  });
});

describe("表情", () => {
  it("不同 mood 画出不同的 d（表情真的换了，不是只换了 class）", () => {
    const seen = new Map<string, string>();
    for (const mood of ["idle", "blink", "happy", "wink", "sleep", "serve"] as const) {
      const { container, unmount } = render(<HulianMascot mood={mood} blinking={false} />);
      seen.set(mood, bodyPathOf(container));
      unmount();
    }
    expect(seen.get("idle")).not.toBe(seen.get("blink"));
    expect(seen.get("happy")).not.toBe(seen.get("idle"));
    expect(seen.get("wink")).not.toBe(seen.get("idle"));
    expect(seen.get("wink")).not.toBe(seen.get("blink"));
    // sleep 与 blink 眼型相同（都是闭眼），差别在配件
    expect(seen.get("sleep")).toBe(seen.get("blink"));
  });

  it("sleep 出 zZ、serve 出三块积木，其余 mood 不带配件", () => {
    const { container: sleep } = render(<HulianMascot mood="sleep" />);
    expect(sleep.querySelectorAll(".hl-mascot-zzz")).toHaveLength(1);
    cleanup();

    const { container: serve } = render(<HulianMascot mood="serve" />);
    expect(serve.querySelectorAll(".hl-mascot-block")).toHaveLength(3);
    cleanup();

    const { container: idle } = render(<HulianMascot mood="idle" blinking={false} />);
    expect(idle.querySelectorAll(".hl-mascot-zzz, .hl-mascot-block")).toHaveLength(0);
  });
});

describe("动效与降级", () => {
  function stubReducedMotion(reduce: boolean) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: reduce && query.includes("prefers-reduced-motion"),
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
        onchange: null,
      })),
    });
  }

  it("reduced-motion 下不眨眼（是不眨，不是眨得慢）", () => {
    stubReducedMotion(true);
    vi.useFakeTimers();
    const { container } = render(<HulianMascot mood="idle" />);
    const before = bodyPathOf(container);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(bodyPathOf(container)).toBe(before);
  });

  it("正常动效下会眨眼，且眨完自己睁回来", () => {
    stubReducedMotion(false);
    vi.spyOn(Math, "random").mockReturnValue(0);
    vi.useFakeTimers();
    const { container } = render(<HulianMascot mood="idle" />);
    const open = bodyPathOf(container);

    act(() => {
      vi.advanceTimersByTime(2400);
    });
    const closed = bodyPathOf(container);
    expect(closed).not.toBe(open);

    act(() => {
      vi.advanceTimersByTime(120);
    });
    expect(bodyPathOf(container)).toBe(open);
  });

  it("blinking=false 时永不自动眨眼", () => {
    stubReducedMotion(false);
    vi.useFakeTimers();
    const { container } = render(<HulianMascot mood="idle" blinking={false} />);
    const before = bodyPathOf(container);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(bodyPathOf(container)).toBe(before);
  });

  it("floating=false 去掉浮动 class", () => {
    const { container } = render(<HulianMascot floating={false} blinking={false} />);
    expect(container.querySelector("svg")!.getAttribute("class")).not.toContain("hl-mascot-float");
  });
});

describe("无障碍", () => {
  it("不给 title 就是纯装饰：aria-hidden，不进读屏", () => {
    const { container } = render(<HulianMascot blinking={false} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBeNull();
    expect(svg.querySelector("title")).toBeNull();
  });

  it("给了 title 就是图片：role=img + <title>，且不再 aria-hidden", () => {
    const { container } = render(<HulianMascot title="瑚琏器灵" blinking={false} />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-hidden")).toBeNull();
    expect(svg.querySelector("title")!.textContent).toBe("瑚琏器灵");
  });
});

describe("cellsToPath", () => {
  it("每格产出一条闭合子路径，坐标 = 格号 × 60", () => {
    expect(cellsToPath([[2, 3]])).toBe("M120 180h60v60h-60Z");
  });
});
