import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { RelativeTime, formatRelative, formatAbsolute } from "./relative-time";

const now = new Date("2026-06-05T12:00:00Z");
const ago = (sec: number) => new Date(now.getTime() - sec * 1000);
const after = (sec: number) => new Date(now.getTime() + sec * 1000);

describe("formatRelative（中文·过去）", () => {
  it("5 秒内 → 刚刚", () => {
    expect(formatRelative(ago(3), now)).toBe("刚刚");
  });
  it("秒级", () => expect(formatRelative(ago(30), now)).toBe("30秒前"));
  it("分钟级", () => expect(formatRelative(ago(5 * 60), now)).toBe("5分钟前"));
  it("小时级", () => expect(formatRelative(ago(3 * 3600), now)).toBe("3小时前"));
  it("1 天 → 昨天", () => expect(formatRelative(ago(86400 + 100), now)).toBe("昨天"));
  it("多天", () => expect(formatRelative(ago(5 * 86400), now)).toBe("5天前"));
  it("月级", () => expect(formatRelative(ago(70 * 86400), now)).toBe("2个月前"));
  it("年级", () => expect(formatRelative(ago(800 * 86400), now)).toBe("2年前"));
});

describe("formatRelative（中文·未来）", () => {
  it("分钟后", () => expect(formatRelative(after(10 * 60), now)).toBe("10分钟后"));
  it("1 天后 → 明天", () => expect(formatRelative(after(86400 + 100), now)).toBe("明天"));
});

describe("formatRelative（英文）", () => {
  it("过去分钟", () => expect(formatRelative(ago(5 * 60), now, "en")).toBe("5m ago"));
  it("未来分钟带 in 前缀", () => expect(formatRelative(after(5 * 60), now, "en")).toBe("in 5m"));
  it("just now", () => expect(formatRelative(ago(2), now, "en")).toBe("just now"));
});

describe("formatAbsolute", () => {
  it("YYYY-MM-DD HH:mm 本地格式", () => {
    const d = new Date(2026, 5, 5, 9, 7); // 本地构造避免时区漂移
    expect(formatAbsolute(d)).toBe("2026-06-05 09:07");
  });
});

describe("RelativeTime 组件", () => {
  it("用 base 固定基准渲染相对串 + dateTime + title", () => {
    const { getByText } = render(<RelativeTime value={ago(5 * 60)} base={now} />);
    const el = getByText("5分钟前");
    expect(el.tagName.toLowerCase()).toBe("time");
    expect(el.getAttribute("dateTime")).toBe(ago(5 * 60).toISOString());
    expect(el.getAttribute("title")).toBeTruthy();
  });

  it("withTitle=false 不挂 title", () => {
    const { getByText } = render(<RelativeTime value={ago(60)} base={now} withTitle={false} />);
    expect(getByText("1分钟前").getAttribute("title")).toBeNull();
  });

  it("接受 ISO 字符串与时间戳", () => {
    const { getByText } = render(
      <RelativeTime value={ago(3600).toISOString()} base={now.getTime()} />,
    );
    expect(getByText("1小时前")).toBeTruthy();
  });

  it("locale 缺省时跟随 ConfigProvider，显式 prop 仍优先", () => {
    const { getByText } = render(
      <ConfigProvider locale={enUS}>
        <RelativeTime value={ago(5 * 60)} base={now} />
        <RelativeTime value={ago(5 * 60)} base={now} locale="zh" />
      </ConfigProvider>,
    );
    expect(getByText("5m ago")).toBeTruthy();
    expect(getByText("5分钟前")).toBeTruthy();
  });
});

describe("时钟基准（#181 同类）", () => {
  it("首帧不读系统时钟：相隔半年的两次 renderToString 产物逐字节相同", async () => {
    const { renderToString } = await import("react-dom/server");
    const target = ago(5 * 60);
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const atBuildTime = renderToString(<RelativeTime value={target} />);
    vi.setSystemTime(new Date("2027-01-01T00:00:00Z"));
    const halfYearLater = renderToString(<RelativeTime value={target} />);
    vi.useRealTimers();
    // 服务端那一帧只由 value 决定；否则构建时刻就被烤进静态产物
    expect(atBuildTime).toBe(halfYearLater);
  });

  it("无 base 时首帧落绝对时间（无 JS 时的正确降级），不含相对串", async () => {
    const { renderToString } = await import("react-dom/server");
    const target = ago(5 * 60);
    const html = renderToString(<RelativeTime value={target} />);
    expect(html).toContain(formatAbsolute(target));
    expect(html).not.toContain("5分钟前");
  });

  it("挂载后换成相对串", () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const { getByText } = render(<RelativeTime value={ago(5 * 60)} />);
    expect(getByText("5分钟前")).toBeTruthy();
    vi.useRealTimers();
  });

  it("传 base 时首帧就是相对串（基准由消费方钉死，SSR 确定）", async () => {
    const { renderToString } = await import("react-dom/server");
    const html = renderToString(<RelativeTime value={ago(5 * 60)} base={now} />);
    expect(html).toContain("5分钟前");
  });
});
