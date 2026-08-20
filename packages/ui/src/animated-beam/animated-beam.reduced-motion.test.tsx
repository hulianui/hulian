import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { useRef } from "react";

// 单独成文件 + 文件级 mock，理由同 border-beam.reduced-motion.test.tsx：
// motion 的 useReducedMotion 首次调用即把结果缓存进模块级变量，同文件内后设的
// matchMedia 桩不再生效。
vi.mock("motion/react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("motion/react")>()),
  useReducedMotion: () => true,
}));

const { AnimatedBeam } = await import("./animated-beam");

function Harness() {
  const c = useRef<HTMLDivElement>(null);
  const a = useRef<HTMLDivElement>(null);
  const b = useRef<HTMLDivElement>(null);
  return (
    <div ref={c} className="relative">
      <div ref={a} />
      <div ref={b} />
      <AnimatedBeam containerRef={c} fromRef={a} toRef={b} />
    </div>
  );
}

describe("AnimatedBeam · reduced-motion", () => {
  // 与 BorderBeam 不同：底线 path 是**信息**（表达 A 连到 B），不能一起拿掉。
  // 只有那道流动的渐变光是装饰，去掉后退成一条静态连线，语义不丢。
  it("保留连线，只去掉流光与渐变", () => {
    const { container } = render(<Harness />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg!.querySelectorAll("path")).toHaveLength(1);
    expect(container.querySelector("linearGradient")).toBeNull();
  });

  it("保留下来的是底线那条（颜色走 pathColor，不是渐变引用）", () => {
    const { container } = render(<Harness />);
    const path = container.querySelector("path")!;
    expect(path.getAttribute("stroke")).not.toContain("url(#");
  });
});
