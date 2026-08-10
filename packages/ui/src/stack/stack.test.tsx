import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Stack } from "./stack";

describe("Stack", () => {
  it("默认 column flex", () => {
    const { container } = render(<Stack />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("flex")).toBe(true);
    expect(el.classList.contains("flex-col")).toBe(true);
  });

  it("direction=row → flex-row", () => {
    const { container } = render(<Stack direction="row" />);
    expect((container.firstElementChild as HTMLElement).classList.contains("flex-row")).toBe(true);
  });

  it("gap 换算为 rem（× 0.25）", () => {
    const { container } = render(<Stack gap={4} />);
    expect((container.firstElementChild as HTMLElement).style.gap).toBe("1rem");
  });

  it("gap=0 不写 inline gap", () => {
    const { container } = render(<Stack gap={0} />);
    expect((container.firstElementChild as HTMLElement).style.gap).toBe("");
  });

  it("align/justify 映射到 Tailwind 类", () => {
    const { container } = render(<Stack align="center" justify="between" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("items-center")).toBe(true);
    expect(el.classList.contains("justify-between")).toBe(true);
  });

  it("inline → inline-flex 而非 flex", () => {
    const { container } = render(<Stack inline />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("inline-flex")).toBe(true);
    expect(el.classList.contains("flex")).toBe(false);
  });

  it("as 透传渲染标签", () => {
    const { container } = render(<Stack as="section" />);
    expect(container.firstElementChild!.tagName).toBe("SECTION");
  });

  it("响应式 direction 出断点类", () => {
    const { container } = render(<Stack direction={{ base: "column", sm: "row" }} />);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("flex-col");
    expect(cls).toContain("sm:flex-row");
  });
});

// —— 类型回归（编译期断言，hulianui/hulian#62）——
// 这些函数不需要被调用：`as` 一旦不再参与推导，tsc 就会在此处报错。
// 早先 as="form" 后 onSubmit 的 currentTarget 退化成 HTMLElement，
// event.currentTarget.elements 这类表单专有 API 全部拿不到。
function _typeCheckAsForm() {
  return (
    <Stack
      as="form"
      onSubmit={(event) => {
        const form: HTMLFormElement = event.currentTarget;
        void form.elements;
      }}
    />
  );
}

function _typeCheckAsAnchor() {
  return <Stack as="a" href="#anchor" />;
}

// 它们的价值全在编译期，运行时没有调用点。这两行只为满足 noUnusedLocals ——
// 别改成删函数：删掉等于撤掉 #62 的类型回归断言。
void _typeCheckAsForm;
void _typeCheckAsAnchor;

describe("Stack 响应式断点", () => {
  it("direction 支持 xl / 2xl 档", () => {
    const { container } = render(<Stack direction={{ base: "column", xl: "row", "2xl": "column" }} />);
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("xl:flex-row");
    expect(cls).toContain("2xl:flex-col");
  });

  it("as 渲染成对应标签", () => {
    const { container } = render(<Stack as="form" />);
    expect(container.firstElementChild?.tagName).toBe("FORM");
  });
});

// 可选 prop 收到 null 时须回落默认值（解构默认只认 undefined）——由 LLM 产出结构再动态渲染的
// 消费方常把「不设这个 prop」写成 null（hulianui/hulian#107）。
describe("Stack · null 回落", () => {
  it("direction 传 null 不抛错，与不传该 prop 完全一致", () => {
    const { container: withNull } = render(<Stack direction={null as never}>x</Stack>);
    const { container: withoutProp } = render(<Stack>x</Stack>);
    const el = withNull.firstElementChild as HTMLElement;
    expect(el.className).toContain("flex-col");
    expect(el.className).toBe((withoutProp.firstElementChild as HTMLElement).className);
  });
});
