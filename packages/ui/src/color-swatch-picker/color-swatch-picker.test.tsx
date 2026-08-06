import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { normalizeSwatches } from "./swatch-items";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

const TOKENS = [
  { color: "var(--color-primary)", label: "主色" },
  { color: "var(--color-danger)", label: "危险色" },
];

describe("ColorSwatchPicker", () => {
  it("按 colors 渲染对应数量的色块（aria-label=颜色串）", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} />);
    COLORS.forEach((c) => expect(getByLabelText(c)).toBeTruthy());
  });

  it("色块内联背景色 = 颜色值", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} />);
    const swatch = getByLabelText("#3b82f6") as HTMLElement;
    // jsdom 把 hex 规范成 rgb
    expect(swatch.style.backgroundColor).toBe("rgb(59, 130, 246)");
  });

  it("点击色块触发 onValueChange", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} onValueChange={onValueChange} />);
    fireEvent.click(getByLabelText("#22c55e"));
    expect(onValueChange).toHaveBeenCalledWith("#22c55e");
  });

  it("defaultValue 选中态打到对应色块", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} defaultValue="#3b82f6" />);
    expect(getByLabelText("#3b82f6").getAttribute("data-checked")).not.toBeNull();
  });

  it("受控 value 变化反映到选中态", () => {
    const { getByLabelText, rerender } = render(<ColorSwatchPicker colors={COLORS} value="#ef4444" />);
    expect(getByLabelText("#ef4444").getAttribute("data-checked")).not.toBeNull();
    rerender(<ColorSwatchPicker colors={COLORS} value="#22c55e" />);
    expect(getByLabelText("#22c55e").getAttribute("data-checked")).not.toBeNull();
    expect(getByLabelText("#ef4444").getAttribute("data-checked")).toBeNull();
  });

  it("disabled 加 opacity-50 到容器", () => {
    const { container } = render(<ColorSwatchPicker colors={COLORS} disabled />);
    expect(container.firstElementChild!.className).toContain("opacity-50");
  });

  it("透传 className 到容器 + 默认 aria-label", () => {
    const { container, getByRole } = render(<ColorSwatchPicker colors={COLORS} className="my-swatches" />);
    expect(container.firstElementChild!.classList.contains("my-swatches")).toBe(true);
    expect(getByRole("radiogroup", { name: "颜色色板" })).toBeTruthy();
  });

  it("ConfigProvider locale=enUS localizes the default group label", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <ColorSwatchPicker colors={COLORS} />
      </ConfigProvider>,
    );
    expect(getByRole("radiogroup", { name: "Color swatches" })).toBeTruthy();
  });

  it("legacy dictionaries fall back to Chinese while aria-label overrides enUS", () => {
    const legacy = { ...enUS, components: { ...enUS.components!, colorSwatchPicker: undefined } };
    const { getByRole, rerender } = render(
      <ConfigProvider locale={legacy}>
        <ColorSwatchPicker colors={COLORS} />
      </ConfigProvider>,
    );
    expect(getByRole("radiogroup", { name: "颜色色板" })).toBeTruthy();

    rerender(
      <ConfigProvider locale={enUS}>
        <ColorSwatchPicker colors={COLORS} aria-label="Product color" />
      </ConfigProvider>,
    );
    expect(getByRole("radiogroup", { name: "Product color" })).toBeTruthy();
  });
});

describe("normalizeSwatches", () => {
  it("字符串项 label 回退到色值（旧行为不变）", () => {
    expect(normalizeSwatches(["#ef4444"])).toEqual([{ color: "#ef4444", label: "#ef4444" }]);
  });

  it("对象项用 label", () => {
    expect(normalizeSwatches([{ color: "var(--color-primary)", label: "主色" }])).toEqual([
      { color: "var(--color-primary)", label: "主色" },
    ]);
  });

  it("对象项缺 label / 空白 label 回退到色值", () => {
    expect(
      normalizeSwatches([{ color: "#3b82f6" }, { color: "#22c55e", label: "   " }]),
    ).toEqual([
      { color: "#3b82f6", label: "#3b82f6" },
      { color: "#22c55e", label: "#22c55e" },
    ]);
  });

  it("两种形态可混写，顺序不变", () => {
    expect(normalizeSwatches(["#000", { color: "#fff", label: "白" }])).toEqual([
      { color: "#000", label: "#000" },
      { color: "#fff", label: "白" },
    ]);
  });

  it("空数组回空数组", () => {
    expect(normalizeSwatches([])).toEqual([]);
  });
});

describe("ColorSwatchPicker 可读标签", () => {
  it("对象项的 label 成为色块 aria-label（token 不再被读成变量名）", () => {
    const { getByLabelText, queryByLabelText } = render(<ColorSwatchPicker colors={TOKENS} />);
    expect(getByLabelText("主色")).toBeTruthy();
    expect(getByLabelText("危险色")).toBeTruthy();
    expect(queryByLabelText("var(--color-primary)")).toBeNull();
  });

  it("label 同时作为 title（hover 提示）", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={TOKENS} />);
    expect(getByLabelText("主色").getAttribute("title")).toBe("主色");
  });

  it("字符串项向后兼容：aria-label 与 title 都是裸色值", () => {
    const { getByLabelText } = render(<ColorSwatchPicker colors={COLORS} />);
    const swatch = getByLabelText("#3b82f6");
    expect(swatch.getAttribute("title")).toBe("#3b82f6");
  });

  it("身份仍是 color：onValueChange 回吐色值而不是 label", () => {
    const onValueChange = vi.fn();
    const { getByLabelText } = render(
      <ColorSwatchPicker colors={TOKENS} onValueChange={onValueChange} />,
    );
    fireEvent.click(getByLabelText("危险色"));
    expect(onValueChange).toHaveBeenCalledWith("var(--color-danger)");
  });

  it("受控 value 按 color 匹配（不认 label）", () => {
    const { getByLabelText } = render(
      <ColorSwatchPicker colors={TOKENS} value="var(--color-primary)" />,
    );
    expect(getByLabelText("主色").getAttribute("data-checked")).not.toBeNull();
    expect(getByLabelText("危险色").getAttribute("data-checked")).toBeNull();
  });

  it("混写数组：对象项与字符串项同时渲染", () => {
    const { getByLabelText } = render(
      <ColorSwatchPicker colors={[...TOKENS, "#3b82f6"]} />,
    );
    expect(getByLabelText("主色")).toBeTruthy();
    expect(getByLabelText("#3b82f6")).toBeTruthy();
  });
});
