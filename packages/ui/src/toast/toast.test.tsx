import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast, ToastProvider } from "./toast";
import { ConfigProvider } from "../config/config-provider";
import { enUS, zhCN } from "../config/locale";

// 全局单例 manager 跨测试持有 toast；RTL render 跨测试累积 DOM → 每个用例后清掉挂载。
// 各用例用唯一 title 文案隔离（limit=3 会挤出旧条，最新条始终可查）。
// Base UI 另渲一份 aria-live 播报副本 → title 文案出现两次，用 queryAllByText 取带皮肤的 <h2>。
afterEach(cleanup);

/** 取带指定皮肤类的标题元素（跳过 aria-live 播报副本）；不存在返回 undefined。 */
function titleEl(text: string, mustContain: string) {
  return screen.queryAllByText(text).find((el) => el.className.includes(mustContain));
}

describe("Toast", () => {
  it("关闭按钮随 enUS 本地化，缺 Provider 与 legacy locale 保持精确中文", () => {
    const assertClose = (label: string, title: string) => {
      act(() => { toast({ title, timeout: 0 }); });
      const root = titleEl(title, "text-foreground")!.closest("[class*='bg-surface']")!;
      expect(root.querySelector(`button[aria-label="${label}"]`)).toBeTruthy();
    };

    const first = render(<ToastProvider />);
    assertClose("关闭", "默认关闭标签");
    first.unmount();

    const second = render(<ConfigProvider locale={enUS}><ToastProvider /></ConfigProvider>);
    assertClose("Close", "English close label");
    second.unmount();

    render(<ConfigProvider locale={{ ...zhCN, components: undefined }}><ToastProvider /></ConfigProvider>);
    assertClose("关闭", "旧 locale 关闭标签");
  });
  it("toast() 触发后 Provider 渲出 title 与 description", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存", description: "更改已成功同步。" });
    });
    expect(screen.getAllByText("已保存").length).toBeGreaterThan(0);
    expect(screen.getAllByText("更改已成功同步。").length).toBeGreaterThan(0);
  });

  it("danger tone：标题 text-danger + 容器 border-l-danger", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "出错了", tone: "danger" });
    });
    const title = titleEl("出错了", "text-danger");
    expect(title).toBeTruthy();
    // 容器（Toast.Root）带 danger 左边条
    expect(title!.closest("[class*='border-l-danger']")).not.toBeNull();
  });

  it("success tone：标题 text-success + 容器 border-l-success", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "已保存成功", tone: "success" });
    });
    const title = titleEl("已保存成功", "text-success");
    expect(title).toBeTruthy();
    expect(title!.closest("[class*='border-l-success']")).not.toBeNull();
  });

  it("warning tone：标题 text-warning + 容器 border-l-warning", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "部分失败", tone: "warning" });
    });
    const title = titleEl("部分失败", "text-warning");
    expect(title).toBeTruthy();
    expect(title!.closest("[class*='border-l-warning']")).not.toBeNull();
  });

  it("info tone：标题 text-info", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "提示", tone: "info" });
    });
    expect(titleEl("提示", "text-info")).toBeTruthy();
  });

  it("默认 tone=neutral：标题 text-foreground", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "普通" });
    });
    expect(titleEl("普通", "text-foreground")).toBeTruthy();
  });

  it("点 Close 按钮后该 toast 移除", async () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "可关闭项", timeout: 0 }); // 0=不自动消失，隔离计时干扰
    });
    const title = titleEl("可关闭项", "text-foreground");
    expect(title).toBeTruthy();
    const root = title!.closest("[class*='bg-surface']") as HTMLElement;
    // Base UI 在 toast 未聚焦时给 Close 加 aria-hidden（移出 a11y 树）→ getByRole 找不到，直接查 DOM。
    const closeBtn = root.querySelector('button[aria-label="关闭"]') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    fireEvent.click(closeBtn);
    await waitFor(() => expect(titleEl("可关闭项", "text-foreground")).toBeFalsy());
  });

  it("ToastProvider 透传渲染 children（包裹式写法不吞子树）", () => {
    render(
      <ToastProvider>
        <div>应用内容</div>
      </ToastProvider>,
    );
    expect(screen.getByText("应用内容")).toBeTruthy();
    // children 存在时命令式触发照常工作
    act(() => {
      toast({ title: "包裹式触发" });
    });
    expect(screen.getAllByText("包裹式触发").length).toBeGreaterThan(0);
  });

  it("timeout:0 不自动消失（fake timers 推进 10s 仍在）", () => {
    vi.useFakeTimers();
    try {
      render(<ToastProvider />);
      act(() => {
        toast({ title: "常驻项", timeout: 0 });
      });
      act(() => {
        vi.advanceTimersByTime(10000);
      });
      expect(titleEl("常驻项", "text-foreground")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe("toast.close（关闭句柄 · #227）", () => {
  it("toast.close(id) 把那一条从 DOM 里摘掉", async () => {
    render(<ToastProvider />);
    let id = "";
    act(() => {
      id = toast({ title: "按 id 关掉这条", timeout: 0 });
    });
    expect(titleEl("按 id 关掉这条", "text-foreground")).toBeTruthy();
    act(() => {
      toast.close(id);
    });
    await waitFor(() => expect(titleEl("按 id 关掉这条", "text-foreground")).toBeFalsy());
  });

  it("只关目标那一条，其余不受影响", async () => {
    render(<ToastProvider />);
    let target = "";
    act(() => {
      target = toast({ title: "被点名的那条", timeout: 0 });
      toast({ title: "旁观的那条", timeout: 0 });
    });
    act(() => {
      toast.close(target);
    });
    await waitFor(() => expect(titleEl("被点名的那条", "text-foreground")).toBeFalsy());
    expect(titleEl("旁观的那条", "text-foreground")).toBeTruthy();
  });

  it("不传 id 关掉全部", async () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "全清甲", timeout: 0 });
      toast({ title: "全清乙", timeout: 0 });
    });
    act(() => {
      toast.close();
    });
    await waitFor(() => expect(titleEl("全清甲", "text-foreground")).toBeFalsy());
    expect(titleEl("全清乙", "text-foreground")).toBeFalsy();
  });

  it("「进行中 → 关掉它 → 弹结果」不会同屏并存（issue 里断掉的那条链路）", async () => {
    render(<ToastProvider />);
    let id = "";
    act(() => {
      id = toast({ title: "正在上传图片…", loading: true });
    });
    act(() => {
      toast.close(id);
      toast({ title: "上传成功", tone: "success" });
    });
    await waitFor(() => expect(titleEl("正在上传图片…", "text-foreground")).toBeFalsy());
    expect(titleEl("上传成功", "text-success")).toBeTruthy();
  });
});

