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
