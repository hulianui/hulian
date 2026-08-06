import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { InspectorPanel } from "./inspector-panel";
import { MIXED } from "./inspector-schema";
import type { InspectorSection, InspectorToken } from "./inspector-panel.types";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

// memo 护栏要的稳定引用：内联字面量每轮新建，memo 本就不该 bail，会把护栏变成假红。
const STABLE_PROPS: Record<string, unknown> = {};
const NOOP = () => {};

const allKinds: InspectorSection[] = [
  {
    id: "demo",
    label: "演示",
    fields: [
      { key: "title", label: "标题", kind: "text", placeholder: "输入标题" },
      { key: "count", label: "数量", kind: "number" },
      { key: "fontSize", label: "字号", kind: "length", min: 8, max: 96, unit: "px" },
      { key: "padding", label: "内边距", kind: "spacing", unit: "px" },
      { key: "color", label: "文字色", kind: "color" },
      {
        key: "textAlign",
        label: "对齐",
        kind: "enum",
        options: [{ value: "left", label: "左" }, { value: "center", label: "中" }],
      },
      { key: "hidden", label: "隐藏", kind: "toggle" },
    ],
  },
];

const tokens: InspectorToken[] = [
  { token: "color-primary", label: "主色" },
  { token: "color-danger", label: "危险色", value: "oklch(0.6 0.2 25)" },
];

function setup(override: Partial<React.ComponentProps<typeof InspectorPanel>> = {}) {
  const onChange = vi.fn();
  const view = render(
    <InspectorPanel sections={allKinds} props={{}} onChange={onChange} {...override} />,
  );
  return { ...view, onChange };
}

describe("InspectorPanel schema 驱动", () => {
  it("稳定父更新时跳过检查器子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <InspectorPanel sections={allKinds} props={STABLE_PROPS} onChange={NOOP} />
    ));
  });

  it("按 kind 派生对应控件种类", () => {
    const { container, getByLabelText, getAllByLabelText } = setup();
    // text → 文本框；number → 数字框；toggle → switch；enum(2 项) → radiogroup
    expect((getByLabelText("标题") as HTMLInputElement).type).toBe("text");
    expect((getByLabelText("数量") as HTMLInputElement).type).toBe("number");
    expect(getByLabelText("隐藏").getAttribute("role")).toBe("switch");
    expect(getByLabelText("对齐").getAttribute("role")).toBe("radiogroup");
    // length → 滑杆 + 数字框两个控件共用同一标签（同一属性的两种输入方式）
    const lengthControls = getAllByLabelText("字号");
    const lengthTypes = lengthControls.map((el) => (el as HTMLInputElement).type);
    expect(lengthTypes).toContain("range");
    expect(lengthTypes).toContain("number");
    expect(container.querySelector('input[type="range"]')).toBeTruthy();
    // spacing → 四个独立命名的数字框
    for (const side of ["上", "右", "下", "左"]) {
      expect((getByLabelText(`内边距 ${side}`) as HTMLInputElement).type).toBe("number");
    }
  });

  it("枚举选项 > 4 时退化为 Select 触发器而不是 Segmented", () => {
    const { queryByRole, getByLabelText } = setup({
      sections: [
        {
          id: "demo",
          label: "演示",
          fields: [
            {
              key: "display",
              label: "显示",
              kind: "enum",
              options: ["block", "flex", "grid", "inline-flex", "none"].map((value) => ({ value })),
            },
          ],
        },
      ],
    });
    expect(queryByRole("radiogroup")).toBeNull();
    expect(getByLabelText("显示").tagName).toBe("BUTTON");
  });

  it("categories 决定内置预设的取用与顺序", () => {
    const { getAllByRole } = render(
      <InspectorPanel categories={["effects", "border"]} props={{}} onChange={() => {}} />,
    );
    const triggers = getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
    expect(triggers.map((b) => b.textContent)).toEqual(["效果", "边框"]);
  });

  it("selectedElement 为 null 进空态，不渲染任何字段", () => {
    const { queryByLabelText, getByText } = setup({ selectedElement: null });
    expect(queryByLabelText("标题")).toBeNull();
    expect(getByText("未选中元素")).toBeTruthy();
  });
});

