import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Badge, formatCount } from "./badge";

/** 角标节点：独立成标时它就是根，包裹模式下是内层那个 —— 两种形态都带 rounded-full。 */
function mark(container: HTMLElement): string {
  const el = container.querySelector<HTMLElement>('[class*="rounded-full"]');
  if (!el) throw new Error("角标没渲染");
  return el.className;
}

describe("formatCount", () => {
  it("普通数字原样", () => expect(formatCount(5)).toBe("5"));
  it("超过 max 显示 max+", () => expect(formatCount(120, 99)).toBe("99+"));
  it("等于 max 不溢出", () => expect(formatCount(99, 99)).toBe("99"));
  it("无 max 不溢出", () => expect(formatCount(9999)).toBe("9999"));
});

describe("Badge 计数角标", () => {
  it("standalone 渲染数字", () => {
    const { getByText } = render(<Badge count={3} />);
    expect(getByText("3")).toBeTruthy();
  });

  it("count=0 默认隐藏（无任何元素）", () => {
    const { container } = render(<Badge count={0} />);
    expect(container.firstElementChild).toBeNull();
  });

  it("count=0 + showZero 显示 0", () => {
    const { getByText } = render(<Badge count={0} showZero />);
    expect(getByText("0")).toBeTruthy();
  });

  it("max 溢出渲染 99+", () => {
    const { getByText } = render(<Badge count={1000} max={99} />);
    expect(getByText("99+")).toBeTruthy();
  });

  it("默认 tone=danger + variant=signal：明暗同色的信号红 + 白字（#295）", () => {
    const { container } = render(<Badge count={1} />);
    const cls = mark(container);
    expect(cls).toContain("--color-signal-danger");
    expect(cls).toContain("--color-signal-danger-foreground");
    // 兜底链在：装了新 ui 却没升 tokens 的消费方退化成旧语义色，而不是变透明
    expect(cls).toContain("var(--color-danger)");
  });

  it('variant="themed" 回到跟随主题的语义面配色', () => {
    const { container } = render(<Badge count={1} variant="themed" />);
    expect(container.querySelector(".bg-danger")).toBeTruthy();
    expect(mark(container)).not.toContain("signal");
  });

  it("neutral 两档一致：它是中性计数不是警示标记，恒随主题", () => {
    const a = render(<Badge count={1} tone="neutral" />).container;
    const b = render(<Badge count={1} tone="neutral" variant="themed" />).container;
    expect(a.querySelector(".bg-surface-hover")).toBeTruthy();
    expect(b.querySelector(".bg-surface-hover")).toBeTruthy();
  });

  it("dot 模式只渲染圆点不渲染数字", () => {
    const { container, queryByText } = render(<Badge dot count={5} />);
    expect(queryByText("5")).toBeNull();
    expect(mark(container)).toContain("--color-signal-danger");
  });

  it("content 覆盖 count 渲染自定义内容", () => {
    const { getByText, queryByText } = render(<Badge count={9} content="VIP" />);
    expect(getByText("VIP")).toBeTruthy();
    expect(queryByText("9")).toBeNull();
  });

  it("invisible 隐藏角标但保留子元素", () => {
    const { getByText, queryByText } = render(
      <Badge count={5} invisible>
        <span>头像</span>
      </Badge>,
    );
    expect(getByText("头像")).toBeTruthy();
    expect(queryByText("5")).toBeNull();
  });

  it("包裹模式：子元素保留 + 角标绝对定位", () => {
    const { getByText, container } = render(
      <Badge count={5}>
        <span>铃铛</span>
      </Badge>,
    );
    expect(getByText("铃铛")).toBeTruthy();
    const mark = container.querySelector(".absolute");
    expect(mark).toBeTruthy();
    expect(mark!.textContent).toBe("5");
  });

  it("包裹模式角标带 ring 描边分离宿主", () => {
    const { container } = render(
      <Badge count={1}>
        <span>x</span>
      </Badge>,
    );
    expect(container.querySelector(".ring-bg")).toBeTruthy();
  });

  it("tone=success 绿底（头像绿勾场景）", () => {
    const { container } = render(
      <Badge tone="success" content="✓">
        <span>EM</span>
      </Badge>,
    );
    expect(mark(container)).toContain("--color-signal-success");
  });

  it("placement=bottom-right 锚定右下角", () => {
    const { container } = render(
      <Badge dot placement="bottom-right">
        <span>x</span>
      </Badge>,
    );
    const mark = container.querySelector(".absolute");
    expect(mark!.className).toContain("bottom-0");
    expect(mark!.className).toContain("right-0");
  });
});
