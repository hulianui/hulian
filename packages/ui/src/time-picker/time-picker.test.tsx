import { describe, it, expect, vi } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { ConfigProvider, enUS } from "../config";
import { Field } from "../field";
import { TimePicker } from "./time-picker";
import { inputShellVariants } from "../input/input";

// 触发器是 role="combobox" 而非 button（#315）：按 button 取会同时命中「清除」那颗。
const openPanel = () => fireEvent.click(screen.getByRole("combobox", { name: "选择时间" }));

describe("TimePicker", () => {
  it("默认渲染占位文本，无清除按钮", () => {
    render(<TimePicker aria-label="选择时间" />);
    expect(screen.getByText("选择时间")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
  });

  it("有值时显示定宽时间文本", () => {
    render(<TimePicker defaultValue="09:30" aria-label="选择时间" />);
    expect(screen.getByText("09:30")).toBeTruthy();
  });

  it("默认只有时/分两列，withSeconds 才出秒列", () => {
    const a = render(<TimePicker defaultValue="09:30" aria-label="选择时间" />);
    openPanel();
    expect(screen.queryByRole("listbox", { name: "秒" })).toBeNull();
    a.unmount();

    render(<TimePicker withSeconds defaultValue="09:30:15" aria-label="选择时间" />);
    openPanel();
    expect(screen.getByRole("listbox", { name: "秒" })).toBeTruthy();
  });

  it("点小时列提交新值，分钟保持", () => {
    const onValueChange = vi.fn();
    render(<TimePicker defaultValue="09:30" onValueChange={onValueChange} aria-label="选择时间" />);
    openPanel();
    fireEvent.click(screen.getByRole("option", { name: "时 14" }));
    expect(onValueChange).toHaveBeenCalledWith("14:30");
  });

  it("未选过时以 00:00 为底", () => {
    const onValueChange = vi.fn();
    render(<TimePicker onValueChange={onValueChange} aria-label="选择时间" />);
    openPanel();
    fireEvent.click(screen.getByRole("option", { name: "分 45" }));
    expect(onValueChange).toHaveBeenCalledWith("00:45");
  });

  it("withSeconds 时值形状带秒", () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        withSeconds
        defaultValue="09:30:15"
        onValueChange={onValueChange}
        aria-label="选择时间"
      />,
    );
    openPanel();
    fireEvent.click(screen.getByRole("option", { name: "秒 42" }));
    expect(onValueChange).toHaveBeenCalledWith("09:30:42");
  });

  it("minuteStep 只列出整步的分钟", () => {
    render(<TimePicker minuteStep={15} defaultValue="09:30" aria-label="选择时间" />);
    openPanel();
    expect(screen.getByRole("option", { name: "分 45" })).toBeTruthy();
    expect(screen.queryByRole("option", { name: "分 44" })).toBeNull();
  });

  it("minTime/maxTime 逐列灰掉不可达值", () => {
    render(
      <TimePicker minTime="09:30" maxTime="18:00" defaultValue="10:00" aria-label="选择时间" />,
    );
    openPanel();
    expect((screen.getByRole("option", { name: "时 08" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
    expect((screen.getByRole("option", { name: "时 09" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    expect((screen.getByRole("option", { name: "时 19" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("未选过 + 有 minTime：基准落在夹紧后的时刻，分钟列立刻可用", () => {
    const onValueChange = vi.fn();
    render(<TimePicker minTime="09:30" onValueChange={onValueChange} aria-label="选择时间" />);
    openPanel();
    // 隐含基准 = clamp(00:00, min=09:30) = 09:30，所以「分 45」可点且落在 9 点
    expect((screen.getByRole("option", { name: "分 45" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
    fireEvent.click(screen.getByRole("option", { name: "分 45" }));
    expect(onValueChange).toHaveBeenCalledWith("09:45");
  });

  it("未选过 + 有 minTime：仍禁掉基准小时内早于下界的分钟", () => {
    render(<TimePicker minTime="09:30" aria-label="选择时间" />);
    openPanel();
    expect((screen.getByRole("option", { name: "分 29" }) as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it("清除按钮回传 null", () => {
    const onValueChange = vi.fn();
    render(<TimePicker defaultValue="09:30" onValueChange={onValueChange} aria-label="选择时间" />);
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("readOnly 选不动", () => {
    const onValueChange = vi.fn();
    render(
      <TimePicker
        defaultValue="09:30"
        readOnly
        onValueChange={onValueChange}
        aria-label="选择时间"
      />,
    );
    openPanel();
    fireEvent.click(screen.getByRole("option", { name: "时 14" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("disabled 打不开面板", () => {
    render(<TimePicker defaultValue="09:30" disabled aria-label="选择时间" />);
    openPanel();
    expect(screen.queryByRole("listbox", { name: "时" })).toBeNull();
  });

  it("当前值所在项标 aria-selected", () => {
    render(<TimePicker defaultValue="09:30" aria-label="选择时间" />);
    openPanel();
    expect(screen.getByRole("option", { name: "时 09" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("option", { name: "分 30" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("ConfigProvider locale=enUS localizes the full picker chrome", () => {
    render(
      <ConfigProvider locale={enUS}>
        <TimePicker defaultValue="09:30" />
      </ConfigProvider>,
    );
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
    // combobox 不是「名字取自内容」的角色，所以这里按角色取而不带 name（与 DatePicker 一致）
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox", { name: "Hour" })).toBeTruthy();
    expect(screen.getByRole("listbox", { name: "Minute" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Now" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Confirm" })).toBeTruthy();
  });

  // #98：触发器此前硬编码 h-9(36px)，与 Input 的 32/40/48 刻度对不上，并排必错位。
  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s 触发器高度 %s，与 Input 同刻度", (size, h) => {
    expect(inputShellVariants({ size })).toContain(h);
    const { container } = render(<TimePicker size={size} aria-label="选择时间" />);
    expect(container.querySelector("button")!.className).toContain(h);
  });

  it("不传 size 时按 md（40px）渲染", () => {
    const { container } = render(<TimePicker aria-label="选择时间" />);
    expect(container.querySelector("button")!.className).toContain("h-10");
  });

  // #315：与 DatePicker 在 #293 里补的是同一条链 —— TimePicker 当时漏在名单外。
  describe("Field a11y 链（#315）", () => {
    it("触发器是 combobox 而非隐含的 button", () => {
      render(<TimePicker aria-label="选择时间" />);
      expect(screen.getByRole("combobox", { name: "选择时间" })).toBeTruthy();
    });

    it("Field required 注入的 aria-required 落到触发器上", () => {
      const { container } = render(
        <Field label="上班时间" required>
          <TimePicker />
        </Field>,
      );
      const trigger = container.querySelector('[role="combobox"]')!;
      expect(trigger.getAttribute("aria-required")).toBe("true");
      // label 的 htmlFor 此前指向一个不存在的 id，读屏念不出字段名
      expect(trigger.id).toBeTruthy();
      expect(container.querySelector("label")!.getAttribute("for")).toBe(trigger.id);
    });

    it("Field 的 description / error 经 aria-describedby 串到触发器，error 隐含 invalid", () => {
      const { container, getByText } = render(
        <Field label="上班时间" description="按班次同步" error="不能为空">
          <TimePicker />
        </Field>,
      );
      const trigger = container.querySelector('[role="combobox"]')!;
      const describedBy = trigger.getAttribute("aria-describedby") ?? "";
      expect(describedBy).toContain(getByText("按班次同步").id);
      expect(describedBy).toContain(getByText("不能为空").id);
      expect(trigger.getAttribute("aria-invalid")).toBe("true");
    });

    it("未列出的原生属性透传到触发器，而不是外层容器", () => {
      const { container } = render(<TimePicker data-testid="probe" title="选一个时刻" />);
      const probe = container.querySelector('[data-testid="probe"]')!;
      expect(probe.tagName).toBe("BUTTON");
      expect(probe.getAttribute("role")).toBe("combobox");
      expect(probe.getAttribute("title")).toBe("选一个时刻");
    });

    it("组件自身的 role 赢过外部传入的（rest 展开在最前，a11y 语义顶不掉）", () => {
      const { container } = render(
        // @ts-expect-error role 已被 Omit 掉，这里只钉运行时行为
        <TimePicker role="button" data-testid="probe" aria-label="选择时间" />,
      );
      expect(container.querySelector('[data-testid="probe"]')!.getAttribute("role")).toBe(
        "combobox",
      );
    });
  });
});
