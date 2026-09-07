import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// 单独成文件 + 文件级 mock，理由同 border-beam.reduced-motion.test.tsx：
// motion 的 useReducedMotion 在**首次调用**时把结果缓存进模块级变量，同一个文件里只要前面
// 有过任何一次常态渲染，后面再改 matchMedia 就不再生效。要断言行为就得让 reduce 确定为真。
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));

const { Skeleton } = await import("./skeleton");
const { TableSkeleton } = await import("./skeleton-presets");

const blockOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

describe("Skeleton · reduced-motion（#350）", () => {
  // 骨架的信息量在形状，不在扫光：占位几何必须留着，动效才是要关的那一层。
  it("偏好减少动态时仍渲染占位块，形状类不变", () => {
    const { container } = render(<Skeleton shape="circle" className="size-10" />);
    const block = blockOf(container);
    expect(block).toBeTruthy();
    expect(block.className).toContain("rounded-full");
    expect(block.className).toContain("size-10");
  });

  // 渐变一起去掉：没有人推动 backgroundPosition 时，留着等于把高光钉死在起点，像渲染残留。
  it("去掉扫光的渐变背景，退成纯色块", () => {
    const { container } = render(<Skeleton />);
    expect(blockOf(container).style.backgroundImage).toBe("");
  });

  it("三个预设走同一个原语，因此一并静止（TableSkeleton 40 块无一带渐变）", () => {
    const { container } = render(<TableSkeleton rows={8} cols={5} />);
    const blocks = [...container.querySelectorAll<HTMLElement>("[aria-hidden]")];
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.every((block) => block.style.backgroundImage === "")).toBe(true);
  });

  it("透传的原生属性照常生效", () => {
    const { container } = render(<Skeleton data-testid="ph" />);
    expect(blockOf(container).getAttribute("data-testid")).toBe("ph");
  });
});
