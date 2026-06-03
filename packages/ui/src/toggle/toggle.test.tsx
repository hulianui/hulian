import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Toggle, ToggleGroup } from "./toggle";

describe("Toggle", () => {
  it("渲染 button，默认未按下 aria-pressed=false", () => {
    const { getByRole } = render(<Toggle aria-label="bold">B</Toggle>);
    const btn = getByRole("button");
    expect(btn.tagName).toBe("BUTTON");
    expect(btn.getAttribute("aria-pressed")).toBe("false");
  });

  it("defaultPressed → aria-pressed=true + data-pressed", () => {
    const { getByRole } = render(
      <Toggle defaultPressed aria-label="bold">
        B
      </Toggle>,
    );
    const btn = getByRole("button");
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.hasAttribute("data-pressed")).toBe(true);
  });

  it("点击切换 pressed，回调收敛为 (boolean)", () => {
    let v: boolean | undefined;
    const { getByRole } = render(<Toggle onPressedChange={(p) => (v = p)} aria-label="x" />);
    fireEvent.click(getByRole("button"));
    expect(v).toBe(true);
  });

  it("disabled 透传到 button", () => {
    const { getByRole } = render(<Toggle disabled aria-label="x" />);
    expect((getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("variant=outline 带 border 皮肤类", () => {
    const { getByRole } = render(<Toggle variant="outline" aria-label="x" />);
    expect(getByRole("button").className).toContain("border");
  });
});

describe("ToggleGroup", () => {
  it("渲染容器 + 内含 toggle 按钮", () => {
    const { getAllByRole } = render(
      <ToggleGroup defaultValue={["b"]}>
        <Toggle value="b" aria-label="b">
          B
        </Toggle>
        <Toggle value="i" aria-label="i">
          I
        </Toggle>
      </ToggleGroup>,
    );
    expect(getAllByRole("button").length).toBe(2);
  });

  it("single（默认）：选中项 aria-pressed=true，其余 false", () => {
    const { getByLabelText } = render(
      <ToggleGroup defaultValue={["b"]}>
        <Toggle value="b" aria-label="b" />
        <Toggle value="i" aria-label="i" />
      </ToggleGroup>,
    );
    expect(getByLabelText("b").getAttribute("aria-pressed")).toBe("true");
    expect(getByLabelText("i").getAttribute("aria-pressed")).toBe("false");
  });

  it("multiple：两项可同时按下", () => {
    const { getByLabelText } = render(
      <ToggleGroup multiple defaultValue={["b", "i"]}>
        <Toggle value="b" aria-label="b" />
        <Toggle value="i" aria-label="i" />
      </ToggleGroup>,
    );
    expect(getByLabelText("b").getAttribute("aria-pressed")).toBe("true");
    expect(getByLabelText("i").getAttribute("aria-pressed")).toBe("true");
  });

  it("onValueChange 收敛为 string[]", () => {
    let v: string[] | undefined;
    const { getByLabelText } = render(
      <ToggleGroup onValueChange={(x) => (v = x)}>
        <Toggle value="b" aria-label="b" />
      </ToggleGroup>,
    );
    fireEvent.click(getByLabelText("b"));
    expect(v).toEqual(["b"]);
  });
});
