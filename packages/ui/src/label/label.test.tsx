import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Label, labelClass } from "./label";
import { Field } from "../field/field";
import { Input } from "../input/input";

describe("Label", () => {
  it("渲染真的 <label> 而不是长得像标签的文字", () => {
    const { getByText } = render(<Label>邮箱</Label>);
    expect(getByText("邮箱").tagName).toBe("LABEL");
  });

  it("htmlFor 落成原生 for，点标签能命中控件", () => {
    const { getByText, container } = render(
      <div>
        <Label htmlFor="email">邮箱</Label>
        <input id="email" />
      </div>,
    );
    expect(getByText("邮箱").getAttribute("for")).toBe("email");
    expect(container.querySelector("input")!.id).toBe("email");
  });

  it("原生属性透传到根节点（id / title / data-* / onClick）", () => {
    let clicked = 0;
    const { getByText } = render(
      <Label id="lbl" title="提示" data-testid="x" onClick={() => (clicked += 1)}>
        邮箱
      </Label>,
    );
    const el = getByText("邮箱");
    expect(el.id).toBe("lbl");
    expect(el.getAttribute("title")).toBe("提示");
    expect(el.getAttribute("data-testid")).toBe("x");
    el.click();
    expect(clicked).toBe(1);
  });

  it("真坑回归: 皮肤与 Field 的 label 完全同源（改一处必须两处一起变）", () => {
    // 两次 render 都挂在 document.body 上，查询必须锁到各自的 container，
    // 否则「邮箱」会同时命中两棵树。
    const standaloneTree = render(<Label>邮箱</Label>).container;
    const fieldTree = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    ).container;
    // 逐类比对而不是比字符串：Field 那侧还会叠 labelClassName，只要求 labelClass 全在。
    const standalone = standaloneTree.querySelector("label")!.className.split(/\s+/);
    const inField = fieldTree.querySelector("label")!.className.split(/\s+/);
    for (const token of labelClass.split(/\s+/)) {
      expect(standalone).toContain(token);
      expect(inField).toContain(token);
    }
  });

  it("className 经 twMerge 顶掉默认字号（不是并存）", () => {
    const { getByText } = render(<Label className="text-xs">邮箱</Label>);
    const className = getByText("邮箱").className;
    expect(className).toContain("text-xs");
    expect(className).not.toContain("text-sm");
  });
});
