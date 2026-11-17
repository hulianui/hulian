import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";
import { EqRef, Paper } from ".";
import { PaperEquation } from "../math";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function Doc({ third }: { third?: React.ReactNode }) {
  return (
    <Paper>
      <p>
        <EqRef to="e1" /> <EqRef to="e2" /> <EqRef to="tagged" /> <EqRef to="e3" />
      </p>
      <PaperEquation id="e1">{"a=b"}</PaperEquation>
      <PaperEquation id="tagged" number="A.1">{"c=d"}</PaperEquation>
      <PaperEquation>{"x=y"}</PaperEquation>
      <PaperEquation id="star" number={null}>{"u=v"}</PaperEquation>
      <PaperEquation id="e2">{"e=f"}</PaperEquation>
      <PaperEquation id="e3" number={third}>{"g=h"}</PaperEquation>
    </Paper>
  );
}

const refs = () => [...document.querySelectorAll("[data-eq-ref]")].map((a) => a.textContent);

describe("PaperEquation 自动编号", () => {
  it("服务端渲染就带计数器：自动编号的公式占号，手写和不编号的不占", () => {
    const html = renderToString(<Doc />);
    const doc = new DOMParser().parseFromString(html, "text/html");
    const root = doc.querySelector("[data-paper]")!;
    expect(root.className).toMatch(/\[counter-reset:[^\]]*paper-equation/);
    const eqs = [...doc.querySelectorAll("[data-paper-equation]")];
    const counted = eqs.map((el) => el.className.includes("[counter-increment:paper-equation]"));
    expect(counted).toEqual([true, false, true, false, true, true]);
    expect(eqs[0].querySelector('[data-paper-equation-number="auto"] .before\\:content-\\[counter\\(paper-equation\\)\\]')).not.toBeNull();
    expect(eqs[1].querySelector("[data-paper-equation-number]")!.textContent).toBe("(A.1)");
    expect(eqs[3].querySelector("[data-paper-equation-number]")).toBeNull();
  });

  it("在 Paper 外不传 number 时不编号（与之前一致）", () => {
    render(<PaperEquation>{"a=b"}</PaperEquation>);
    const eq = document.querySelector("[data-paper-equation]")!;
    expect(eq.querySelector("[data-paper-equation-number]")).toBeNull();
    expect(eq.className).not.toContain("counter-increment");
  });
});

describe("EqRef", () => {
  it("按文档顺序取号，与计数器一致；手写覆盖原样显示", () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    // e1 → 1；无 id 的那条占 2；e2 → 3；e3 → 4。
    expect(refs()).toEqual(["公式 (1)", "公式 (3)", "公式 (A.1)", "公式 (4)"]);
  });

  it("英文界面是 Eq. (N)；Paper 的 labels.equation 优先", () => {
    render(
      <ConfigProvider locale={enUS}>
        <Doc />
      </ConfigProvider>,
    );
    expect(refs()[0]).toBe("Eq. (1)");
    cleanup();
    render(
      <ConfigProvider locale={zhCN}>
        <Paper labels={{ equation: "Equation" }}>
          <EqRef to="e1" />
          <PaperEquation id="e1">{"a=b"}</PaperEquation>
        </Paper>
      </ConfigProvider>,
    );
    expect(refs()).toEqual(["Equation (1)"]);
  });

  it("编号方式变化、公式增删后重新取号", () => {
    function Live() {
      const [extra, setExtra] = useState(false);
      return (
        <Paper>
          <button type="button" onClick={() => setExtra(true)}>加一条</button>
          <EqRef to="last" />
          {extra ? <PaperEquation>{"z=0"}</PaperEquation> : null}
          <PaperEquation id="last">{"a=b"}</PaperEquation>
        </Paper>
      );
    }
    render(
      <ConfigProvider locale={zhCN}>
        <Live />
      </ConfigProvider>,
    );
    expect(refs()).toEqual(["公式 (1)"]);
    fireEvent.click(screen.getByRole("button", { name: "加一条" }));
    expect(refs()).toEqual(["公式 (2)"]);
  });

  it("把公式改成手写编号后引用跟着变", () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    expect(refs()[3]).toBe("公式 (4)");
    rerender(
      <ConfigProvider locale={zhCN}>
        <Doc third="★" />
      </ConfigProvider>,
    );
    expect(refs()[3]).toBe("公式 (★)");
  });

  it("点击：阻止默认跳转、滚到公式、描边约 1.2 秒", () => {
    vi.useFakeTimers();
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(
      <ConfigProvider locale={zhCN}>
        <Doc />
      </ConfigProvider>,
    );
    const link = document.querySelector<HTMLAnchorElement>('[data-eq-ref][href="#e2"]')!;
    // jsdom 没有布局：把公式放到视野下方，才会触发滚动。
    vi.spyOn(document.getElementById("e2")!, "getBoundingClientRect").mockReturnValue(
      { top: 5000, bottom: 5040, height: 40, left: 0, right: 0, width: 0, x: 0, y: 5000, toJSON() {} } as DOMRect,
    );
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(link, event);
    expect(event.defaultPrevented).toBe(true);
    const eq = document.getElementById("e2")!;
    expect(eq.hasAttribute("data-highlight")).toBe(true);
    expect(scroll).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1300);
    });
    expect(eq.hasAttribute("data-highlight")).toBe(false);
  });

  it("找不到公式、引用不编号的公式时告警；在 Paper 外是普通锚点", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <ConfigProvider locale={zhCN}>
        <Paper>
          <EqRef to="nope-eq" />
          <EqRef to="star-eq" />
          <PaperEquation id="star-eq" number={false}>{"u=v"}</PaperEquation>
        </Paper>
      </ConfigProvider>,
    );
    expect(refs()).toEqual(["公式", "公式"]);
    fireEvent.click(document.querySelector('[href="#nope-eq"]')!);
    expect(warn.mock.calls.some(([m]) => String(m).includes('找不到 id 为 "nope-eq"'))).toBe(true);
    expect(warn.mock.calls.some(([m]) => String(m).includes('公式 "star-eq" 没有编号'))).toBe(true);
    warn.mockRestore();
    cleanup();

    render(<EqRef to="x">Eq. 1</EqRef>);
    const a = screen.getByText("Eq. 1");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    fireEvent(a, event);
    expect(event.defaultPrevented).toBe(false);
    expect(a.getAttribute("href")).toBe("#x");
  });

  it("打印形态下去掉链接色", () => {
    render(
      <Paper mode="print">
        <EqRef to="e" />
        <PaperEquation id="e">{"a"}</PaperEquation>
      </Paper>,
    );
    expect(document.querySelector("[data-eq-ref]")!.className).toContain("text-inherit");
  });
});
