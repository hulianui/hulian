import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { resolveGrade, DEFAULT_GRADES } from "./score-ring.grade";
import { ScoreRing } from "./score-ring";

describe("resolveGrade", () => {
  it("95 → A", () => expect(resolveGrade(95).label).toBe("A"));
  it("82 → B", () => expect(resolveGrade(82).label).toBe("B"));
  it("72 → C", () => expect(resolveGrade(72).label).toBe("C"));
  it("65 → D", () => expect(resolveGrade(65).label).toBe("D"));
  it("40 → F", () => expect(resolveGrade(40).label).toBe("F"));
  it("乱序 grades 也按 min 降序命中", () => {
    const g = resolveGrade(85, [
      { min: 0, label: "low" },
      { min: 80, label: "high" },
    ]);
    expect(g.label).toBe("high");
  });
  it("默认 5 档", () => expect(DEFAULT_GRADES.length).toBe(5));
});

describe("ScoreRing", () => {
  it("渲染分值 + 等级", () => {
    const { container } = render(<ScoreRing value={88} />);
    expect(container.textContent).toContain("88");
    expect(container.textContent).toContain("B");
  });
  it("role=meter + aria-valuenow", () => {
    const { container } = render(<ScoreRing value={73} />);
    const m = container.querySelector('[role="meter"]')!;
    expect(m.getAttribute("aria-valuenow")).toBe("73");
  });
  it("两个 circle（背景 + 前景进度）", () => {
    const { container } = render(<ScoreRing value={50} />);
    expect(container.querySelectorAll("circle").length).toBe(2);
  });
  it("前景进度用 dashoffset 而非 transform 控制", () => {
    const { container } = render(<ScoreRing value={50} />);
    const fg = container.querySelectorAll("circle")[1];
    expect(fg.getAttribute("stroke-dashoffset")).toBeTruthy();
    expect(fg.className.baseVal ?? "").not.toMatch(/translate|scale/);
  });
  it("showGrade=false 不显等级字", () => {
    const { container } = render(<ScoreRing value={88} showGrade={false} />);
    expect(container.textContent).not.toContain("B");
  });
});
