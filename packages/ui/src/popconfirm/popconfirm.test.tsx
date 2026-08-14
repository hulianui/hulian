import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, waitFor, act } from "@testing-library/react";
import { Popconfirm } from "./popconfirm";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";

describe("Popconfirm", () => {
  it("缺 Provider 时默认按钮文案逐字保持中文", () => {
    const { getByText } = render(
      <Popconfirm defaultOpen title="t"><button>触发</button></Popconfirm>,
    );
    expect(getByText("确认")).toBeTruthy();
    expect(getByText("取消")).toBeTruthy();
  });

  it("enUS Provider 提供 Confirm / Cancel，显式 props 仍优先", () => {
    const { getByText, rerender } = render(
      <ConfigProvider locale={enUS}>
        <Popconfirm defaultOpen title="t"><button>Open</button></Popconfirm>
      </ConfigProvider>,
    );
    expect(getByText("Confirm")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
    rerender(
      <ConfigProvider locale={enUS}>
        <Popconfirm defaultOpen title="t" okText="Remove" cancelText="Keep"><button>Open</button></Popconfirm>
      </ConfigProvider>,
    );
    expect(getByText("Remove")).toBeTruthy();
    expect(getByText("Keep")).toBeTruthy();
  });

  it("legacy locale without components falls back to exact Chinese defaults", () => {
    const legacy = { ...zhCN, components: undefined };
    const { getByText } = render(
      <ConfigProvider locale={legacy}>
        <Popconfirm defaultOpen title="t"><button>触发</button></Popconfirm>
      </ConfigProvider>,
    );
    expect(getByText("确认")).toBeTruthy();
    expect(getByText("取消")).toBeTruthy();
  });
  it("defaultOpen 渲染标题/描述/确认/取消", () => {
    const { getByText } = render(
      <Popconfirm defaultOpen title="确定删除？" description="不可恢复" okText="删除" cancelText="算了">
        <button>触发</button>
      </Popconfirm>,
    );
    expect(getByText("确定删除？")).toBeTruthy();
    expect(getByText("不可恢复")).toBeTruthy();
    expect(getByText("删除")).toBeTruthy();
    expect(getByText("算了")).toBeTruthy();
  });

  it("点确认（同步 onConfirm）→ 回调一次 + 关闭(onOpenChange false)", () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <Popconfirm defaultOpen title="t" onConfirm={onConfirm} onOpenChange={onOpenChange}>
        <button>触发</button>
      </Popconfirm>,
    );
    fireEvent.click(getByText("确认"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("点取消 → onCancel + 关闭，且不触发 onConfirm", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <Popconfirm defaultOpen title="t" onConfirm={onConfirm} onCancel={onCancel} onOpenChange={onOpenChange}>
        <button>触发</button>
      </Popconfirm>,
    );
    fireEvent.click(getByText("取消"));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("danger → 确认按钮带 danger 皮肤(bg-danger)", () => {
    const { getByText } = render(
      <Popconfirm defaultOpen danger title="t">
        <button>触发</button>
      </Popconfirm>,
    );
    const ok = getByText("确认").closest("button")!;
    expect(ok.className).toContain("bg-danger");
  });

  it("disabled → 触发器照常渲染，但即便 defaultOpen 也不出浮层", () => {
    const { getByText, queryByText } = render(
      <Popconfirm disabled defaultOpen title="不该出现">
        <button>触发</button>
      </Popconfirm>,
    );
    expect(getByText("触发")).toBeTruthy();
    expect(queryByText("不该出现")).toBeNull();
  });

  it("异步 onConfirm → 确认期间 loading，resolve 后关闭", async () => {
    let resolve!: () => void;
    const onConfirm = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    const onOpenChange = vi.fn();
    const { getByText } = render(
      <Popconfirm defaultOpen title="t" onConfirm={onConfirm} onOpenChange={onOpenChange}>
        <button>触发</button>
      </Popconfirm>,
    );
    fireEvent.click(getByText("确认"));
    // Popover 内容 Portal 到 document.body → 须从 document 查（非局部 container）。
    await waitFor(() => expect(document.querySelector(".animate-spin")).toBeTruthy());
    expect(onOpenChange).not.toHaveBeenCalled(); // 未 resolve 不关闭
    await act(async () => {
      resolve();
    });
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("icon={null} → 不渲染默认警示图标", () => {
    render(
      <Popconfirm defaultOpen icon={null} title="t">
        <button>触发</button>
      </Popconfirm>,
    );
    expect(document.querySelector(".lucide-triangle-alert")).toBeNull();
  });
});

describe("Popconfirm 拦截子元素动作（#267）", () => {
  it("children 带 onClick 时 dev 下点名（否则「被丢弃」这件事无从察觉）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Popconfirm title="t">
        <button onClick={() => {}}>删除</button>
      </Popconfirm>,
    );
    expect(warn.mock.calls.flat().join("\n")).toContain("children 自带的 onClick 已被忽略");
    warn.mockRestore();
  });

  it("点触发器只打开确认框，子元素自带的 onClick 不执行", async () => {
    const childClick = vi.fn();
    const onConfirm = vi.fn();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getByText } = render(
      <Popconfirm title="确定要删除吗？" onConfirm={onConfirm}>
        <button onClick={childClick}>删除</button>
      </Popconfirm>,
    );
    fireEvent.click(getByText("删除"));
    await waitFor(() => expect(document.body.textContent).toContain("确定要删除吗？"));
    expect(childClick).not.toHaveBeenCalled(); // 破坏性动作不该在确认之前跑
    expect(onConfirm).not.toHaveBeenCalled();
    fireEvent.click(getByText("确认"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(childClick).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("disabled：不弹确认，但照样执行 onConfirm（「这次不用问」不是「按钮失效」）", () => {
    const onConfirm = vi.fn();
    const { getByText } = render(
      <Popconfirm disabled title="确定要删除吗？" onConfirm={onConfirm}>
        <button>删除</button>
      </Popconfirm>,
    );
    fireEvent.click(getByText("删除"));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(document.body.textContent).not.toContain("确定要删除吗？");
  });

  it("disabled 下 onConfirm 抛 rejected promise 不炸（失败反馈仍归消费方）", () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error("boom")));
    const { getByText } = render(
      <Popconfirm disabled title="t" onConfirm={onConfirm}>
        <button>删除</button>
      </Popconfirm>,
    );
    expect(() => fireEvent.click(getByText("删除"))).not.toThrow();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
