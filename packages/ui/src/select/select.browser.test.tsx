import { act, useEffect, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { page, userEvent } from "@vitest/browser/context";
import type {} from "@vitest/browser/providers/playwright";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectGroupLabel,
  SelectItem,
  SelectTrigger,
} from "./select";
import { Field } from "../field/field";

afterEach(cleanup);

async function interact(action: () => Promise<void>) {
  await act(async () => {
    await action();
  });
}

const browserItems = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
];

const groupedBrowserItems = [
  { value: "first-a", label: "第一组未选" },
  { value: "first-b", label: "第一组选中" },
  { value: "second-a", label: "第二组未选" },
  { value: "second-b", label: "第二组选中" },
];

function ComponentPlaceholder({
  label,
  id,
  onMount,
}: {
  label: string;
  id?: string;
  onMount?: () => void;
}) {
  useEffect(() => {
    onMount?.();
  }, [onMount]);
  return <span id={id}>{label}</span>;
}

function FinalDeleteNameFixture({ onPlaceholderMount }: { onPlaceholderMount?: () => void }) {
  const [value, setValue] = useState(["sans"]);
  return (
    <Select
      items={browserItems}
      multiple
      value={value}
      placeholder={
        <ComponentPlaceholder
          id="browser-final-placeholder"
          label="浏览器最后一项组件占位"
          onMount={onPlaceholderMount}
        />
      }
      onValueChange={(next) => setValue(next as string[])}
    >
      <SelectTrigger display="chips" removable />
      <SelectContent>
        {browserItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ControlledFixture({
  initialValue,
  searchable = false,
  maxDisplay,
  onOpenChange,
}: {
  initialValue: string[];
  searchable?: boolean;
  maxDisplay?: number;
  onOpenChange?: (open: boolean, eventDetails: { reason: string }) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <Select
      items={browserItems}
      multiple
      selectedFirst
      searchable={searchable}
      value={value}
      onValueChange={(next) => setValue(next as string[])}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger display="chips" removable maxDisplay={maxDisplay} />
      <SelectContent>
        {browserItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NonUpdatingControlledFixture() {
  return (
    <Select items={browserItems} multiple value={["sans"]} defaultOpen onValueChange={() => {}}>
      <SelectTrigger display="chips" removable />
      <SelectContent>
        {browserItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function UncontrolledSkinFixture({ searchable }: { searchable: boolean }) {
  return (
    <Select items={browserItems} searchable={searchable} placeholder="请选择字体">
      <SelectTrigger />
      <SelectContent>
        {browserItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function GroupedKeyboardFixture() {
  return (
    <Select
      items={groupedBrowserItems}
      multiple
      selectedFirst
      defaultValue={["second-b", "first-b"]}
    >
      <SelectTrigger />
      <SelectContent>
        <SelectGroup>
          <SelectGroupLabel>第一组</SelectGroupLabel>
          <SelectItem value="first-a">第一组未选</SelectItem>
          <SelectItem value="first-b">第一组选中</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectGroupLabel>第二组</SelectGroupLabel>
          <SelectItem value="second-a">第二组未选</SelectItem>
          <SelectItem value="second-b">第二组选中</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const manyItems = Array.from({ length: 120 }, (_, index) => ({
  value: `item-${index}`,
  label: `Item ${index}`,
}));

function VirtualizedFixture() {
  const [value, setValue] = useState(["item-119"]);
  return (
    <Select
      items={manyItems}
      multiple
      selectedFirst
      searchable
      value={value}
      onValueChange={(next) => setValue(next as string[])}
    >
      <SelectTrigger />
      <SelectContent>
        {manyItems.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

describe("Select multiselect workflows (#328)", () => {
  it("两组 selectedFirst 的真实键盘高亮遵循组内置顶后的 DOM/root 顺序", async () => {
    render(<GroupedKeyboardFixture />);
    await interact(() => userEvent.click(screen.getByRole("combobox")));

    const options = screen.getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "第一组选中",
      "第一组未选",
      "第二组选中",
      "第二组未选",
    ]);

    await interact(() => userEvent.keyboard("{Home}"));
    expect(options[0]?.hasAttribute("data-highlighted")).toBe(true);
    await interact(() => userEvent.keyboard("{ArrowDown}"));
    expect(options[1]?.hasAttribute("data-highlighted")).toBe(true);
    await interact(() => userEvent.keyboard("{ArrowDown}"));
    expect(options[2]?.hasAttribute("data-highlighted")).toBe(true);
    await interact(() => userEvent.keyboard("{ArrowDown}"));
    expect(options[3]?.hasAttribute("data-highlighted")).toBe(true);
  });

  it("searchable 中选择后切回标准皮肤仍保留非受控值", async () => {
    const view = render(<UncontrolledSkinFixture searchable />);
    await interact(() => userEvent.click(screen.getByRole("combobox")));
    await interact(() => userEvent.click(screen.getByRole("option", { name: "衬线" })));

    view.rerender(<UncontrolledSkinFixture searchable={false} />);

    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("衬线");
    await interact(() => userEvent.click(trigger));
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("标准皮肤中选择后往返 searchable 仍保留非受控值", async () => {
    const view = render(<UncontrolledSkinFixture searchable={false} />);
    await interact(() => userEvent.click(screen.getByRole("combobox")));
    await interact(() => userEvent.click(screen.getByRole("option", { name: "衬线" })));

    view.rerender(<UncontrolledSkinFixture searchable />);
    expect(view.container.querySelector("button[role='combobox']")?.textContent).toContain(
      "衬线",
    );

    view.rerender(<UncontrolledSkinFixture searchable={false} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.textContent).toContain("衬线");
    await interact(() => userEvent.click(trigger));
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("真实 Chromium 只挂载一份可见组件型 placeholder，并保留外部标签优先级", async () => {
    const standardMount = vi.fn();
    const searchableMount = vi.fn();
    render(
      <>
        <Select
          items={browserItems}
          multiple
          defaultValue={[]}
          placeholder={
            <ComponentPlaceholder
              id="browser-standard-placeholder"
              label="浏览器标准组件占位"
              onMount={standardMount}
            />
          }
        >
          <SelectTrigger display="chips" />
        </Select>
        <Select
          items={browserItems}
          multiple
          searchable
          defaultValue={[]}
          placeholder={
            <ComponentPlaceholder
              id="browser-searchable-placeholder"
              label="浏览器搜索组件占位"
              onMount={searchableMount}
            />
          }
        >
          <SelectTrigger display="chips" />
        </Select>
        <Select
          items={browserItems}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="不应覆盖 aria-label" />}
        >
          <SelectTrigger display="chips" aria-label="浏览器消费方 aria-label" />
        </Select>
        <span id="browser-consumer-labelledby">浏览器消费方 aria-labelledby</span>
        <Select
          items={browserItems}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="不应覆盖 aria-labelledby" />}
        >
          <SelectTrigger display="chips" aria-labelledby="browser-consumer-labelledby" />
        </Select>
        <Field label="浏览器 Field 标签">
          <Select
            items={browserItems}
            multiple
            defaultValue={[]}
            placeholder={<ComponentPlaceholder label="不应覆盖 Field" />}
          >
            <SelectTrigger display="chips" />
          </Select>
        </Field>
        <label htmlFor="browser-native-select-label">浏览器原生标签</label>
        <Select
          items={browserItems}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="不应覆盖原生标签" />}
        >
          <SelectTrigger id="browser-native-select-label" display="chips" />
        </Select>
      </>,
    );

    const standardTrigger = screen.getByRole("combobox", { name: "浏览器标准组件占位" });
    const searchableTrigger = screen.getByRole("combobox", { name: "浏览器搜索组件占位" });
    const standardPlaceholder = document.querySelector<HTMLElement>(
      "#browser-standard-placeholder",
    )!;
    const searchablePlaceholder = document.querySelector<HTMLElement>(
      "#browser-searchable-placeholder",
    )!;
    expect(standardMount).toHaveBeenCalledTimes(1);
    expect(searchableMount).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("#browser-standard-placeholder")).toHaveLength(1);
    expect(document.querySelectorAll("#browser-searchable-placeholder")).toHaveLength(1);
    expect(standardPlaceholder.closest("button[role='combobox']")).toBe(standardTrigger);
    expect(searchablePlaceholder.closest("button[role='combobox']")).toBe(searchableTrigger);
    expect(standardPlaceholder.closest(".sr-only")).toBeNull();
    expect(searchablePlaceholder.closest(".sr-only")).toBeNull();
    expect(screen.getByRole("combobox", { name: "浏览器消费方 aria-label" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "浏览器消费方 aria-labelledby" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "浏览器 Field 标签" })).toBeTruthy();
    expect(screen.getByRole("combobox", { name: "浏览器原生标签" })).toBeTruthy();
  });

  it("Tab 到 remove 后按 Enter 只删除该项，不改变 popup 状态", async () => {
    render(<ControlledFixture initialValue={["sans", "serif"]} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    const remove = screen.getByRole("button", { name: "移除 无衬线" });
    await interact(async () => {
      remove.focus();
      await userEvent.keyboard("{Enter}");
    });
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    const nextRemove = screen.getByRole("button", { name: "移除 衬线" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(nextRemove);
  });

  it("popup 打开时按 Space 删除并保留 popup 与下一个 remove 焦点", async () => {
    render(<ControlledFixture initialValue={["sans", "serif"]} />);
    const trigger = screen.getByRole("combobox");
    await interact(() => userEvent.click(trigger));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const highlightedOption = screen.getByRole("option", { name: "衬线" });
    await interact(() => page.elementLocator(highlightedOption).hover());
    expect(highlightedOption.hasAttribute("data-highlighted")).toBe(true);

    const remove = screen.getByRole("button", { name: "移除 无衬线" });
    await interact(async () => {
      remove.focus();
      await userEvent.keyboard("{Space}");
    });
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    const nextRemove = screen.getByRole("button", { name: "移除 衬线" });
    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    expect(screen.queryByRole("button", { name: "移除 等宽" })).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(nextRemove);
  });

  it("pointer 删除单项保留已打开 popup，并将焦点交给下一个存活的删除按钮", async () => {
    const reasons: string[] = [];
    const ancestorPointerDown = vi.fn();
    render(
      <div onPointerDown={ancestorPointerDown}>
        <ControlledFixture
          initialValue={["sans", "serif"]}
          onOpenChange={(_open, eventDetails) => reasons.push(eventDetails.reason)}
        />
      </div>,
    );
    const trigger = screen.getByRole("combobox");
    await interact(() => userEvent.click(trigger));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    ancestorPointerDown.mockClear();

    await interact(() => userEvent.click(screen.getByRole("button", { name: "移除 无衬线" })));
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));
    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    const nextRemove = screen.getByRole("button", { name: "移除 衬线" });
    expect(reasons).toContain("outside-press");
    expect(reasons).toContain("focus-out");
    expect(ancestorPointerDown).not.toHaveBeenCalled();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(nextRemove);
  });

  it("值保持受控时，pointer 点击 remove 会把原生焦点落到该按钮", async () => {
    const ancestorPointerDown = vi.fn();
    render(
      <div onPointerDown={ancestorPointerDown}>
        <NonUpdatingControlledFixture />
      </div>,
    );
    const trigger = screen.getByRole("combobox");
    const remove = screen.getByRole("button", { name: "移除 无衬线" });

    await interact(() => userEvent.click(remove));

    expect(ancestorPointerDown).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(remove);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("maxDisplay=1 删除后会在新 DOM 中聚焦刚出现的后继 chip，并保留 popup", async () => {
    render(<ControlledFixture initialValue={["sans", "serif"]} maxDisplay={1} />);
    const trigger = screen.getByRole("combobox");
    await interact(() => userEvent.click(trigger));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await interact(() => userEvent.click(screen.getByRole("button", { name: "移除 无衬线" })));
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    const nextRemove = screen.getByRole("button", { name: "移除 衬线" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(nextRemove);
  });

  it("删除最后一个 chip 后保留 popup 并将焦点明确交回 Trigger", async () => {
    render(<ControlledFixture initialValue={["sans"]} />);
    const trigger = screen.getByRole("combobox");
    await interact(() => userEvent.click(trigger));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    await interact(() => userEvent.click(screen.getByRole("button", { name: "移除 无衬线" })));
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(trigger);
  });

  it("点击其他外部元素仍会关闭 popup", async () => {
    render(<ControlledFixture initialValue={["sans"]} />);
    const trigger = screen.getByRole("combobox");
    await interact(() => userEvent.click(trigger));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // Use a real coordinate away from the trigger/popup rather than a locator click through
    // the popup's overlay; this verifies the unchanged native outside-press path.
    await interact(async () => {
      await page.elementLocator(document.body).click({ position: { x: 300, y: 500 } });
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("点击 chip 非删除区域会打开 popup", async () => {
    render(<ControlledFixture initialValue={["sans"]} />);
    const chipLabel = document.querySelector<HTMLElement>('[data-slot="select-chip"] > span')!;
    const trigger = screen.getByRole("combobox");
    const chipBounds = chipLabel.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();

    // `data-slot=select-chip` is deliberately pointer-events:none, so a locator click on
    // that element correctly refuses to fake a click. Click the real trigger at a coordinate
    // inside the visible chip instead: Chromium must hit-test through the chip layer.
    await interact(() =>
      page.elementLocator(trigger).click({
        position: {
          x: chipBounds.left - triggerBounds.left + chipBounds.width / 2,
          y: chipBounds.top - triggerBounds.top + chipBounds.height / 2,
        },
      }),
    );
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  it("searchable 过滤不强插未命中的已选项", async () => {
    render(<ControlledFixture initialValue={["mono", "sans"]} searchable />);
    await interact(() => userEvent.click(screen.getByRole("combobox")));
    await interact(() => userEvent.fill(screen.getByPlaceholderText("搜索"), "衬线"));
    const labels = screen.getAllByRole("option").map((option) => option.textContent);
    expect(labels).toEqual(["无衬线", "衬线"]);
    expect(labels).not.toContain("等宽");
  });

  it("120 项自动虚拟化前先将 selectedFirst 项排到窗口首位", async () => {
    render(<VirtualizedFixture />);
    await interact(() => userEvent.click(screen.getByRole("combobox")));
    expect(document.querySelector("[data-hulian-virtual-count]")).not.toBeNull();
    expect(screen.getAllByRole("option")[0]?.textContent).toContain("Item 119");
  });

  it("删除最后一个 chip 后用组件型 placeholder 重新命名真实 Trigger", async () => {
    const onMount = vi.fn();
    render(<FinalDeleteNameFixture onPlaceholderMount={onMount} />);
    expect(onMount).not.toHaveBeenCalled();

    await interact(() => userEvent.click(screen.getByRole("button", { name: "移除 无衬线" })));
    await interact(() => new Promise<void>((resolve) => setTimeout(resolve, 0)));

    const trigger = screen.getByRole("combobox", { name: "浏览器最后一项组件占位" });
    const placeholder = document.querySelector<HTMLElement>("#browser-final-placeholder")!;
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("#browser-final-placeholder")).toHaveLength(1);
    expect(placeholder.closest("button[role='combobox']")).toBe(trigger);
    expect(placeholder.closest(".sr-only")).toBeNull();
  });
});
