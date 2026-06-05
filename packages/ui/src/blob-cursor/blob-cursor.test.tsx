import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BlobCursor } from "./blob-cursor";

// 结构：根容器(relative·onPointerMove) > [可选 svg gooey 滤镜] > 水滴层([aria-hidden]·pointer-events-none·filter) > N 个水滴。
const dropLayerOf = (c: HTMLElement) =>
  c.querySelector("[aria-hidden].pointer-events-none") as HTMLElement;

describe("BlobCursor", () => {
  it("默认渲染根容器 + gooey svg 滤镜 + trailCount 个水滴，不抛错", () => {
    const { container } = render(<BlobCursor />);
    expect(container.firstElementChild).not.toBeNull();
    // svg gooey 滤镜存在
    expect(container.querySelector("svg filter")).not.toBeNull();
    // 水滴层下应有 3 个水滴（默认 trailCount=3）
    const layer = dropLayerOf(container);
    expect(layer).not.toBeNull();
    expect(layer.children.length).toBe(3);
  });

  it("水滴层带 pointer-events-none 与 token 主体色，不拦截交互", () => {
    const { container } = render(<BlobCursor />);
    const layer = dropLayerOf(container);
    expect(layer.className).toContain("pointer-events-none");
    // 首个水滴吃 primary token
    const firstBlob = layer.children[0] as HTMLElement;
    expect(firstBlob.style.backgroundColor).toContain("--color-primary");
  });

  it("trailCount prop 生效：水滴数量随之改变", () => {
    const { container } = render(<BlobCursor trailCount={5} />);
    expect(dropLayerOf(container).children.length).toBe(5);
  });

  it("gooey=false 时不渲染 svg 滤镜，且水滴层不带 filter 样式", () => {
    const { container } = render(<BlobCursor gooey={false} />);
    expect(container.querySelector("svg filter")).toBeNull();
    const layer = dropLayerOf(container);
    expect((layer.getAttribute("style") ?? "").includes("url(#")).toBe(false);
  });

  it("className 与 zIndex 透传到根容器；square 改圆角；children 渲染于 z-10 层", () => {
    const { container, getByText } = render(
      <BlobCursor className="test-blob" zIndex={77} square>
        <span>覆盖内容</span>
      </BlobCursor>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-blob");
    expect(root.style.zIndex).toBe("77");
    // 方形水滴：圆角 20%
    const layer = dropLayerOf(container);
    const firstBlob = layer.children[0] as HTMLElement;
    expect(firstBlob.style.borderRadius).toBe("20%");
    // children 在 relative z-10 容器
    const wrapper = getByText("覆盖内容").closest("div");
    expect(wrapper?.className).toContain("z-10");
  });
});
