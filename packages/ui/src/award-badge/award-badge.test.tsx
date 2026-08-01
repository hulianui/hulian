import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AwardBadge } from "./award-badge";
import { laurelDefaults, laurelLeaves, laurelStemPath } from "./laurel-geometry";

describe("laurelLeaves", () => {
  it("按 count 出叶，坐标全为有限数", () => {
    const leaves = laurelLeaves({ count: 5 });
    expect(leaves).toHaveLength(5);
    for (const l of leaves) {
      expect(Number.isFinite(l.x)).toBe(true);
      expect(Number.isFinite(l.y)).toBe(true);
      expect(l.rx).toBeGreaterThan(0);
      expect(l.ry).toBeGreaterThan(0);
    }
  });

  it("从根到梢逐片收缩", () => {
    const leaves = laurelLeaves();
    for (let i = 1; i < leaves.length; i++) {
      expect(leaves[i].rx).toBeLessThan(leaves[i - 1].rx);
    }
  });

  it("首片在底部、末片在左上（左枝走向）", () => {
    const [first] = laurelLeaves();
    const last = laurelLeaves().at(-1)!;
    expect(first.y).toBeGreaterThan(laurelDefaults.cy); // 底部：y 更大
    expect(last.y).toBeLessThan(laurelDefaults.cy); // 左上：y 更小
    expect(last.x).toBeLessThan(laurelDefaults.cx); // 偏左
  });

  it("叶片旋转角 = 角度 + tilt（径向朝外再向枝梢倾）", () => {
    const [leaf] = laurelLeaves({ count: 1, from: 100, tilt: 30 });
    expect(leaf.rotate).toBe(130);
  });

  it("count 为 0 / 负数时返回空数组（不崩）", () => {
    expect(laurelLeaves({ count: 0 })).toEqual([]);
    expect(laurelLeaves({ count: -3 })).toEqual([]);
  });

  it("单片时不做插值（不出 NaN）", () => {
    const leaves = laurelLeaves({ count: 1 });
    expect(leaves).toHaveLength(1);
    expect(Number.isNaN(leaves[0].x)).toBe(false);
  });
});

describe("laurelStemPath", () => {
  it("输出圆弧 path，跨度 ≤180° 时 large-arc 为 0", () => {
    const d = laurelStemPath();
    expect(d.startsWith("M ")).toBe(true);
    expect(d).toContain(` A ${laurelDefaults.radius} ${laurelDefaults.radius} 0 0 1 `);
  });

  it("跨度 >180° 时 large-arc 置 1", () => {
    expect(laurelStemPath({ from: 0, to: 200 })).toContain(" 0 1 1 ");
  });
});

describe("AwardBadge", () => {
  it("渲染名次 / 前缀小字 / 主标题", () => {
    const { getByText } = render(
      <AwardBadge rank={1} kicker="GitHub Trending" title="#1 Repository Of The Day" />,
    );
    expect(getByText("1")).toBeTruthy();
    expect(getByText("GitHub Trending")).toBeTruthy();
    expect(getByText("#1 Repository Of The Day")).toBeTruthy();
  });

  it("默认画桂冠，wreath=false 关掉", () => {
    const { container } = render(<AwardBadge rank={1} title="Award" />);
    expect(container.querySelectorAll("ellipse").length).toBeGreaterThan(0);
    const { container: bare } = render(<AwardBadge rank={1} title="Award" wreath={false} />);
    expect(bare.querySelectorAll("ellipse")).toHaveLength(0);
  });

  it("emblem 槽替换整枚徽记", () => {
    const { container, getByTestId } = render(
      <AwardBadge title="Award" rank={1} emblem={<span data-testid="trophy" />} />,
    );
    expect(getByTestId("trophy")).toBeTruthy();
    expect(container.querySelectorAll("ellipse")).toHaveLength(0);
  });

  it("徽记区对读屏隐藏（信息由标题承载）", () => {
    const { container } = render(<AwardBadge rank={1} title="Award" />);
    expect(container.querySelector("[aria-hidden]")?.querySelector("svg")).toBeTruthy();
  });

  it("tone 决定描边与文字色", () => {
    const { container } = render(<AwardBadge title="Award" tone="success" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.color).toContain("--color-success");
    expect(root.style.borderColor).toContain("--color-success");
  });

  it("color 逃生舱接管 tone", () => {
    const { container } = render(<AwardBadge title="Award" tone="success" color="chart-2" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.color).toContain("--color-chart-2");
  });

  it("solid 皮肤走实底 + 反色文字", () => {
    const { container } = render(<AwardBadge title="Award" variant="solid" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toContain("--color-primary");
    expect(root.style.color).toContain("--color-primary-foreground");
  });

  it("soft 皮肤用 color-mix 柔填", () => {
    const { container } = render(<AwardBadge title="Award" variant="soft" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.backgroundColor).toContain("color-mix");
  });

  it("href 时整枚成链接，_blank 自动补 rel", () => {
    const { container } = render(
      <AwardBadge title="Award" href="https://example.com" target="_blank" />,
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com");
    expect(a?.getAttribute("rel")).toBe("noreferrer noopener");
  });
});
