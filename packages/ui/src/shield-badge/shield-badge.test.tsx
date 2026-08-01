import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ShieldBadge, ShieldBadgeGroup, compactCount } from "./shield-badge";

describe("compactCount", () => {
  it("千以下原样取整", () => {
    expect(compactCount(4)).toBe("4");
    expect(compactCount(999)).toBe("999");
    expect(compactCount(12.4)).toBe("12");
  });

  it("千位以上带单位，<10 保留一位小数", () => {
    expect(compactCount(1500)).toBe("1.5k");
    expect(compactCount(9900)).toBe("9.9k");
  });

  it("≥10 的档取整", () => {
    expect(compactCount(12300)).toBe("12k");
    expect(compactCount(345_000)).toBe("345k");
  });

  it("百万 / 十亿档", () => {
    expect(compactCount(3_400_000)).toBe("3.4M");
    expect(compactCount(2_000_000_000)).toBe("2B");
  });

  it("进位到上一级单位（999_999 不写成 1000k）", () => {
    expect(compactCount(999_999)).toBe("1M");
  });

  it("负数保号，非有限值降级为破折号", () => {
    expect(compactCount(-1500)).toBe("-1.5k");
    expect(compactCount(Number.NaN)).toBe("—");
  });
});

describe("ShieldBadge", () => {
  it("渲染左标签 + 右数值双段", () => {
    const { getByText } = render(<ShieldBadge label="license" value="MIT" />);
    expect(getByText("license")).toBeTruthy();
    expect(getByText("MIT")).toBeTruthy();
  });

  it("省略 label 时只渲染单段", () => {
    const { container, queryByText } = render(<ShieldBadge value="MIT" />);
    expect(queryByText("MIT")).toBeTruthy();
    expect(container.querySelectorAll("span > span")).toHaveLength(1);
  });

  it("href 时整枚成链接", () => {
    const { container } = render(
      <ShieldBadge label="stars" value="4" href="https://example.com/repo" />,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com/repo");
  });

  it("target=_blank 自动补 rel", () => {
    const { container } = render(
      <ShieldBadge label="npm" value="v0.17.0" href="https://example.com" target="_blank" />,
    );
    expect(container.querySelector("a")?.getAttribute("rel")).toBe("noreferrer noopener");
  });

  it("显式 rel 优先于自动补的", () => {
    const { container } = render(
      <ShieldBadge value="v1" href="https://example.com" target="_blank" rel="nofollow" />,
    );
    expect(container.querySelector("a")?.getAttribute("rel")).toBe("nofollow");
  });

  it("tone 决定右段实底色类", () => {
    const { getByText } = render(<ShieldBadge label="CI" value="failing" tone="danger" />);
    expect(getByText("failing").className).toContain("bg-danger");
  });

  it("color 逃生舱走内联样式并接管 tone", () => {
    const { getByText } = render(<ShieldBadge label="build" value="passing" color="chart-3" />);
    const el = getByText("passing") as HTMLElement;
    expect(el.style.backgroundColor).toContain("--color-chart-3");
    expect(el.className).not.toContain("bg-primary");
  });

  it("soft/outline 双段时补分隔线，solid 不补", () => {
    const { getByText: soft } = render(<ShieldBadge label="a" value="b" variant="soft" />);
    expect(soft("b").className).toContain("border-l");
    const { getByText: solid } = render(<ShieldBadge label="a" value="c" />);
    expect(solid("c").className).not.toContain("border-l");
  });

  it("图标槽对读屏隐藏", () => {
    const { container } = render(
      <ShieldBadge label="CI" value="passing" icon={<svg data-testid="logo" />} />,
    );
    expect(container.querySelector("[aria-hidden]")?.querySelector("svg")).toBeTruthy();
  });

  it("透传 className 与原生属性", () => {
    const { container } = render(
      <ShieldBadge value="MIT" className="mt-2" title="许可证" data-x="1" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("mt-2");
    expect(root.getAttribute("title")).toBe("许可证");
    expect(root.getAttribute("data-x")).toBe("1");
  });
});

describe("ShieldBadgeGroup", () => {
  it("换行排列子徽章", () => {
    const { container } = render(
      <ShieldBadgeGroup gap="md">
        <ShieldBadge label="license" value="MIT" />
        <ShieldBadge label="stars" value="4" />
      </ShieldBadgeGroup>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("flex-wrap");
    expect(root.className).toContain("gap-2.5");
    expect(root.children).toHaveLength(2);
  });
});
