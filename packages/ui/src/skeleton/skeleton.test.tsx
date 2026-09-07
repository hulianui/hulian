import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton, skeletonVariants } from "./skeleton";
import { CardSkeleton, ListSkeleton, TableSkeleton } from "./skeleton-presets";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Skeleton", () => {
  it("稳定父更新时跳过骨架子树", async () => {
    await expectMemoSkipsSubtree(() => <Skeleton shape="text" className="h-4 w-full" />);
  });

  // 减弱动效那一侧在 skeleton.reduced-motion.test.tsx —— motion 的 useReducedMotion 首次调用
  // 就把结果缓存进模块级变量，两侧必须分文件，否则先跑的那侧会把后一侧钉死。
  it("默认（未开减弱动效）挂着扫光的渐变背景", () => {
    const { container } = render(<Skeleton />);
    const block = container.firstElementChild as HTMLElement;
    expect(block.style.backgroundImage).toContain("linear-gradient");
    expect(block.style.backgroundSize).toBe("200% 100%");
  });
});

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

  it("组合骨架使用 ConfigProvider 的加载文案", () => {
    const { getAllByRole } = render(
      <ConfigProvider locale={enUS}>
        <CardSkeleton />
        <ListSkeleton />
        <TableSkeleton />
      </ConfigProvider>,
    );
    expect(getAllByRole("status").map((element) => element.getAttribute("aria-label"))).toEqual([
      "Loading",
      "Loading",
      "Loading",
    ]);
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
