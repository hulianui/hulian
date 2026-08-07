import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { PreviewSandbox } from "./preview-sandbox";
import { PREVIEW_SANDBOX_MESSAGE_KEY } from "./preview-sandbox-bridge";

const HTML = "<html><head></head><body><h1>hello</h1></body></html>";

/**
 * 冲掉一拍异步：
 * - jsdom 会在渲染之后自己触发 iframe 的 load（这是真实行为，用它比 fireEvent.load 更可信）；
 * - 错误态里的 Button 会异步加载 motion 特性包，落在测试体外会撞「window is not defined」。
 */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function frameOf(container: HTMLElement): HTMLIFrameElement {
  const el = container.querySelector("iframe");
  if (!el) throw new Error("没有渲染 iframe");
  return el;
}

/** 模拟预览内脚本回传的错误消息（jsdom 不会真的执行 srcDoc 里的脚本）。 */
function postFromFrame(frame: HTMLIFrameElement, payload: Record<string, unknown>) {
  const data = { ...payload, [PREVIEW_SANDBOX_MESSAGE_KEY]: frame.getAttribute("data-frame-id") };
  act(() => {
    window.dispatchEvent(new MessageEvent("message", { data }));
  });
}

afterEach(async () => {
  await settle();
  vi.restoreAllMocks();
});

describe("PreviewSandbox · iframe 模式", () => {
  it("code 直接进 srcdoc，默认 sandbox 只给 allow-scripts", async () => {
    const { container } = render(<PreviewSandbox code={HTML} />);
    await settle();
    const frame = frameOf(container);
    expect(frame.getAttribute("srcdoc")).toContain("<h1>hello</h1>");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts");
    expect(frame.getAttribute("title")).toBe("预览沙箱");
  });

  it("默认注入错误转发脚本；instrument=false 则原样传，一个字符不加", async () => {
    const { container } = render(<PreviewSandbox code={HTML} />);
    const bare = render(<PreviewSandbox code={HTML} instrument={false} />);
    await settle();
    expect(frameOf(container).getAttribute("srcdoc")).toContain("addEventListener('error'");
    expect(frameOf(bare.container).getAttribute("srcdoc")).toBe(HTML);
  });

  it("sandbox 可覆盖（放开隔离是显式选择）", async () => {
    const { container } = render(
      <PreviewSandbox code={HTML} sandbox="allow-scripts allow-same-origin" />,
    );
    await settle();
    expect(frameOf(container).getAttribute("sandbox")).toBe("allow-scripts allow-same-origin");
  });

  it("切设备不重挂 iframe，也不重载文档（预览内状态不丢、不白闪）", async () => {
    const { container, rerender } = render(<PreviewSandbox code={HTML} device="desktop" />);
    await settle();
    const before = frameOf(container);
    const srcBefore = before.getAttribute("srcdoc");

    rerender(<PreviewSandbox code={HTML} device="iphone" />);
    const afterPhone = frameOf(container);
    rerender(<PreviewSandbox code={HTML} device={{ width: 600, height: 900 }} />);
    const afterCustom = frameOf(container);

    expect(afterPhone).toBe(before);
    expect(afterCustom).toBe(before);
    expect(afterCustom.getAttribute("srcdoc")).toBe(srcBefore);
  });

  it("换 code 只改 srcdoc，iframe 节点仍是同一个（热更新而非重建）", async () => {
    const { container, rerender } = render(<PreviewSandbox code={HTML} />);
    await settle();
    const before = frameOf(container);
    rerender(<PreviewSandbox code="<p>next</p>" />);
    expect(frameOf(container)).toBe(before);
    expect(frameOf(container).getAttribute("srcdoc")).toContain("<p>next</p>");
  });

  it("载入完成 → onReady + 加载态收回 false", async () => {
    const onReady = vi.fn();
    const onLoadingChange = vi.fn();
    render(<PreviewSandbox code={HTML} onReady={onReady} onLoadingChange={onLoadingChange} />);
    expect(onLoadingChange).toHaveBeenCalledWith(true);
    expect(onReady).not.toHaveBeenCalled();

    await settle();
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onLoadingChange).toHaveBeenLastCalledWith(false);
  });

  it("预览内错误经消息回传 → onError（source=iframe）+ 错误态可见", async () => {
    const onError = vi.fn();
    const { container, getByRole, getByText } = render(
      <PreviewSandbox code={HTML} onError={onError} />,
    );
    await settle();
    postFromFrame(frameOf(container), { kind: "error", message: "boom", filename: "about:srcdoc" });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toMatchObject({
      source: "iframe",
      kind: "error",
      message: "boom",
      error: null,
    });
    expect(getByRole("alert")).toBeTruthy();
    expect(getByText("boom")).toBeTruthy();
  });

  it("别的窗口发来的同形状消息不算数（不认 origin，只认来源窗口）", async () => {
    const onError = vi.fn();
    const { container } = render(<PreviewSandbox code={HTML} onError={onError} />);
    await settle();
    const frame = frameOf(container);
    const data = {
      [PREVIEW_SANDBOX_MESSAGE_KEY]: frame.getAttribute("data-frame-id"),
      kind: "error",
      message: "boom",
    };
    act(() => {
      window.dispatchEvent(
        new MessageEvent("message", { data, source: {} as unknown as MessageEventSource }),
      );
    });
    expect(onError).not.toHaveBeenCalled();
  });

  it("重试：重载文档（srcdoc 变化）但不换 iframe 节点，错误态消失", async () => {
    const { container, getByRole, queryByRole } = render(<PreviewSandbox code={HTML} />);
    await settle();
    const frame = frameOf(container);
    const srcBefore = frame.getAttribute("srcdoc");
    postFromFrame(frame, { kind: "error", message: "boom" });
    expect(queryByRole("alert")).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "重试" }));

    expect(queryByRole("alert")).toBeNull();
    expect(frameOf(container)).toBe(frame);
    expect(frame.getAttribute("srcdoc")).not.toBe(srcBefore);
  });

  it("renderError 完全接管错误态", async () => {
    const { container, getByText, queryByRole } = render(
      <PreviewSandbox code={HTML} renderError={(e) => <span>自定义：{e.message}</span>} />,
    );
    await settle();
    postFromFrame(frameOf(container), { kind: "error", message: "boom" });
    expect(getByText("自定义：boom")).toBeTruthy();
    expect(queryByRole("alert")).toBeNull();
  });

  it("instrument=false 时不监听消息（明确关掉就不该悄悄还在收）", async () => {
    const onError = vi.fn();
    const { container } = render(
      <PreviewSandbox code={HTML} instrument={false} onError={onError} />,
    );
    await settle();
    postFromFrame(frameOf(container), { kind: "error", message: "boom" });
    expect(onError).not.toHaveBeenCalled();
  });
});

