import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectContent, SelectItem } from "./select";

const items = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
];

function Basic(props: {
  defaultValue?: string;
  open?: boolean;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}) {
  return (
    <Select items={items} placeholder="请选择字体" defaultValue={props.defaultValue} open={props.open}>
      <SelectTrigger size={props.size} invalid={props.invalid} />
      <SelectContent>
        {items.map((it) => (
          <SelectItem key={it.value} value={it.value}>
            {it.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Base UI Select Trigger 渲染 role="combobox" 的 button。
const getTrigger = () => screen.getByRole("combobox");

describe("Select", () => {
  it("闭合态: 触发器在, 选项不在 DOM", () => {
    render(<Basic />);
    expect(getTrigger()).toBeTruthy();
    expect(screen.queryByText("等宽")).toBeNull();
  });

  it("placeholder: 无值时 Trigger 可见文本即占位（rc.0 经注入 value:null 项实现）", () => {
    render(<Basic />);
    // 验「可见文本」而非 attribute —— rc.0 无 Value.placeholder prop，靠注入的 null 项 label 显示。
    expect(getTrigger().textContent).toContain("请选择字体");
  });

  it("受控 open: Popup mount + surface 皮肤 + 选项渲染", () => {
    render(<Basic open />);
    expect(screen.getByText("无衬线")).toBeTruthy();
    expect(screen.getByText("等宽")).toBeTruthy();
    const popup = document.querySelector(".bg-surface.border-hairline");
    expect(popup).not.toBeNull();
  });

  it("选中态: defaultValue 对应 Item 带 data-selected + Trigger 显示该 label", () => {
    render(<Basic defaultValue="serif" open />);
    const selected = document.querySelector("[role='option'][data-selected]");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("衬线");
    // items 自动映射：Trigger 显示选中项 label（而非 raw value "serif"）。
    expect(getTrigger().textContent).toContain("衬线");
  });

  it("size=lg: Trigger 应用 lg 高度类", () => {
    render(<Basic size="lg" />);
    expect(getTrigger().className).toContain("h-12");
  });

  it("invalid: Trigger 落 data-invalid + aria-invalid", () => {
    render(<Basic invalid />);
    const trigger = getTrigger();
    expect(trigger.getAttribute("data-invalid")).toBe("");
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });
});

function Multi(props: { defaultValue?: string[]; maxDisplay?: number; open?: boolean }) {
  return (
    <Select items={items} placeholder="请选择字体" multiple defaultValue={props.defaultValue}
      open={props.open}>
      <SelectTrigger maxDisplay={props.maxDisplay} />
      <SelectContent>
        {items.map((it) => (
          <SelectItem key={it.value} value={it.value}>
            {it.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

describe("Select multiple", () => {
  it("空值: Trigger 显示 placeholder（多选不注入 null 项，走函数式 Value）", () => {
    render(<Multi defaultValue={[]} />);
    expect(getTrigger().textContent).toContain("请选择字体");
  });

  it("已选 ≤ maxDisplay: label 顿号平铺，无 +N", () => {
    render(<Multi defaultValue={["sans", "serif"]} />);
    const text = getTrigger().textContent ?? "";
    expect(text).toContain("无衬线、衬线");
    expect(text).not.toContain("+");
  });

  it("已选 > maxDisplay: 超出折叠为 +N 计数", () => {
    render(<Multi defaultValue={["sans", "serif", "mono"]} maxDisplay={2} />);
    const text = getTrigger().textContent ?? "";
    expect(text).toContain("无衬线、衬线");
    expect(text).toContain("+1");
    expect(text).not.toContain("等宽");
  });

  it("items 命不中的 value 回落 raw 字符串", () => {
    render(<Multi defaultValue={["sans", "ghost"]} />);
    expect(getTrigger().textContent).toContain("无衬线、ghost");
  });

  it("受控 open: 多个已选 Item 同时带 data-selected", () => {
    render(<Multi defaultValue={["sans", "mono"]} open />);
    const selected = document.querySelectorAll("[role='option'][data-selected]");
    expect(selected.length).toBe(2);
  });
});
