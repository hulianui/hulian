import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";
import { TimeField } from "./time-field";
import { inputShellVariants } from "../input/input";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const hourSeg = () => screen.getByRole("spinbutton", { name: "小时" });
const minuteSeg = () => screen.getByRole("spinbutton", { name: "分钟" });
const secondSeg = () => screen.getByRole("spinbutton", { name: "秒" });

describe("TimeField", () => {
  it("稳定父更新时跳过 TimeField 子树", async () => {
    await expectMemoSkipsSubtree(() => <TimeField defaultValue="09:30" />);
  });

  it("enUS localizes the group, segments, empty value, and clear action", () => {
    render(
      <ConfigProvider locale={enUS}>
        <TimeField defaultValue="09:05:07" withSeconds />
      </ConfigProvider>,
    );
    expect(screen.getByRole("group", { name: "Time" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Hour" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Minute" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "Second" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Clear" })).toBeTruthy();
  });

  it("a legacy custom locale without timeField keeps the Chinese controls", () => {
    const locale = { ...enUS, components: { ...enUS.components!, timeField: undefined } };
    render(
      <ConfigProvider locale={locale}>
        <TimeField defaultValue="09:05:07" withSeconds />
      </ConfigProvider>,
    );
    expect(screen.getByRole("group", { name: "时间" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "小时" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "分钟" })).toBeTruthy();
    expect(screen.getByRole("spinbutton", { name: "秒" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "清除" })).toBeTruthy();
  });

  it("无值时各段显示 --", () => {
    render(<TimeField />);
    expect(hourSeg().textContent).toBe("--");
    expect(minuteSeg().textContent).toBe("--");
  });

  it("有值时按段补零显示", () => {
    render(<TimeField defaultValue="09:05" />);
    expect(hourSeg().textContent).toBe("09");
    expect(minuteSeg().textContent).toBe("05");
  });

  it("withSeconds 才渲染秒段", () => {
    const { unmount } = render(<TimeField defaultValue="09:05" />);
    expect(screen.queryByRole("spinbutton", { name: "秒" })).toBeNull();
    unmount();
    render(<TimeField defaultValue="09:05:07" withSeconds />);
    expect(secondSeg().textContent).toBe("07");
  });

  describe("↑↓ 调值", () => {
    it("按段加减并循环", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="23:59" onValueChange={onValueChange} />);
      fireEvent.keyDown(hourSeg(), { key: "ArrowUp" });
      expect(onValueChange).toHaveBeenLastCalledWith("00:59");
      fireEvent.keyDown(minuteSeg(), { key: "ArrowUp" });
      expect(onValueChange).toHaveBeenLastCalledWith("00:00");
    });

    it("空段起步 ↑ 给最小、↓ 给最大", () => {
      render(<TimeField />);
      fireEvent.keyDown(hourSeg(), { key: "ArrowDown" });
      expect(hourSeg().textContent).toBe("23");
    });

    it("整段没输完不对外提交", () => {
      const onValueChange = vi.fn();
      render(<TimeField onValueChange={onValueChange} />);
      fireEvent.keyDown(hourSeg(), { key: "ArrowUp" });
      expect(hourSeg().textContent).toBe("00");
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("数字键录入", () => {
    it("两位缓冲后提交，并自动跳下一段", () => {
      const onValueChange = vi.fn();
      render(<TimeField onValueChange={onValueChange} />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "1" });
      expect(hourSeg().textContent).toBe("01");
      fireEvent.keyDown(hourSeg(), { key: "4" });
      expect(hourSeg().textContent).toBe("14");
      expect(document.activeElement).toBe(minuteSeg());
      fireEvent.keyDown(minuteSeg(), { key: "3" });
      fireEvent.keyDown(minuteSeg(), { key: "0" });
      expect(onValueChange).toHaveBeenLastCalledWith("14:30");
    });

    it("首位补零即超范围时一位定形并跳段", () => {
      render(<TimeField />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "9" });
      expect(hourSeg().textContent).toBe("09");
      expect(document.activeElement).toBe(minuteSeg());
    });

    it("第二位放不下时当新首位重来，不钳到边界", () => {
      render(<TimeField />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "2" });
      fireEvent.keyDown(hourSeg(), { key: "9" });
      expect(hourSeg().textContent).toBe("09");
    });

    it("最后一段输满不会把焦点甩出去", () => {
      render(<TimeField defaultValue="09:00" />);
      minuteSeg().focus();
      fireEvent.keyDown(minuteSeg(), { key: "4" });
      fireEvent.keyDown(minuteSeg(), { key: "5" });
      expect(document.activeElement).toBe(minuteSeg());
    });
  });

  describe("←→ 切段", () => {
    it("在段之间移动，两端不越界", () => {
      render(<TimeField defaultValue="09:30:15" withSeconds />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "ArrowLeft" });
      expect(document.activeElement).toBe(hourSeg());
      fireEvent.keyDown(hourSeg(), { key: "ArrowRight" });
      expect(document.activeElement).toBe(minuteSeg());
      fireEvent.keyDown(minuteSeg(), { key: "ArrowRight" });
      expect(document.activeElement).toBe(secondSeg());
      fireEvent.keyDown(secondSeg(), { key: "ArrowRight" });
      expect(document.activeElement).toBe(secondSeg());
    });

    it("切段会清掉两位缓冲，避免黏到下一次输入", () => {
      render(<TimeField />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "1" });
      fireEvent.keyDown(hourSeg(), { key: "ArrowRight" });
      fireEvent.keyDown(hourSeg(), { key: "2" }); // 回到小时段再输，应作首位处理
      expect(hourSeg().textContent).toBe("02");
    });
  });

  describe("Backspace 清段", () => {
    it("清掉该段并回传 null", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="09:30" onValueChange={onValueChange} />);
      fireEvent.keyDown(minuteSeg(), { key: "Backspace" });
      expect(minuteSeg().textContent).toBe("--");
      expect(onValueChange).toHaveBeenCalledWith(null);
    });

    it("本来就没值就不重复回调", () => {
      const onValueChange = vi.fn();
      render(<TimeField onValueChange={onValueChange} />);
      fireEvent.keyDown(minuteSeg(), { key: "Backspace" });
      expect(onValueChange).not.toHaveBeenCalled();
    });
  });

  describe("min/max 钳制", () => {
    it("输完整段后越界钳到边界，显示同步跟上", () => {
      const onValueChange = vi.fn();
      render(
        <TimeField
          defaultValue="12:00"
          minTime="09:30"
          maxTime="18:00"
          onValueChange={onValueChange}
        />,
      );
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "2" });
      fireEvent.keyDown(hourSeg(), { key: "3" });
      expect(onValueChange).toHaveBeenLastCalledWith("18:00");
      expect(hourSeg().textContent).toBe("18");
      expect(minuteSeg().textContent).toBe("00");
    });

    it("下界同理", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="12:00" minTime="09:30" onValueChange={onValueChange} />);
      fireEvent.keyDown(hourSeg(), { key: "ArrowDown" });
      fireEvent.keyDown(hourSeg(), { key: "ArrowDown" });
      fireEvent.keyDown(hourSeg(), { key: "ArrowDown" });
      expect(onValueChange).toHaveBeenLastCalledWith("09:30");
    });
  });

  describe("清除按钮", () => {
    it("有值才出现，点了回传 null", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="09:30" onValueChange={onValueChange} />);
      fireEvent.click(screen.getByRole("button", { name: "清除" }));
      expect(onValueChange).toHaveBeenCalledWith(null);
      expect(hourSeg().textContent).toBe("--");
    });

    it("无值时不出现", () => {
      render(<TimeField />);
      expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
    });

    it("clearable={false} 不出现", () => {
      render(<TimeField defaultValue="09:30" clearable={false} />);
      expect(screen.queryByRole("button", { name: "清除" })).toBeNull();
    });
  });

  describe("disabled / readOnly", () => {
    it("disabled 时段不可聚焦、键盘无效", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="09:30" disabled onValueChange={onValueChange} />);
      expect(hourSeg().getAttribute("tabindex")).toBe("-1");
      fireEvent.keyDown(hourSeg(), { key: "ArrowUp" });
      expect(onValueChange).not.toHaveBeenCalled();
    });

    it("readOnly 改不动值，但还能切段", () => {
      const onValueChange = vi.fn();
      render(<TimeField defaultValue="09:30" readOnly onValueChange={onValueChange} />);
      fireEvent.keyDown(hourSeg(), { key: "ArrowUp" });
      fireEvent.keyDown(hourSeg(), { key: "1" });
      expect(onValueChange).not.toHaveBeenCalled();
      expect(hourSeg().textContent).toBe("09");
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "ArrowRight" });
      expect(document.activeElement).toBe(minuteSeg());
    });
  });

  describe("受控", () => {
    // 这一组是回归护栏：此前 applyParts 只在非受控时记录「刚提交的值」，于是受控用法下
    // 父组件把值回传下来会被当成「外部改了值」，连带清空两位缓冲 —— 表现是输 3 再输 0
    // 得到 00 而不是 30。全部用 defaultValue 的测试碰不到这条路径，是真键盘试出来的。
    function Controlled({ withSeconds }: { withSeconds?: boolean }) {
      const [v, setV] = useState<string | null>(null);
      return <TimeField value={v} onValueChange={setV} withSeconds={withSeconds} />;
    }

    it("受控回环下两位缓冲仍然有效（输 3 再输 0 得 30，不是 00）", () => {
      render(<Controlled />);
      hourSeg().focus();
      fireEvent.keyDown(hourSeg(), { key: "1" });
      fireEvent.keyDown(hourSeg(), { key: "4" });
      expect(hourSeg().textContent).toBe("14");
      fireEvent.keyDown(minuteSeg(), { key: "3" });
      fireEvent.keyDown(minuteSeg(), { key: "0" });
      expect(minuteSeg().textContent).toBe("30");
      expect(hourSeg().textContent).toBe("14");
    });

    it("受控回环下秒段同样保持缓冲", () => {
      render(<Controlled withSeconds />);
      fireEvent.keyDown(hourSeg(), { key: "0" });
      fireEvent.keyDown(hourSeg(), { key: "9" });
      fireEvent.keyDown(minuteSeg(), { key: "3" });
      fireEvent.keyDown(minuteSeg(), { key: "0" });
      fireEvent.keyDown(secondSeg(), { key: "4" });
      fireEvent.keyDown(secondSeg(), { key: "5" });
      expect(secondSeg().textContent).toBe("45");
      expect(minuteSeg().textContent).toBe("30");
      expect(hourSeg().textContent).toBe("09");
    });

    it("外部改值时把编辑态拽回来", () => {
      const { rerender } = render(<TimeField value="09:30" />);
      expect(hourSeg().textContent).toBe("09");
      rerender(<TimeField value="18:45" />);
      expect(hourSeg().textContent).toBe("18");
      expect(minuteSeg().textContent).toBe("45");
    });

    it("外部清空时段位也清空", () => {
      const { rerender } = render(<TimeField value="09:30" />);
      rerender(<TimeField value={null} />);
      expect(hourSeg().textContent).toBe("--");
    });
  });

  it("各段带 spinbutton 的 aria 数值语义", () => {
    render(<TimeField defaultValue="09:30" />);
    expect(hourSeg().getAttribute("aria-valuenow")).toBe("9");
    expect(hourSeg().getAttribute("aria-valuemax")).toBe("23");
    expect(minuteSeg().getAttribute("aria-valuemax")).toBe("59");
    expect(hourSeg().getAttribute("aria-valuetext")).toBe("09");
  });

  // #98：外壳此前硬编码 h-9(36px)，与 Input 的 32/40/48 刻度对不上，并排必错位。
  it.each([
    ["sm", "h-8"],
    ["md", "h-10"],
    ["lg", "h-12"],
  ] as const)("size=%s 外壳高度 %s，与 Input 同刻度", (size, h) => {
    expect(inputShellVariants({ size })).toContain(h);
    const { container } = render(<TimeField size={size} />);
    expect((container.firstElementChild as HTMLElement).className).toContain(h);
  });

  it("不传 size 时按 md（40px）渲染", () => {
    const { container } = render(<TimeField />);
    expect((container.firstElementChild as HTMLElement).className).toContain("h-10");
  });
});
