import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
} from "./select";

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
  it("SelectTrigger 透传 aria-label 到真实 button", () => {
    render(
      <Select items={items}>
        <SelectTrigger aria-label="每页条数" />
      </Select>,
    );
    expect(getTrigger().getAttribute("aria-label")).toBe("每页条数");
  });

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

// ——— clearable ———

function Clearable(props: {
  clearable?: boolean;
  defaultValue?: string;
  onValueChange?: (v: unknown) => void;
}) {
  return (
    <Select
      items={items}
      placeholder="请选择字体"
      clearable={props.clearable}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
    >
      <SelectTrigger />
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

const queryClear = () => screen.queryByLabelText("清除");

describe("Select clearable", () => {
  it("显示时机: 未开 clearable 时即便有值也不渲染清除按钮", () => {
    render(<Clearable defaultValue="serif" />);
    expect(queryClear()).toBeNull();
  });

  it("显示时机: 开了 clearable 但无值 → 不渲染清除按钮", () => {
    render(<Clearable clearable />);
    expect(queryClear()).toBeNull();
  });

  it("显示时机: 开了 clearable 且有值 → 清除按钮进 DOM，靠 group-hover/focus 浮出", () => {
    render(<Clearable clearable defaultValue="serif" />);
    const clear = queryClear();
    expect(clear).not.toBeNull();
    // 常态隐藏、hover/focus 才显示（DOM 常驻以便键盘可达）。
    expect(clear!.className).toContain("hidden");
    expect(clear!.className).toContain("group-hover:flex");
    expect(clear!.className).toContain("group-focus-within:flex");
  });

  it("清除按钮是 Trigger 的兄弟节点，不嵌在 button 里（嵌套 button 非法且会误触发浮层）", () => {
    render(<Clearable clearable defaultValue="serif" />);
    expect(queryClear()!.closest("button[role='combobox']")).toBeNull();
  });

  it("清除结果: 点击后回传 null，Trigger 回落 placeholder，按钮消失", () => {
    const onValueChange = vi.fn();
    render(<Clearable clearable defaultValue="serif" onValueChange={onValueChange} />);
    expect(getTrigger().textContent).toContain("衬线");

    fireEvent.click(queryClear()!);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange.mock.calls[0][0]).toBeNull();
    expect(getTrigger().textContent).toContain("请选择字体");
    expect(queryClear()).toBeNull();
  });

  it("清除结果(受控): 外部不改 value 时组件不自行置空（受控语义不被打破）", () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} placeholder="请选择字体" clearable value="serif" onValueChange={onValueChange}>
        <SelectTrigger />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    fireEvent.click(queryClear()!);
    expect(onValueChange.mock.calls[0][0]).toBeNull();
    expect(getTrigger().textContent).toContain("衬线");
  });

  it("多选清除: 回传空数组，Trigger 回落 placeholder", () => {
    const onValueChange = vi.fn();
    render(
      <Select
        items={items}
        placeholder="请选择字体"
        multiple
        clearable
        defaultValue={["sans", "serif"]}
        onValueChange={onValueChange}
      >
        <SelectTrigger />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    fireEvent.click(queryClear()!);
    expect(onValueChange.mock.calls[0][0]).toEqual([]);
    expect(getTrigger().textContent).toContain("请选择字体");
  });
});

// ——— loading ———

