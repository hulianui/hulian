import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { zhCN } from "../config/locale";
import { Paper, PaperFigure, usePaperTerm } from ".";
import { PaperEquation } from "../math";
import type { PaperMode } from ".";

afterEach(cleanup);

interface S {
  dk: number;
  scaled: boolean;
}

const STATES: Record<string, S> = { small: { dk: 4, scaled: true }, big: { dk: 512, scaled: false } };

function Toggle({ fig }: { fig: { state: S; setState: (s: S) => void } }) {
  const term = usePaperTerm("dk");
  return (
    <button type="button" {...term.bind} onClick={() => fig.setState({ ...fig.state, scaled: !fig.state.scaled })}>
      缩放
    </button>
  );
}

const LATEX = String.raw`\frac{QK^T}{\term{dk}{\sqrt{d_k}}} + \term{v}{V}`;

function Demo({ mode, dkState }: { mode?: PaperMode; dkState?: string | ((s: unknown) => unknown) }) {
  return (
    <ConfigProvider locale={zhCN}>
      <Paper mode={mode}>
        <PaperEquation
          number={1}
          terms={{
            dk: {
              label: "√d_k：切换缩放",
              figure: "attn",
              state: dkState ?? ((s) => ({ ...(s as S), scaled: !(s as S).scaled })),
            },
            v: { label: "V" },
          }}
        >
          {LATEX}
        </PaperEquation>
        <PaperFigure<S>
          id="attn"
          states={STATES}
          caption="注意力"
          controls={(fig) => <Toggle fig={fig} />}
        >
          {(s) => <span data-testid="value">{`${s.dk}:${s.scaled ? "scaled" : "raw"}`}</span>}
        </PaperFigure>
      </Paper>
    </ConfigProvider>
  );
}

const span = (name: string) => document.querySelector<HTMLElement>(`[data-paper-equation] [data-paper-term="${name}"]:not(button)`)!;

describe("PaperEquation", () => {
  it("\\term 标出的项带 data-paper-term，叠一个有名字的按钮；编号在右侧", () => {
    render(<Demo />);
    expect(span("dk")).toBeTruthy();
    expect(span("dk").closest(".katex-html")?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("button", { name: "√d_k：切换缩放" })).toBeTruthy();
    // 没配 figure 的项只做高亮，不是按钮。
    expect(screen.queryByRole("button", { name: "V" })).toBeNull();
    expect(document.querySelector("[data-paper-equation-number]")?.textContent).toBe("(1)");
  });

  it("点击项：state 是函数时由图的当前状态算出新状态", () => {
    render(<Demo />);
    expect(screen.getByTestId("value").textContent).toBe("4:scaled");
    fireEvent.click(screen.getByRole("button", { name: "√d_k：切换缩放" }));
    expect(screen.getByTestId("value").textContent).toBe("4:raw");
    fireEvent.click(screen.getByRole("button", { name: "√d_k：切换缩放" }));
    expect(screen.getByTestId("value").textContent).toBe("4:scaled");
  });

  it("点击项：state 是预设名时切到那个预设", () => {
    render(<Demo dkState="big" />);
    fireEvent.click(screen.getByRole("button", { name: "√d_k：切换缩放" }));
    expect(screen.getByTestId("value").textContent).toBe("512:raw");
    expect(document.getElementById("attn")?.getAttribute("data-state")).toBe("big");
  });

  it("双向高亮：悬停 / 聚焦公式项 → 控件 data-active；悬停 / 聚焦控件 → 公式项 data-active", () => {
    render(<Demo />);
    const termButton = screen.getByRole("button", { name: "√d_k：切换缩放" });
    const control = screen.getByRole("button", { name: "缩放" });

    fireEvent.pointerEnter(termButton);
    expect(control.hasAttribute("data-active")).toBe(true);
    expect(span("dk").hasAttribute("data-active")).toBe(true);
    fireEvent.pointerLeave(termButton);
    expect(control.hasAttribute("data-active")).toBe(false);
    expect(span("dk").hasAttribute("data-active")).toBe(false);

    fireEvent.focus(control);
    expect(span("dk").hasAttribute("data-active")).toBe(true);
    expect(span("v").hasAttribute("data-active")).toBe(false);
    fireEvent.blur(control);
    expect(span("dk").hasAttribute("data-active")).toBe(false);
  });

  it("打印形态下不叠按钮、不高亮", () => {
    render(<Demo mode="print" />);
    expect(screen.queryByRole("button", { name: "√d_k：切换缩放" })).toBeNull();
    expect(span("dk")).toBeTruthy();
    expect(document.querySelector("[data-paper-equation]")?.getAttribute("data-mode")).toBe("print");
  });

  it("trust 只放行 \\term：\\href、\\htmlClass、其他 \\htmlData 照旧拒绝", () => {
    render(
      <Paper>
        <PaperEquation>{String.raw`\href{javascript:alert(1)}{a} + \htmlClass{evil}{b} + \htmlData{foo=bar}{c} + \term{x" onclick="y}{d}`}</PaperEquation>
      </Paper>,
    );
    const root = document.querySelector("[data-paper-equation]")!;
    expect(root.querySelector("a")).toBeNull();
    expect(root.querySelector(".evil")).toBeNull();
    expect(root.querySelector("[data-foo]")).toBeNull();
    expect(root.querySelector("[onclick]")).toBeNull();
  });

  it("公式里写了 terms 没配的项，开发期告警", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Paper>
        <PaperEquation>{String.raw`\term{lonely}{x}`}</PaperEquation>
      </Paper>,
    );
    expect(warn.mock.calls.some((c) => String(c[0]).includes("lonely"))).toBe(true);
    warn.mockRestore();
  });

  it("在 Paper 外也能渲染公式，usePaperTerm 恒为 inactive", () => {
    function Lone() {
      const t = usePaperTerm("dk");
      return <span data-testid="lone" data-active={t.active ? "" : undefined} />;
    }
    render(
      <>
        <PaperEquation terms={{ dk: { label: "d", figure: "nope" } }}>{LATEX}</PaperEquation>
        <Lone />
      </>,
    );
    fireEvent.pointerEnter(screen.getByRole("button", { name: "d" }));
    expect(screen.getByTestId("lone").hasAttribute("data-active")).toBe(false);
  });
});
