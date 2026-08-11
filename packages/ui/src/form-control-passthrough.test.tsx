import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

import { Calendar } from "./calendar";
import { Checkbox } from "./checkbox";
import { CheckboxGroup } from "./checkbox-group";
import { Choicebox, ChoiceboxGroup } from "./choicebox";
import { CodeEditor } from "./code-editor";
import { Combobox, ComboboxChips, ComboboxInput, ComboboxTrigger } from "./combobox";
import { ColorSwatchPicker } from "./color-swatch-picker";
import { EmojiPicker } from "./emoji-picker";
import { IconPicker } from "./icon-picker";
import { InputOTP } from "./input-otp";
import { Listbox } from "./listbox";
import { MarkdownEditor } from "./markdown-editor";
import { NumberField } from "./number-field";
import { Rating } from "./rating";
import { ScopeMatrix } from "./scope-matrix";
import { SecretField } from "./secret-field";
import { Segmented } from "./segmented";
import { Switch } from "./switch";
import { TimeField } from "./time-field";
import { Toggle } from "./toggle";
import { Transfer } from "./transfer";

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
