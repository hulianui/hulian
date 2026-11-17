import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../button";
import { PaperEquation } from "../math";
import { Paper, PaperFigure, PaperSection, usePaperNavigate } from ".";

const originalScrollIntoView = Element.prototype.scrollIntoView;

afterEach(() => {
  cleanup();
  Element.prototype.scrollIntoView = originalScrollIntoView;
  vi.restoreAllMocks();
});

function Buttons() {
  const navigate = usePaperNavigate();
  return (
    <>
      <Button onClick={() => navigate.figure("fig", "b")}>figure</Button>
      <Button onClick={() => navigate.equation("eq")}>equation</Button>
      <Button onClick={() => navigate.section("sec")}>section</Button>
    </>
  );
}

function Doc() {
  return (
    <Paper>
      <Buttons />
      <PaperFigure id="fig" states={{ a: 1, b: 2 }} caption="c">
        {(state) => <span data-testid="fig-state">{state}</span>}
      </PaperFigure>
      <PaperEquation id="eq">{"a=b"}</PaperEquation>
      <PaperSection id="sec" title="Section">
        <p>body</p>
      </PaperSection>
    </Paper>
  );
}

describe("usePaperNavigate", () => {
  it("从真按钮跳到图并切预设，不需要把引用嵌进按钮、也不继承链接样式", () => {
    render(<Doc />);
    const button = screen.getByRole("button", { name: "figure" });
    expect(button.tagName).toBe("BUTTON");
    expect(button.classList.contains("underline")).toBe(false);

    fireEvent.click(button);
    expect(screen.getByTestId("fig-state").textContent).toBe("2");
    expect(document.getElementById("fig")!.getAttribute("data-state")).toBe("b");
    expect(document.getElementById("fig")!.hasAttribute("data-highlight")).toBe(true);
  });

  it("跳到公式和章节：滚动并描边目标，章节描边标题而不是整节", () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    render(<Doc />);
    // jsdom 没有布局：放到视野下方才会触发滚动。
    vi.spyOn(document.getElementById("eq")!, "getBoundingClientRect").mockReturnValue({
      top: 5000,
      bottom: 5040,
      height: 40,
      left: 0,
      right: 0,
      width: 0,
      x: 0,
      y: 5000,
      toJSON() {},
    } as DOMRect);

    fireEvent.click(screen.getByRole("button", { name: "equation" }));
    expect(document.getElementById("eq")!.hasAttribute("data-highlight")).toBe(true);
    expect(scroll).toHaveBeenCalled();

    const section = document.getElementById("sec")!;
    const title = section.querySelector("[data-paper-section-title]")!;
    fireEvent.click(screen.getByRole("button", { name: "section" }));
    expect(title.hasAttribute("data-highlight")).toBe(true);
    expect(section.hasAttribute("data-highlight")).toBe(false);
  });

  it("目标不存在或不在 Paper 里：开发环境告警一次，不抛错", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Paper>
        <MissingProbe />
      </Paper>,
    );
    fireEvent.click(screen.getByRole("button", { name: "missing" }));
    const calls = warn.mock.calls.filter(([message]) => String(message).includes('找不到 id 为 "missing-a"'));
    expect(calls).toHaveLength(1);

    render(<Outside />);
    fireEvent.click(screen.getByRole("button", { name: "outside" }));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("必须在 Paper 里使用"));
  });
});

// 同一个组件里连点两次，警告去重只打一条。
function MissingProbe() {
  const navigate = usePaperNavigate();
  return (
    <Button
      onClick={() => {
        navigate.figure("missing-a");
        navigate.figure("missing-a");
      }}
    >
      missing
    </Button>
  );
}

function Outside() {
  const navigate = usePaperNavigate();
  return <Button onClick={() => navigate.figure("nowhere")}>outside</Button>;
}
