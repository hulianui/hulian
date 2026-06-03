import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render, fireEvent, cleanup, act } from "@testing-library/react";
import { Anchor, flattenAnchorItems } from "./anchor";
import type { AnchorItem } from "./anchor.types";

// 捕获最近一个 IntersectionObserver 实例的回调，供测试手动触发模拟「section 进入视口」。
let observerCb: IntersectionObserverCallback | null = null;
const observed: Element[] = [];

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    constructor(cb: IntersectionObserverCallback) {
      observerCb = cb;
    }
    observe(el: Element) {
      observed.push(el);
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  } as unknown as typeof IntersectionObserver;
  // jsdom 未实现 scrollTo → 打桩避免抛错
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
});

beforeEach(() => {
  observerCb = null;
  observed.length = 0;
  (window.scrollTo as unknown as ReturnType<typeof vi.fn>).mockClear?.();
  cleanup();
  document.body.innerHTML = "";
});

const items: AnchorItem[] = [
  { href: "#intro", title: "介绍" },
  {
    href: "#usage",
    title: "用法",
    children: [
      { href: "#install", title: "安装" },
      { href: "#config", title: "配置" },
    ],
  },
  { href: "#api", title: "API" },
];

// 在文档里放真实 section（供 getElementById / IO target）
function mountSections() {
  const ids = ["intro", "usage", "install", "config", "api"];
  for (const id of ids) {
    const sec = document.createElement("section");
    sec.id = id;
    sec.textContent = id;
    document.body.appendChild(sec);
  }
}

describe("flattenAnchorItems", () => {
  it("递归扁平化含二级项，保持文档顺序", () => {
    expect(flattenAnchorItems(items).map((i) => i.href)).toEqual([
      "#intro",
      "#usage",
      "#install",
      "#config",
      "#api",
    ]);
  });
  it("空数组返回空", () => {
    expect(flattenAnchorItems([])).toEqual([]);
  });
});

describe("Anchor 渲染", () => {
  it("渲染 nav + 全部链接（含二级）正确 href/标题", () => {
    const { container } = render(<Anchor items={items} />);
    const nav = container.querySelector("nav")!;
    expect(nav).toBeTruthy();
    const links = container.querySelectorAll("a");
    expect(links.length).toBe(5);
    const hrefs = Array.from(links).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["#intro", "#usage", "#install", "#config", "#api"]);
    expect(container.textContent).toContain("安装");
    expect(container.textContent).toContain("配置");
  });

  it("注入滑动指示条（aria-hidden 装饰位）", () => {
    const { container } = render(<Anchor items={items} />);
    const indicator = container.querySelector("[data-anchor-indicator]")!;
    expect(indicator).toBeTruthy();
    expect(indicator.getAttribute("aria-hidden")).toBe("true");
  });

  it("空 items 不崩，仅渲染空导航", () => {
    const { container } = render(<Anchor items={[]} />);
    expect(container.querySelectorAll("a").length).toBe(0);
  });

  it("className 与 props 透传到 nav", () => {
    const { container } = render(
      <Anchor items={items} className="w-40" data-testid="a" aria-label="目录" />,
    );
    const nav = container.querySelector("nav")!;
    expect(nav.className).toContain("w-40");
    expect(nav.getAttribute("data-testid")).toBe("a");
    expect(nav.getAttribute("aria-label")).toBe("目录");
  });
});

describe("Anchor 点击平滑滚动", () => {
  it("点击链接 preventDefault + 调 scrollTo 定位到目标（扣除 offsetTop）+ 标记当前项", () => {
    mountSections();
    const onChange = vi.fn();
    const { container } = render(<Anchor items={items} offsetTop={80} onChange={onChange} />);
    const apiLink = container.querySelector('a[href="#api"]') as HTMLAnchorElement;

    const ev = new MouseEvent("click", { bubbles: true, cancelable: true });
    act(() => {
      apiLink.dispatchEvent(ev);
    });
    expect(ev.defaultPrevented).toBe(true);

    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    const arg = (window.scrollTo as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    // jsdom 下 rect.top 与 scrollY 均为 0 → top = 0 - offsetTop(80) = -80
    expect(arg.top).toBe(-80);

    expect(apiLink.getAttribute("aria-current")).toBe("location");
    expect(onChange).toHaveBeenCalledWith("#api");
  });

  it("目标 id 不存在时不调用 scrollTo（容错）", () => {
    // 不挂载 sections → getElementById 全 null
    const { container } = render(<Anchor items={items} />);
    fireEvent.click(container.querySelector('a[href="#api"]')!);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("传 getContainer 时滚动落到容器而非 window", () => {
    mountSections();
    const scroller = document.createElement("div");
    scroller.scrollTo = vi.fn() as unknown as typeof scroller.scrollTo;
    document.body.appendChild(scroller);
    const { container } = render(<Anchor items={items} getContainer={() => scroller} />);

    fireEvent.click(container.querySelector('a[href="#api"]')!);

    expect(scroller.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});

describe("Anchor scrollspy（IntersectionObserver 驱动）", () => {
  // 模拟真实 IO 回调：传 [id, 是否相交] 数组。需 act() 包裹以 flush React 状态。
  const fire = (entries: [string, boolean][]) =>
    act(() => {
      observerCb!(
        entries.map(
          ([id, vis]) =>
            ({ target: document.getElementById(id)!, isIntersecting: vis }) as unknown as IntersectionObserverEntry,
        ),
        {} as IntersectionObserver,
      );
    });

  it("section 进入视口 → 高亮对应锚点 + 触发 onChange", () => {
    mountSections();
    const onChange = vi.fn();
    const { container } = render(<Anchor items={items} onChange={onChange} />);
    expect(observerCb).toBeTruthy();
    expect(observed.length).toBe(5); // 每个 section 都被 observe

    fire([["usage", true]]);

    const usageLink = container.querySelector('a[href="#usage"]')!;
    expect(usageLink.getAttribute("aria-current")).toBe("location");
    expect(onChange).toHaveBeenCalledWith("#usage");
  });

  it("多 section 可见时取文档顺序最靠前者为当前项", () => {
    mountSections();
    const { container } = render(<Anchor items={items} />);
    fire([
      ["config", true],
      ["install", true],
    ]);
    // install 在 config 之前 → install 激活
    expect(container.querySelector('a[href="#install"]')!.getAttribute("aria-current")).toBe(
      "location",
    );
    expect(container.querySelector('a[href="#config"]')!.getAttribute("aria-current")).toBeNull();
  });

  it("onChange 仅在激活项变化时触发，同项不重复", () => {
    mountSections();
    const onChange = vi.fn();
    render(<Anchor items={items} onChange={onChange} />);
    fire([["intro", true]]); // 激活 intro
    fire([["intro", true]]); // 仍 intro，不重复
    fire([
      ["intro", false],
      ["api", true],
    ]); // intro 离开、api 进入 → 激活 api
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenNthCalledWith(1, "#intro");
    expect(onChange).toHaveBeenNthCalledWith(2, "#api");
  });
});
