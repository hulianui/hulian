import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxItem } from "./combobox";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

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

  it("大数据集只挂载可视窗口，过滤后仍能找到远端选项", async () => {
    const observer = class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        const size = [{ inlineSize: 320, blockSize: 320 }] as ReadonlyArray<ResizeObserverSize>;
        queueMicrotask(() =>
          this.callback(
            [
              {
                target,
                contentRect: {
                  width: 320,
                  height: 320,
                  top: 0,
                  left: 0,
                  right: 320,
                  bottom: 320,
                  x: 0,
                  y: 0,
                } as DOMRectReadOnly,
                borderBoxSize: size,
                contentBoxSize: size,
                devicePixelContentBoxSize: size,
              },
            ],
            this as unknown as ResizeObserver,
          ),
        );
      }
      unobserve() {}
      disconnect() {}
    };
    vi.stubGlobal("ResizeObserver", observer);
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        const height = this.hasAttribute("data-index") ? 32 : 320;
        return {
          width: 320,
          height,
          top: 0,
          left: 0,
          right: 320,
          bottom: height,
          x: 0,
          y: 0,
          toJSON() {},
        } as DOMRect;
      });
    const many = Array.from({ length: 1_000 }, (_, index) => ({
      value: `item-${index}`,
      label: `选项 ${index}`,
    }));

    render(
      <Combobox items={many} defaultOpen>
        <ComboboxInput placeholder="搜索千项" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );

    await waitFor(() =>
      expect(document.querySelectorAll("[role='option']").length).toBeLessThan(40),
    );
    expect(screen.queryByText("选项 999")).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("搜索千项"), { target: { value: "选项 999" } });
    await waitFor(() => expect(screen.getByText("选项 999")).toBeTruthy());

    rect.mockRestore();
  });
});
