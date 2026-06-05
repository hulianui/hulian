import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LogoLoop } from "./logo-loop";
import type { LogoItem } from "./logo-loop.types";

const LOGOS: LogoItem[] = [
  { node: <span>瑚琏</span>, ariaLabel: "瑚琏" },
  { src: "/a.svg", alt: "A" },
  { node: <span>HanUI</span>, href: "https://example.com" },
];

describe("LogoLoop", () => {
  it("渲染 region 根 + 复制序列（≥2 份），aria-label 默认中文", () => {
    const { container } = render(<LogoLoop logos={LOGOS} />);
    const root = container.firstElementChild!;
    expect(root.getAttribute("role")).toBe("region");
    expect(root.getAttribute("aria-label")).toBe("合作伙伴 logo");
    // 至少 MIN_COPIES=2 份序列
    expect(container.querySelectorAll('ul[role="list"]').length).toBeGreaterThanOrEqual(2);
  });

  it("gap / logoHeight 落 CSS 变量，fade token 默认吃 surface", () => {
    const { container } = render(
      <LogoLoop logos={LOGOS} gap={48} logoHeight={40} fadeOut />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hl-loop-gap")).toBe("48px");
    expect(root.style.getPropertyValue("--hl-loop-logo-h")).toBe("40px");
    expect(root.style.getPropertyValue("--hl-loop-fade")).toBe("var(--color-surface)");
    // fadeOut 开启渐隐伪元素类
    expect(root.getAttribute("class")).toContain("before:content-['']");
  });

  it("className / style / ariaLabel 透传，will-change 轨道存在", () => {
    const { container } = render(
      <LogoLoop
        logos={LOGOS}
        className="my-loop"
        ariaLabel="伙伴墙"
        style={{ opacity: 0.5 }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("class")).toContain("my-loop");
    expect(root.getAttribute("aria-label")).toBe("伙伴墙");
    expect(root.style.opacity).toBe("0.5");
    expect(container.querySelector(".will-change-transform")).toBeTruthy();
  });

  it("href 项渲染为新窗口链接 + rel 安全属性", () => {
    const { container } = render(<LogoLoop logos={LOGOS} />);
    const link = container.querySelector("a")!;
    expect(link.getAttribute("href")).toBe("https://example.com");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("renderItem 自定义渲染覆盖默认", () => {
    const { container } = render(
      <LogoLoop
        logos={LOGOS}
        renderItem={(_, i) => <b data-testid="custom">item-{i}</b>}
      />,
    );
    expect(container.querySelectorAll('[data-testid="custom"]').length).toBeGreaterThan(0);
  });
});
