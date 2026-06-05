import { describe, it, expect } from "vitest";
import { render as rtlRender } from "@testing-library/react";
import { Button, buttonVariants } from "./button";

describe("buttonVariants", () => {
  it("default = solid brand md", () => {
    const c = buttonVariants({});
    expect(c).toContain("bg-primary");
    expect(c).toContain("h-10");
  });
  it("danger solid swaps to danger bg", () => {
    expect(buttonVariants({ variant: "solid", tone: "danger" })).toContain("bg-danger");
  });
  it("link 变体去掉横向内边距（文字贴单元格左缘，对齐表头）", () => {
    // cva 原串里 size 档的 px-3 与 compound 的 px-0 同时存在，靠组件内 cn(twMerge) 去重，
    // 故在真实渲染的元素上断言：最终只剩 px-0，且不含 px-3。
    const { container } = rtlRender(
      <Button variant="link" size="sm">
        查看
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("px-0");
    expect(cls).not.toContain("px-3");
    expect(cls).toContain("text-primary");
  });
});

describe("Button render（按钮样式的链接）", () => {
  it("render=<a> 时渲染为锚点、带 href、套上按钮样式、文案取 children", () => {
    const { container, getByText } = rtlRender(
      <Button render={<a href="/docs" />}>浏览组件</Button>,
    );
    const el = container.querySelector("a");
    expect(el).toBeTruthy();
    expect(el!.getAttribute("href")).toBe("/docs");
    expect(el!.className).toContain("bg-primary"); // solid 默认皮肤已合并
    expect(getByText("浏览组件")).toBeTruthy();
    // 不应再渲染原生 button
    expect(container.querySelector("button")).toBeNull();
  });

  it("render 元素自带 children 时作为文案兜底", () => {
    const { container } = rtlRender(<Button render={<a href="/x">主题</a>} />);
    expect(container.querySelector("a")!.textContent).toBe("主题");
  });

  it("disabled/loading → aria-disabled + 禁用样式（非 button 无原生 disabled）", () => {
    const { container } = rtlRender(
      <Button render={<a href="/x" />} disabled>
        禁用链接
      </Button>,
    );
    const el = container.querySelector("a")!;
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.className).toContain("pointer-events-none");
    expect(el.hasAttribute("disabled")).toBe(false); // <a> 不应有原生 disabled
  });

  it("不传 render 时仍渲染原生 <button>", () => {
    const { container } = rtlRender(<Button>点我</Button>);
    expect(container.querySelector("button")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
  });
});
