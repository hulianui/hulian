import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Container } from "./container";

describe("Container", () => {
  it("默认 xl 宽度 + 居中内距", () => {
    const { container } = render(<Container>x</Container>);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("max-w-5xl");
    expect(cls).toContain("mx-auto");
  });

  it("size 映射最大宽度", () => {
    const { container } = render(<Container size="md">x</Container>);
    expect(container.firstElementChild!.className).toContain("max-w-3xl");
  });

  // 行为变更（hulianui/hulian#58）：padded 曾同时关掉居中，于是「要居中但自定义内距」做不到。
  // 现在 padded 只管内距，居中归 centered —— 两者要一起关就都传 false。
  it("padded=false 只去掉内距，仍然居中", () => {
    const { container } = render(<Container padded={false}>x</Container>);
    const cls = container.firstElementChild!.className;
    expect(cls).toContain("mx-auto");
    expect(cls).not.toContain("px-6");
  });

  it("padded=false + centered=false 才是「既不居中也无内距」", () => {
    const { container } = render(
      <Container padded={false} centered={false}>
        x
      </Container>,
    );
    const cls = container.firstElementChild!.className;
    expect(cls).not.toContain("mx-auto");
    expect(cls).not.toContain("px-6");
  });

  it("as 渲染语义标签", () => {
    const { container } = render(<Container as="section">x</Container>);
    expect(container.querySelector("section")).toBeTruthy();
  });
});

describe("Container 档位与居中解耦（hulianui/hulian#58）", () => {
  it("补齐 2xl=6xl / 3xl=7xl 档", () => {
    const { container: a } = render(<Container size="2xl" />);
    expect((a.firstElementChild as HTMLElement).className).toContain("max-w-6xl");
    const { container: b } = render(<Container size="3xl" />);
    expect((b.firstElementChild as HTMLElement).className).toContain("max-w-7xl");
  });

  it("padded 只管内距，居中由 centered 单独控制", () => {
    const { container: a } = render(<Container padded={false} />);
    const clsA = (a.firstElementChild as HTMLElement).className;
    expect(clsA).toContain("mx-auto"); // 仍居中
    expect(clsA).not.toContain("px-6");

    const { container: b } = render(<Container centered={false} />);
    const clsB = (b.firstElementChild as HTMLElement).className;
    expect(clsB).not.toContain("mx-auto");
    expect(clsB).toContain("px-6");
  });
});
