import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("渲染 role=separator", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[role="separator"]')).toBeTruthy();
  });

  it("默认 horizontal：data-orientation=horizontal", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[role="separator"]')!.getAttribute("data-orientation")).toBe("horizontal");
  });

  it("vertical 透传 data-orientation=vertical", () => {
    const { container } = render(<Separator orientation="vertical" />);
    expect(container.querySelector('[role="separator"]')!.getAttribute("data-orientation")).toBe("vertical");
  });

  it("透传 className", () => {
    const { container } = render(<Separator className="my-sep" />);
    expect(container.querySelector('[role="separator"]')!.classList.contains("my-sep")).toBe(true);
  });

  it("消费 border token (bg-border)", () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[role="separator"]')!.className).toContain("bg-border");
  });
});
