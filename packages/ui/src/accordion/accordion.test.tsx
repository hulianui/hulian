import { useState } from "react";
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

  // —— plain（hulianui/hulian#162）——
  it("默认渲染内层皮肤 div（内边距 + 次要文字色）", () => {
    const { getByText } = render(<Three defaultValue={["a"]} />);
    const skin = getByText("答案一");
    expect(skin.tagName).toBe("DIV");
    expect(skin.className).toContain("px-4");
    expect(skin.className).toContain("text-muted-foreground");
  });

  it("plain：不渲染内层皮肤 div，children 直接进 Panel", () => {
    const { getByText } = render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger>问题一</AccordionTrigger>
          <AccordionPanel plain>
            <p data-testid="content">整块功能区</p>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    const content = getByText("整块功能区");
    const panel = content.parentElement!;
    // 父节点直接就是 Base UI 的 Panel（role=region），中间没有那层皮肤 div。
    expect(panel.getAttribute("role")).toBe("region");
    expect(panel.className).toContain("h-[var(--accordion-panel-height)]");
  });

  it("plain 不影响外层 Panel 的高度过渡皮肤", () => {
    const { getByText } = render(
      <Accordion defaultValue={["a"]}>
        <AccordionItem value="a">
          <AccordionTrigger>问题一</AccordionTrigger>
          <AccordionPanel plain>内容</AccordionPanel>
        </AccordionItem>
      </Accordion>,
    );
    const panel = getByText("内容");
    expect(panel.className).toContain("overflow-hidden");
    expect(panel.className).toContain("data-[ending-style]:h-0");
    expect(panel.className).not.toContain("text-muted-foreground");
  });

  // —— 受控用法（hulianui/hulian#163）——
  // 泛型丢失时这个组件连编译都过不了（value: string[] 撞 unknown[]，TS2322 + TS2345）。
  it("受控 multiple：value / onValueChange 是 string[]，展开态跟着外部状态走", () => {
    function Controlled() {
      const [open, setOpen] = useState<string[]>([]);
      return (
        <>
          <span data-testid="mirror">{open.join(",")}</span>
          <Accordion multiple value={open} onValueChange={(v) => setOpen(v)}>
            <AccordionItem value="a">
              <AccordionTrigger>问题一</AccordionTrigger>
              <AccordionPanel>答案一</AccordionPanel>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger>问题二</AccordionTrigger>
              <AccordionPanel>答案二</AccordionPanel>
            </AccordionItem>
          </Accordion>
        </>
      );
    }
    const { getByText, getByTestId } = render(<Controlled />);
    fireEvent.click(getByText("问题一").closest("button")!);
    expect(getByTestId("mirror").textContent).toBe("a");
    fireEvent.click(getByText("问题二").closest("button")!);
    expect(getByTestId("mirror").textContent).toBe("a,b");
  });
});

// —— 类型回归（编译期断言，hulianui/hulian#163）——
// 这些函数不需要被调用：泛型一旦不再透传，tsc 就会在此处报错。
// 早先 AccordionProps = ComponentProps<typeof Root> 把 Value 擦成 unknown，
// 受控写法必然 TS2322（value）+ TS2345（onValueChange 回吐 unknown[]）。
function _typeCheckControlledString() {
  const [open, setOpen] = useState<string[]>([]);
  return (
    <Accordion multiple value={open} onValueChange={(v) => setOpen(v)}>
      <AccordionItem value="a">
        <AccordionTrigger>问题一</AccordionTrigger>
        <AccordionPanel>答案一</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

// 显式指定 Value 时也照样透传（枚举/字面量联合是中后台常见写法）。
function _typeCheckControlledUnion() {
  const [open, setOpen] = useState<Array<"a" | "b">>([]);
  return (
    <Accordion<"a" | "b"> multiple value={open} onValueChange={(v) => setOpen(v)}>
      <AccordionItem value="a">
        <AccordionTrigger>问题一</AccordionTrigger>
        <AccordionPanel>答案一</AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

// 它们的价值全在编译期，运行时没有调用点。这两行只为满足 noUnusedLocals ——
// 别改成删函数：删掉等于撤掉 #163 的类型回归断言。
void _typeCheckControlledString;
void _typeCheckControlledUnion;
