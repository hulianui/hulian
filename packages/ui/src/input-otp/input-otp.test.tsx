import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { InputOTP } from "./input-otp";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const inputs = (c: HTMLElement) => Array.from(c.querySelectorAll("input"));

describe("InputOTP", () => {
  it("稳定父更新时跳过 InputOTP 子树", async () => {
    await expectMemoSkipsSubtree(() => <InputOTP length={6} defaultValue="123" />);
  });

  it("按 length 渲染对应数量的格子", () => {
    const { container } = render(<InputOTP length={4} />);
    expect(inputs(container)).toHaveLength(4);
  });

  it("输入数字后值进入对应格 + onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "1" } });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("numeric 模式过滤非数字", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "a" } });
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  it("text 模式允许字母", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} type="text" onChange={onChange} />);
    fireEvent.change(inputs(container)[0], { target: { value: "a" } });
    expect(onChange).toHaveBeenLastCalledWith("a");
  });

  it("中间清空保留位置（不左移）", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="1234" onChange={onChange} />);
    fireEvent.change(inputs(container)[1], { target: { value: "" } });
    expect(onChange).toHaveBeenLastCalledWith("1 34");
  });

  it("Backspace 清空当前格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="12" onChange={onChange} />);
    fireEvent.keyDown(inputs(container)[1], { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("Backspace 在空格回退并清前一格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={4} value="12" onChange={onChange} />);
    fireEvent.keyDown(inputs(container)[2], { key: "Backspace" });
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("粘贴整段分发到各格", () => {
    const onChange = vi.fn();
    const { container } = render(<InputOTP length={6} onChange={onChange} />);
    fireEvent.paste(inputs(container)[0], { clipboardData: { getData: () => "123456" } });
    expect(onChange).toHaveBeenLastCalledWith("123456");
  });

  it("填满触发 onComplete", () => {
    const onComplete = vi.fn();
    const { container } = render(<InputOTP length={4} value="123" onComplete={onComplete} />);
    fireEvent.change(inputs(container)[3], { target: { value: "4" } });
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("invalid 加 danger 边框 + aria-invalid", () => {
    const { container } = render(<InputOTP length={2} invalid />);
    const first = inputs(container)[0];
    expect(first.getAttribute("aria-invalid")).toBe("true");
    expect(first.className).toContain("border-danger");
  });

  // —— 接 react-hook-form Controller 所需的透传（#157）——
  it("onBlur 只在焦点离开整组时触发（槽位间跳焦不算）", () => {
    const onBlur = vi.fn();
    const { container } = render(<InputOTP length={3} onBlur={onBlur} />);
    const [a, b] = inputs(container);
    // 从第 1 格跳到第 2 格：还在组内，不该算失焦，否则 RHF 的 onBlur/onTouched
    // 模式会在用户刚输一位时就开始报错。
    fireEvent.blur(a, { relatedTarget: b });
    expect(onBlur).not.toHaveBeenCalled();
    // 跳到组外的元素才算
    const outside = document.createElement("button");
    document.body.appendChild(outside);
    fireEvent.blur(b, { relatedTarget: outside });
    expect(onBlur).toHaveBeenCalledTimes(1);
    outside.remove();
  });

  it("焦点离开窗口（relatedTarget=null）照样触发 onBlur", () => {
    const onBlur = vi.fn();
    const { container } = render(<InputOTP length={2} onBlur={onBlur} />);
    fireEvent.blur(inputs(container)[0], { relatedTarget: null });
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("name 渲染持有完整值的隐藏 input（原生表单提交拿到整串而非 N 个字段）", () => {
    const { container } = render(<InputOTP length={4} name="otp" defaultValue="1234" />);
    const hidden = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hidden.name).toBe("otp");
    expect(hidden.value).toBe("1234");
    // 且必须排在槽位之后，不能挪动按下标取槽位的写法
    expect(inputs(container)[0].getAttribute("type")).toBe("text");
  });

  it("id / data-* / 其余根节点属性照常透传", () => {
    const { getByRole } = render(<InputOTP length={2} id="otp-field" data-testid="otp" />);
    const group = getByRole("group");
    expect(group.id).toBe("otp-field");
    expect(group.getAttribute("data-testid")).toBe("otp");
  });

  it("ConfigProvider locale=enUS localizes the default group label", () => {
    const { getByRole } = render(
      <ConfigProvider locale={enUS}>
        <InputOTP length={4} />
      </ConfigProvider>,
    );
    expect(getByRole("group", { name: "Verification code" })).toBeTruthy();
  });
});
