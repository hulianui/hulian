import { describe, it, expect } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { DomeGallery } from "./dome-gallery";

describe("DomeGallery", () => {
  it("渲染根容器 + 球面瓦片按钮（jsdom 无 WebGL/无崩溃）", () => {
    const { container } = render(
      <DomeGallery images={["a.jpg", "b.jpg", "c.jpg"]} />,
    );
    const root = container.firstElementChild!;
    // 根容器关键 token 类
    expect(root.getAttribute("class")).toContain("overflow-hidden");
    expect(root.getAttribute("class")).toContain("select-none");
    // 每张瓦片渲染为 button
    const tiles = container.querySelectorAll("button");
    expect(tiles.length).toBeGreaterThan(0);
  });

  it("token 类与渐隐遮罩存在（border-border / 暗角 overlay）", () => {
    const { container } = render(<DomeGallery />);
    const html = container.innerHTML;
    // 边缘渐隐用 token 底色变量
    expect(html).toContain("var(--color-background)");
    // 占位瓦片吃 chart token
    expect(html).toContain("var(--color-chart-");
  });

  it("className / 任意 props 透传到根元素", () => {
    const { container } = render(
      <DomeGallery className="custom-x" data-testid="dg" />,
    );
    const root = container.firstElementChild!;
    expect(root.getAttribute("class")).toContain("custom-x");
    expect(root.getAttribute("data-testid")).toBe("dg");
  });

  it("传入图片时瓦片含 <img> 且 grayscale 默认开启", () => {
    const { container } = render(<DomeGallery images={["x.jpg"]} />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img!.getAttribute("src")).toBe("x.jpg");
    expect((img as HTMLImageElement).style.filter).toBe("grayscale(1)");
  });

  it("grayscale=false 时瓦片图片不加灰度滤镜", () => {
    const { container } = render(
      <DomeGallery images={["x.jpg"]} grayscale={false} />,
    );
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.style.filter).toBe("none");
  });

  it("ConfigProvider locale=enUS localizes every generated accessibility label", () => {
    const { container } = render(
      <ConfigProvider locale={enUS}>
        <DomeGallery />
      </ConfigProvider>,
    );

    expect(
      screen.getByRole("group", { name: "Draggable rotating dome gallery" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "Image 1" }).length,
    ).toBeGreaterThan(0);
    expect(container.innerHTML).not.toMatch(/[\u3400-\u9fff]/u);
  });

  it("ConfigProvider locale=enUS localizes empty-alt tile and viewer fallbacks", () => {
    render(
      <ConfigProvider locale={enUS}>
        <DomeGallery images={["x.jpg"]} />
      </ConfigProvider>,
    );

    const tile = screen.getAllByRole("button", { name: "View image" })[0]!;
    fireEvent.click(tile);
    expect(screen.getByRole("dialog", { name: "Enlarged view" })).toBeTruthy();
  });

  it("未提供 ConfigProvider 时保持中文默认文案", () => {
    render(<DomeGallery />);

    expect(
      screen.getByRole("group", { name: "可拖拽旋转的球面图库" }),
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: "图片 1" }).length,
    ).toBeGreaterThan(0);
  });
});
