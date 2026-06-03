import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Statistic, formatCountdown, formatStatistic } from "./statistic";

afterEach(cleanup);

describe("formatStatistic（纯函数）", () => {
  it("number 走千分位", () => {
    expect(formatStatistic(112893)).toBe("112,893");
  });
  it("precision 控制小数位", () => {
    expect(formatStatistic(89234.5, 2)).toBe("89,234.50");
  });
  it("groupSeparator=false 不分组", () => {
    expect(formatStatistic(112893, 0, false)).toBe("112893");
  });
  it("string 原样返回", () => {
    expect(formatStatistic("1,234 万")).toBe("1,234 万");
  });
});

describe("formatCountdown（纯函数）", () => {
  it("默认 HH:mm:ss 补零", () => {
    expect(formatCountdown(3 * 3600_000 + 5 * 60_000 + 9 * 1000)).toBe("03:05:09");
  });
  it("负数 clamp 到 0", () => {
    expect(formatCountdown(-5000)).toBe("00:00:00");
  });
  it("含 D 时 H 为天内小时", () => {
    // 1 天 2 小时 3 分 4 秒
    const ms = 86_400_000 + 2 * 3600_000 + 3 * 60_000 + 4 * 1000;
    expect(formatCountdown(ms, "D 天 HH:mm:ss")).toBe("1 天 02:03:04");
  });
  it("无 D 时 H 为总小时（可超 24）", () => {
    expect(formatCountdown(26 * 3600_000, "HH:mm:ss")).toBe("26:00:00");
  });
});

describe("Statistic 组件", () => {
  it("渲标题 + 格式化数值", () => {
    const { container } = render(<Statistic title="活跃用户" value={112893} />);
    expect(container.textContent).toContain("活跃用户");
    expect(container.textContent).toContain("112,893");
  });

  it("前后缀渲出", () => {
    const { container } = render(<Statistic value={68.4} precision={1} prefix="￥" suffix="%" />);
    expect(container.textContent).toContain("￥");
    expect(container.textContent).toContain("68.4");
    expect(container.textContent).toContain("%");
  });

  it("valueStyle 应用到数值行", () => {
    const { container } = render(<Statistic value={1} valueStyle={{ color: "rgb(1, 2, 3)" }} />);
    const row = container.querySelector('[style*="color"]') as HTMLElement;
    expect(row).not.toBeNull();
    expect(row.style.color).toBe("rgb(1, 2, 3)");
  });

  it("Countdown 递减并到期触发 onFinish（一次）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
    const onFinish = vi.fn();
    const { container } = render(<Statistic.Countdown deadline={3000} onFinish={onFinish} />);
    // 挂载即算：3000ms → 00:00:03
    expect(container.textContent).toContain("00:00:03");
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(container.textContent).toContain("00:00:02");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(container.textContent).toContain("00:00:00");
    expect(onFinish).toHaveBeenCalledOnce();
    // 再推进不应重复触发
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(onFinish).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });
});
