import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Kbd, KbdGroup } from "./kbd";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Kbd", () => {
  it("稳定父更新时跳过键帽子树", async () => {
    await expectMemoSkipsSubtree(() => <Kbd className="w-8">Esc</Kbd>);
  });

  it("渲染 kbd 标签 + 内容", () => {
    const { getByText } = render(<Kbd>K</Kbd>);
    expect(getByText("K").tagName).toBe("KBD");
  });

  it("皮肤含 font-mono + border", () => {
    const { getByText } = render(<Kbd>K</Kbd>);
    const el = getByText("K");
    expect(el.className).toContain("font-mono");
    expect(el.className).toContain("border");
  });

  it("透传 className", () => {
    const { getByText } = render(<Kbd className="my-kbd">K</Kbd>);
    expect(getByText("K").classList.contains("my-kbd")).toBe(true);
  });

  it("组合键：并排多个 Kbd 各自渲 kbd 标签", () => {
    const { getByText } = render(
      <span>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </span>,
    );
    expect(getByText("⌘").tagName).toBe("KBD");
    expect(getByText("K").tagName).toBe("KBD");
  });
});

describe("KbdGroup", () => {
  it("keys 逐个包成 kbd 标签", () => {
    const { container, getByText } = render(<KbdGroup keys={["⌘", "K"]} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
    expect(getByText("⌘").tagName).toBe("KBD");
    expect(getByText("K").tagName).toBe("KBD");
  });

  it("默认在键之间画 + 分隔符，两端不画", () => {
    const { container } = render(<KbdGroup keys={["⌘", "⇧", "P"]} />);
    const separators = [...container.querySelectorAll("[aria-hidden='true']")];
    expect(separators.map((el) => el.textContent)).toEqual(["+", "+"]);
    // 首个键前面没有分隔符：第一个子节点就是键帽本身
    expect(container.firstElementChild?.firstElementChild?.tagName).toBe("KBD");
  });

  it("分隔符是装饰性的，不进无障碍树", () => {
    const { container } = render(<KbdGroup keys={["⌘", "K"]} separator="·" />);
    const separator = container.querySelector("span[aria-hidden]");
    expect(separator?.textContent).toBe("·");
    expect(separator?.getAttribute("aria-hidden")).toBe("true");
  });

  it("separator={null} 只留间距不画符号", () => {
    const { container } = render(<KbdGroup keys={["⌘", "K"]} separator={null} />);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
  });

  it("label 给整组一个读屏名（配 role=group 才生效）", () => {
    const { getByRole } = render(<KbdGroup keys={["⌘", "K"]} label="打开命令面板" />);
    const group = getByRole("group", { name: "打开命令面板" });
    expect(group.querySelectorAll("kbd")).toHaveLength(2);
  });

  it("没给 label 就不平白造一层 group", () => {
    const { container, queryByRole } = render(<KbdGroup keys={["⌘", "K"]} />);
    expect(queryByRole("group")).toBeNull();
    expect(container.firstElementChild?.hasAttribute("role")).toBe(false);
  });

  it("children 优先于 keys，分隔符照样插在中间", () => {
    const { container, queryByText } = render(
      <KbdGroup keys={["忽略"]}>
        <Kbd className="my-key">⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>,
    );
    expect(queryByText("忽略")).toBeNull();
    expect(container.querySelectorAll("kbd")).toHaveLength(2);
    expect(container.querySelector("kbd")?.classList.contains("my-key")).toBe(true);
    expect(container.querySelectorAll("[aria-hidden='true']")).toHaveLength(1);
  });

  // consuming.md §7 / #157：rest 展开在最前，组件自身的 role / aria 赢。
  it("消费方传的 role 顶不掉组件自己的 role=group", () => {
    const { getByRole, queryByRole } = render(
      <KbdGroup keys={["⌘", "K"]} label="打开命令面板" role="presentation" />,
    );
    expect(getByRole("group", { name: "打开命令面板" })).toBeTruthy();
    expect(queryByRole("presentation")).toBeNull();
  });

  it("没给 label 时组件不占 role，消费方传什么就是什么", () => {
    const { container } = render(<KbdGroup keys={["⌘", "K"]} role="presentation" />);
    expect(container.firstElementChild?.getAttribute("role")).toBe("presentation");
  });

  it("透传 className 与原生属性", () => {
    const { container } = render(
      <KbdGroup keys={["Esc"]} className="my-group" data-testid="combo" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.classList.contains("my-group")).toBe(true);
    expect(root.classList.contains("inline-flex")).toBe(true);
    expect(root.dataset.testid).toBe("combo");
  });

  it("单键也能用，不会多出分隔符", () => {
    const { container } = render(<KbdGroup keys={["Esc"]} />);
    expect(container.querySelectorAll("kbd")).toHaveLength(1);
    expect(container.querySelector("[aria-hidden='true']")).toBeNull();
  });
});
