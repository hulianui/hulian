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
  const renderProcess = (mode?: PaperMode) =>
    zh(
      <Paper mode={mode}>
        <ProcessFigure id="arch" steps={steps} caption="架构" overviewDescription="全部阶段">
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

  it("打印形态：主图全部亮着，每一步展开一张分图，没有控件", () => {
    const { container } = renderProcess("print");
    expect(screen.queryByRole("group", { name: "步骤" })).toBeNull();
    const main = container.querySelector("[data-paper-figure-body]")!;
    expect(within(main as HTMLElement).getByTestId("part-a").getAttribute("data-phase")).toBe("all");
    const subs = container.querySelectorAll("[data-paper-subfigure]");
    expect([...subs].map((s) => s.textContent)).toEqual(["(a) 嵌入", "(b) 自注意力", "(c) 前馈"]);
    expect(subs[1].querySelector('[data-testid="part-bc"]')?.getAttribute("data-phase")).toBe("on");
  });
});

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
