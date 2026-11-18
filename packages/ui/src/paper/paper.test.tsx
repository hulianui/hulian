import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";
import { FigRef, FigureStep, Paper, PaperFigure, ProcessFigure, usePaperMode } from ".";
import type { PaperMode } from ".";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const zh = (node: React.ReactNode) => render(<ConfigProvider locale={zhCN}>{node}</ConfigProvider>);

const steps = [
  { key: "a", label: "嵌入", description: "第一步：嵌入" },
  { key: "b", label: "自注意力", description: "第二步：自注意力" },
  { key: "c", label: "前馈", description: "第三步：前馈" },
];

function Arch() {
  return (
    <svg>
      <FigureStep at="a" data-testid="part-a" />
      <FigureStep at={["b", "c"]} data-testid="part-bc" />
      <FigureStep at="c" data-testid="part-c" />
    </svg>
  );
}

function Explore({ mode }: { mode?: PaperMode }) {
  return (
    <Paper mode={mode}>
      <p>
        见 <FigRef to="curve" state="big" data-testid="ref-big">图 1（大）</FigRef> 与{" "}
        <FigRef to="curve" data-testid="ref-auto" />
      </p>
      <PaperFigure
        id="curve"
        states={{ small: 1, big: 8 }}
        caption="一条曲线"
        describe={(v) => `k = ${v}`}
        controls={(f) => (
          <button type="button" onClick={() => f.setState(f.state + 1)}>
            加一
          </button>
        )}
      >
        {(v) => <span data-testid="value">{v}</span>}
      </PaperFigure>
    </Paper>
  );
}

describe("PaperFigure", () => {
  it("初始画第一个预设，图注带状态说明，控件可以直接给值", () => {
    zh(<Explore />);
    expect(screen.getByTestId("value").textContent).toBe("1");
    const figure = screen.getByRole("figure");
    expect(figure.id).toBe("curve");
    expect(figure.getAttribute("data-state")).toBe("small");
    expect(within(figure).getByText("k = 1")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "加一" }));
    expect(screen.getByTestId("value").textContent).toBe("2");
    expect(figure.hasAttribute("data-state")).toBe(false);
  });

  it("打印形态画打印态，控件不渲染", () => {
    zh(<Explore mode="print" />);
    expect(screen.getByTestId("value").textContent).toBe("1");
    expect(screen.queryByRole("button", { name: "加一" })).toBeNull();
  });

  it("labels 覆盖论文内容的文字，控件文字仍跟界面语言", () => {
    const { container } = zh(
      <Paper labels={{ figure: "Figure", separator: ": " }}>
        <FigRef to="arch" data-testid="ref" />
        <ProcessFigure id="arch" steps={steps} caption="c">
          <Arch />
        </ProcessFigure>
      </Paper>,
    );
    expect(container.querySelector("[data-paper-figure-label]")?.textContent).toBe("Figure : ");
    expect(screen.getByTestId("ref").textContent).toBe("Figure 1");
    expect(screen.getByRole("button", { name: "下一步" })).toBeTruthy();
  });

  it("图注前缀跟随语言", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <Explore />
      </ConfigProvider>,
    );
    expect(container.querySelector("[data-paper-figure-label]")?.textContent).toBe("Figure : ");
  });
});

