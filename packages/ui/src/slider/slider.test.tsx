import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Slider } from "./slider";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const ranges = (c: HTMLElement) =>
  Array.from(c.querySelectorAll<HTMLInputElement>('input[type="range"]'));

describe("Slider", () => {
  it("稳定父更新时跳过 Slider 子树", async () => {
    await expectMemoSkipsSubtree(() => <Slider defaultValue={40} />);
  });

  it("标量 value → 渲 1 个 range input(单 thumb)", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(ranges(container)).toHaveLength(1);
  });

  it("数组 value → 渲 2 个 range input(range 双 thumb)", () => {
    const { container } = render(<Slider defaultValue={[25, 75]} />);
    expect(ranges(container)).toHaveLength(2);
  });

  it("min/max/step 透传到内层 input", () => {
    const { container } = render(<Slider defaultValue={5} min={0} max={50} step={5} />);
    const input = ranges(container)[0];
    expect(input.getAttribute("min")).toBe("0");
    expect(input.getAttribute("max")).toBe("50");
    expect(input.getAttribute("step")).toBe("5");
  });

  it("disabled 透传 → 内层 input 禁用", () => {
    const { container } = render(<Slider defaultValue={40} disabled />);
    expect(ranges(container)[0].disabled).toBe(true);
  });

  it("showValue 渲出数值读出 output", () => {
    const { container } = render(<Slider defaultValue={40} showValue />);
    expect(container.querySelector("output")).not.toBeNull();
  });

  it("无 showValue 时不渲 output", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(container.querySelector("output")).toBeNull();
  });

  it("className 落在 Root wrapper", () => {
    const { container } = render(<Slider defaultValue={40} className="mt-4" />);
    expect((container.firstChild as HTMLElement).className).toContain("mt-4");
  });
});

describe("thumb 无障碍名（#200）", () => {
  it("单值滑块：名字移到 thumb input（Root 是 role=group，名字挂那儿焦点上听不到）", () => {
    const { container } = render(<Slider defaultValue={100} min={90} max={120} aria-label="字体大小" />);
    expect(ranges(container)[0].getAttribute("aria-label")).toBe("字体大小");
    // 是转移不是复制：组里只有一个控件，两处同名会被读屏念两遍，也让按名字找控件变成歧义
    expect((container.firstChild as HTMLElement).hasAttribute("aria-label")).toBe(false);
  });

  it("range：Root 留组名（此时组里确实有两个控件）", () => {
    const { container } = render(<Slider defaultValue={[20, 80]} aria-label="价格区间" />);
    expect((container.firstChild as HTMLElement).getAttribute("aria-label")).toBe("价格区间");
  });

  it("thumbAriaLabel 覆盖 Root 的名字", () => {
    const { container } = render(<Slider defaultValue={40} aria-label="组名" thumbAriaLabel="滑块名" />);
    expect(ranges(container)[0].getAttribute("aria-label")).toBe("滑块名");
  });

  it("range 两个 thumb 用二元组分别命名（同名会听成两个一模一样的滑块）", () => {
    const { container } = render(
      <Slider defaultValue={[20, 80]} thumbAriaLabel={["最低价", "最高价"]} />,
    );
    const [lo, hi] = ranges(container);
    expect(lo.getAttribute("aria-label")).toBe("最低价");
    expect(hi.getAttribute("aria-label")).toBe("最高价");
  });

  it("只有 aria-labelledby 时把它指给 thumb", () => {
    const { container } = render(<Slider defaultValue={40} aria-labelledby="lbl" />);
    expect(ranges(container)[0].getAttribute("aria-labelledby")).toBe("lbl");
  });

  it("两者都没给时不硬造名字（thumb 上不出现空 aria-label）", () => {
    const { container } = render(<Slider defaultValue={40} />);
    expect(ranges(container)[0].hasAttribute("aria-label")).toBe(false);
  });
});
