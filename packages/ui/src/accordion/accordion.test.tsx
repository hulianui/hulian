import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "./accordion";

function Three(props: React.ComponentProps<typeof Accordion>) {
  return (
    <Accordion {...props}>
      <AccordionItem value="a">
        <AccordionTrigger>问题一</AccordionTrigger>
        <AccordionPanel>答案一</AccordionPanel>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>问题二</AccordionTrigger>
        <AccordionPanel>答案二</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("trigger 渲染为 button + 文字 + chevron", () => {
    const { getByText } = render(<Three />);
    const trigger = getByText("问题一").closest("button")!;
    expect(trigger).toBeTruthy();
    expect(trigger.querySelector("[data-chevron]")).toBeTruthy();
  });

  it("默认全闭合：trigger aria-expanded=false", () => {
    const { getByText } = render(<Three />);
    expect(getByText("问题一").closest("button")!.getAttribute("aria-expanded")).toBe("false");
  });

  it("点击 trigger 展开对应 item（aria-expanded=true + data-panel-open）", () => {
    const { getByText } = render(<Three />);
    const trigger = getByText("问题一").closest("button")!;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.hasAttribute("data-panel-open")).toBe(true);
  });

  it("multiple=false（单开）：开第二个时第一个自动闭合", () => {
    const { getByText } = render(<Three multiple={false} defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    const t2 = getByText("问题二").closest("button")!;
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(t2);
    expect(t2.getAttribute("aria-expanded")).toBe("true");
    expect(t1.getAttribute("aria-expanded")).toBe("false");
  });

  it("multiple=true（多开）：两个可同时展开", () => {
    const { getByText } = render(<Three multiple defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    const t2 = getByText("问题二").closest("button")!;
    fireEvent.click(t2);
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    expect(t2.getAttribute("aria-expanded")).toBe("true");
  });

  it("可折叠：再次点击已开 item 可收起", () => {
    const { getByText } = render(<Three defaultValue={["a"]} />);
    const t1 = getByText("问题一").closest("button")!;
    expect(t1.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(t1);
    expect(t1.getAttribute("aria-expanded")).toBe("false");
  });

  it("Panel 皮肤带高度过渡钩子（var 高度 + overflow-hidden + ending 塌零）", () => {
    const { getByText } = render(<Three defaultValue={["a"]} />);
    const panel = getByText("答案一").closest("[role='region']")!;
    expect(panel.className).toContain("overflow-hidden");
    expect(panel.className).toContain("h-[var(--accordion-panel-height)]");
    expect(panel.className).toContain("data-[ending-style]:h-0");
  });

  it("chevron 带 group-data-[panel-open] 旋转钩子", () => {
    const { getByText } = render(<Three />);
    const chevron = getByText("问题一").closest("button")!.querySelector("[data-chevron]")!;
    expect(chevron.getAttribute("class")).toContain("group-data-[panel-open]:rotate-180");
  });

  it("容器皮肤：border + 圆角 + item 间分隔", () => {
    const { container } = render(<Three />);
    const root = container.firstElementChild!;
    expect(root.className).toContain("border");
    expect(root.className).toContain("divide-y");
  });
});