describe("InspectorPanel 回吐", () => {
  it("文本改值回吐 (path, value)", () => {
    const { getByLabelText, onChange } = setup({ props: { title: "旧" } });
    fireEvent.change(getByLabelText("标题"), { target: { value: "新" } });
    expect(onChange).toHaveBeenCalledWith("title", "新");
  });

  it("有 unit 的字段回吐带单位字符串，无 unit 回吐数字", () => {
    const { getAllByLabelText, getByLabelText, onChange } = setup();
    fireEvent.change(getAllByLabelText("字号")[1], { target: { value: "20" } });
    expect(onChange).toHaveBeenCalledWith("fontSize", "20px");
    fireEvent.change(getByLabelText("数量"), { target: { value: "3" } });
    expect(onChange).toHaveBeenCalledWith("count", 3);
  });

  it("清空数字框回吐 null（删除属性），不是 0", () => {
    const { getByLabelText, onChange } = setup({ props: { count: 5 } });
    fireEvent.change(getByLabelText("数量"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith("count", null);
  });

  it("开关回吐布尔，枚举回吐选项 value", () => {
    const { getByLabelText, getByText, onChange } = setup();
    fireEvent.click(getByLabelText("隐藏"));
    expect(onChange).toHaveBeenCalledWith("hidden", true);
    fireEvent.click(getByText("中"));
    expect(onChange).toHaveBeenCalledWith("textAlign", "center");
  });

  it("commitMode=commit：输入过程不回吐，失焦才回吐", () => {
    const { getByLabelText, onChange } = setup({ commitMode: "commit" });
    const input = getByLabelText("标题");
    fireEvent.change(input, { target: { value: "草稿" } });
    expect(onChange).not.toHaveBeenCalled();
    expect((input as HTMLInputElement).value).toBe("草稿");
    fireEvent.blur(input);
    expect(onChange).toHaveBeenCalledWith("title", "草稿");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("commitMode=commit：回车提交等价于失焦", () => {
    const { getByLabelText, onChange } = setup({ commitMode: "commit" });
    const input = getByLabelText("标题");
    fireEvent.change(input, { target: { value: "回车" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("title", "回车");
  });

  // commitMode 曾覆盖不到色块弹层里的 ColorPicker（它当时只有逐帧的 onValueChange）。
  it("commitMode=commit 覆盖到 ColorPicker：编辑中不回吐，失焦才回吐", () => {
    const { getByLabelText, onChange } = setup({
      commitMode: "commit",
      props: { color: "#ff0000" },
    });
    fireEvent.click(getByLabelText("文字色 取色器"));
    const hexInput = getByLabelText("十六进制颜色值");
    fireEvent.change(hexInput, { target: { value: "#00ff00" } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(hexInput);
    expect(onChange).toHaveBeenCalledWith("color", "#00ff00");
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("commitMode=commit 下 ColorPicker 不被受控钉死（父级不回写也跟手）", () => {
    const { getByLabelText } = setup({ commitMode: "commit", props: { color: "#ff0000" } });
    fireEvent.click(getByLabelText("文字色 取色器"));
    const hexInput = getByLabelText("十六进制颜色值") as HTMLInputElement;
    fireEvent.change(hexInput, { target: { value: "#00ff00" } });
    // 父级此刻还没收到值、更没回写 props，取色器自己得留住这个中间态
    expect(hexInput.value.toLowerCase()).toContain("00ff00");
  });

  it("commitMode=change 下 ColorPicker 仍逐次回吐", () => {
    const { getByLabelText, onChange } = setup({ props: { color: "#ff0000" } });
    fireEvent.click(getByLabelText("文字色 取色器"));
    fireEvent.change(getByLabelText("十六进制颜色值"), { target: { value: "#00ff00" } });
    expect(onChange).toHaveBeenCalledWith("color", "#00ff00");
  });
});

describe("InspectorPanel spacing 链接锁定", () => {
  it("未锁定时只改被编辑的那一边", () => {
    const { getByLabelText, onChange } = setup();
    fireEvent.change(getByLabelText("内边距 上"), { target: { value: "8" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("paddingTop", "8px");
  });

  it("锁定后改一边同步四值（四个派生 path）", () => {
    const { getByLabelText, onChange } = setup();
    const link = getByLabelText("链接四边");
    expect(link.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(link);
    expect(link.getAttribute("aria-pressed")).toBe("true");

    fireEvent.change(getByLabelText("内边距 左"), { target: { value: "12" } });
    expect(onChange.mock.calls).toEqual([
      ["paddingTop", "12px"],
      ["paddingRight", "12px"],
      ["paddingBottom", "12px"],
      ["paddingLeft", "12px"],
    ]);
  });

  it("传了 onBatchChange，多 path 变更改走批量回调（不再逐条 onChange）", () => {
    const onBatchChange = vi.fn();
    const { getByLabelText, onChange } = setup({ onBatchChange });
    fireEvent.click(getByLabelText("链接四边"));
    fireEvent.change(getByLabelText("内边距 上"), { target: { value: "4" } });
    expect(onChange).not.toHaveBeenCalled();
    expect(onBatchChange).toHaveBeenCalledWith([
      { path: "paddingTop", value: "4px" },
      { path: "paddingRight", value: "4px" },
      { path: "paddingBottom", value: "4px" },
      { path: "paddingLeft", value: "4px" },
    ]);
  });

  it("单 path 变更即使传了 onBatchChange 仍走 onChange", () => {
    const onBatchChange = vi.fn();
    const { getByLabelText, onChange } = setup({ onBatchChange });
    fireEvent.change(getByLabelText("内边距 右"), { target: { value: "6" } });
    expect(onBatchChange).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith("paddingRight", "6px");
  });

  it("sides 可覆盖派生 path", () => {
    const { getByLabelText, onChange } = setup({
      sections: [
        {
          id: "demo",
          label: "演示",
          fields: [
            { key: "padding", label: "内边距", kind: "spacing", sides: { top: "py" }, unit: "px" },
          ],
        },
      ],
    });
    fireEvent.change(getByLabelText("内边距 上"), { target: { value: "2" } });
    expect(onChange).toHaveBeenCalledWith("py", "2px");
  });
});

describe("InspectorPanel 混合值", () => {
  it("文本/数字类显示占位而不是某一个元素的值", () => {
    const { getByLabelText } = setup({ props: { title: MIXED, count: MIXED } });
    expect((getByLabelText("标题") as HTMLInputElement).value).toBe("");
    expect(getByLabelText("标题").getAttribute("placeholder")).toBe("多个值");
    expect(getByLabelText("数量").getAttribute("placeholder")).toBe("多个值");
  });

  it("length 混合时不画滑杆（滑块停在任何位置都等于替用户选了值）", () => {
    const { container, getAllByText } = setup({ props: { fontSize: MIXED } });
    expect(container.querySelector('input[type="range"]')).toBeNull();
    expect(getAllByText("多个值").length).toBeGreaterThan(0);
  });

  it("开关混合时不选中，并在旁边标注", () => {
    const { getByLabelText, getAllByText } = setup({ props: { hidden: MIXED } });
    expect(getByLabelText("隐藏").getAttribute("aria-checked")).toBe("false");
    expect(getAllByText("多个值").length).toBeGreaterThan(0);
  });

  it("枚举混合时没有任何段被选中", () => {
    const { getAllByRole } = setup({ props: { textAlign: MIXED } });
    const radios = getAllByRole("radio");
    expect(radios.every((r) => r.getAttribute("aria-checked") === "false")).toBe(true);
  });

  it("labels 可覆盖混合值文案", () => {
    const { getByLabelText } = setup({ props: { title: MIXED }, labels: { mixed: "Mixed" } });
    expect(getByLabelText("标题").getAttribute("placeholder")).toBe("Mixed");
  });
});

describe("InspectorPanel token 绑定", () => {
  it("色值控件按 token 渲染色板，选中回吐 var(--token)", () => {
    const { getByLabelText, onChange } = setup({ tokenSource: tokens });
    const swatches = getByLabelText("文字色 主题色").querySelectorAll('[role="radio"]');
    expect(swatches.length).toBe(2);
    fireEvent.click(swatches[0]);
    expect(onChange).toHaveBeenCalledWith("color", "var(--color-primary)");
  });

  it("当前值命中 token 时显示 token 名而不是裸色值，且该色块处于选中态", () => {
    const { getByLabelText, getByText } = setup({
      tokenSource: tokens,
      props: { color: "oklch(0.6 0.2 25)" },
    });
    expect(getByText("危险色")).toBeTruthy();
    const swatches = getByLabelText("文字色 主题色").querySelectorAll('[role="radio"]');
    expect(swatches[1].getAttribute("aria-checked")).toBe("true");
    expect(swatches[0].getAttribute("aria-checked")).toBe("false");
  });

  it("带字面值的 token 回吐字面值（不是 var 引用）", () => {
    const { getByLabelText, onChange } = setup({ tokenSource: tokens });
    const swatches = getByLabelText("文字色 主题色").querySelectorAll('[role="radio"]');
    fireEvent.click(swatches[1]);
    expect(onChange).toHaveBeenCalledWith("color", "oklch(0.6 0.2 25)");
  });

  it("tokenGroup 过滤色板候选", () => {
    const { getByLabelText } = setup({
      tokenSource: [
        { token: "color-primary", label: "主色", group: "text" },
        { token: "color-surface", label: "表面", group: "surface" },
      ],
      sections: [
        {
          id: "demo",
          label: "演示",
          fields: [{ key: "color", label: "文字色", kind: "color", tokenGroup: "text" }],
        },
      ],
    });
    expect(getByLabelText("文字色 主题色").querySelectorAll('[role="radio"]').length).toBe(1);
  });

  it("无 tokenSource 时不渲染色板，只留自由输入", () => {
    const { queryByLabelText, getByLabelText } = setup();
    expect(queryByLabelText("文字色 主题色")).toBeNull();
    expect(getByLabelText("文字色")).toBeTruthy();
  });

  it("token 色块的无障碍名是 token 可读名，不是 var(--x) 变量串", () => {
    const { getByLabelText } = setup({ tokenSource: tokens });
    const swatches = getByLabelText("文字色 主题色").querySelectorAll('[role="radio"]');
    expect(swatches[0].getAttribute("aria-label")).toBe("主色");
    expect(swatches[1].getAttribute("aria-label")).toBe("危险色");
    // hover 提示同步补上
    expect(swatches[0].getAttribute("title")).toBe("主色");
  });

  it("token 没给 label 时色块名回退到 token 名（仍不是裸 var 串）", () => {
    const { getByLabelText } = setup({ tokenSource: [{ token: "color-primary" }] });
    const swatch = getByLabelText("文字色 主题色").querySelector('[role="radio"]')!;
    expect(swatch.getAttribute("aria-label")).toBe("color-primary");
  });
});

describe("InspectorPanel 分类折叠", () => {
  it("默认展开，点击标题收起（Base UI 收起动画未结束前面板仍在 DOM，只看 aria-expanded）", () => {
    const { getByText, queryByLabelText } = setup();
    const trigger = getByText("演示").closest("button")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(queryByLabelText("标题")).toBeTruthy();
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.hasAttribute("data-panel-open")).toBe(false);
  });

  it("defaultOpen=false 的分类初始即收起", () => {
    const { queryByLabelText, getByText } = setup({
      sections: [{ ...allKinds[0], defaultOpen: false }],
    });
    expect(queryByLabelText("标题")).toBeNull();
    fireEvent.click(getByText("演示").closest("button")!);
    expect(queryByLabelText("标题")).toBeTruthy();
  });
});
