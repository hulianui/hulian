import { describe, it, expect, vi, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { Reveal, Stagger, StaggerItem } from "./reveal";

// useInView 依赖 IntersectionObserver；jsdom 无之，stub 一个空实现（不触发，组件走 initial 态即可）。
beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

describe("Reveal", () => {
  it("渲染 children + 透传 className/props", () => {
    const { container } = render(
      <Reveal className="my-reveal" data-testid="r">
        <p>内容</p>
      </Reveal>,
    );
    expect(container.textContent).toBe("内容");
    const root = container.querySelector("[data-testid='r']")!;
    expect(root.getAttribute("class")).toContain("my-reveal");
  });

  it("trigger=mount 不抛错且渲染内容", () => {
    const { container } = render(
      <Reveal trigger="mount">
        <span>x</span>
      </Reveal>,
    );
    expect(container.textContent).toBe("x");
  });
});

describe("Stagger / StaggerItem", () => {
  it("容器编排 + 子项均渲染（穿过中间节点）", () => {
    const { container } = render(
      <Stagger trigger="mount" data-testid="stag">
        <div>
          <StaggerItem>
            <p>一</p>
          </StaggerItem>
          <StaggerItem y={22} scale={0.94} blur={12}>
            <p>二</p>
          </StaggerItem>
        </div>
      </Stagger>,
    );
    expect(container.textContent).toBe("一二");
    expect(container.querySelector("[data-testid='stag']")).toBeTruthy();
  });
});

describe("reduced-motion", () => {
  it("命中时只淡入、不抛错、内容在", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((q: string) => ({
        matches: q.includes("reduce"),
        media: q,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const { container } = render(
      <Reveal>
        <span>降级</span>
      </Reveal>,
    );
    expect(container.textContent).toBe("降级");
    vi.unstubAllGlobals();
  });
});
