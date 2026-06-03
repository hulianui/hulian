import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  it("渲染 children", () => {
    const { getByText } = render(
      <ScrollArea className="h-32 w-48">
        <div>滚动内容</div>
      </ScrollArea>,
    );
    expect(getByText("滚动内容")).toBeTruthy();
  });

  it("默认 vertical：渲染竖向滚动条", () => {
    const { container } = render(
      <ScrollArea className="h-32">
        <div style={{ height: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
  });

  it("horizontal：渲染横向滚动条", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal" className="w-32">
        <div style={{ width: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
  });

  it("both：双向滚动条都渲染", () => {
    const { container } = render(
      <ScrollArea orientation="both" className="size-32">
        <div style={{ width: 600, height: 600 }}>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-orientation="vertical"]')).toBeTruthy();
    expect(container.querySelector('[data-orientation="horizontal"]')).toBeTruthy();
  });

  it("透传 className 到 Root", () => {
    const { container } = render(
      <ScrollArea className="my-sa">
        <div>x</div>
      </ScrollArea>,
    );
    expect(container.querySelector(".my-sa")).toBeTruthy();
  });
});
