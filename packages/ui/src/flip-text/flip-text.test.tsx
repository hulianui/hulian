import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { createRef } from "react";
import { FlipText } from "./flip-text";

const flipping = (root: HTMLElement) => root.querySelectorAll('[class*="hulian-text-flip"]');

describe("FlipText", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("按字切分 children，每个字都是双面盒（正面 + 背面同字）", () => {
    const { container } = render(<FlipText>状态</FlipText>);
    const faces = container.querySelectorAll(".\\[backface-visibility\\:hidden\\]");
    // 2 个字 × 正反两面
    expect(faces.length).toBe(4);
    // 背面的字挂在 data 属性上由伪元素渲染
    const backs = [...container.querySelectorAll("[data-hulian-flip-back]")].map((el) =>
      el.getAttribute("data-hulian-flip-back"),
    );
    expect(backs).toEqual(["状", "态"]);
  });

  it("背面不进 DOM 文本：标题的 textContent 就是标题本身，不是「状状态态」", () => {
    const { container } = render(<FlipText as="h1">状态</FlipText>);
    // 框选复制、爬虫读到的文案、任何按 textContent 取值的地方都不该看到双份
    expect(container.querySelector("h1")!.textContent).toBe("状态");
  });

  it("收 children 而不是 text: string —— 变量/表达式直接传（#254）", () => {
    const name = "";
    const { container } = render(<FlipText>{name || "未命名客户"}</FlipText>);
    expect(container.querySelector("span")!.getAttribute("aria-label")).toBe("未命名客户");
  });

  it("as 换标签：标题自己就是那个 h1，不套壳", () => {
    const { container } = render(
      <FlipText as="h1" className="text-lg font-semibold">
        AI 状态
      </FlipText>,
    );
    const h1 = container.querySelector("h1")!;
    expect(h1).not.toBeNull();
    expect(h1.getAttribute("class")).toContain("font-semibold");
    // 读屏读整句不读碎字：根挂 aria-label，各段 aria-hidden
    expect(h1.getAttribute("aria-label")).toBe("AI 状态");
    expect(h1.querySelector("[aria-hidden]")).not.toBeNull();
  });

  it("静息不带动画类；hover 后每个字带上，且错峰逐字递增", () => {
    const { container } = render(<FlipText>状态栏</FlipText>);
    const root = container.querySelector("span")!;
    expect(flipping(container).length).toBe(0);

    fireEvent.mouseEnter(root);
    const segs = flipping(container);
    expect(segs.length).toBe(3);
    expect((segs[0] as HTMLElement).style.animationDelay).toBe("0ms");
    expect((segs[1] as HTMLElement).style.animationDelay).toBe("30ms");
    expect((segs[2] as HTMLElement).style.animationDelay).toBe("60ms");
  });

  it("一轮播完撤动画类；播放中重入不重开（重入保护）", () => {
    vi.useFakeTimers();
    const { container } = render(
      <FlipText duration={0.4} stagger={100}>
        状态
      </FlipText>,
    );
    const root = container.querySelector("span")!;

    fireEvent.mouseEnter(root);
    expect(flipping(container).length).toBe(2);

    // 中途再次移入：不重开、也不打断（类还在，动画没被撤下重挂）
    act(() => {
      vi.advanceTimersByTime(200);
    });
    fireEvent.mouseEnter(root);
    expect(flipping(container).length).toBe(2);

    // 一轮 = 0.4s + 1 个错峰 100ms = 500ms，此时才归零
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(flipping(container).length).toBe(2);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(flipping(container).length).toBe(0);

    // 归零后可以再翻一次
    fireEvent.mouseEnter(root);
    expect(flipping(container).length).toBe(2);
  });

  it("卸载时清掉未完成的定时器（标题在列表里频繁进出）", () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(globalThis, "clearTimeout");
    const { container, unmount } = render(<FlipText>状态</FlipText>);
    fireEvent.mouseEnter(container.querySelector("span")!);
    unmount();
    expect(clear).toHaveBeenCalled();
    clear.mockRestore();
  });

  it("四档方向：背面静息时摆在对侧，与容器的转轴互为逆变换", () => {
    const back = (dir: "top" | "bottom" | "left" | "right") => {
      const { container } = render(<FlipText direction={dir}>字</FlipText>);
      return (container.querySelector(".absolute") as HTMLElement).style.transform;
    };
    expect(back("top")).toBe("rotateX(90deg) translateZ(0.5lh)");
    expect(back("bottom")).toBe("rotateX(-90deg) translateZ(0.5lh)");
    expect(back("left")).toBe("rotateY(-90deg) translateZ(0.5lh)");
    expect(back("right")).toBe("rotateY(90deg) translateZ(0.5lh)");

    const { container } = render(<FlipText direction="left">字</FlipText>);
    fireEvent.mouseEnter(container.querySelector("span")!);
    expect(container.innerHTML).toContain("hulian-text-flip-left");
  });

  it("splitType=word 按空白切，空白段保留排版宽度且不翻转", () => {
    const { container } = render(<FlipText splitType="word">Deploy in seconds</FlipText>);
    fireEvent.mouseEnter(container.querySelector("span")!);
    // 3 个词参与翻转，2 段空白只占位
    expect(flipping(container).length).toBe(3);
    expect(container.querySelectorAll(".whitespace-pre").length).toBe(2);
    expect(container.textContent).toBe("Deploy in seconds");
  });

  it("背面靠伪元素 content: attr() 渲染，自身没有子节点", () => {
    const { container } = render(<FlipText>字</FlipText>);
    const back = container.querySelector(".absolute")!;
    expect(back.getAttribute("data-hulian-flip-back")).toBe("字");
    expect(back.childNodes.length).toBe(0);
  });

  it("取不出文字时原样渲染 children，而不是整段消失", () => {
    const { container } = render(
      <FlipText>
        <svg data-testid="icon" />
      </FlipText>,
    );
    expect(container.querySelector("svg")).not.toBeNull();
    expect(container.querySelector("span")!.hasAttribute("aria-label")).toBe(false);
  });

  it("减弱动效偏好压得住：动画写在 class 里而非内联 style", () => {
    const { container } = render(<FlipText>字</FlipText>);
    fireEvent.mouseEnter(container.querySelector("span")!);
    const seg = flipping(container)[0] as HTMLElement;
    expect(seg.getAttribute("class")).toContain("motion-reduce:[animation:none]");
    // 内联只留时长与错峰两个 longhand，压不住 `animation: none`
    expect(seg.style.animationName).toBe("");
    expect(seg.style.animationDuration).toBe("0.5s");
  });

  it("透传的 onMouseEnter 先被调用，翻转不顶掉它", () => {
    const onMouseEnter = vi.fn();
    const { container } = render(<FlipText onMouseEnter={onMouseEnter}>字</FlipText>);
    fireEvent.mouseEnter(container.querySelector("span")!);
    expect(onMouseEnter).toHaveBeenCalledOnce();
    expect(flipping(container).length).toBe(1);
  });

  it("其余属性透传到 as 指定的标签上（id / ref / data-*）", () => {
    const ref = createRef<HTMLHeadingElement>();
    const { container } = render(
      <FlipText as="h2" ref={ref} id="title" data-testid="t">
        标题
      </FlipText>,
    );
    const h2 = container.querySelector("h2")!;
    expect(h2.id).toBe("title");
    expect(h2.getAttribute("data-testid")).toBe("t");
    expect(ref.current).toBe(h2);
  });
});
