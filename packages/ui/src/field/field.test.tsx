import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "../input/input";

describe("Field", () => {
  it("真坑回归: error 非空时错误文字真的渲染(不能框红字没)", () => {
    const { getByText } = render(
      <Field label="邮箱" error="邮箱格式不正确">
        <Input />
      </Field>,
    );
    expect(getByText("邮箱格式不正确")).toBeTruthy();
  });

  it("error 隐含 invalid → 控件自动 aria-invalid", () => {
    const { container } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  it("error 的 id 自动串进控件 aria-describedby(a11y 白嫖)", () => {
    const { container, getByText } = render(
      <Field error="必填">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    const errorEl = getByText("必填");
    expect((input.getAttribute("aria-describedby") ?? "")).toContain(errorEl.id);
  });

  it("label 经 htmlFor 自动关联控件", () => {
    const { getByText, container } = render(
      <Field label="用户名">
        <Input />
      </Field>,
    );
    const label = getByText("用户名");
    const input = container.querySelector("input")!;
    expect(input.id).toBeTruthy();
    expect(label.getAttribute("for")).toBe(input.id);
  });

  it("三段 className 出口经 twMerge 顶掉默认字号，a11y 串联不受影响(#153)", () => {
    const { getByText, container } = render(
      <Field
        label="参保状态"
        description="按月同步"
        error="不能为空"
        labelClassName="text-xs text-muted-foreground"
        descriptionClassName="text-[11px]"
        errorClassName="text-[11px]"
      >
        <Input />
      </Field>,
    );
    const label = getByText("参保状态");
    // 同族类被顶掉而不是并存 —— 并存的话两条 font-size 规则谁赢取决于 CSS 顺序，等于没改。
    expect(label.className).toContain("text-xs");
    expect(label.className).not.toContain("text-sm");
    expect(label.className).toContain("text-muted-foreground");
    expect(label.className).not.toContain("text-foreground ");
    expect(getByText("按月同步").className).toContain("text-[11px]");
    expect(getByText("不能为空").className).toContain("text-[11px]");
    // 出口只动样式：label↔控件、error↔aria-describedby 这些关系必须原样还在。
    const input = container.querySelector("input")!;
    expect(label.getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-describedby") ?? "").toContain(getByText("不能为空").id);
  });

  it("orientation=horizontal 保住全部 a11y 串联(#161)", () => {
    const { getByText, container } = render(
      <Field orientation="horizontal" label="主题" description="选择你偏好的配色方案" error="不能为空">
        <Input />
      </Field>,
    );
    const input = container.querySelector("input")!;
    // 换布局不能换语义：label↔控件、error↔aria-describedby、invalid 传导必须与竖排一模一样。
    expect(getByText("主题").getAttribute("for")).toBe(input.id);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain(getByText("不能为空").id);
    expect(describedBy).toContain(getByText("选择你偏好的配色方案").id);
  });

  it("orientation=horizontal 走两列网格，错误行独占整行", () => {
    const { getByText, container } = render(
      <Field orientation="horizontal" label="主题" error="不能为空">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("grid-cols-[1fr_auto]");
    expect(root.className).not.toContain("flex-col");
    // col-span-full 而不是写死的 col-span-2：消费方换成三列列模板时错误行仍占满。
    expect(getByText("不能为空").className).toContain("col-span-full");
  });

  it("横排的标签列宽度靠 className 顶掉默认列模板，不另开 prop", () => {
    const { container } = render(
      <Field orientation="horizontal" label="主题" className="grid-cols-[8rem_1fr]">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("grid-cols-[8rem_1fr]");
    expect(root.className).not.toContain("grid-cols-[1fr_auto]");
  });

  it("缺省 orientation 仍是竖排(既有版式零变化)", () => {
    const { container } = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    );
    const root = container.firstElementChild!;
    expect(root.className).toContain("flex-col");
    expect(root.className).not.toContain("grid");
  });

  it("横排时 label 缺席也保留左列，控件不会跑到左边", () => {
    const { container } = render(
      <Field orientation="horizontal">
        <Input />
      </Field>,
    );
    // 第一个子节点是标签区（此时为空），控件在第二列。
    const root = container.firstElementChild!;
    expect(root.children.length).toBe(2);
    expect(root.children[0]!.querySelector("input")).toBeNull();
    expect(root.children[1]!.querySelector("input")).toBeTruthy();
  });

  it("无 error 时不渲染错误节点", () => {
    const { queryByText } = render(
      <Field label="邮箱">
        <Input />
      </Field>,
    );
    expect(queryByText("邮箱格式不正确")).toBeNull();
  });

  // #180：必填此前只活在 rules 里，界面上要提交一次才知道哪些字段必填。
  describe("required（#180）", () => {
    it("画红星 + 把 aria-required 落到控件上", () => {
      const { container, getByText } = render(
        <Field label="banner类型" required>
          <Input />
        </Field>,
      );
      const star = getByText("*");
      expect(star.getAttribute("aria-hidden")).toBe("true"); // 装饰节点，读屏不读
      expect(star.className).toContain("text-danger");
      expect(container.querySelector("input")!.getAttribute("aria-required")).toBe("true");
    });

    it("不传 required 时既无星号也无 aria-required（DOM 与此前一致）", () => {
      const { container, queryByText } = render(
        <Field label="备注">
          <Input />
        </Field>,
      );
      expect(queryByText("*")).toBeNull();
      expect(container.querySelector("input")!.getAttribute("aria-required")).toBeNull();
    });

    it("requiredMark=false 只留语义不画标记", () => {
      const { container, queryByText } = render(
        <Field label="邮箱" required requiredMark={false}>
          <Input />
        </Field>,
      );
      expect(queryByText("*")).toBeNull();
      expect(container.querySelector("input")!.getAttribute("aria-required")).toBe("true");
    });

    it("requiredMark 收 ReactNode：换成自家标记", () => {
      const { getByText, queryByText } = render(
        <Field label="邮箱" required requiredMark={<span>必填</span>}>
          <Input />
        </Field>,
      );
      expect(getByText("必填")).toBeTruthy();
      expect(queryByText("*")).toBeNull();
    });

    it("控件已显式写了 aria-required 时以消费方为准，不被覆盖", () => {
      const { container } = render(
        <Field label="邮箱" required>
          <Input aria-required={false} />
        </Field>,
      );
      expect(container.querySelector("input")!.getAttribute("aria-required")).toBe("false");
    });

    it("horizontal 下同样注入（控件包在第二列的 div 里）", () => {
      const { container } = render(
        <Field label="邮箱" required orientation="horizontal">
          <Input />
        </Field>,
      );
      expect(container.querySelector("input")!.getAttribute("aria-required")).toBe("true");
    });
  });

  describe("label 的命中区（#296）", () => {
    // 真 <label> 被 flex stretch 拉满整行时，行尾那片看不见的空白照样把 click 转发给控件 ——
    // 对浮层型控件就是「点了下拉框上方的空处，浮层凭空弹开」。宽度在 jsdom 里量不出来，
    // 这里钉的是「盒子按内容收」这条类，视觉/命中的实际效果由浏览器的盒模型保证。
    it("label 默认按文字宽收窄，不吃满整行", () => {
      const { getByText } = render(
        <Field label="一级分类">
          <Input />
        </Field>,
      );
      expect(getByText("一级分类").className).toContain("w-fit");
    });

    it("horizontal 的标签列同样收窄（第一列是 1fr，label 在其中仍会被 stretch）", () => {
      const { getByText } = render(
        <Field label="一级分类" orientation="horizontal">
          <Input />
        </Field>,
      );
      expect(getByText("一级分类").className).toContain("w-fit");
    });

    it("需要满宽 label 的消费方传 w-full 顶掉（同族类走 twMerge，不并存）", () => {
      const { getByText, container } = render(
        <Field label="一级分类" labelClassName="w-full">
          <Input />
        </Field>,
      );
      const label = getByText("一级分类");
      expect(label.className).toContain("w-full");
      expect(label.className).not.toContain("w-fit");
      // 收窄只动盒宽：htmlFor 关联照旧
      expect(label.getAttribute("for")).toBe(container.querySelector("input")!.id);
    });
  });
});