describe("FigRef", () => {
  it("点击把图切到对应预设并描边", () => {
    zh(<Explore />);
    fireEvent.click(screen.getByTestId("ref-big"));
    expect(screen.getByTestId("value").textContent).toBe("8");
    expect(screen.getByRole("figure").hasAttribute("data-highlight")).toBe(true);
  });

  it("不写文字时按文档顺序自动取图号，链接退化为锚点", () => {
    zh(<Explore />);
    const auto = screen.getByTestId("ref-auto");
    expect(auto.textContent).toBe("图 1");
    expect(auto.getAttribute("href")).toBe("#curve");
  });

  it("引用不存在的预设只告警，不改状态", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    zh(
      <Paper>
        <FigRef to="curve" state="nope" data-testid="bad" />
        <PaperFigure id="curve" states={{ small: 1 }} caption="c">
          {(v) => <span data-testid="value">{v}</span>}
        </PaperFigure>
      </Paper>,
    );
    fireEvent.click(screen.getByTestId("bad"));
    expect(screen.getByTestId("value").textContent).toBe("1");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("ProcessFigure", () => {
  const renderProcess = (
    mode?: PaperMode,
    extra?: Partial<React.ComponentProps<typeof ProcessFigure>>,
  ) =>
    zh(
      <Paper mode={mode}>
        <ProcessFigure id="arch" steps={steps} caption="架构" overviewDescription="全部阶段" {...extra}>
          <Arch />
        </ProcessFigure>
      </Paper>,
    );

  it("当前步 on、讲过的 done、没讲到的 off", () => {
    renderProcess();
    const main = screen.getByRole("figure");
    const phase = (id: string) => within(main).getByTestId(id).getAttribute("data-phase");
    expect([phase("part-a"), phase("part-bc"), phase("part-c")]).toEqual(["on", "off", "off"]);
    fireEvent.click(screen.getByRole("button", { name: "(c) 前馈" }));
    expect([phase("part-a"), phase("part-bc"), phase("part-c")]).toEqual(["done", "on", "on"]);
    expect(within(main).getByText("第三步：前馈")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "全部" }));
    expect([phase("part-a"), phase("part-bc"), phase("part-c")]).toEqual(["all", "all", "all"]);
  });

  it("FigRef 不写文字且 state 是打印分图时，自动写成「图 N(字母)」；all 不带字母", () => {
    zh(
      <Paper>
        <FigRef to="arch" state="b" data-testid="sub-b" />
        <FigRef to="arch" state="all" data-testid="sub-all" />
        <ProcessFigure id="arch" steps={steps} caption="架构">
          <Arch />
        </ProcessFigure>
      </Paper>,
    );
    expect(screen.getByTestId("sub-b").textContent).toBe("图 1(b)");
    expect(screen.getByTestId("sub-all").textContent).toBe("图 1");
  });

  it("until：讲到被取代的那一步起、以及「全部」和打印主图里隐藏；分图里按各自的步骤算", () => {
    const { container } = zh(
      <Paper>
        <ProcessFigure id="moving" steps={steps} caption="移动的指针">
          <svg>
            <FigureStep at="a" until="b" data-testid="ptr-old" />
            <FigureStep at="b" data-testid="ptr-new" />
          </svg>
        </ProcessFigure>
      </Paper>,
    );
    const main = container.querySelector("[data-paper-figure-body]") as HTMLElement;
    const phase = (id: string) => within(main).getByTestId(id).getAttribute("data-phase");
    expect([phase("ptr-old"), phase("ptr-new")]).toEqual(["on", "off"]);
    fireEvent.click(screen.getByRole("button", { name: "(b) 自注意力" }));
    expect([phase("ptr-old"), phase("ptr-new")]).toEqual(["gone", "on"]);
    expect(within(main).getByTestId("ptr-old").getAttribute("class")).toContain("data-[phase=gone]:hidden");
    fireEvent.click(screen.getByRole("button", { name: "(c) 前馈" }));
    expect([phase("ptr-old"), phase("ptr-new")]).toEqual(["gone", "done"]);
    fireEvent.click(screen.getByRole("button", { name: "全部" }));
    expect([phase("ptr-old"), phase("ptr-new")]).toEqual(["gone", "all"]);
  });

  it("until 不是这张图的步骤时告警，照常按 at 算", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    zh(
      <Paper>
        <ProcessFigure id="bad-until" steps={steps} caption="c">
          <svg>
            <FigureStep at="a" until="zzz" data-testid="p" />
          </svg>
        </ProcessFigure>
      </Paper>,
    );
    expect(screen.getAllByTestId("p")[0].getAttribute("data-phase")).toBe("on");
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("zzz"));
    warn.mockRestore();
  });

  it("上一步 / 下一步在首尾禁用", () => {
    renderProcess();
    expect(screen.getByRole("button", { name: "上一步" })).toHaveProperty("disabled", true);
    fireEvent.click(screen.getByRole("button", { name: "下一步" }));
    fireEvent.click(screen.getByRole("button", { name: "下一步" }));
    expect(screen.getByRole("button", { name: "下一步" })).toHaveProperty("disabled", true);
  });

  it("播放逐步前进，到最后一步停下", () => {
    vi.useFakeTimers();
    renderProcess();
    fireEvent.click(screen.getByRole("button", { name: "播放" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByRole("button", { name: "(b) 自注意力" }).getAttribute("aria-pressed")).toBe("true");
    act(() => vi.advanceTimersByTime(2200));
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByRole("button", { name: "(c) 前馈" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "播放" })).toBeTruthy();
  });

  it("播放中外部切步骤（正文引用 / 定位阶段）→ 播放让位，别把读者选的那步刷走", () => {
    vi.useFakeTimers();
    zh(
      <Paper>
        <FigRef to="arch" state="c" data-testid="jump" />
        <ProcessFigure id="arch" steps={steps} caption="架构" overviewDescription="全部阶段">
          <Arch />
        </ProcessFigure>
      </Paper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "播放" }));
    fireEvent.click(screen.getByTestId("jump"));
    expect(screen.getByRole("button", { name: "播放" })).toBeTruthy();
    act(() => vi.advanceTimersByTime(2200));
    expect(screen.getByRole("button", { name: "(c) 前馈" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("外部先切了步骤：之后才进视口也不自动开播", () => {
    vi.useFakeTimers();
    const io = stubObserverDeferred();
    try {
      zh(
        <Paper>
          <FigRef to="arch" state="c" data-testid="jump" />
          <ProcessFigure id="arch" steps={steps} caption="架构" autoPlay>
            <Arch />
          </ProcessFigure>
        </Paper>,
      );
      fireEvent.click(screen.getByTestId("jump"));
      act(() => io.enter());
      act(() => vi.advanceTimersByTime(2200));
      expect(screen.getByRole("button", { name: "(c) 前馈" }).getAttribute("aria-pressed")).toBe("true");
      expect(screen.getByRole("button", { name: "播放" })).toBeTruthy();
    } finally {
      io.restore();
    }
  });

  it("打印形态：主图全部亮着，每一步展开一张分图，没有控件", () => {
    const { container } = renderProcess("print");
    expect(screen.queryByRole("group", { name: "步骤" })).toBeNull();
    const main = container.querySelector("[data-paper-figure-body]")!;
    expect(within(main as HTMLElement).getByTestId("part-a").getAttribute("data-phase")).toBe("all");
    const subs = container.querySelectorAll("[data-paper-subfigure]");
    expect([...subs].map((s) => s.textContent)).toEqual(["(a) 嵌入", "(b) 自注意力", "(c) 前馈"]);
    expect(subs[1].querySelector('[data-testid="part-bc"]')?.getAttribute("data-phase")).toBe("on");
  });

  it("loop：播到最后一步回到第一步继续", () => {
    vi.useFakeTimers();
    renderProcess(undefined, { loop: true });
    fireEvent.click(screen.getByRole("button", { name: "播放" }));
    const pressed = (name: string) =>
      screen.getByRole("button", { name }).getAttribute("aria-pressed");
    act(() => vi.advanceTimersByTime(2200));
    act(() => vi.advanceTimersByTime(2200));
    expect(pressed("(c) 前馈")).toBe("true");
    act(() => vi.advanceTimersByTime(2200));
    expect(pressed("(a) 嵌入")).toBe("true");
    // 还在播，不是停在第一步
    expect(screen.getByRole("button", { name: "暂停" })).toBeTruthy();
  });

  it("循环开关：默认关，点一下开着，再点关掉", () => {
    renderProcess();
    const loop = screen.getByRole("button", { name: "循环播放" });
    expect(loop.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(loop);
    expect(loop.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(loop);
    expect(loop.getAttribute("aria-pressed")).toBe("false");
  });

  it("倍速：按钮在档位间轮转，显示当前档", () => {
    renderProcess();
    expect(screen.getByRole("button", { name: "播放速度 1×" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /播放速度/ }));
    expect(screen.getByRole("button", { name: "播放速度 1.5×" })).toBeTruthy();
  });

  it("倍速：每步停留按档位缩放", () => {
    vi.useFakeTimers();
    renderProcess(undefined, { interval: 2000, defaultSpeed: 2 });
    fireEvent.click(screen.getByRole("button", { name: "播放" }));
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button", { name: "(b) 自注意力" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("speeds=[] 不渲染倍速按钮，按 interval 原速播", () => {
    renderProcess(undefined, { speeds: [] });
    expect(screen.queryByRole("button", { name: /播放速度/ })).toBeNull();
  });

  it("autoPlay：图进视口后自己开播，不用点按钮", () => {
    vi.useFakeTimers();
    const restore = stubObserver(true);
    try {
      renderProcess(undefined, { autoPlay: true });
      act(() => vi.advanceTimersByTime(2200));
      expect(screen.getByRole("button", { name: "(b) 自注意力" }).getAttribute("aria-pressed")).toBe("true");
    } finally {
      restore();
    }
  });

  it("autoPlay：读者手动暂停后滚回视口不抢回来", () => {
    vi.useFakeTimers();
    const restore = stubObserver(true);
    try {
      renderProcess(undefined, { autoPlay: true });
      fireEvent.click(screen.getByRole("button", { name: "暂停" }));
      act(() => vi.advanceTimersByTime(2200));
      expect(screen.getByRole("button", { name: "(a) 嵌入" }).getAttribute("aria-pressed")).toBe("true");
    } finally {
      restore();
    }
  });

  it("autoPlay：prefers-reduced-motion 下不自动播（按钮照常能播）", () => {
    vi.useFakeTimers();
    const restoreMotion = stubReducedMotion(true);
    const restore = stubObserver(true);
    try {
      renderProcess(undefined, { autoPlay: true });
      act(() => vi.advanceTimersByTime(2200));
      expect(screen.getByRole("button", { name: "(a) 嵌入" }).getAttribute("aria-pressed")).toBe("true");
      fireEvent.click(screen.getByRole("button", { name: "播放" }));
      act(() => vi.advanceTimersByTime(2200));
      expect(screen.getByRole("button", { name: "(b) 自注意力" }).getAttribute("aria-pressed")).toBe("true");
    } finally {
      restore();
      restoreMotion();
    }
  });
});

describe("PaperFigure 外壳", () => {
  it("hideCaption：整条图注都不渲染", () => {
    const { container } = zh(
      <Paper>
        <PaperFigure id="bare" states={{ one: 1 }} caption="一条曲线" hideCaption>
          {(v) => <span data-testid="value">{v}</span>}
        </PaperFigure>
      </Paper>,
    );
    expect(container.querySelector("figcaption")).toBeNull();
    expect(screen.getByTestId("value")).toBeTruthy();
  });

  it("hideDescription：留图注，去掉状态说明那一行", () => {
    zh(
      <Paper>
        <PaperFigure
          id="quiet"
          states={{ small: 1 }}
          caption="一条曲线"
          hideDescription
          describe={() => "k = 1"}
        >
          {(v) => <span data-testid="value">{v}</span>}
        </PaperFigure>
      </Paper>,
    );
    expect(screen.getByRole("figure").textContent).toContain("一条曲线");
    expect(screen.queryByText("k = 1")).toBeNull();
  });

  it("collapsibleControls：收起控件后只剩「显示控件」，展开能回来", () => {
    zh(
      <Paper>
        <PaperFigure
          id="foldable"
          states={{ small: 1 }}
          caption="一条曲线"
          collapsibleControls
          controls={() => <button type="button">加一</button>}
        >
          {(v) => <span data-testid="value">{v}</span>}
        </PaperFigure>
      </Paper>,
    );
    expect(screen.getByRole("button", { name: "加一" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "隐藏控件" }));
    // 收起后控件行不占位（display: none），但不卸载：播放器要接着走
    const row = document.querySelector("[data-paper-figure-controls]") as HTMLElement;
    expect(row.classList.contains("hidden")).toBe(true);
    expect(screen.queryByRole("button", { name: "加一" })).toBeNull();
    const show = screen.getByRole("button", { name: "显示控件" });
    expect(show.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(show);
    expect(screen.getByRole("button", { name: "加一" })).toBeTruthy();
    expect(row.classList.contains("hidden")).toBe(false);
  });

  it("collapsibleControls + defaultControlsCollapsed：初始就是收起的", () => {
    zh(
      <Paper>
        <PaperFigure
          id="collapsed"
          states={{ small: 1 }}
          caption="一条曲线"
          collapsibleControls
          defaultControlsCollapsed
          controls={() => <button type="button">加一</button>}
        >
          {(v) => <span data-testid="value">{v}</span>}
        </PaperFigure>
      </Paper>,
    );
    expect(screen.queryByRole("button", { name: "加一" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "显示控件" }));
    expect(screen.getByRole("button", { name: "加一" })).toBeTruthy();
  });
});

/** 让 IntersectionObserver 在 observe 时立刻回调一次，模拟「图已经在视口里」。 */
function stubObserver(intersecting: boolean) {
  const original = globalThis.IntersectionObserver;
  class FakeObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback(
        [{ isIntersecting: intersecting, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  return () => {
    globalThis.IntersectionObserver = original;
  };
}

/** 同上的桩，但把回调攒着，由测试决定「什么时候进视口」（要验外部先接管的情形）。 */
function stubObserverDeferred(intersecting = true) {
  const original = globalThis.IntersectionObserver;
  const pending: Array<() => void> = [];
  class FakeObserver {
    constructor(private readonly callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      pending.push(() =>
        this.callback(
          [{ isIntersecting: intersecting, target } as IntersectionObserverEntry],
          this as unknown as IntersectionObserver,
        ),
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  globalThis.IntersectionObserver = FakeObserver as unknown as typeof IntersectionObserver;
  return {
    enter: () => {
      for (const fire of pending.splice(0)) fire();
    },
    restore: () => {
      globalThis.IntersectionObserver = original;
    },
  };
}

/** jsdom 没有 matchMedia，这里只补「减弱动效」这一问的答案。 */
function stubReducedMotion(reduce: boolean) {
  const own = Object.getOwnPropertyDescriptor(window, "matchMedia");
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: reduce && query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  return () => {
    if (own) Object.defineProperty(window, "matchMedia", own);
    else delete (window as { matchMedia?: unknown }).matchMedia;
  };
}

describe("usePaperMode", () => {
  it("非受控 Paper 里可以切换形态", () => {
    function Toggle() {
      const [mode, setMode] = usePaperMode();
      return (
        <button type="button" onClick={() => setMode(mode === "read" ? "print" : "read")}>
          {mode}
        </button>
      );
    }
    const { container } = zh(
      <Paper>
        <Toggle />
      </Paper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "read" }));
    expect(container.querySelector("[data-paper]")?.getAttribute("data-mode")).toBe("print");
  });
});
