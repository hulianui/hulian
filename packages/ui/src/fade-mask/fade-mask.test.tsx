import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FadeMask } from "./fade-mask";

const mask = (el: Element) => {
  const s = (el as HTMLElement).style;
  return s.maskImage || s.webkitMaskImage;
};

describe("FadeMask", () => {
  it("默认向下淡出，从 60% 开始", () => {
    const { container } = render(<FadeMask>x</FadeMask>);
    const m = mask(container.firstElementChild!);
    expect(m).toContain("linear-gradient(to bottom");
    expect(m).toContain("black 60%");
  });

  it("direction + start 落到线性渐变", () => {
    const { container } = render(<FadeMask direction="right" start="80%" />);
    expect(mask(container.firstElementChild!)).toContain("to right, black 80%");
  });

  it("radial 用 at / size 定中心与范围", () => {
    const { container } = render(<FadeMask direction="radial" at="30% 10%" size="40% 50%" />);
    expect(mask(container.firstElementChild!)).toContain("radial-gradient(40% 50% at 30% 10%");
  });

  it("className / style / 子内容透传", () => {
    const { container, getByText } = render(
      <FadeMask className="absolute inset-0" style={{ zIndex: 2 }}>
        内容
      </FadeMask>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("absolute");
    expect(el.style.zIndex).toBe("2");
    expect(getByText("内容")).toBeTruthy();
  });
});
