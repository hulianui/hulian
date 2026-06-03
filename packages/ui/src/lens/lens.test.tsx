import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Lens } from "./lens";

describe("Lens", () => {
  it("渲染 children", () => {
    const { getByText } = render(
      <Lens>
        <span>内容</span>
      </Lens>,
    );
    expect(getByText("内容")).toBeTruthy();
  });

  it("静息时不渲染放大副本（children 只 1 份）", () => {
    const { getAllByText } = render(
      <Lens>
        <span>内容</span>
      </Lens>,
    );
    expect(getAllByText("内容")).toHaveLength(1);
  });

  it("mousemove 后出现放大副本（children 2 份）", () => {
    const { container, getAllByText } = render(
      <Lens>
        <span>内容</span>
      </Lens>,
    );
    fireEvent.mouseMove(container.firstElementChild!, { clientX: 10, clientY: 10 });
    expect(getAllByText("内容")).toHaveLength(2);
  });

  it("mouseleave 后放大副本消失", () => {
    const { container, getAllByText } = render(
      <Lens>
        <span>内容</span>
      </Lens>,
    );
    const root = container.firstElementChild!;
    fireEvent.mouseMove(root, { clientX: 10, clientY: 10 });
    fireEvent.mouseLeave(root);
    expect(getAllByText("内容")).toHaveLength(1);
  });
});
