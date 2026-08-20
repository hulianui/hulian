import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { Calendar } from "./calendar";
import { Cascader } from "./cascader";
import { Checkbox } from "./checkbox";
import { CheckboxGroup } from "./checkbox-group";
import { Choicebox, ChoiceboxGroup } from "./choicebox";
import { CodeEditor } from "./code-editor";
import { Combobox, ComboboxChips, ComboboxInput, ComboboxTrigger } from "./combobox";
import { CountrySelect } from "./country-select";
import { DatePicker } from "./date-picker";
import { DateRangePicker } from "./date-range-picker";
import { DateTimePicker } from "./date-time-picker";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { EmojiPicker } from "./emoji-picker";
import { Field } from "./field";
import { IconPicker } from "./icon-picker";
import { InputOTP } from "./input-otp";
import { Listbox } from "./listbox";
import { MarkdownEditor } from "./markdown-editor";
import { NumberField } from "./number-field";
import { Rating } from "./rating";
import { RegionCascader } from "./region-cascader";
import { RemoteSelect } from "./remote-select";
import { ScopeMatrix } from "./scope-matrix";
import { SecretField } from "./secret-field";
import { Segmented } from "./segmented";
import { Switch } from "./switch";
import { TimeField } from "./time-field";
import { Toggle } from "./toggle";
import { Transfer } from "./transfer";
import { TreeSelect } from "./tree-select";

/**
 * 表单件属性透传的横切回归（hulianui/hulian#157）。
 *
 * 口径见 docs/consuming.md 第 7 节：表单受控件必须继承根节点的 HTMLAttributes，
 * 否则接不上 react-hook-form 的 `Controller`（`field.onBlur` 无处可传 →
 * `touchedFields` 永不更新 → `mode: "onBlur"` 的表单静默失效）。
 *
 * 这里用 `data-testid` 当探针而不是 `onBlur`：前者对每个组件都是同一句断言、
 * 且**只有 rest 真的展开到了根节点才会出现**，逐组件构造失焦场景则要各写各的。
 * 谁哪天把某个组件的 props 接口改回封闭式，这条当场红。
 */
const CASES: [name: string, node: ReactElement][] = [
  ["InputOTP", <InputOTP length={2} data-testid="probe" />],
  ["Rating", <Rating data-testid="probe" />],
  ["Segmented", <Segmented items={[{ value: "a", label: "A" }]} data-testid="probe" />],
  ["SecretField", <SecretField value="sk-1234" data-testid="probe" />],
  ["Listbox", <Listbox items={[{ key: "a", label: "A" }]} data-testid="probe" />],
  ["CheckboxGroup", <CheckboxGroup data-testid="probe" />],
  ["ChoiceboxGroup", <ChoiceboxGroup data-testid="probe" />],
  [
    "Choicebox",
    <ChoiceboxGroup>
      <Choicebox value="a" title="A" data-testid="probe" />
    </ChoiceboxGroup>,
  ],
  ["ColorSwatchPicker", <ColorSwatchPicker colors={["#f00"]} data-testid="probe" />],
  [
    "IconPicker",
    <IconPicker
      sources={[{ key: "k", label: "K", icons: [{ name: "a" }], renderIcon: () => null }]}
      data-testid="probe"
    />,
  ],
  ["EmojiPicker", <EmojiPicker data-testid="probe" />],
  ["Transfer", <Transfer dataSource={[{ key: "a", label: "A" }]} data-testid="probe" />],
  ["ScopeMatrix", <ScopeMatrix allow={[]} deny={[]} data-testid="probe" />],
  ["CodeEditor", <CodeEditor value="const a = 1" data-testid="probe" />],
  ["MarkdownEditor", <MarkdownEditor defaultValue="# hi" data-testid="probe" />],
  ["Calendar", <Calendar data-testid="probe" />],
  ["TimeField", <TimeField data-testid="probe" />],
  ["Checkbox", <Checkbox data-testid="probe" />],
  ["Switch", <Switch data-testid="probe" />],
  ["Toggle", <Toggle data-testid="probe" />],
  ["NumberField", <NumberField data-testid="probe" />],
  // Combobox 三件（#160）：这几个的「根」不是外壳 span 而是内层 input / 触发按钮，
  // 探针照样只在 rest 真的展开到那个节点时才出现 —— 断言一句不用改。
  [
    "ComboboxInput",
    <Combobox items={[{ value: "a", label: "A" }]}>
      <ComboboxInput aria-label="A" data-testid="probe" />
    </Combobox>,
  ],
  [
    "ComboboxTrigger",
    <Combobox items={[{ value: "a", label: "A" }]}>
      <ComboboxTrigger aria-label="A" data-testid="probe" />
    </Combobox>,
  ],
  [
    "ComboboxChips",
    <Combobox items={[{ value: "a", label: "A" }]} multiple>
      <ComboboxChips aria-label="A" data-testid="probe" />
    </Combobox>,
  ],
];

