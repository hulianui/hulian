import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Timeline, TimelineItem } from "./timeline";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

// 无 jest-dom（同 carousel/toast）：用 getAttribute/classList/querySelector 断言，禁 toHaveClass。
const sample = [
  { label: "10:00", children: "提交申请" },
  { label: "11:30", children: "经理审批", color: "primary" as const },
  { label: "14:00", children: "已完成", color: "success" as const },
];

describe("Timeline", () => {
  // 回归护栏：Timeline 外层的 memo 一旦被拆掉，本例立刻红。
  // items 用模块级常量 sample —— memo 只认引用相等，内联数组字面量会让测试假红。
  it("稳定父更新时跳过 Timeline 子树", async () => {
    await expectMemoSkipsSubtree(() => <Timeline items={sample} mode="left" />);
  });

  it("items 数组驱动：渲染 ol + N 个 li", () => {
    const { container } = render(<Timeline items={sample} />);
    const ol = container.querySelector("ol");
    expect(ol).toBeTruthy();
    expect(ol!.querySelectorAll("li").length).toBe(sample.length);
  });

  it("复合用法：TimelineItem 子元素同样渲染 N 个 li", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>甲</TimelineItem>
        <TimelineItem>乙</TimelineItem>
      </Timeline>,
    );
    expect(container.querySelectorAll("li").length).toBe(2);
  });

  it("复合用法过滤非 TimelineItem 子节点", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem>甲</TimelineItem>
        {null}
        <span>噪声</span>
        <TimelineItem>乙</TimelineItem>
      </Timeline>,
    );
    expect(container.querySelectorAll("li").length).toBe(2);
  });

  it("label 与 children 都被渲染", () => {
    const { getByText } = render(<Timeline items={sample} />);
    expect(getByText("10:00")).toBeTruthy();
    expect(getByText("提交申请")).toBeTruthy();
  });

  it("默认圆点按 color 着色（吃 token 类）", () => {
    const { container } = render(
      <Timeline
        items={[
          { children: "a", color: "default" },
          { children: "b", color: "primary" },
          { children: "c", color: "success" },
          { children: "d", color: "danger" },
          { children: "e", color: "warning" },
        ]}
      />,
    );
    expect(container.querySelector(".bg-muted")).toBeTruthy();
    expect(container.querySelector(".bg-primary")).toBeTruthy();
    expect(container.querySelector(".bg-success")).toBeTruthy();
    expect(container.querySelector(".bg-danger")).toBeTruthy();
    expect(container.querySelector(".bg-warning")).toBeTruthy();
  });

  it("color 缺省为 default（bg-muted）", () => {
    const { container } = render(<Timeline items={[{ children: "x" }]} />);
    expect(container.querySelector(".bg-muted")).toBeTruthy();
  });

  it("自定义 dot 替换默认圆点", () => {
    const { container, getByTestId } = render(
      <Timeline items={[{ children: "x", dot: <i data-testid="my-dot" /> }]} />,
    );
    expect(getByTestId("my-dot")).toBeTruthy();
    // 默认圆点不再出现
    expect(container.querySelector(".bg-muted")).toBeNull();
  });

  it("最后一项不画向下连线，非最后项画连线", () => {
    const { container } = render(<Timeline items={sample} />);
    const lis = container.querySelectorAll("li");
    // 每个 li 内最多一条 .border-l 连线
    const lineIn = (li: Element) => li.querySelector(".border-l");
    expect(lineIn(lis[0])).toBeTruthy();
    expect(lineIn(lis[1])).toBeTruthy();
    expect(lineIn(lis[lis.length - 1])).toBeNull();
  });

  it("pending: 追加幽灵末项（加载态圆点）且前一项连线转虚线", () => {
    const { container } = render(<Timeline items={sample} pending />);
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(sample.length + 1); // 多出幽灵项
    // 幽灵项是加载态：含旋转环
    expect(container.querySelector(".animate-spin")).toBeTruthy();
    // 连入幽灵项的那条线（原最后一项 sample[2] 现在变成倒数第二项）是虚线
    const intoPending = lis[sample.length - 1].querySelector(".border-l");
    expect(intoPending).toBeTruthy();
    expect(intoPending!.classList.contains("border-dashed")).toBe(true);
  });

  it("pending 传 ReactNode 作幽灵项内容", () => {
    const { getByText } = render(<Timeline items={sample} pending="处理中…" />);
    expect(getByText("处理中…")).toBeTruthy();
  });

  it("pending=false（默认）不追加幽灵项、无旋转环", () => {
    const { container } = render(<Timeline items={sample} />);
    expect(container.querySelectorAll("li").length).toBe(sample.length);
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  it("mode=alternate：奇偶项落在中轴两侧（含居中 spacer）", () => {
    const { container } = render(<Timeline items={sample} mode="alternate" />);
    // alternate 每个 li 都有一个 flex-1 的空白半区做对称（与 left/right 不同）
    const spacers = container.querySelectorAll("li > .flex-1");
    expect(spacers.length).toBeGreaterThanOrEqual(sample.length);
  });

  it("透传 className 到根 ol，其它属性透传", () => {
    const { container } = render(<Timeline items={sample} className="my-tl" aria-label="审批流" />);
    const ol = container.querySelector("ol")!;
    expect(ol.classList.contains("my-tl")).toBe(true);
    expect(ol.getAttribute("aria-label")).toBe("审批流");
  });
});
