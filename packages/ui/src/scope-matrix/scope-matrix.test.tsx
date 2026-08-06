import { describe, it, expect, vi, afterEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { ScopeMatrix } from "./scope-matrix";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

afterEach(cleanup);

describe("ScopeMatrix", () => {
  it("渲染两个桶与各自条数", () => {
    const { getByText, container } = render(<ScopeMatrix allow={["a/**"]} deny={["b/**", "c/**"]} />);
    expect(getByText("允许")).toBeTruthy();
    expect(getByText("禁止")).toBeTruthy();
    expect(container.querySelector('[data-bucket="allow"]')!.textContent).toContain("1 条");
    expect(container.querySelector('[data-bucket="deny"]')!.textContent).toContain("2 条");
  });

  it("无 onChange 时为只读，不渲染编辑入口", () => {
    const { queryByPlaceholderText, queryByLabelText } = render(
      <ScopeMatrix allow={["a/**"]} deny={[]} />,
    );
    expect(queryByPlaceholderText("输入模式后回车")).toBeNull();
    expect(queryByLabelText("移除 a/**")).toBeNull();
  });

  it("readOnly 时即使给了 onChange 也不可编辑", () => {
    const { queryByPlaceholderText } = render(
      <ScopeMatrix allow={[]} deny={[]} onChange={vi.fn()} readOnly />,
    );
    expect(queryByPlaceholderText("输入模式后回车")).toBeNull();
  });

  it("回车添加到允许桶", () => {
    const onChange = vi.fn();
    const { container } = render(<ScopeMatrix allow={[]} deny={["x"]} onChange={onChange} />);
    const input = container.querySelector('[data-bucket="allow"] input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "src/**" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith({ allow: ["src/**"], deny: ["x"] });
  });

  it("点击添加按钮同样生效，且不影响另一个桶", () => {
    const onChange = vi.fn();
    const { container } = render(<ScopeMatrix allow={["keep"]} deny={[]} onChange={onChange} />);
    const bucket = container.querySelector('[data-bucket="deny"]')!;
    fireEvent.change(bucket.querySelector("input")!, { target: { value: "node_modules/**" } });
    fireEvent.click(bucket.querySelector("button")!);
    expect(onChange).toHaveBeenCalledWith({ allow: ["keep"], deny: ["node_modules/**"] });
  });

  it("移除单条", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(
      <ScopeMatrix allow={["a", "b"]} deny={[]} onChange={onChange} />,
    );
    fireEvent.click(getByLabelText("移除 a"));
    expect(onChange).toHaveBeenCalledWith({ allow: ["b"], deny: [] });
  });

  it("空白输入不提交", () => {
    const onChange = vi.fn();
    const { container } = render(<ScopeMatrix allow={[]} deny={[]} onChange={onChange} />);
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("重复模式被拒绝并给出提示", () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <ScopeMatrix allow={["src/**"]} deny={[]} onChange={onChange} />,
    );
    const input = container.querySelector('[data-bucket="allow"] input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "src/**" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    expect(getByText("已存在相同模式")).toBeTruthy();
  });

  it("validate 返回错误时不提交并展示文案", () => {
    const onChange = vi.fn();
    const { container, getByText } = render(
      <ScopeMatrix
        allow={[]}
        deny={[]}
        onChange={onChange}
        validate={(p) => (p.startsWith("/") ? "不接受绝对路径" : null)}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.change(input, { target: { value: "/etc/passwd" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
    expect(getByText("不接受绝对路径")).toBeTruthy();
  });

  it("候选点击后填入输入框而非直接提交", () => {
    const onChange = vi.fn();
    const { container, getAllByText } = render(
      <ScopeMatrix allow={[]} deny={[]} onChange={onChange} suggestions={["src/**"]} />,
    );
    fireEvent.click(getAllByText("src/**")[0]!);
    expect(onChange).not.toHaveBeenCalled();
    expect((container.querySelector("input") as HTMLInputElement).value).toBe("src/**");
  });

  it("已在列表中的候选不再展示", () => {
    const { container } = render(
      <ScopeMatrix allow={["src/**"]} deny={[]} onChange={vi.fn()} suggestions={["src/**", "docs/**"]} />,
    );
    const chips = container.querySelectorAll('[data-bucket="allow"] button');
    const texts = Array.from(chips).map((b) => b.textContent);
    expect(texts).not.toContain("src/**");
    expect(texts).toContain("docs/**");
  });

  it("小结：都为空时说明未设限制", () => {
    const { getByText } = render(<ScopeMatrix allow={[]} deny={[]} />);
    expect(getByText("当前未设置任何范围限制。")).toBeTruthy();
  });

  it("小结：允许为空时说明未启用白名单（而非全部禁止）", () => {
    const { container } = render(<ScopeMatrix allow={[]} deny={["x"]} />);
    expect(container.textContent).toContain("未启用白名单");
  });

  it("小结：只有允许时说明其余全部拒绝", () => {
    const { container } = render(<ScopeMatrix allow={["x"]} deny={[]} />);
    expect(container.textContent).toContain("其余全部拒绝");
  });

  it("小结：两者都有时说明禁止优先", () => {
    const { container } = render(<ScopeMatrix allow={["a"]} deny={["b"]} />);
    expect(container.textContent).toContain("命中即拒绝");
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("ScopeMatrix · null 回落", () => {
  it("suggestions 传 null 不抛错", () => {
    const { getByText } = render(<ScopeMatrix allow={["a/**"]} deny={[]} suggestions={null as never} />);
    expect(getByText("允许")).toBeTruthy();
  });
});

// 见 hulianui/hulian#89：稳定父更新时整棵子树必须 bail out。
// 数组必须提到模块级：每轮现造新数组时浅比较必然失配，memo 从原理上就 bail 不掉。
const GUARD_ALLOW = ["a/**"];
const GUARD_DENY = ["b/**"];

describe("ScopeMatrix · memo", () => {
  it("稳定父更新时跳过矩阵子树", async () => {
    await expectMemoSkipsSubtree(() => <ScopeMatrix allow={GUARD_ALLOW} deny={GUARD_DENY} />);
  });
});
