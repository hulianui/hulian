import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { OrbitingCircles } from "./orbiting-circles";

describe("OrbitingCircles", () => {
  it("每个子元素渲染为一个环绕项", () => {
    const { getByText } = render(
      <OrbitingCircles>
        <span>A</span>
        <span>B</span>
        <span>C</span>
      </OrbitingCircles>,
    );
    expect(getByText("A")).toBeTruthy();
    expect(getByText("C")).toBeTruthy();
  });

  it("子元素均匀分布角度（第 i 个 angle=360/count*i）", () => {
    const { getByText } = render(
      <OrbitingCircles>
        <span>A</span>
        <span>B</span>
      </OrbitingCircles>,
    );
    const wrapB = getByText("B").parentElement as HTMLElement;
    expect(wrapB.style.getPropertyValue("--hulian-orbit-angle")).toBe("180");
  });

  it("挂 hulian-orbit 动画类", () => {
    const { getByText } = render(
      <OrbitingCircles>
        <span>A</span>
      </OrbitingCircles>,
    );
    expect(getByText("A").parentElement!.className).toContain("[animation:hulian-orbit_linear_infinite]");
  });

  it("showPath=false 不画轨道 svg", () => {
    const { container } = render(
      <OrbitingCircles showPath={false}>
        <span>A</span>
      </OrbitingCircles>,
    );
    expect(container.querySelector("svg")).toBeNull();
  });

  it("reverse 设置 animationDirection=reverse", () => {
    const { getByText } = render(
      <OrbitingCircles reverse>
        <span>A</span>
      </OrbitingCircles>,
    );
    expect((getByText("A").parentElement as HTMLElement).style.animationDirection).toBe("reverse");
  });
});
