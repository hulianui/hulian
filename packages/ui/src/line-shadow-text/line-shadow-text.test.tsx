import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { LineShadowText } from "./line-shadow-text";

describe("LineShadowText", () => {
  it("渲染两份文字：本体 + 一份 aria-hidden 的投影副本", () => {
    const { container } = render(<LineShadowText>瑚琏</LineShadowText>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.textContent).toBe("瑚琏瑚琏");
    const shadow = root.querySelector("[aria-hidden]")!;
    expect(shadow.textContent).toBe("瑚琏");
  });

  // 伪元素的 content:attr() 会被部分读屏当文本念，同一个词念两遍。用真节点才能明确标成装饰。
  it("投影副本对读屏不可见", () => {
    const { container } = render(<LineShadowText>Hulian</LineShadowText>);
    expect(container.querySelectorAll("[aria-hidden='true']").length).toBe(1);
  });

  it("默认静态：不挂动画，也不需要 motion-reduce 兜底", () => {
    const { container } = render(<LineShadowText>Hulian</LineShadowText>);
    const shadow = container.querySelector("[aria-hidden]")!;
    expect(shadow.className).not.toContain("animation:hulian-line-shadow");
  });

  it("animated 开启时挂关键帧，并保留 motion-reduce 关闭", () => {
    const { container } = render(<LineShadowText animated>Hulian</LineShadowText>);
    const shadow = container.querySelector("[aria-hidden]")!;
    expect(shadow.className).toContain("animation:hulian-line-shadow");
    expect(shadow.className).toContain("motion-reduce:[animation:none]");
  });

  // 写死 black 在暗色主题下是一团看不见的黑；默认必须是跟随主题的 token。
  it("默认投影色是 --color-foreground，可被 shadowColor 覆盖", () => {
    const a = render(<LineShadowText>x</LineShadowText>);
    const rootA = a.container.firstElementChild as HTMLElement;
    expect(rootA.style.getPropertyValue("--hulian-line-shadow-color")).toBe(
      "var(--color-foreground)",
    );
    const b = render(<LineShadowText shadowColor="var(--color-chart-2)">x</LineShadowText>);
    const rootB = b.container.firstElementChild as HTMLElement;
    expect(rootB.style.getPropertyValue("--hulian-line-shadow-color")).toBe(
      "var(--color-chart-2)",
    );
  });

  it("offset / lineWidth / duration 落到 CSS 变量上", () => {
    const { container } = render(
      <LineShadowText animated offset="0.1em" lineWidth="0.2em" duration="5s">
        x
      </LineShadowText>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--hulian-line-shadow-offset")).toBe("0.1em");
    expect(root.style.getPropertyValue("--hulian-line-shadow-width")).toBe("0.2em");
    expect(root.style.getPropertyValue("--hulian-line-shadow-duration")).toBe("5s");
  });

  it("自定义 prop 不裸传到 DOM，原生属性照常透传", () => {
    const { container } = render(
      <LineShadowText animated offset="0.1em" id="brand" data-testid="t">
        x
      </LineShadowText>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.id).toBe("brand");
    expect(root.getAttribute("data-testid")).toBe("t");
    expect(root.hasAttribute("animated")).toBe(false);
    expect(root.hasAttribute("offset")).toBe(false);
    expect(root.hasAttribute("shadowColor")).toBe(false);
  });
});
