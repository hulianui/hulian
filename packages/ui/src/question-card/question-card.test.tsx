import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { QuestionCard } from "./question-card";

describe("QuestionCard", () => {
  it("题干里的数学记号渲染成版式而不是原始记号", () => {
    const { container } = render(
      <QuestionCard stem={"将\\frac{3}{8}化成小数为____。"} kind="fill" />,
    );
    expect(container.textContent).not.toContain("\\frac");
    expect(container.textContent).not.toContain("____");
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("8")).toBeTruthy();
  });

  it("选项按标号逐条渲染", () => {
    render(
      <QuestionCard
        stem="下列说法正确的是( )。"
        kind="choice"
        options={[
          { label: "A", text: "排序" },
          { label: "B", text: "标号" },
        ]}
      />,
    );
    expect(screen.getByText("排序")).toBeTruthy();
    expect(screen.getByText("标号")).toBeTruthy();
  });

  it("有质量标记时亮出警示边条与标记名", () => {
    const { container } = render(
      <QuestionCard stem="题干" issues={[{ label: "选项不全" }]} />,
    );
    expect(screen.getByText("选项不全")).toBeTruthy();
    expect(container.querySelector(".border-l-warning")).toBeTruthy();
  });

  it("无质量标记时不加边条", () => {
    const { container } = render(<QuestionCard stem="题干" />);
    expect(container.querySelector(".border-l-warning")).toBeNull();
  });

  it("compact 模式收起小问与出处", () => {
    render(
      <QuestionCard stem="题干" parts={["(1)第一问"]} source="某书 p3" compact />,
    );
    expect(screen.queryByText("(1)第一问")).toBeNull();
    expect(screen.queryByText("某书 p3")).toBeNull();
  });
})
