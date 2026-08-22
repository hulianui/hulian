import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { DEFAULT_GRADES, type Grade } from "../score-ring/score-ring.grade";
import { toSegments, toPercent } from "./score-scale.geometry";
import { ScoreScale } from "./score-scale";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

// 信誉评分四档：0-29 差 / 30-59 一般 / 60-79 良好 / 80-100 优秀（与 issue 里那张实物卡同口径，36 分落「一般」）。
const CREDIT_GRADES: Grade[] = [
  { min: 80, label: "优秀", tone: "success" },
  { min: 60, label: "良好", tone: "chart-2" },
  { min: 30, label: "一般", tone: "warning" },
  { min: 0, label: "差", tone: "danger" },
];

const widths = (container: HTMLElement) =>
  [...container.querySelectorAll<HTMLElement>('[data-slot="segment"]')].map((el) => el.style.width);

describe("toSegments", () => {
  it("段宽由 grades 的区间宽度推出，与 value 无关", () => {
    const segs = toSegments(CREDIT_GRADES, 0, 100);
    expect(segs.map((s) => s.label)).toEqual(["差", "一般", "良好", "优秀"]);
    expect(segs.map((s) => s.widthPercent)).toEqual([30, 30, 20, 20]);
  });
  it("段宽之和恒为 100", () => {
    const total = toSegments(DEFAULT_GRADES, 0, 100).reduce((s, x) => s + x.widthPercent, 0);
    expect(total).toBeCloseTo(100, 10);
  });
  it("最低档向下补到量程起点，轨道不留无主空白", () => {
    const segs = toSegments([{ min: 20, label: "低" }, { min: 60, label: "高" }], 0, 100);
    expect(segs[0].from).toBe(0);
    expect(segs.map((s) => s.widthPercent)).toEqual([60, 40]);
  });
  it("整档落在量程外的直接丢掉", () => {
    const segs = toSegments([{ min: 0, label: "低" }, { min: 300, label: "高" }], 0, 100);
    expect(segs.map((s) => s.label)).toEqual(["低"]);
  });
  it("min 非 0 的量程按跨度归一（体检指标 60–200）", () => {
    const segs = toSegments([{ min: 60, label: "正常" }, { min: 130, label: "偏高" }], 60, 200);
    expect(segs.map((s) => s.widthPercent)).toEqual([50, 50]);
  });
  it("空 grades / 零跨度不产段", () => {
    expect(toSegments([], 0, 100)).toEqual([]);
    expect(toSegments(DEFAULT_GRADES, 50, 50)).toEqual([]);
  });
});

describe("toPercent", () => {
  it("按 value 定位，与段宽无关", () => expect(toPercent(36, 0, 100)).toBe(36));
  it("min 非 0 时按跨度归一", () => expect(toPercent(130, 60, 200)).toBe(50));
  it("越界夹到端点", () => {
    expect(toPercent(120, 0, 100)).toBe(100);
    expect(toPercent(-30, 0, 100)).toBe(0);
  });
  it("零跨度回落 0", () => expect(toPercent(5, 5, 5)).toBe(0));
});