describe("toast loading 档（#227）", () => {
  it("loading 不自动消失：fake timers 推进 30s 仍在", () => {
    vi.useFakeTimers();
    try {
      render(<ToastProvider />);
      act(() => {
        toast({ title: "进行中不该自己走", loading: true });
      });
      act(() => {
        vi.advanceTimersByTime(30000);
      });
      expect(titleEl("进行中不该自己走", "text-foreground")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("显式 timeout 覆盖 loading 的缺省 0（不是两套互相打架的常驻语义）", () => {
    vi.useFakeTimers();
    try {
      render(<ToastProvider />);
      act(() => {
        toast({ title: "进行中但限时", loading: true, timeout: 3000 });
      });
      act(() => {
        vi.advanceTimersByTime(5000);
      });
      expect(titleEl("进行中但限时", "text-foreground")).toBeFalsy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("渲出转圈图标：aria-hidden（不嵌套活动区）+ reduced-motion 减速而非停转", () => {
    render(<ToastProvider />);
    act(() => {
      toast({ title: "带转圈的那条", loading: true, timeout: 0 });
    });
    const root = titleEl("带转圈的那条", "text-foreground")!.closest(
      "[class*='bg-surface']",
    ) as HTMLElement;
    const spinner = root.querySelector("svg[aria-hidden]") as SVGElement;
    expect(spinner).toBeTruthy();
    const cls = spinner.getAttribute("class")!.split(/\s+/);
    expect(cls).toContain("animate-spin");
    // 定格成静止圆弧 = 状态信息当场消失，故这里刻意不是库内装饰件那套 [animation:none]
    expect(cls).toContain("motion-reduce:[animation-duration:2.4s]");
    expect(cls).not.toContain("motion-reduce:[animation:none]");
    // 未开 loading 的那条不该冒出图标
    act(() => {
      toast({ title: "没有转圈的那条", timeout: 0 });
    });
    const plain = titleEl("没有转圈的那条", "text-foreground")!.closest(
      "[class*='bg-surface']",
    ) as HTMLElement;
    expect(plain.querySelector("svg[aria-hidden]")).toBeNull();
  });
});

describe("ToastProvider position（#227）", () => {
  const viewport = () => document.querySelector(".fixed.z-\\[60\\]") as HTMLElement;

  it("不传 position：仍是右上角，类串与历史逐字一致", () => {
    render(<ToastProvider />);
    expect(viewport().getAttribute("class")).toBe(
      "fixed right-4 top-4 z-[60] flex w-[min(90vw,22rem)] flex-col gap-2 outline-none",
    );
  });

  it("bottom-left：停靠左下 + 队列反向堆叠（最新一条贴停靠边）", () => {
    render(<ToastProvider position="bottom-left" />);
    const cls = viewport().getAttribute("class")!.split(/\s+/);
    expect(cls).toContain("bottom-4");
    expect(cls).toContain("left-4");
    expect(cls).toContain("flex-col-reverse");
    // twMerge 同组取后者：flex-col 必须已被顶掉，否则堆叠方向是反的
    expect(cls).not.toContain("flex-col");
    expect(cls).not.toContain("top-4");
    expect(cls).not.toContain("right-4");
  });

  it("top-center：横向居中，不反向堆叠", () => {
    render(<ToastProvider position="top-center" />);
    const cls = viewport().getAttribute("class")!.split(/\s+/);
    expect(cls).toContain("left-1/2");
    expect(cls).toContain("-translate-x-1/2");
    expect(cls).toContain("flex-col");
    expect(cls).not.toContain("flex-col-reverse");
  });

  it("入场位移方向跟着停靠边换手：左侧档从左边滑入", () => {
    render(<ToastProvider position="bottom-left" />);
    act(() => {
      toast({ title: "左下入场", timeout: 0 });
    });
    const root = titleEl("左下入场", "text-foreground")!.closest(
      "[class*='bg-surface']",
    ) as HTMLElement;
    const cls = root.className.split(/\s+/);
    expect(cls).toContain("data-[starting-style]:-translate-x-4");
    expect(cls).not.toContain("data-[starting-style]:translate-x-4");
  });
});
