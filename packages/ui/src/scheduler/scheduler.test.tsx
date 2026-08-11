import { describe, it, expect, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { Scheduler } from "./scheduler";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import type { SchedulerEvent, SchedulerResource } from "./scheduler.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

afterEach(cleanup);

const DATE = "2026-06-03"; // 周三
const events: SchedulerEvent[] = [
  { id: "a", title: "复诊", start: "2026-06-03T09:00:00", end: "2026-06-03T09:30:00", resourceId: "d1", tone: "primary" },
  { id: "b", title: "初诊", start: "2026-06-03T10:00:00", end: "2026-06-03T11:00:00", resourceId: "d2", tone: "success" },
];
const resources: SchedulerResource[] = [
  { id: "d1", title: "李医生" },
  { id: "d2", title: "王医生" },
];

const base = { events, date: DATE, resources, onViewChange: () => {}, onDateChange: () => {} };

describe("Scheduler 渲染", () => {
  it("稳定父组件更新时跳过排班子树", async () => {
    await expectMemoSkipsSubtree(() => <Scheduler {...base} view="week" />);
  });

  it("uses English toolbar, weekday, and date formatting from ConfigProvider", () => {
    const { getByLabelText, getByText } = render(
      <ConfigProvider locale={enUS}>
        <Scheduler {...base} view="week" />
      </ConfigProvider>,
    );
    expect(getByLabelText("Previous")).not.toBeNull();
    expect(getByLabelText("Next")).not.toBeNull();
    expect(getByLabelText("View switcher")).not.toBeNull();
    expect(getByText("Mon")).not.toBeNull();
    expect(getByText("Jun 1 – Jun 7")).not.toBeNull();
  });

  it("keeps Chinese fallback for legacy component dictionaries without scheduler labels", () => {
    const locale = { ...enUS, components: { ...enUS.components!, scheduler: undefined } };
    const { getByLabelText, getByText } = render(
      <ConfigProvider locale={locale}>
        <Scheduler {...base} view="week" />
      </ConfigProvider>,
    );
    expect(getByLabelText("上一个")).not.toBeNull();
    expect(getByText("周一")).not.toBeNull();
  });

  it("月视图渲染事件 chip", () => {
    const { getAllByTitle } = render(<Scheduler {...base} view="month" />);
    expect(getAllByTitle("复诊").length).toBeGreaterThan(0);
  });

  it("周视图渲染 7 列表头", () => {
    const { getByText } = render(<Scheduler {...base} view="week" />);
    expect(getByText("周一")).not.toBeNull();
    expect(getByText("周日")).not.toBeNull();
  });

  it("日视图只渲染焦点日的事件", () => {
    const { getByTitle } = render(<Scheduler {...base} view="day" />);
    // title 含时间段
    expect(getByTitle(/复诊 · 09:00–09:30/)).not.toBeNull();
  });

  it("资源视图按 resourceId 归列：每资源各显自己的事件", () => {
    const { getByText, getByTitle } = render(<Scheduler {...base} view="resource" />);
    expect(getByText("李医生")).not.toBeNull();
    expect(getByText("王医生")).not.toBeNull();
    expect(getByTitle(/复诊/)).not.toBeNull();
    expect(getByTitle(/初诊/)).not.toBeNull();
  });

  it("toolbar=false 不渲染视图切换", () => {
    const { queryByLabelText } = render(<Scheduler {...base} view="week" toolbar={false} />);
    expect(queryByLabelText("视图切换")).toBeNull();
  });

  it("点上一个/下一个触发 onDateChange", () => {
    const onDateChange = vi.fn();
    const { getByLabelText } = render(<Scheduler {...base} view="week" onDateChange={onDateChange} />);
    fireEvent.click(getByLabelText("下一个"));
    expect(onDateChange).toHaveBeenCalledTimes(1);
    // 周视图步进 7 天
    expect(onDateChange).toHaveBeenCalledWith("2026-06-10");
  });

  it("月视图点事件 chip 触发 onEventClick", () => {
    const onEventClick = vi.fn();
    const { getByTitle } = render(<Scheduler {...base} view="month" onEventClick={onEventClick} />);
    fireEvent.click(getByTitle("复诊"));
    expect(onEventClick).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("Scheduler · null 回落", () => {
  it("resources 传 null 不抛错", () => {
    const { container } = render(<Scheduler {...base} resources={null as never} view="month" />);
    expect(container.firstElementChild).not.toBeNull();
  });
});


// #181：渲染期读系统时钟，在 SSR / 静态导出下构建日与访问日跨天必然 hydration 失败。
describe("时钟基准（#181）", () => {
  it("首帧不读系统时钟：renderToString 的产物里没有当前时刻线", async () => {
    const { renderToString } = await import("react-dom/server");
    const spy = vi.spyOn(Date.prototype, "getTime");
    const html = renderToString(
      <Scheduler view="week" date={DATE} events={events} resources={resources} />,
    );
    // 服务端渲染那一帧不含「此刻」线（它由 nowISO 驱动，首帧 nowISO 为空）
    expect(html).not.toContain("data-now-line");
    spy.mockRestore();
  });

  it("挂载后才补上当前时刻线（钉住系统时钟避免用例本身随跑测时间飘）", () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(`${DATE}T10:00:00`));
    try {
      const { container } = render(
        <Scheduler view="day" date={DATE} events={[]} resources={resources} />,
      );
      expect(container.querySelector("[data-now-line]")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("传 now 就完全由消费方钉死（截图回归可复现）", () => {
    const { container } = render(
      <Scheduler
        view="day"
        date={DATE}
        now={`${DATE}T10:00:00`}
        events={events}
        resources={resources}
      />,
    );
    expect(container.querySelector("[data-now-line]")).toBeTruthy();
  });

  it("now 指向别的日期时，当天视图里不画时刻线", () => {
    const { container } = render(
      <Scheduler
        view="day"
        date={DATE}
        now="2026-07-01T10:00:00"
        events={events}
        resources={resources}
      />,
    );
    expect(container.querySelector("[data-now-line]")).toBeNull();
  });
});