describe("PreviewSandbox · 同文档模式", () => {
  it("children 直接渲染，不进 iframe", () => {
    const { container, getByText } = render(
      <PreviewSandbox>
        <p>直接渲染</p>
      </PreviewSandbox>,
    );
    expect(getByText("直接渲染")).toBeTruthy();
    expect(container.querySelector("iframe")).toBeNull();
  });

  it("挂载即就绪，且不进加载态", () => {
    const onReady = vi.fn();
    const onLoadingChange = vi.fn();
    render(
      <PreviewSandbox onReady={onReady} onLoadingChange={onLoadingChange}>
        <p>x</p>
      </PreviewSandbox>,
    );
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onLoadingChange).toHaveBeenCalledWith(false);
    expect(onLoadingChange).not.toHaveBeenCalledWith(true);
  });

  it("错误边界捕获子树崩溃 → onError（source=react，带原始 Error），重试后恢复", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    let shouldThrow = true;
    const Boom = () => {
      if (shouldThrow) throw new Error("子树炸了");
      return <p>恢复了</p>;
    };
    const onError = vi.fn();
    const { getByRole, queryByText } = render(
      <PreviewSandbox onError={onError}>
        <Boom />
      </PreviewSandbox>,
    );

    expect(onError).toHaveBeenCalledTimes(1);
    const err = onError.mock.calls[0]![0];
    expect(err).toMatchObject({ source: "react", kind: "error", message: "子树炸了" });
    expect(err.error).toBeInstanceOf(Error);
    expect(getByRole("alert")).toBeTruthy();

    shouldThrow = false;
    fireEvent.click(getByRole("button", { name: "重试" }));
    expect(queryByText("恢复了")).toBeTruthy();
    await settle();
  });
});

describe("PreviewSandbox · 设备外框", () => {
  // 机身尺寸从 aspectRatio 改为「宽 + 推导出的高」（#117 / #139），所以按 height 找机身。
  it("showDeviceFrame + 机型档位 → 套外框（机身尺寸由内屏推导）", async () => {
    const { container } = render(<PreviewSandbox code={HTML} device="iphone" showDeviceFrame />);
    await settle();
    const body = container.querySelector('div[style*="height"][style*="width"]');
    expect(body).toBeTruthy();
    expect(body!.contains(frameOf(container))).toBe(true);
  });

  it("desktop 没有对应机型外框，showDeviceFrame 不生效", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<PreviewSandbox code={HTML} device="desktop" showDeviceFrame />);
    await settle();
    expect(container.querySelector('div[style*="aspect-ratio"]')).toBeNull();
  });

  it("关闭外框（默认）时不套机身", async () => {
    const { container } = render(<PreviewSandbox code={HTML} device="iphone" />);
    await settle();
    expect(container.querySelector('div[style*="aspect-ratio"]')).toBeNull();
  });
});
