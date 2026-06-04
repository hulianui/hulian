import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { skeletonVariants } from "./skeleton";
import { CardSkeleton, ListSkeleton, TableSkeleton } from "./skeleton-presets";

describe("skeletonVariants", () => {
  it("默认 text 形态", () => {
    expect(skeletonVariants({})).toContain("rounded");
  });
  it("circle 形态全圆", () => {
    expect(skeletonVariants({ shape: "circle" })).toContain("rounded-full");
  });
});

describe("组合骨架", () => {
  it("CardSkeleton 渲染 count 张卡片", () => {
    const { container } = render(<CardSkeleton count={4} />);
    expect(container.querySelectorAll(".grid > div")).toHaveLength(4);
  });

  it("CardSkeleton 无边框（骨架屏惯例·绝不出现裸 border 近黑）", () => {
    const { container } = render(<CardSkeleton count={1} />);
    expect(container.querySelector(".border-border")).toBeNull();
    const card = container.querySelector(".grid > div");
    expect(card!.className).not.toContain("border");
  });

  it("CardSkeleton 暴露 role=status 无障碍", () => {
    const { getByRole } = render(<CardSkeleton />);
    expect(getByRole("status")).toBeTruthy();
  });

  it("ListSkeleton 渲染 rows 行带圆形头像位", () => {
    const { container } = render(<ListSkeleton rows={3} />);
    expect(container.querySelectorAll('[role="status"] > div')).toHaveLength(3);
    expect(container.querySelector(".rounded-full")).toBeTruthy();
  });

  it("TableSkeleton 渲染 rows×cols 个块", () => {
    const { container } = render(<TableSkeleton rows={2} cols={3} />);
    expect(container.querySelectorAll('[role="status"] > div')).toHaveLength(2);
  });
});
