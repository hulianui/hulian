import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Kbd } from "./kbd";

describe("Kbd", () => {
  it("渲染 kbd 标签 + 内容", () => {
    const { getByText } = render(<Kbd>K</Kbd>);
    expect(getByText("K").tagName).toBe("KBD");
  });

  it("皮肤含 font-mono + border", () => {
    const { getByText } = render(<Kbd>K</Kbd>);
    const el = getByText("K");
    expect(el.className).toContain("font-mono");
    expect(el.className).toContain("border");
  });

  it("透传 className", () => {
    const { getByText } = render(<Kbd className="my-kbd">K</Kbd>);
    expect(getByText("K").classList.contains("my-kbd")).toBe(true);
  });

  it("组合键：并排多个 Kbd 各自渲 kbd 标签", () => {
    const { getByText } = render(
      <span>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>,
    );
    expect(getByText("⌘").tagName).toBe("KBD");
    expect(getByText("K").tagName).toBe("KBD");
  });
});
