import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Dock, DockIcon } from "./dock";

describe("Dock", () => {
  it("渲染底座 + 各图标", () => {
    const { getByText, container } = render(
      <Dock>
        <DockIcon>A</DockIcon>
        <DockIcon>B</DockIcon>
      </Dock>,
    );
    expect(getByText("A")).toBeTruthy();
    expect(getByText("B")).toBeTruthy();
    expect(container.firstElementChild!.className).toContain("rounded-2xl");
  });

  it("DockIcon 在 Dock 外也能渲染（无 context 降级恒定尺寸）", () => {
    const { getByText } = render(<DockIcon>X</DockIcon>);
    expect(getByText("X")).toBeTruthy();
  });

  it("透传 className 到底座", () => {
    const { container } = render(
      <Dock className="my-dock">
        <DockIcon>A</DockIcon>
      </Dock>,
    );
    expect(container.firstElementChild!.classList.contains("my-dock")).toBe(true);
  });

  // #132：Dock 曾没有「当前项」的概念 —— 既无高亮也无 aria-current，
  // 屏幕阅读器用户完全拿不到当前位置，而库里其它导航件都有。
  it("activeKey 命中的项落 aria-current 与指示点", () => {
    const { container } = render(
      <Dock activeKey="b" onSelect={() => {}}>
        <DockIcon itemKey="a" label="A">
          A
        </DockIcon>
        <DockIcon itemKey="b" label="B">
          B
        </DockIcon>
      </Dock>,
    );
    const items = container.querySelectorAll("button");
    expect(items[0].getAttribute("aria-current")).toBeNull();
    expect(items[1].getAttribute("aria-current")).toBe("page");
    // 指示点是形状线索，不只靠颜色
    expect(items[1].querySelector("span.rounded-full")).not.toBeNull();
    expect(items[0].querySelector("span.rounded-full")).toBeNull();
  });

  it("active 直传优先于 activeKey 比对", () => {
    const { container } = render(
      <Dock activeKey="a">
        <DockIcon itemKey="a">A</DockIcon>
        <DockIcon itemKey="b" active>
          B
        </DockIcon>
      </Dock>,
    );
    const items = container.querySelectorAll("[aria-current]");
    expect(items.length).toBe(2);
  });

  it("接了 onSelect 才升级成 button 并回吐 key；否则保持无语义容器", () => {
    const picked: string[] = [];
    const { container, rerender } = render(
      <Dock onSelect={(k) => picked.push(k)}>
        <DockIcon itemKey="a" label="A">
          A
        </DockIcon>
      </Dock>,
    );
    const btn = container.querySelector("button")!;
    expect(btn.getAttribute("aria-label")).toBe("A");
    btn.click();
    expect(picked).toEqual(["a"]);
    // 没有 onSelect 时不该把消费方自己的 <a> 再套进一层 button
    rerender(
      <Dock>
        <DockIcon itemKey="a">A</DockIcon>
      </Dock>,
    );
    expect(container.querySelector("button")).toBeNull();
  });

  it("能选中时底座给出 nav 地标", () => {
    const { container, rerender } = render(
      <Dock aria-label="主导航" onSelect={() => {}}>
        <DockIcon itemKey="a">A</DockIcon>
      </Dock>,
    );
    expect(container.querySelector('nav[aria-label="主导航"]')).not.toBeNull();
    rerender(
      <Dock>
        <DockIcon>A</DockIcon>
      </Dock>,
    );
    expect(container.querySelector("nav")).toBeNull();
  });
});
