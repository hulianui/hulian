import { describe, it, expect } from "vitest";
import {
  clamp,
  dateOf,
  eventRect,
  hourLines,
  layoutColumns,
  minutesOfDay,
  minutesToISO,
  monthMatrix,
  resourceColumns,
  snap,
  startOfWeekISO,
  weekColumns,
  yToMinutes,
} from "./scheduler-geometry";

describe("minutesOfDay", () => {
  it("ISO 时分 → 当日分钟数", () => {
    expect(minutesOfDay("2026-06-05T08:00:00")).toBe(480);
    expect(minutesOfDay("2026-06-05T09:30:00")).toBe(570);
    expect(minutesOfDay("2026-06-05T00:00:00")).toBe(0);
  });
});

describe("snap", () => {
  it("吸附到最近网格", () => {
    expect(snap(497, 30)).toBe(510); // 8:17 → 8:30
    expect(snap(484, 30)).toBe(480); // 8:04 → 8:00
    expect(snap(495, 30)).toBe(510); // 8:15 → 8:30(四舍五入)
  });
  it("step<=0 原样返回", () => {
    expect(snap(123, 0)).toBe(123);
  });
});

describe("dateOf / minutesToISO 往返", () => {
  it("dateOf 取日期段", () => {
    expect(dateOf("2026-06-05T09:30:00")).toBe("2026-06-05");
  });
  it("minutesToISO 组合日期+分钟，hour() 稳定", () => {
    const iso = minutesToISO("2026-06-05", 570); // 9:30
    expect(minutesOfDay(iso)).toBe(570);
    expect(dateOf(iso)).toBe("2026-06-05");
  });
});

describe("eventRect", () => {
  it("按分钟线性映射 top/height", () => {
    // dayStart=480(8:00), pxPerMin=1 → 9:00 事件 top=60
    const r = eventRect(540, 600, 480, 1);
    expect(r.top).toBe(60);
    expect(r.height).toBe(60);
  });
  it("零时长至少 1px 高", () => {
    expect(eventRect(540, 540, 480, 1).height).toBe(1);
  });
});

describe("yToMinutes", () => {
  it("落点 px → 分钟并 clamp", () => {
    expect(yToMinutes(60, 480, 1200, 1)).toBe(540); // 8:00 + 60px = 9:00
    expect(yToMinutes(-100, 480, 1200, 1)).toBe(480); // clamp 下限
    expect(yToMinutes(99999, 480, 1200, 1)).toBe(1200); // clamp 上限
  });
});

