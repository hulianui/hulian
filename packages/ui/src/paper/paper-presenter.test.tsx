import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { ConfigProvider } from "../config/config-provider";
import { zhCN } from "../config/locale";
import { FigureStep, Paper, PaperFigure, PaperPresenter, ProcessFigure } from ".";
import type { PaperPresenterProps } from ".";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const steps = [
  { key: "a", label: "嵌入", description: "第一步" },
  { key: "b", label: "注意力", description: "第二步" },
];

function Demo(props: Partial<PaperPresenterProps> & { scale?: number }) {
  const { scale = 1, ...presenter } = props;
  return (
    <ConfigProvider locale={zhCN}>
      <Paper>
        <PaperPresenter trigger={<button type="button">演示</button>} title="论文题目" {...presenter} />
        <ProcessFigure id="arch" steps={steps} caption="架构">
          <svg>
            <FigureStep at="a" data-testid="part-a" />
            <FigureStep at="b" data-testid="part-b" />
          </svg>
        </ProcessFigure>
        <PaperFigure
          id="curve"
          states={{ small: 1, big: 8 }}
          caption="曲线"
          describe={(v) => `k = ${v * scale}`}
          controls={(f) => (
            <button type="button" onClick={() => f.setState(f.state + 1)}>
              加一
            </button>
          )}
        >
          {(v) => <span data-testid="value">{v * scale}</span>}
        </PaperFigure>
      </Paper>
    </ConfigProvider>
  );
}

function open() {
  fireEvent.click(screen.getByRole("button", { name: "演示" }));
  return screen.getByRole("dialog", { name: "演示模式" });
}

const counter = (dialog: HTMLElement) =>
  dialog.querySelector("[data-paper-presenter-counter]")?.textContent;
const shown = (dialog: HTMLElement) => dialog.querySelector("[data-paper-presenter-figure]");

