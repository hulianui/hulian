import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from "./combobox";

afterEach(cleanup);

const FRUITS = [
  { value: "apple", label: "苹果 Apple" },
  { value: "banana", label: "香蕉 Banana" },
  { value: "cherry", label: "樱桃 Cherry" },
];

function Demo(props: { defaultOpen?: boolean; invalid?: boolean; defaultValue?: (typeof FRUITS)[number] }) {
  return (
    <Combobox items={FRUITS} defaultOpen={props.defaultOpen} defaultValue={props.defaultValue}>
      <ComboboxInput placeholder="搜索水果…" invalid={props.invalid} clearable />
      <ComboboxContent>
        {(item) => (
          <ComboboxItem key={item.value} value={item} disabled={item.value === "cherry"}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("渲染输入框 + placeholder", () => {
    render(<Demo />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.tagName).toBe("INPUT");
  });

  it("默认闭合：未展开时选项不在 DOM", () => {
    render(<Demo />);
    expect(screen.queryByText("苹果 Apple")).toBeNull();
  });

  it("defaultOpen 展开后渲染全部候选项", () => {
    render(<Demo defaultOpen />);
    expect(screen.getByText("苹果 Apple")).toBeTruthy();
    expect(screen.getByText("香蕉 Banana")).toBeTruthy();
    expect(screen.getByText("樱桃 Cherry")).toBeTruthy();
  });

  it("disabled item 落 data-disabled + 皮肤钩子类齐备", () => {
    render(<Demo defaultOpen />);
    const cherry = screen.getByText("樱桃 Cherry").closest("[role='option']") as HTMLElement;
    expect(cherry).toBeTruthy();
    expect(cherry.getAttribute("data-disabled")).not.toBeNull();
    expect(cherry.className).toContain("data-[highlighted]:bg-muted/15");
  });

  it("invalid → input 落 data-invalid/aria-invalid，外壳 has-[[data-invalid]] 钩子", () => {
    render(<Demo invalid />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.getAttribute("data-invalid")).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const shell = input.parentElement as HTMLElement;
    expect(shell.className).toContain("has-[[data-invalid]]:border-danger");
  });

  it("defaultValue → input 显示对应 label", () => {
    render(<Demo defaultValue={FRUITS[1]} />);
    const input = screen.getByDisplayValue("香蕉 Banana");
    expect(input).toBeTruthy();
  });
});