describe("clamp", () => {
  it("夹在区间内", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("layoutColumns 重叠并排", () => {
  it("不重叠 → 各占满（cols=1）", () => {
    const m = layoutColumns([
      { id: "a", start: "2026-06-05T08:00", end: "2026-06-05T09:00" },
      { id: "b", start: "2026-06-05T09:00", end: "2026-06-05T10:00" },
    ]);
    expect(m.get("a")).toEqual({ col: 0, cols: 1 });
    expect(m.get("b")).toEqual({ col: 0, cols: 1 });
  });

  it("两两重叠 → 并排两列", () => {
    const m = layoutColumns([
      { id: "a", start: "2026-06-05T08:00", end: "2026-06-05T09:30" },
      { id: "b", start: "2026-06-05T09:00", end: "2026-06-05T10:00" },
    ]);
    expect(m.get("a")).toEqual({ col: 0, cols: 2 });
    expect(m.get("b")).toEqual({ col: 1, cols: 2 });
  });

  it("三事件同簇并发 3 列", () => {
    const m = layoutColumns([
      { id: "a", start: "2026-06-05T08:00", end: "2026-06-05T11:00" },
      { id: "b", start: "2026-06-05T08:30", end: "2026-06-05T11:00" },
      { id: "c", start: "2026-06-05T09:00", end: "2026-06-05T11:00" },
    ]);
    expect(m.get("a")?.cols).toBe(3);
    expect(m.get("b")?.cols).toBe(3);
    expect(m.get("c")?.cols).toBe(3);
    expect(new Set([m.get("a")?.col, m.get("b")?.col, m.get("c")?.col])).toEqual(
      new Set([0, 1, 2]),
    );
  });

  it("簇之间独立计 cols", () => {
    const m = layoutColumns([
      { id: "a", start: "2026-06-05T08:00", end: "2026-06-05T09:30" },
      { id: "b", start: "2026-06-05T09:00", end: "2026-06-05T10:00" }, // 与 a 重叠 → 簇1 cols=2
      { id: "c", start: "2026-06-05T11:00", end: "2026-06-05T12:00" }, // 独立 → 簇2 cols=1
    ]);
    expect(m.get("a")?.cols).toBe(2);
    expect(m.get("b")?.cols).toBe(2);
    expect(m.get("c")).toEqual({ col: 0, cols: 1 });
  });

  it("空列回收：a 结束后 c 复用 col 0", () => {
    const m = layoutColumns([
      { id: "a", start: "2026-06-05T08:00", end: "2026-06-05T09:00" },
      { id: "b", start: "2026-06-05T08:30", end: "2026-06-05T10:00" }, // 与 a,c 都重叠 → 撑簇
      { id: "c", start: "2026-06-05T09:00", end: "2026-06-05T10:00" }, // a 已结束，复用 col 0
    ]);
    // a,b,c 同簇（b 横跨），cols=2；c 复用 a 的列
    expect(m.get("a")?.col).toBe(0);
    expect(m.get("b")?.col).toBe(1);
    expect(m.get("c")?.col).toBe(0);
    expect(m.get("c")?.cols).toBe(2);
  });
});

describe("startOfWeekISO", () => {
  it("ISO 周一起", () => {
    // 2026-06-05 是周五 → 当周周一 2026-06-01
    expect(startOfWeekISO("2026-06-05")).toBe("2026-06-01");
    // 周一本身
    expect(startOfWeekISO("2026-06-01")).toBe("2026-06-01");
    // 周日回退到本周周一
    expect(startOfWeekISO("2026-06-07")).toBe("2026-06-01");
  });
});

describe("monthMatrix", () => {
  it("6×7 网格，周一起，首格为含 1 号那周的周一", () => {
    const m = monthMatrix("2026-06-15");
    expect(m).toHaveLength(6);
    expect(m[0]).toHaveLength(7);
    // 2026-06-01 是周一 → 首格即 6/1
    expect(m[0][0]).toBe("2026-06-01");
    // 末格 = 首格 + 41 天
    expect(m[5][6]).toBe("2026-07-12");
  });

  it("跨月补位：上月尾日在首行", () => {
    // 2026-05-01 是周五 → 首行从 4/27(周一) 起
    const m = monthMatrix("2026-05-10");
    expect(m[0][0]).toBe("2026-04-27");
  });
});

describe("weekColumns", () => {
  it("7 列，含星期标签与今日高亮", () => {
    const cols = weekColumns("2026-06-05", "2026-06-03");
    expect(cols).toHaveLength(7);
    expect(cols[0].label).toBe("周一");
    expect(cols[0].dateISO).toBe("2026-06-01");
    const wed = cols.find((c) => c.dateISO === "2026-06-03");
    expect(wed?.isToday).toBe(true);
    expect(cols[0].isToday).toBe(false);
  });
});

describe("resourceColumns", () => {
  it("每资源一列均绑焦点日", () => {
    const cols = resourceColumns("2026-06-05", [
      { id: "d1", title: "李医生", subtitle: "内科" },
      { id: "d2", title: "王医生" },
    ]);
    expect(cols).toHaveLength(2);
    expect(cols[0]).toMatchObject({ resourceId: "d1", label: "李医生", sublabel: "内科", dateISO: "2026-06-05" });
    expect(cols[1].resourceId).toBe("d2");
  });
});

describe("hourLines", () => {
  it("含首尾整点", () => {
    expect(hourLines(8, 12)).toEqual([8, 9, 10, 11, 12]);
  });
});