describe("PaperPresenter", () => {
  it("默认按文档顺序串起每张图的全部预设：流程图各步 + 全部，参数图各预设", () => {
    render(<Demo />);
    const dialog = open();
    // 模态：Base UI 把演示层之外的内容标成 inert / aria-hidden，读屏取不到正文里的东西。
    expect(screen.queryByRole("button", { name: "演示" })).toBeNull();
    expect(counter(dialog)).toBe("1 / 5");
    expect(shown(dialog)?.getAttribute("data-paper-presenter-figure")).toBe("arch");
    expect(shown(dialog)?.getAttribute("data-state")).toBe("a");
    expect(dialog.querySelector("header")?.textContent).toContain("图 1");

    const next = within(dialog).getByRole("button", { name: /下一页/ });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(shown(dialog)?.getAttribute("data-state")).toBe("all");
    fireEvent.click(next);
    expect(shown(dialog)?.getAttribute("data-paper-presenter-figure")).toBe("curve");
    expect(within(dialog).getByTestId("value").textContent).toBe("1");
    fireEvent.click(next);
    expect(counter(dialog)).toBe("5 / 5");
    expect((next as HTMLButtonElement).disabled).toBe(true);
  });

  it("复用图的渲染函数：演示里的部件阶段跟着页走，正文里的图状态不变", () => {
    render(<Demo />);
    const dialog = open();
    fireEvent.click(within(dialog).getByRole("button", { name: /下一页/ }));
    // 演示层里 b 亮，a 已讲过。
    expect(within(dialog).getByTestId("part-b").getAttribute("data-phase")).toBe("on");
    expect(within(dialog).getByTestId("part-a").getAttribute("data-phase")).toBe("done");
    // 正文里的图（不在 dialog 里）仍停在 a。
    const inPaper = screen.getAllByTestId("part-a").find((el) => !dialog.contains(el));
    expect(inPaper?.getAttribute("data-phase")).toBe("on");
  });

  it("方向键、空格、PageUp/PageDown 翻页；在输入框里按方向键不翻", () => {
    render(<Demo />);
    const dialog = open();
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(counter(dialog)).toBe("2 / 5");
    fireEvent.keyDown(dialog, { key: "PageDown" });
    fireEvent.keyDown(dialog, { key: " " });
    expect(counter(dialog)).toBe("4 / 5");
    fireEvent.keyDown(dialog, { key: "PageUp" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(counter(dialog)).toBe("2 / 5");
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(counter(dialog)).toBe("1 / 5");

    const input = document.createElement("input");
    dialog.appendChild(input);
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(counter(dialog)).toBe("1 / 5");
  });

  it("图的控件在演示里可用：步骤按钮翻到对应页，setState 只覆盖当前页", () => {
    render(<Demo />);
    const dialog = open();
    // ProcessFigure 的步骤按钮 (b) 就是翻到 b 那一页。
    fireEvent.click(within(dialog).getByRole("button", { name: "(b) 注意力" }));
    expect(counter(dialog)).toBe("2 / 5");

    for (let i = 0; i < 2; i++) fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(shown(dialog)?.getAttribute("data-paper-presenter-figure")).toBe("curve");
    fireEvent.click(within(dialog).getByRole("button", { name: "加一" }));
    expect(within(dialog).getByTestId("value").textContent).toBe("2");
    expect(within(dialog).getByText("k = 2")).toBeTruthy();
    // 正文里的图不受影响。
    const inPaper = screen.getAllByTestId("value").find((el) => !dialog.contains(el));
    expect(inPaper?.textContent).toBe("1");
    // 翻页即还原。
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByTestId("value").textContent).toBe("1");
  });

  it("slides 可以改写顺序，不存在的图或预设跳过并告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Demo
        slides={[
          { figure: "curve", state: "big" },
          { figure: "nope", state: "x" },
          { figure: "arch", state: "zzz" },
          { figure: "arch", state: "b" },
        ]}
      />,
    );
    const dialog = open();
    expect(counter(dialog)).toBe("1 / 2");
    expect(within(dialog).getByTestId("value").textContent).toBe("8");
    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(shown(dialog)?.getAttribute("data-state")).toBe("b");
    // 图号仍按文档顺序，不按 slides 顺序。
    expect(dialog.querySelector("header")?.textContent).toContain("图 1");
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it("presentStates 选定一张图演示哪些预设，[] 表示跳过", () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Paper>
          <PaperPresenter trigger={<button type="button">演示</button>} />
          <ProcessFigure id="arch" steps={steps} caption="架构" presentStates={["b"]}>
            <svg />
          </ProcessFigure>
          <PaperFigure id="skip" states={{ x: 1 }} caption="跳过" presentStates={[]}>
            {(v) => <span>{v}</span>}
          </PaperFigure>
        </Paper>
      </ConfigProvider>,
    );
    const dialog = open();
    expect(counter(dialog)).toBe("1 / 1");
    expect(shown(dialog)?.getAttribute("data-state")).toBe("b");
  });

  it("图的 props 变了，演示里跟着重画", () => {
    function Live() {
      const [scale, setScale] = useState(1);
      return (
        <>
          <button type="button" onClick={() => setScale(10)}>
            放大
          </button>
          <Demo scale={scale} slides={[{ figure: "curve", state: "big" }]} />
        </>
      );
    }
    render(<Live />);
    const dialog = open();
    expect(within(dialog).getByTestId("value").textContent).toBe("8");
    // 演示层是模态的，这里直接在外面触发重渲染。
    act(() => {
      (screen.getAllByRole("button", { hidden: true }).find((b) => b.textContent === "放大") as HTMLButtonElement).click();
    });
    expect(within(dialog).getByTestId("value").textContent).toBe("80");
  });

  it("受控 open，没有可演示的图时显示提示；Esc / 退出按钮关闭", () => {
    const onOpenChange = vi.fn();
    const onSlideChange = vi.fn();
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Paper>
          <PaperPresenter open onOpenChange={onOpenChange} onSlideChange={onSlideChange} />
        </Paper>
      </ConfigProvider>,
    );
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("这篇论文里还没有可演示的图。")).toBeTruthy();
    fireEvent.click(within(dialog).getByRole("button", { name: "退出" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(onSlideChange).not.toHaveBeenCalled();
    rerender(
      <ConfigProvider locale={zhCN}>
        <Paper>
          <PaperPresenter open onOpenChange={onOpenChange} onSlideChange={onSlideChange} />
          <PaperFigure id="one" states={{ x: 1 }} caption="一">
            {(v) => <span>{v}</span>}
          </PaperFigure>
        </Paper>
      </ConfigProvider>,
    );
    expect(onSlideChange).toHaveBeenLastCalledWith({ figure: "one", state: "x" }, 0);
  });

  it("退出后焦点回到触发按钮，演示层关闭", async () => {
    render(<Demo />);
    const trigger = screen.getByRole("button", { name: "演示" });
    trigger.focus();
    const dialog = open();
    fireEvent.keyDown(dialog, { key: "Escape" });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});
