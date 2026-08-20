import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";

// 单独成文件，且用文件级 mock 而不是桩 matchMedia：motion 的 useReducedMotion 在**首次调用**
// 时把结果缓存进模块级变量，同一个文件里只要前面有任何一次常态渲染，后面再改 matchMedia
// 就不再生效（库内既有的 matchMedia 桩用例只断言「不抛」，所以一直没暴露这点）。
// 这里要断言的是行为，就得让 reduce 确定为真。
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));

const { BorderBeam } = await import("./border-beam");

describe("BorderBeam · reduced-motion", () => {
  // 光束是纯装饰层（absolute inset-0 pointer-events-none），不渲染既不影响布局也不丢信息。
  // 不选「停在某处」：静止的半段光带看着像渲染残留，比没有更糟。
  it("偏好减少动态时整个不渲染", () => {
    const { container } = render(<BorderBeam />);
    expect(container.firstElementChild).toBeNull();
  });

  it("传了 size / 颜色 / className 也一样不渲染", () => {
    const { container } = render(
      <BorderBeam size={120} colorFrom="red" colorTo="blue" className="x" />,
    );
    expect(container.firstElementChild).toBeNull();
  });
});
