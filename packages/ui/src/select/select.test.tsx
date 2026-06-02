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
    <Select items={items} defaultValue={props.defaultValue} open={props.open}>
      <SelectTrigger placeholder="请选择字体" size={props.size} invalid={props.invalid} />
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

// Base UI Select.Value 在 placeholder 态渲染为空 <span placeholder="..." data-placeholder="">
// 文本不在 DOM 内容中，而是通过 placeholder attribute 传递；改用 role="combobox" 找 Trigger。
const getTrigger = () => screen.getByRole("combobox");

describe("Select", () => {
  it("闭合态: 触发器在, 选项不在 DOM", () => {
    render(<Basic />);
    expect(getTrigger()).toBeTruthy();
    expect(screen.queryByText("衬线")).toBeNull();
  });

  it("placeholder: 无值时 Trigger 显示占位 + Value 带 data-placeholder", () => {
    render(<Basic />);
    // Base UI Select.Value 在 placeholder 态：渲染空 <span data-placeholder="" placeholder="...">
    // button 本身也有 data-placeholder=""；用 span[data-placeholder] 精确找 Value span
    const phSpan = document.querySelector("span[data-placeholder]");
    expect(phSpan).not.toBeNull();
    expect(phSpan!.getAttribute("placeholder")).toBe("请选择字体");
    expect(phSpan!.getAttribute("data-placeholder")).toBe("");
  });

  it("受控 open: Popup mount + surface 皮肤 + 选项渲染", () => {
    render(<Basic open />);
    expect(screen.getByText("无衬线")).toBeTruthy();
    expect(screen.getByText("等宽")).toBeTruthy();
    const popup = document.querySelector(".bg-surface.border-border");
    expect(popup).not.toBeNull();
  });

  it("选中态: defaultValue 对应 Item 带 data-selected", () => {
    render(<Basic defaultValue="serif" open />);
    const selected = document.querySelector("[role='option'][data-selected]");
    expect(selected).not.toBeNull();
    expect(selected!.textContent).toContain("衬线");
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
