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
