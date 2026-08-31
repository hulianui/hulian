import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { QuestionCard } from "./question-card";

describe("QuestionCard", () => {
  it("题干里的数学记号交给 KaTeX 排版，填空槽渲染成空位", () => {
    const { container } = render(
      <QuestionCard stem={"将\\frac{3}{8}化成小数为____。"} type="blank" />,
    );
    expect(container.querySelector(".katex")).not.toBeNull();
    expect(container.querySelector('[role="img"]')).not.toBeNull();
    expect(container.textContent).not.toContain("____");
  });

  it("选项按 key 逐条渲染（新形状）", () => {
    render(
      <QuestionCard
        stem="下列说法正确的是( )。"
        type="single"
        options={[
          { key: "A", text: "排序" },
          { key: "B", text: "标号" },
        ]}
      />,
    );
    expect(screen.getByText("排序")).toBeTruthy();
    expect(screen.getByText("A.")).toBeTruthy();
  });

  it("旧形状 {label,text} 仍能渲染", () => {
    render(<QuestionCard stem="题干" options={[{ label: "A", text: "旧" }]} />);
    expect(screen.getByText("旧")).toBeTruthy();
    expect(screen.getByText("A.")).toBeTruthy();
  });

  it("题型标签走 Locale：默认中文，enUS 下英文", () => {
    render(<QuestionCard stem="题干" type="short_answer" />);
    expect(screen.getByText("简答")).toBeTruthy();
    render(
      <ConfigProvider locale={enUS}>
        <QuestionCard stem="stem" type="short_answer" />
      </ConfigProvider>,
    );
    expect(screen.getByText("Short answer")).toBeTruthy();
  });

  it("typeLabel 覆盖内置文案", () => {
    render(<QuestionCard stem="题干" type="single" typeLabel="单项选择" />);
    expect(screen.getByText("单项选择")).toBeTruthy();
  });

  describe("kind 兼容一版", () => {
    afterEach(() => vi.restoreAllMocks());
    it("kind 映射到七型", () => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
      render(<QuestionCard stem="题干" kind="fill" />);
      expect(screen.getByText("填空")).toBeTruthy();
    });
    it("kind 与 type 同时给时以 type 为准", () => {
      render(<QuestionCard stem="题干" kind="fill" type="essay" />);
      expect(screen.getByText("解答")).toBeTruthy();
    });
  });

  describe("答案 / 解析区", () => {
    it("默认不渲染（学生作答前不能泄题）", () => {
      const { container } = render(<QuestionCard stem="题干" type="single" answer="A" analysis="因为" />);
      expect(container.querySelector('[data-slot="question-answer"]')).toBeNull();
    });
    it("showAnswer 时按形状渲染答案与解析", () => {
      render(
        <QuestionCard
          stem="题干"
          type="blank"
          answer={[["150", "150°"], "30"]}
          analysis="由内角和得"
          showAnswer
        />,
      );
      expect(screen.getByText("答案")).toBeTruthy();
      expect(screen.getByText(/第1空：150 \/ 150°；第2空：30/)).toBeTruthy();
      expect(screen.getByText("解析")).toBeTruthy();
      expect(screen.getByText(/由内角和得/)).toBeTruthy();
    });
    it("判断题答案渲染成正确 / 错误", () => {
      render(<QuestionCard stem="题干" type="judge" answer={false} showAnswer />);
      expect(screen.getByText(/错误/)).toBeTruthy();
    });
  });

  it("有质量标记时亮出警示边条与标记名", () => {
    const { container } = render(<QuestionCard stem="题干" issues={[{ label: "选项不全" }]} />);
    expect(screen.getByText("选项不全")).toBeTruthy();
    expect(container.querySelector(".border-l-warning")).toBeTruthy();
  });

  it("无质量标记时不加边条", () => {
    const { container } = render(<QuestionCard stem="题干" />);
    expect(container.querySelector(".border-l-warning")).toBeNull();
  });

  it("compact 模式收起小问与出处", () => {
    render(<QuestionCard stem="题干" parts={["(1)第一问"]} source="某书 p3" compact />);
    expect(screen.queryByText("(1)第一问")).toBeNull();
    expect(screen.queryByText("某书 p3")).toBeNull();
  });
});
