import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { Paper, PaperFigure, PaperPresenter } from ".";

/**
 * 字体与主题岛只能在真实浏览器里验：要的是 CSS 变量经过层叠后的计算值，jsdom 不解析 var()。
 */

afterEach(cleanup);

function Fixture({ wrapperStyle, theme }: { wrapperStyle?: React.CSSProperties; theme?: "dark" | "light" }) {
  return (
    <div style={wrapperStyle} data-theme={theme} data-testid="island">
      <Paper>
        <PaperPresenter trigger={<button type="button">演示</button>} />
        <PaperFigure id="k" states={{ a: 1, b: 2 }} caption="参数">
          {(v) => <svg viewBox="0 0 10 10" aria-label={`k=${v}`} />}
        </PaperFigure>
      </Paper>
    </div>
  );
}

async function openPresenter() {
  await act(async () => {
    screen.getByRole("button", { name: "演示" }).click();
  });
  const popup = document.querySelector<HTMLElement>("[data-paper-presenter]");
  expect(popup).not.toBeNull();
  return popup!;
}

describe("PaperPresenter 字体", () => {
  it("Paper 外层设的 --paper-font 能传到挂在 body 下的演示层", async () => {
    render(<Fixture wrapperStyle={{ "--paper-font": '"Courier New", monospace' } as React.CSSProperties} />);
    const popup = await openPresenter();
    expect(popup.parentElement?.closest("[data-paper]")).toBeNull();
    expect(getComputedStyle(popup).fontFamily).toContain("Courier New");
  });

  it("不覆盖时沿用默认衬线栈", async () => {
    render(<Fixture />);
    const popup = await openPresenter();
    expect(getComputedStyle(popup).fontFamily).toContain("STIX Two Text");
  });

  it("中文与兜底回落到 tokens 的 --hl-font-serif，改它 Paper 跟着变", async () => {
    render(<Fixture wrapperStyle={{ "--hl-font-serif": '"Noto Serif SC", serif' } as React.CSSProperties} />);
    const font = getComputedStyle(document.querySelector<HTMLElement>("[data-paper]")!).fontFamily;
    expect(font).toMatch(/^"STIX Two Text", "Times New Roman", "Noto Serif SC", serif$/);
  });
});

describe("PaperPresenter 主题岛", () => {
  const bg = (el: Element) => getComputedStyle(el).backgroundColor;

  it("Paper 在暗色岛里，演示层也是暗色；演示中切换岛的主题跟着变", async () => {
    render(<Fixture theme="dark" />);
    const popup = await openPresenter();
    expect(popup.getAttribute("data-theme")).toBe("dark");
    const dark = bg(popup);

    await act(async () => {
      screen.getByTestId("island").setAttribute("data-theme", "light");
    });
    await expect.poll(() => popup.getAttribute("data-theme")).toBe("light");
    expect(bg(popup)).not.toBe(dark);
  });

  it("没有主题岛时不标 data-theme，跟随全局", async () => {
    render(<Fixture />);
    const popup = await openPresenter();
    expect(popup.hasAttribute("data-theme")).toBe(false);
  });
});