describe("表单件把根节点原生属性透传出去（#157）", () => {
  for (const [name, node] of CASES) {
    it(`${name} 的 data-* 落到根节点`, () => {
      const { container } = render(node);
      expect(container.querySelector('[data-testid="probe"]')).toBeTruthy();
    });
  }

  it("Listbox：组件自身的 role 赢过外部传入的（rest 展开在最前，a11y 语义不可被顶掉）", () => {
    const { container } = render(
      // role 现在类型上是可传的（继承 HTMLAttributes 的代价），所以更要钉死它顶不掉
      <Listbox items={[{ key: "a", label: "A" }]} role="tablist" data-testid="probe" />,
    );
    expect(container.querySelector('[data-testid="probe"]')!.getAttribute("role")).toBe("listbox");
  });
});

/**
 * 浮层型控件的必填语义与 label 关联（hulianui/hulian#293）。
 *
 * 这一族（Cascader / RegionCascader / TreeSelect / DatePicker / DateTimePicker /
 * DateRangePicker / RemoteSelect）此前 props 封闭且实现不透传：`Field required` 用
 * cloneElement 注进去的 `aria-required` 被静默丢掉，必填只剩视觉星号。
 *
 * 修的时候发现比 issue 描述的更深一层 —— 触发器没接 Base UI 的 Field 控件上下文，
 * 于是 `label` 的 `htmlFor` 指向一个**不存在的 id**：读屏连字段名都念不出来，
 * 点 label 也不会聚焦控件。所以这里三件一起钉：
 *   1. `aria-required` 到达那个可聚焦元素；
 *   2. 该元素的 role 支持 `aria-required`（button 不支持，combobox 支持）；
 *   3. label 的 htmlFor 真的指向它。
 */
const OVERLAY_CASES: [name: string, node: ReactElement][] = [
  ["Cascader", <Cascader nodes={[{ key: "a", label: "A" }]} data-testid="probe" />],
  ["RegionCascader", <RegionCascader data-testid="probe" />],
  ["TreeSelect", <TreeSelect nodes={[{ key: "a", label: "A" }]} data-testid="probe" />],
  ["DatePicker", <DatePicker data-testid="probe" />],
  ["DateTimePicker", <DateTimePicker data-testid="probe" />],
  ["DateRangePicker", <DateRangePicker data-testid="probe" />],
  ["RemoteSelect", <RemoteSelect fetcher={async () => ({ options: [] })} data-testid="probe" />],
  ["CountrySelect", <CountrySelect data-testid="probe" />],
];

describe("浮层型控件把必填语义交到可聚焦元素上（#293）", () => {
  for (const [name, node] of OVERLAY_CASES) {
    it(`${name}：aria-required 落到可聚焦元素，label 的 htmlFor 命中它`, () => {
      const { container } = render(
        <Field label="字段" required>
          {node}
        </Field>,
      );
      const probe = container.querySelector('[data-testid="probe"]')!;
      // 1. 未列出的属性真的透传到了触发器 / 输入框（不是外层容器）
      expect(probe).toBeTruthy();
      expect(["BUTTON", "INPUT"]).toContain(probe.tagName);
      // 2. Field 注入的 aria-required 到达它，且它的 role 支持这个属性
      expect(probe.getAttribute("aria-required")).toBe("true");
      expect(probe.getAttribute("role")).toBe("combobox");
      // 3. label 的 htmlFor 指向它 —— 指向不存在的 id 时读屏念不出字段名（本次一并修）
      expect(container.querySelector("label")!.getAttribute("for")).toBe(probe.id);
      expect(probe.id).toBeTruthy();
    });
  }

  it("Field 的 description / error 经 aria-describedby 串到触发器上", () => {
    const { container, getByText } = render(
      <Field label="字段" description="按月同步" error="不能为空">
        <DatePicker />
      </Field>,
    );
    const trigger = container.querySelector('[role="combobox"]')!;
    const describedBy = trigger.getAttribute("aria-describedby") ?? "";
    expect(describedBy).toContain(getByText("按月同步").id);
    expect(describedBy).toContain(getByText("不能为空").id);
    // error 隐含 invalid：与 Input 一样自动飘红（此前这一族在 Field 里不会变色）
    expect(trigger.getAttribute("aria-invalid")).toBe("true");
  });

  it("消费方自己写的 aria-label 不被组件顶掉", () => {
    const { container } = render(<Cascader nodes={[]} aria-label="所属分类" />);
    expect(container.querySelector('[role="combobox"]')!.getAttribute("aria-label")).toBe(
      "所属分类",
    );
  });
});
