import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AspectRatio } from "./aspect-ratio";

describe("AspectRatio", () => {
  it("默认 ratio=1 写入 aspect-ratio", () => {
    const { container } = render(<AspectRatio />);
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe("1");
  });

  it("ratio 写入 CSS aspect-ratio", () => {
    const { container } = render(<AspectRatio ratio={16 / 9} />);
    expect((container.firstElementChild as HTMLElement).style.aspectRatio).toBe(String(16 / 9));
  });

  it("overflow-hidden + w-full 钳住内容", () => {
    const { container } = render(<AspectRatio />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("overflow-hidden")).toBe(true);
    expect(el.classList.contains("w-full")).toBe(true);
  });

  it("渲染 children", () => {
    const { getByText } = render(
      <AspectRatio>
        <span>内容</span>
      </AspectRatio>,
    );
    expect(getByText("内容")).toBeTruthy();
  });

  it("透传 className", () => {
    const { container } = render(<AspectRatio className="my-ar" />);
    expect((container.firstElementChild as HTMLElement).classList.contains("my-ar")).toBe(true);
  });
});