function Loading(props: { open?: boolean }) {
  return (
    <Select items={items} placeholder="请选择字体" loading open={props.open}>
      <SelectTrigger />
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

describe("Select loading", () => {
  it("Trigger: 加载态用 Spinner 顶掉箭头", () => {
    render(<Loading />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(getTrigger().querySelector("svg.animate-spin")).not.toBeNull();
  });

  it("浮层: 只出加载占位，不渲染选项（避免展示陈旧数据）", () => {
    render(<Loading open />);
    expect(screen.getByText("加载中")).toBeTruthy();
    expect(screen.queryByText("无衬线")).toBeNull();
    expect(document.querySelectorAll("[role='option']").length).toBe(0);
  });

  it("自定义 loadingText 生效", () => {
    render(
      <Select items={items} placeholder="请选择字体" loading loadingText="正在拉取选项" open>
        <SelectTrigger />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    expect(screen.getByText("正在拉取选项")).toBeTruthy();
  });

  it("clearable + loading: 加载期间不给清除按钮（值可能正在刷新）", () => {
    render(
      <Select items={items} placeholder="请选择字体" clearable loading defaultValue="serif">
        <SelectTrigger />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    expect(queryClear()).toBeNull();
  });
});

// ——— searchable ———

function Searchable(props: {
  open?: boolean;
  defaultValue?: string;
  onValueChange?: (v: unknown) => void;
  loading?: boolean;
}) {
  return (
    <Select
      items={items}
      placeholder="请选择字体"
      searchable
      open={props.open}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      loading={props.loading}
    >
      <SelectTrigger />
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

const getSearchInput = () => screen.getByPlaceholderText("搜索") as HTMLInputElement;
const optionTexts = () =>
  Array.from(document.querySelectorAll("[role='option']")).map((el) => el.textContent);

describe("Select searchable", () => {
  it("闭合态: Trigger 仍显示 placeholder", () => {
    render(<Searchable />);
    expect(screen.getByRole("combobox").textContent).toContain("请选择字体");
  });

  it("展开: 浮层顶部出搜索框 + 全量选项", () => {
    render(<Searchable open />);
    expect(getSearchInput()).toBeTruthy();
    expect(optionTexts()).toEqual(["无衬线", "衬线", "等宽"]);
  });

  it("过滤: 输入命中子串的选项才保留（复用 Base UI Combobox 过滤）", () => {
    render(<Searchable open />);
    fireEvent.change(getSearchInput(), { target: { value: "衬线" } });
    expect(optionTexts()).toEqual(["无衬线", "衬线"]);
  });

  it("过滤: 无命中时出空态文案，选项清零", () => {
    render(<Searchable open />);
    fireEvent.change(getSearchInput(), { target: { value: "zzz" } });
    expect(optionTexts()).toEqual([]);
    expect(screen.getByText("无匹配项")).toBeTruthy();
  });

  it("选中: 点击过滤后的项回传原始 string value", () => {
    const onValueChange = vi.fn();
    render(<Searchable open onValueChange={onValueChange} />);
    fireEvent.change(getSearchInput(), { target: { value: "等" } });
    fireEvent.click(document.querySelectorAll("[role='option']")[0]!);
    expect(onValueChange.mock.calls[0][0]).toBe("mono");
  });

  it("已选值: defaultValue 映射回 label 显示在 Trigger", () => {
    render(<Searchable defaultValue="serif" />);
    expect(screen.getByRole("combobox").textContent).toContain("衬线");
  });

  it("searchable + clearable: 清除按钮同样可用并回传 null", () => {
    const onValueChange = vi.fn();
    render(
      <Select
        items={items}
        placeholder="请选择字体"
        searchable
        clearable
        defaultValue="serif"
        onValueChange={onValueChange}
      >
        <SelectTrigger />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    expect(queryClear()).not.toBeNull();
    fireEvent.click(queryClear()!);
    expect(onValueChange.mock.calls[0][0]).toBeNull();
    expect(screen.getByRole("combobox").textContent).toContain("请选择字体");
  });

  it("searchable + loading: 浮层出加载占位而非选项", () => {
    render(<Searchable open loading />);
    // Combobox 的 Empty 槽位（aria-live）会在文案后补一个 word-joiner，故用正则匹配。
    expect(screen.getByText(/加载中/)).toBeTruthy();
    expect(optionTexts()).toEqual([]);
  });
});

// ——— 分组 ———

describe("Select group", () => {
  it("SelectGroup/SelectGroupLabel 渲染分组语义 + 标题", () => {
    render(
      <Select items={items} placeholder="请选择字体" open>
        <SelectTrigger />
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>西文</SelectGroupLabel>
            <SelectItem value="sans">无衬线</SelectItem>
            <SelectItem value="serif">衬线</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectGroupLabel>等宽</SelectGroupLabel>
            <SelectItem value="mono">等宽</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    const groups = document.querySelectorAll("[role='group']");
    expect(groups.length).toBe(2);
    expect(screen.getByText("西文")).toBeTruthy();
    // 分组标题与分组建立 aria 关联（Base UI 自动挂 aria-labelledby）。
    expect(groups[0]!.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.querySelectorAll("[role='option']").length).toBe(3);
  });
});
