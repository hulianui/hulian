import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WindowFrame } from "./window-frame";

describe("WindowFrame", () => {
  it("三色点装饰 aria-hidden，字符串标题按等宽小字渲染", () => {
    const { container, getByText } = render(<WindowFrame title="components">内容</WindowFrame>);
    expect(container.querySelectorAll("[aria-hidden]")).toHaveLength(3);
    expect(getByText("components").className).toContain("font-mono");
    expect(getByText("内容")).toBeTruthy();
  });

  it("节点标题原样渲染（不套等宽样式），toolbar 靠右", () => {
    const { getByTestId } = render(
      <WindowFrame title={<b data-testid="t">MCP</b>} toolbar={<i data-testid="tb" />} />,
    );
    expect(getByTestId("t").parentElement!.className).not.toContain("font-mono");
    expect(getByTestId("tb").parentElement!.className).toContain("ml-auto");
  });

  it("className / 其余属性落在外框", () => {
    const { container } = render(<WindowFrame className="h-80" aria-label="预览" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("h-80");
    expect(el.getAttribute("aria-label")).toBe("预览");
  });
});
