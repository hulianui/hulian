import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ChromaGrid } from "./chroma-grid";
import type { ChromaGridItem } from "./chroma-grid.types";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

const cardsOf = (c: HTMLElement) =>
  c.querySelectorAll("[data-chroma-card]");
const overlayOf = (c: HTMLElement) =>
  c.querySelector("[data-chroma-overlay]") as HTMLElement;
const fadeOf = (c: HTMLElement) =>
  c.querySelector("[data-chroma-fade]") as HTMLElement;

describe("ChromaGrid", () => {
  it("无 items 时回退内置 demo（6 张卡），并渲染两层遮罩，不抛错", () => {
    const { container } = render(<ChromaGrid />);
    expect(container.firstElementChild).not.toBeNull();
    expect(cardsOf(container).length).toBe(6);
    expect(overlayOf(container)).not.toBeNull();
    expect(fadeOf(container)).not.toBeNull();
  });

  it("enUS 下内置 demo 使用英文人物与职位", () => {
    const { container, getByText } = render(
      <ConfigProvider locale={enUS}>
        <ChromaGrid />
      </ConfigProvider>,
    );
    expect(getByText("Lin Yu")).toBeTruthy();
    expect(getByText("Full-stack Engineer")).toBeTruthy();
    expect(container.textContent).not.toMatch(/[\u3400-\u9fff]/u);
  });

  it("items 渲染对应数量卡片 + 标题/描边色 token 注入", () => {
    const items: ChromaGridItem[] = [
      {
        title: "甲",
        subtitle: "工程师",
        borderColor: "var(--color-chart-1)",
        gradient: "linear-gradient(145deg, var(--color-chart-1), transparent)",
      },
      { title: "乙", subtitle: "设计师" },
    ];
    const { container, getByText } = render(<ChromaGrid items={items} />);
    expect(cardsOf(container).length).toBe(2);
    expect(getByText("甲")).toBeTruthy();
    const card0 = cardsOf(container)[0] as HTMLElement;
    expect(card0.style.getPropertyValue("--card-border")).toBe("var(--color-chart-1)");
    expect(card0.style.background).toContain("var(--color-chart-1)");
  });

  it("radius prop 落 --hl-chroma-r 变量 + columns 写入 gridTemplateColumns", () => {
    const { container } = render(<ChromaGrid radius={420} columns={4} items={[{ title: "x" }]} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hl-chroma-r")).toBe("420px");
    expect(root.style.gridTemplateColumns).toContain("repeat(4");
  });

  it("遮罩层带 token 揭示 mask + pointer-events-none，不阻断交互", () => {
    const { container } = render(<ChromaGrid />);
    const overlay = overlayOf(container);
    expect(overlay.className).toContain("pointer-events-none");
    const mask =
      overlay.style.getPropertyValue("mask-image") ||
      overlay.style.webkitMaskImage ||
      (overlay.getAttribute("style") ?? "");
    expect(mask).toContain("--hl-chroma-r");
  });

  it("可点击卡片带 role=link + tabIndex；无 url 卡片不可聚焦", () => {
    const { container } = render(
      <ChromaGrid items={[{ title: "可点", url: "https://example.com" }, { title: "静态" }]} />,
    );
    const [c0, c1] = Array.from(cardsOf(container)) as HTMLElement[];
    expect(c0.getAttribute("role")).toBe("link");
    expect(c0.getAttribute("tabindex")).toBe("0");
    expect(c1.getAttribute("role")).toBeNull();
  });

  it("className 透传到根容器", () => {
    const { container } = render(<ChromaGrid className="test-chroma-class" />);
    expect(container.firstElementChild?.className).toContain("test-chroma-class");
  });
});
