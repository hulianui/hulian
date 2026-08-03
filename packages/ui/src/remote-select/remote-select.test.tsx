import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, act, fireEvent } from "@testing-library/react";
import { RemoteSelect } from "./remote-select";
import type { RemoteSelectFetchContext, RemoteSelectRow } from "./remote-select.types";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const rows = (from: number, count: number): RemoteSelectRow[] =>
  Array.from({ length: count }, (_, i) => ({ id: String(from + i), name: `项目 ${from + i}` }));

/** 让 React 处理完已 resolve 的 promise（fake timers 下微任务仍是真的）。 */
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

const advance = async (ms: number) => {
  await act(async () => {
    vi.advanceTimersByTime(ms);
    await Promise.resolve();
    await Promise.resolve();
  });
};

const getList = () => document.querySelector('[role="listbox"]') as HTMLElement;

const optionTexts = () =>
  Array.from(document.querySelectorAll('[role="option"]')).map((el) => el.textContent);

describe("RemoteSelect", () => {
  it("打开即拉第一页，选项来自 fetcher（本地不做二次过滤）", async () => {
    const fetcher = vi.fn(async (_q: string, _ctx: RemoteSelectFetchContext) => ({
      options: rows(1, 3),
      total: 3,
    }));
    render(<RemoteSelect defaultOpen fetcher={fetcher} />);
    await flush();

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(fetcher.mock.calls[0][0]).toBe("");
    expect(optionTexts()).toEqual(["项目 1", "项目 2", "项目 3"]);
  });

  it("输入防抖：连打两次只发一次请求，且带最后一次关键词", async () => {
    const fetcher = vi.fn(async (_q: string, _ctx: RemoteSelectFetchContext) => ({
      options: rows(1, 2),
      total: 2,
    }));
    render(<RemoteSelect defaultOpen debounce={300} fetcher={fetcher} />);
    await flush();
    expect(fetcher).toHaveBeenCalledTimes(1); // 打开的首页请求

    const input = screen.getByPlaceholderText("请选择");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.change(input, { target: { value: "ab" } });

    await advance(299);
    expect(fetcher).toHaveBeenCalledTimes(1);

    await advance(1);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toBe("ab");
    expect(fetcher.mock.calls[1][1].page).toBe(1);
  });

  it("取消旧请求：新搜索 abort 上一次，且慢响应回来不覆盖新结果", async () => {
    const signals: AbortSignal[] = [];
    const resolvers: ((r: { options: RemoteSelectRow[]; total: number }) => void)[] = [];
    const fetcher = vi.fn((_q: string, ctx: RemoteSelectFetchContext) => {
      signals.push(ctx.signal);
      return new Promise<{ options: RemoteSelectRow[]; total: number }>((resolve) => {
        resolvers.push(resolve);
      });
    });

    render(<RemoteSelect defaultOpen debounce={100} fetcher={fetcher} />);
    await flush();
    resolvers[0]({ options: rows(1, 1), total: 1 });
    await flush();

    const input = screen.getByPlaceholderText("请选择");
    fireEvent.change(input, { target: { value: "旧" } });
    await advance(100);
    expect(fetcher).toHaveBeenCalledTimes(2);

    fireEvent.change(input, { target: { value: "新" } });
    await advance(100);
    expect(fetcher).toHaveBeenCalledTimes(3);

    // 「旧」的 signal 已被 abort，「新」的仍在途。
    expect(signals[1].aborted).toBe(true);
    expect(signals[2].aborted).toBe(false);

    // 新结果先到，慢的旧结果后到 —— 列表必须仍是新结果。
    resolvers[2]({ options: rows(100, 1), total: 1 });
    await flush();
    expect(optionTexts()).toEqual(["项目 100"]);

    resolvers[1]({ options: rows(200, 1), total: 1 });
    await flush();
    expect(optionTexts()).toEqual(["项目 100"]);
  });

  it("滚动到底追加下一页（page+1，结果 append 不覆盖）", async () => {
    const fetcher = vi.fn(async (_q: string, ctx: RemoteSelectFetchContext) => ({
      options: rows((ctx.page - 1) * 10 + 1, 10),
      total: 25,
    }));
    render(<RemoteSelect defaultOpen pageSize={10} fetcher={fetcher} />);
    await flush();
    expect(optionTexts()).toHaveLength(10);

    const list = getList();
    Object.defineProperty(list, "scrollHeight", { value: 400, configurable: true });
    Object.defineProperty(list, "clientHeight", { value: 200, configurable: true });
    list.scrollTop = 200;
    fireEvent.scroll(list);
    await flush();

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][1].page).toBe(2);
    const texts = optionTexts();
    expect(texts).toHaveLength(20);
    expect(texts[0]).toBe("项目 1");
    expect(texts[19]).toBe("项目 20");
  });

  it("未到底不触发加载更多", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 10), total: 25 }));
    render(<RemoteSelect defaultOpen fetcher={fetcher} />);
    await flush();

    const list = getList();
    Object.defineProperty(list, "scrollHeight", { value: 400, configurable: true });
    Object.defineProperty(list, "clientHeight", { value: 200, configurable: true });
    list.scrollTop = 0;
    fireEvent.scroll(list);
    await flush();

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("resolveValue 回显：value 不在已加载列表里也能解出 label", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(101, 3), total: 3 }));
    const resolveValue = vi.fn(async (values: string[]) =>
      values.map((v) => ({ id: v, name: `第 ${v} 号` })),
    );
    render(<RemoteSelect fetcher={fetcher} resolveValue={resolveValue} value="7" />);
    await flush();

    expect(resolveValue).toHaveBeenCalledTimes(1);
    expect(resolveValue.mock.calls[0][0]).toEqual(["7"]);
    // 未展开过 → 一次列表请求都没发，label 完全由 resolveValue 兜底。
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue("第 7 号")).toBeTruthy();
  });

  it("resolveValue 缺席时回落显示裸 value，不留空白", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 1), total: 1 }));
    render(<RemoteSelect fetcher={fetcher} value="42" />);
    await flush();
    // 可见输入框（隐藏的表单提交 input 同样是 42，故按 placeholder 精确取可见那只）。
    expect((screen.getByPlaceholderText("请选择") as HTMLInputElement).value).toBe("42");
  });

  it("multiple：chip 严格按 value 顺序渲染（与 resolveValue 返回序无关）", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 5), total: 5 }));
    // 故意乱序返回：接口通常按主键排序，不保证跟 value 同序。
    const resolveValue = vi.fn(async (_values: string[]) => [
      { id: "1", name: "甲" },
      { id: "3", name: "丙" },
    ]);
    render(
      <RemoteSelect multiple fetcher={fetcher} resolveValue={resolveValue} value={["3", "1"]} />,
    );
    await flush();

    expect(resolveValue.mock.calls[0][0]).toEqual(["3", "1"]);
    const toolbar = document.querySelector('[role="toolbar"]') as HTMLElement;
    const chips = Array.from(toolbar.querySelectorAll("div")).filter((el) =>
      el.querySelector('[aria-label="移除"]'),
    );
    expect(chips.map((el) => el.textContent)).toEqual(["丙", "甲"]);
  });

  it("multiple：选中项按 value 顺序回调，选项未加载的也保留在值里", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 3), total: 3 }));
    const resolveValue = vi.fn(async (values: string[]) =>
      values.map((v) => ({ id: v, name: `旧 ${v}` })),
    );
    const onChange = vi.fn();
    render(
      <RemoteSelect
        multiple
        defaultOpen
        fetcher={fetcher}
        resolveValue={resolveValue}
        defaultValue={["9"]}
        onChange={onChange}
      />,
    );
    await flush();

    const option = screen.getByText("项目 2").closest('[role="option"]') as HTMLElement;
    fireEvent.click(option);
    await flush();

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toEqual(["9", "2"]);
    expect(onChange.mock.calls[0][1].map((o: { label: string }) => o.label)).toEqual([
      "旧 9",
      "项目 2",
    ]);
  });

  it("空态与加载态：加载中先显示 loadingMessage，落空数组后显示 emptyMessage", async () => {
    let resolveFn: ((r: { options: RemoteSelectRow[] }) => void) | undefined;
    const fetcher = vi.fn(
      () =>
        new Promise<{ options: RemoteSelectRow[] }>((resolve) => {
          resolveFn = resolve;
        }),
    );
    render(<RemoteSelect defaultOpen fetcher={fetcher} loadingMessage="拉取中" emptyMessage="没数据" />);
    await flush();
    // Base UI 的 Empty 是 aria-live 容器，文案后会跟不可见的播报占位符 → 用正则匹配。
    expect(screen.getByText(/拉取中/)).toBeTruthy();

    resolveFn?.({ options: [] });
    await flush();
    expect(screen.getByText(/没数据/)).toBeTruthy();
  });

  it("单选：选中后回调值与选项，并把 label 回填输入框", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 3), total: 3 }));
    const onChange = vi.fn();
    render(<RemoteSelect defaultOpen fetcher={fetcher} onChange={onChange} />);
    await flush();

    const option = screen.getByText("项目 2").closest('[role="option"]') as HTMLElement;
    fireEvent.click(option);
    await flush();

    expect(onChange).toHaveBeenCalledWith("2", expect.objectContaining({ value: "2", label: "项目 2" }));
    expect(screen.getByDisplayValue("项目 2")).toBeTruthy();
  });

  it("labelKey / valueKey 可映射任意后端字段", async () => {
    const fetcher = vi.fn(async () => ({
      options: [{ store_id: 800, store_name: "门店甲" }],
      total: 1,
    }));
    render(<RemoteSelect defaultOpen fetcher={fetcher} valueKey="store_id" labelKey="store_name" />);
    await flush();
    expect(optionTexts()).toEqual(["门店甲"]);
  });

  it("virtualized={false} 透传到底层 Combobox：候选超阈值也全量挂载", async () => {
    const fetcher = vi.fn(async () => ({ options: rows(1, 150), total: 150 }));
    // renderOption 渲染多行时行高 ≠ 32px，自动虚拟化会让滚动落位偏移 —— 这是它的逃生口。
    render(
      <RemoteSelect
        defaultOpen
        fetcher={fetcher}
        pageSize={150}
        virtualized={false}
        renderOption={(option) => (
          <span>
            <span>{option.label}</span>
            <span>{option.value}</span>
          </span>
        )}
      />,
    );
    await flush();
    expect(document.querySelector("[data-hulian-virtual-count]")).toBeNull();
    expect(document.querySelectorAll('[role="option"]').length).toBe(150);
  });
});
