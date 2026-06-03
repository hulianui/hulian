import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Collapsible, CollapsibleTrigger, CollapsiblePanel } from "./collapsible";

function Demo(props: React.ComponentProps<typeof Collapsible>) {
  return (
    <Collapsible {...props}>
      <CollapsibleTrigger>标题</CollapsibleTrigger>
      <CollapsiblePanel>正文内容</CollapsiblePanel>
    </Collapsible>
  );
}

describe("Collapsible", () => {
  it("trigger 渲染为 button + chevron", () => {
    const { getByText } = render(<Demo />);
    const trigger = getByText("标题").closest("button")!;
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.querySelector("[data-chevron]")).toBeTruthy();
  });

  it("默认闭合：aria-expanded=false 且面板不挂载", () => {
    const { getByText, queryByText } = render(<Demo />);
    expect(getByText("标题").closest("button")!.getAttribute("aria-expanded")).toBe("false");
    expect(queryByText("正文内容")).toBeNull();
  });

  it("点击展开：aria-expanded=true + data-panel-open + 面板出现", () => {
    const { getByText, queryByText } = render(<Demo />);
    const trigger = getByText("标题").closest("button")!;
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.hasAttribute("data-panel-open")).toBe(true);
    expect(queryByText("正文内容")).toBeTruthy();
  });

  it("defaultOpen：初始即展开", () => {
    const { getByText } = render(<Demo defaultOpen />);
    expect(getByText("标题").closest("button")!.getAttribute("aria-expanded")).toBe("true");
  });

  it("再次点击已开可收起", () => {
    const { getByText } = render(<Demo defaultOpen />);
    const trigger = getByText("标题").closest("button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("onOpenChange 收敛为 (boolean)", () => {
    let v: boolean | undefined;
    const { getByText } = render(<Demo onOpenChange={(o) => (v = o)} />);
    fireEvent.click(getByText("标题").closest("button")!);
    expect(v).toBe(true);
  });

  it("Panel 皮肤带高度过渡钩子（var 高度 + overflow-hidden + ending 塌零）", () => {
    const { getByText } = render(<Demo defaultOpen />);
    const panel = getByText("正文内容").parentElement!;
    expect(panel.className).toContain("overflow-hidden");
    expect(panel.className).toContain("h-[var(--collapsible-panel-height)]");
    expect(panel.className).toContain("data-[ending-style]:h-0");
  });

  it("chevron 带 group-data-[panel-open] 旋转钩子", () => {
    const { getByText } = render(<Demo />);
    const chevron = getByText("标题").closest("button")!.querySelector("[data-chevron]")!;
    expect(chevron.getAttribute("class")).toContain("group-data-[panel-open]:rotate-180");
  });

  it("disabled 透传到 trigger button", () => {
    const { getByText } = render(<Demo disabled />);
    expect((getByText("标题").closest("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