describe("ScoreScale", () => {
  // 回归护栏：ScoreScale 若被改回普通函数组件（去掉 memo），这条立刻红。
  it("稳定父更新时跳过评分尺子树", async () => {
    await expectMemoSkipsSubtree(() => <ScoreScale value={36} max={100} size="md" />);
  });

  it("段宽由 grades 推出，不是按 value 填充", () => {
    const { container } = render(<ScoreScale value={36} grades={CREDIT_GRADES} />);
    // 36 分若走 Meter 的填充逻辑，条上只会有 36% / 64% 两段。
    expect(widths(container)).toEqual(["30%", "30%", "20%", "20%"]);
  });

  it("同一份 grades 下改 value 只动游标，不动段宽", () => {
    const a = render(<ScoreScale value={12} grades={CREDIT_GRADES} />);
    const b = render(<ScoreScale value={91} grades={CREDIT_GRADES} />);
    expect(widths(a.container)).toEqual(widths(b.container));
    expect(a.container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("12%");
    expect(b.container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("91%");
  });

  it("游标位置按 min/max 归一", () => {
    const { container } = render(<ScoreScale value={130} min={60} max={200} />);
    expect(container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("50%");
  });

  it("越界夹到端点，aria-valuenow 不越界", () => {
    const { container } = render(<ScoreScale value={137} grades={CREDIT_GRADES} />);
    expect(container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("100%");
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuenow")).toBe("100");
    // 但 valuetext 说实话：念的是原始 137。
    expect(meter.getAttribute("aria-valuetext")).toContain("137");
  });

  it("负向越界同样夹到起点", () => {
    const { container } = render(<ScoreScale value={-8} grades={CREDIT_GRADES} />);
    expect(container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("0%");
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toContain("-8");
  });

  it("role=meter + aria-valuenow/min/max", () => {
    const { container } = render(<ScoreScale value={36} min={0} max={100} />);
    const meter = container.querySelector('[role="meter"]')!;
    expect(meter.getAttribute("aria-valuenow")).toBe("36");
    expect(meter.getAttribute("aria-valuemin")).toBe("0");
    expect(meter.getAttribute("aria-valuemax")).toBe("100");
  });

  it("aria-valuetext 含等级文字（分档信息不只活在颜色里）", () => {
    const { container } = render(<ScoreScale value={36} grades={CREDIT_GRADES} />);
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toBe(
      "36 / 100, 一般",
    );
  });

  it("formatValueText 可换成中文量词句", () => {
    const { container } = render(
      <ScoreScale
        value={36}
        grades={CREDIT_GRADES}
        formatValueText={({ value, grade }) => `${value} 分，${grade?.label ?? ""}`}
      />,
    );
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-valuetext")).toBe(
      "36 分，一般",
    );
  });

  it("字符串 label 兼作读屏名", () => {
    const { container } = render(<ScoreScale value={36} label="信誉评分" />);
    expect(container.querySelector('[role="meter"]')!.getAttribute("aria-label")).toBe("信誉评分");
  });

  it("自定义 grades 生效：等级字与默认 A-F 不同", () => {
    const { container } = render(<ScoreScale value={36} grades={CREDIT_GRADES} />);
    expect(container.textContent).toContain("一般");
    expect(container.textContent).not.toContain("F");
  });

  it("默认 grades 走 ScoreRing 那套 A-F", () => {
    const { container } = render(<ScoreScale value={95} />);
    expect(container.textContent).toContain("A");
    expect(widths(container)).toEqual(["60%", "10%", "10%", "10%", "10%"]);
  });

  it("showGrade={false} 不显等级字", () => {
    const { container } = render(<ScoreScale value={36} grades={CREDIT_GRADES} showGrade={false} />);
    expect(container.textContent).not.toContain("一般");
  });

  it("showRange 标出量程端点", () => {
    const { container } = render(<ScoreScale value={36} min={0} max={100} showRange />);
    expect(container.textContent).toContain("0");
    expect(container.textContent).toContain("100");
  });

  it("markers 按值定位并可带标注", () => {
    const { container } = render(
      <ScoreScale value={36} markers={[{ value: 62, label: "行业均值 62" }]} />,
    );
    const marker = container.querySelector<HTMLElement>('[data-slot="marker"]')!;
    expect(marker.style.left).toBe("62%");
    expect(container.textContent).toContain("行业均值 62");
  });

  it("空 grades 不炸，只剩轨道与游标", () => {
    const { container } = render(<ScoreScale value={36} grades={[]} />);
    expect(widths(container)).toEqual([]);
    expect(container.querySelector<HTMLElement>('[data-slot="cursor"]')!.style.left).toBe("36%");
  });
});
