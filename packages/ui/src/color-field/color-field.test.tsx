import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ColorField, normalizeHex, isHexColor } from "./color-field";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("normalizeHex", () => {
  it("补齐短写并统一小写加 #", () => {
    expect(normalizeHex("#ABC")).toBe("#aabbcc");
    expect(normalizeHex("abc")).toBe("#aabbcc");
    expect(normalizeHex("#38E8FF")).toBe("#38e8ff");
    expect(normalizeHex("38e8ff")).toBe("#38e8ff");
    expect(normalizeHex("  #38e8ff  ")).toBe("#38e8ff");
  });

  it("不可解析返回 null（而不是抛错或吐个默认色）", () => {
    for (const bad of [
      "",
      "#",
      "#12",
      "#1234",
      "#12345",
      "#1234567",
      "zzz",
      "#gggggg",
      "rgb(1,2,3)",
    ]) {
      expect(normalizeHex(bad), bad).toBeNull();
    }
  });

  it("短写是缩写而非另一种颜色：#abc 展开成 #aabbcc 不是 #abc000", () => {
    expect(normalizeHex("#f00")).toBe("#ff0000");
  });
});

describe("isHexColor", () => {
  it("认 3/6 位、# 可省", () => {
    expect(isHexColor("#fff")).toBe(true);
    expect(isHexColor("ffffff")).toBe(true);
    expect(isHexColor("#12345")).toBe(false);
  });
});

describe("ColorField", () => {
  const hexInput = (c: HTMLElement) => c.querySelector('input[type="text"]') as HTMLInputElement;
  const colorInput = (c: HTMLElement) => c.querySelector('input[type="color"]') as HTMLInputElement;

  it("稳定父更新时跳过颜色输入框子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <ColorField defaultValue="#38e8ff" size="md" aria-label="主色" />
    ));
  });

  it("非受控：显示 defaultValue 的规范化结果", () => {
    const { container } = render(<ColorField defaultValue="#ABC" />);
    expect(hexInput(container).value).toBe("#aabbcc");
  });

  it("受控：显示外部 value", () => {
    const { container } = render(<ColorField value="#38e8ff" onValueChange={() => {}} />);
    expect(hexInput(container).value).toBe("#38e8ff");
  });

  /// 这条是本组件存在草稿态的理由：受控值直接回灌会让手输在第一个字符就被打回。
  it("键入半截值时不被规范化打回，且不误触发回调", () => {
    const onValueChange = vi.fn();
    const { container } = render(<ColorField value="#000000" onValueChange={onValueChange} />);
    const el = hexInput(container);
    fireEvent.change(el, { target: { value: "#3" } });
    expect(el.value, "半截输入必须留在框里").toBe("#3");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.change(el, { target: { value: "#38e" } });
    // #38e 是合法短写 → 应该抛出展开后的值
    expect(onValueChange).toHaveBeenCalledWith("#3388ee");
  });

  it("失焦丢草稿，回到规范值", () => {
    const { container } = render(<ColorField value="#38e8ff" onValueChange={() => {}} />);
    const el = hexInput(container);
    fireEvent.change(el, { target: { value: "#zz" } });
    expect(el.value).toBe("#zz");
    fireEvent.blur(el);
    expect(el.value, "半截/非法输入不该留在框里").toBe("#38e8ff");
  });

  it("草稿非法时标红，清空则不算错", () => {
    const { container } = render(<ColorField defaultValue="#38e8ff" />);
    const el = hexInput(container);
    fireEvent.change(el, { target: { value: "#zzz" } });
    expect(el.getAttribute("aria-invalid")).toBe("true");
    fireEvent.change(el, { target: { value: "" } });
    expect(el.getAttribute("aria-invalid")).toBeNull();
  });

  it("独立 invalid 落到 data-invalid（外壳靠 has-[[data-invalid]] 上色）", () => {
    const { container } = render(<ColorField defaultValue="#38e8ff" invalid />);
    expect(hexInput(container).hasAttribute("data-invalid")).toBe(true);
  });

  it("色块的原生取色器改值即抛规范化值", () => {
    const onValueChange = vi.fn();
    const { container } = render(
      <ColorField defaultValue="#000000" onValueChange={onValueChange} />,
    );
    fireEvent.change(colorInput(container), { target: { value: "#38E8FF" } });
    expect(onValueChange).toHaveBeenCalledWith("#38e8ff");
  });

  it("showSwatch=false 不渲染取色器", () => {
    const { container } = render(<ColorField defaultValue="#38e8ff" showSwatch={false} />);
    expect(colorInput(container)).toBeNull();
  });

  it("disabled 同时禁用文本框与取色器", () => {
    const { container } = render(<ColorField defaultValue="#38e8ff" disabled />);
    expect(hexInput(container).disabled).toBe(true);
    expect(colorInput(container).disabled).toBe(true);
  });

  it("透传 className 与 aria-label", () => {
    const { container } = render(
      <ColorField defaultValue="#38e8ff" className="my-field" aria-label="主色" />,
    );
    expect(container.firstElementChild?.classList.contains("my-field")).toBe(true);
    expect(hexInput(container).getAttribute("aria-label")).toBe("主色");
  });

  it("非法 value（外部传坏值）回落到内部值而不是崩", () => {
    const { container } = render(<ColorField value="not-a-color" onValueChange={() => {}} />);
    expect(hexInput(container).value).toBe("#3b82f6");
  });
});
