import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { CheckboxGroup } from "./checkbox-group";
import { Checkbox } from "../checkbox";

function Fruits(props: Record<string, unknown>) {
  return (
    <CheckboxGroup {...props}>
      <Checkbox value="apple" label="苹果" />
      <Checkbox value="banana" label="香蕉" />
      <Checkbox value="cherry" label="樱桃" />
    </CheckboxGroup>
  );
}

describe("CheckboxGroup", () => {
  it("渲染 role=group + 3 个 checkbox", () => {
    const { container, getAllByRole } = render(<Fruits />);
    expect(container.querySelector('[role="group"]')).toBeTruthy();
    expect(getAllByRole("checkbox").length).toBe(3);
  });

  it("defaultValue 勾选对应项（按 value 匹配，apple/banana/cherry 顺序）", () => {
    const { getAllByRole } = render(<Fruits defaultValue={["apple"]} />);
    const [apple, banana] = getAllByRole("checkbox");
    expect(apple.getAttribute("aria-checked")).toBe("true");
    expect(banana.getAttribute("aria-checked")).toBe("false");
  });

  // 注：onValueChange 走 Base UI checkbox 的 pointer 交互，jsdom 下 click/label 均不触发
  // （同 standalone Checkbox 测试的既定取舍）→ 交互正确性交隔离 chromium 截图自证。
  it("defaultValue 多选：多个项可同时勾选", () => {
    const { getAllByRole } = render(<Fruits defaultValue={["apple", "cherry"]} />);
    const cbs = getAllByRole("checkbox");
    expect(cbs[0].getAttribute("aria-checked")).toBe("true");
    expect(cbs[1].getAttribute("aria-checked")).toBe("false");
    expect(cbs[2].getAttribute("aria-checked")).toBe("true");
  });

  it("disabled 下发到所有 checkbox（data-disabled）", () => {
    const { getAllByRole } = render(<Fruits disabled />);
    for (const cb of getAllByRole("checkbox")) {
      expect(cb.hasAttribute("data-disabled")).toBe(true);
    }
  });

  it("受控 value 控制勾选", () => {
    const { getAllByRole } = render(<Fruits value={["cherry"]} />);
    expect(getAllByRole("checkbox")[2].getAttribute("aria-checked")).toBe("true");
  });
});
