import { render, fireEvent } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ConfigProvider } from "../config";
import { enUS } from "../config/locale";
import { PasswordGenerator } from "./password-generator";

/** 结果区文本（逐字符 span 拼回一整串）。 */
function readOut(container: HTMLElement): string {
  return container.querySelector("output")?.textContent ?? "";
}

describe("PasswordGenerator", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("挂载后生成默认 14 位密码", () => {
    const { container } = render(<PasswordGenerator />);
    expect(readOut(container)).toHaveLength(14);
  });

  it("点重新生成产出不同的值", () => {
    const { container, getByLabelText } = render(<PasswordGenerator />);
    const first = readOut(container);
    fireEvent.click(getByLabelText("重新生成"));
    expect(readOut(container)).not.toBe(first);
  });

  it("onGenerate 带回熵与分档", () => {
    const onGenerate = vi.fn();
    render(<PasswordGenerator onGenerate={onGenerate} />);
    expect(onGenerate).toHaveBeenCalledTimes(1);
    const r = onGenerate.mock.calls[0][0];
    expect(r.mode).toBe("password");
    expect(r.value).toHaveLength(14);
    expect(r.entropy).toBeCloseTo(14 * Math.log2(70), 5);
    expect(r.strength).toBe("good");
  });

  it("内联回调不会导致每次渲染都重生成", () => {
    const onGenerate = vi.fn();
    const { rerender } = render(<PasswordGenerator onGenerate={onGenerate} />);
    rerender(<PasswordGenerator onGenerate={() => onGenerate("second render")} />);
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("改参数即重算：关掉数字后结果不含数字", () => {
    const { container, getByRole } = render(<PasswordGenerator />);
    fireEvent.click(getByRole("checkbox", { name: "数字 0-9" }));
    expect(readOut(container)).not.toMatch(/[0-9]/);
  });

  it("关掉数字后隐藏「最少数字」输入", () => {
    const { queryByRole, getByRole } = render(<PasswordGenerator />);
    expect(queryByRole("textbox", { name: "最少数字" })).not.toBeNull();
    fireEvent.click(getByRole("checkbox", { name: "数字 0-9" }));
    expect(queryByRole("textbox", { name: "最少数字" })).toBeNull();
  });

  it("onOptionsChange 报出改动后的完整参数", () => {
    const onOptionsChange = vi.fn();
    const { getByRole } = render(<PasswordGenerator onOptionsChange={onOptionsChange} />);
    fireEvent.click(getByRole("checkbox", { name: "大写 A-Z" }));
    const state = onOptionsChange.mock.calls.at(-1)?.[0];
    expect(state.mode).toBe("password");
    expect(state.password.uppercase).toBe(false);
    expect(state.passphrase.words).toBe(6);
  });

  it("切到密码短语模式后产出带分隔符的词组", () => {
    const { container, getByText } = render(<PasswordGenerator />);
    fireEvent.click(getByText("密码短语"));
    expect(readOut(container).split("-")).toHaveLength(6);
  });

  it("受控 mode 直接进短语模式并回调切换", () => {
    const onModeChange = vi.fn();
    const { container, getByText } = render(
      <PasswordGenerator mode="passphrase" onModeChange={onModeChange} />,
    );
    expect(readOut(container)).toMatch(/^[a-z]+(-[a-z]+){5}$/);
    fireEvent.click(getByText("密码"));
    expect(onModeChange).toHaveBeenCalledWith("password");
    // 受控：父级没改 prop，面板保持短语模式
    expect(readOut(container)).toContain("-");
  });

  it("modes 只给一种时不渲染切换器", () => {
    const { queryByText } = render(<PasswordGenerator modes={["passphrase"]} />);
    expect(queryByText("密码短语")).toBeNull();
  });

  it("defaultPasswordOptions 生效", () => {
    const { container } = render(
      <PasswordGenerator defaultPasswordOptions={{ length: 32, special: false }} />,
    );
    const value = readOut(container);
    expect(value).toHaveLength(32);
    expect(value).not.toMatch(/[!@#$%^&*]/);
  });

  it("复制写入剪贴板并回调原值", () => {
    const writeText = vi.fn();
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const onCopy = vi.fn();
    const { container, getByLabelText } = render(<PasswordGenerator onCopy={onCopy} />);
    fireEvent.click(getByLabelText("复制"));
    expect(writeText).toHaveBeenCalledWith(readOut(container));
    expect(onCopy).toHaveBeenCalledWith(readOut(container));
  });

  it("copyable=false 不渲染复制钮", () => {
    const { queryByLabelText } = render(<PasswordGenerator copyable={false} />);
    expect(queryByLabelText("复制")).toBeNull();
  });

  it("showOptions=false 只留结果与刷新", () => {
    const { queryByLabelText, getByLabelText } = render(<PasswordGenerator showOptions={false} />);
    expect(queryByLabelText("长度")).toBeNull();
    expect(getByLabelText("重新生成")).toBeTruthy();
  });

  it("强度条以 meter 语义暴露档位", () => {
    const { container } = render(<PasswordGenerator defaultPasswordOptions={{ length: 5 }} />);
    const meter = container.querySelector('[role="meter"]');
    expect(meter?.getAttribute("aria-valuenow")).toBe("1"); // 5×log2(70)≈30.7 bit → 弱
    expect(meter?.getAttribute("aria-valuetext")).toBe("弱");
  });

  it("showStrength=false 不渲染强度条", () => {
    const { container } = render(<PasswordGenerator showStrength={false} />);
    expect(container.querySelector('[role="meter"]')).toBeNull();
  });

  it("结果区是 aria-live 的 output，读屏能感知新值", () => {
    const { container } = render(<PasswordGenerator />);
    const out = container.querySelector("output");
    expect(out?.getAttribute("aria-live")).toBe("polite");
    expect(out?.getAttribute("aria-label")).toBe("生成结果");
  });

  it("数字与符号在结果区被着色区分", () => {
    const { container } = render(<PasswordGenerator defaultPasswordOptions={{ length: 40 }} />);
    const spans = [...container.querySelectorAll("output span")];
    expect(spans.some((s) => s.className.includes("text-primary"))).toBe(true);
    expect(spans.some((s) => s.className.includes("text-danger"))).toBe(true);
  });

  it("labels 覆盖单条文案", () => {
    const { getByLabelText } = render(<PasswordGenerator labels={{ regenerate: "换一个" }} />);
    expect(getByLabelText("换一个")).toBeTruthy();
  });

  it("ConfigProvider 切 enUS 走英文", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <PasswordGenerator />
      </ConfigProvider>,
    );
    expect(getByLabelText("Regenerate")).toBeTruthy();
  });

  it("环境无安全随机源时提示而不崩", () => {
    vi.stubGlobal("crypto", undefined);
    const { getByText, container } = render(<PasswordGenerator />);
    expect(getByText("当前环境不支持安全随机数，无法生成")).toBeTruthy();
    expect(container.querySelector("output")).toBeTruthy();
  });

  it("actions 槽渲染在底部", () => {
    const { getByText } = render(<PasswordGenerator actions={<button>使用此密码</button>} />);
    expect(getByText("使用此密码")).toBeTruthy();
  });

  it("服务端渲染出的是占位符而非真实值（否则必然水合不一致）", () => {
    // 生成结果每次都不同：SSR 若吐出真实密码，客户端 hydrate 出的另一串一定对不上
    const html = renderToString(<PasswordGenerator />);
    const out = html.match(/<output[^>]*>(.*?)<\/output>/s)?.[1] ?? "";
    expect(out).toContain("•".repeat(14));
    // 结果区里除了占位圆点没有任何字符——SSR 阶段确实什么都没生成
    expect(out.replace(/<[^>]+>/g, "")).toBe("•".repeat(14));
  });
});
