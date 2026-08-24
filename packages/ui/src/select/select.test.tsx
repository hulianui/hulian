import { Fragment, createRef, useEffect, useState } from "react";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { describe, it, expect, vi } from "vitest";
import { act, render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectGroupLabel,
} from "./select";
import { Field } from "../field/field";

const items = [
  { value: "sans", label: "无衬线" },
  { value: "serif", label: "衬线" },
  { value: "mono", label: "等宽" },
];

// `getReactNodeText` used to inspect only element props. A component renders its
// label later, so this fixture makes sure the trigger names the actual DOM output.
function ComponentPlaceholder({
  label,
  id,
  testId = "component-placeholder",
  onMount,
}: {
  label: string;
  id?: string;
  testId?: string;
  onMount?: () => void;
}) {
  useEffect(() => {
    onMount?.();
  }, [onMount]);
  return (
    <span id={id} data-testid={testId}>
      {label}
    </span>
  );
}

function MountedOptionLabel({
  id,
  label,
  onMount,
  onUnmount,
}: {
  id: string;
  label: string;
  onMount: (id: string) => void;
  onUnmount: (id: string) => void;
}) {
  useEffect(() => {
    onMount(id);
    return () => onUnmount(id);
  }, [id, onMount, onUnmount]);
  return <span data-testid={`mounted-option-${id}`}>{label}</span>;
}

function parseServerMarkup(markup: string) {
  return new DOMParser().parseFromString(markup, "text/html");
}

function Basic(props: {
  defaultValue?: string;
  open?: boolean;
  size?: "sm" | "md" | "lg";
  invalid?: boolean;
}) {
  return (
    <Select
      items={items}
      placeholder="请选择字体"
      defaultValue={props.defaultValue}
      open={props.open}
    >
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

  it("SSR 空 chips 只渲染一份 placeholder，并以稳定 id 命名 combobox", () => {
    const renderMarkup = () =>
      renderToStaticMarkup(
        <Select
          items={items}
          multiple
          defaultValue={[]}
          placeholder={<span id="consumer-placeholder-id">服务端选择字体</span>}
        >
          <SelectTrigger id="ssr-empty-chips" display="chips" />
        </Select>,
      );

    const firstDocument = parseServerMarkup(renderMarkup());
    const firstTrigger = firstDocument.querySelector<HTMLElement>("#ssr-empty-chips")!;
    const labelledBy = firstTrigger.getAttribute("aria-labelledby");

    expect(firstDocument.querySelectorAll("#consumer-placeholder-id")).toHaveLength(1);
    expect(labelledBy).toBeTruthy();
    expect(firstDocument.querySelectorAll(`[id="${labelledBy}"]`)).toHaveLength(1);
    expect(firstDocument.getElementById(labelledBy!)?.textContent).toBe("服务端选择字体");

    const secondDocument = parseServerMarkup(renderMarkup());
    expect(
      secondDocument
        .querySelector<HTMLElement>("#ssr-empty-chips")
        ?.getAttribute("aria-labelledby"),
    ).toBe(labelledBy);
    expect(secondDocument.getElementById(labelledBy!)).not.toBeNull();
  });

  it("SSR 首帧立即保留消费方 aria-label 与 aria-labelledby 优先级", () => {
    const serverDocument = parseServerMarkup(
      renderToStaticMarkup(
        <>
          <span id="explicit-labelled-by">消费方关联标签</span>
          <Select
            items={items}
            multiple
            defaultValue={[]}
            placeholder={<span id="aria-label-placeholder">不会覆盖 aria-label</span>}
          >
            <SelectTrigger
              id="explicit-aria-label-trigger"
              display="chips"
              aria-label="消费方标签"
            />
          </Select>
          <Select
            items={items}
            multiple
            defaultValue={[]}
            placeholder={<span id="aria-labelledby-placeholder">不会覆盖 aria-labelledby</span>}
          >
            <SelectTrigger
              id="explicit-aria-labelledby-trigger"
              display="chips"
              aria-labelledby="explicit-labelled-by"
            />
          </Select>
        </>,
      ),
    );

    const ariaLabelTrigger = serverDocument.querySelector<HTMLElement>(
      "#explicit-aria-label-trigger",
    )!;
    const ariaLabelledByTrigger = serverDocument.querySelector<HTMLElement>(
      "#explicit-aria-labelledby-trigger",
    )!;
    expect(ariaLabelTrigger.getAttribute("aria-label")).toBe("消费方标签");
    expect(ariaLabelTrigger.getAttribute("aria-labelledby")).toBeNull();
    expect(ariaLabelledByTrigger.getAttribute("aria-labelledby")).toBe("explicit-labelled-by");
    expect(serverDocument.querySelectorAll("#aria-label-placeholder")).toHaveLength(1);
    expect(serverDocument.querySelectorAll("#aria-labelledby-placeholder")).toHaveLength(1);
  });

  it("hydration 后原生 label 与项目 Field 标签取回命名优先级", async () => {
    function LabeledFixture() {
      return (
        <>
          <Field label="项目 Field 标签">
            <Select
              items={items}
              multiple
              defaultValue={[]}
              placeholder={<span data-testid="hydrated-field-placeholder">Field 服务端占位</span>}
            >
              <SelectTrigger display="chips" />
            </Select>
          </Field>
          <label htmlFor="hydrated-native-trigger">原生 hydration 标签</label>
          <Select
            items={items}
            multiple
            defaultValue={[]}
            placeholder={<span data-testid="hydrated-native-placeholder">原生服务端占位</span>}
          >
            <SelectTrigger id="hydrated-native-trigger" display="chips" />
          </Select>
        </>
      );
    }

    const container = document.createElement("div");
    container.innerHTML = renderToString(<LabeledFixture />);
    document.body.append(container);
    const view = render(<LabeledFixture />, { container, hydrate: true });

    try {
      await waitFor(() => {
        expect(screen.getByRole("combobox", { name: "项目 Field 标签" })).toBeTruthy();
        expect(screen.getByRole("combobox", { name: "原生 hydration 标签" })).toBeTruthy();
      });

      const fieldPlaceholderId = screen.getByTestId("hydrated-field-placeholder").parentElement?.id;
      const nativePlaceholderId = screen.getByTestId("hydrated-native-placeholder").parentElement
        ?.id;
      const fieldTrigger = screen.getByRole("combobox", { name: "项目 Field 标签" });
      const nativeTrigger = screen.getByRole("combobox", { name: "原生 hydration 标签" });
      expect(fieldPlaceholderId).toBeTruthy();
      expect(nativePlaceholderId).toBeTruthy();
      expect(fieldTrigger.getAttribute("aria-labelledby")).not.toBe(fieldPlaceholderId);
      expect(nativeTrigger.getAttribute("aria-labelledby")).not.toBe(nativePlaceholderId);
    } finally {
      view.unmount();
      container.remove();
    }
  });

  it("chips 的组件型 placeholder 不覆盖外部 Field 标签", () => {
    render(
      <Field label="字体选择">
        <Select
          items={items}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="由组件渲染的占位" />}
        >
          <SelectTrigger display="chips" />
        </Select>
      </Field>,
    );

    expect(screen.getByRole("combobox", { name: "字体选择" })).toBeTruthy();
  });

  it("chips 的组件型 placeholder 不覆盖消费方 aria-label", () => {
    render(
      <Select
        items={items}
        multiple
        defaultValue={[]}
        placeholder={<ComponentPlaceholder label="由组件渲染的占位" />}
      >
        <SelectTrigger display="chips" aria-label="消费方命名" />
      </Select>,
    );

    expect(screen.getByRole("combobox", { name: "消费方命名" })).toBeTruthy();
  });

  it("chips 的组件型 placeholder 不覆盖消费方 aria-labelledby", () => {
    render(
      <>
        <span id="consumer-select-label">消费方关联命名</span>
        <Select
          items={items}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="由组件渲染的占位" />}
        >
          <SelectTrigger display="chips" aria-labelledby="consumer-select-label" />
        </Select>
      </>,
    );

    expect(screen.getByRole("combobox", { name: "消费方关联命名" })).toBeTruthy();
  });

  it("chips 的组件型 placeholder 不覆盖原生 label 关联", () => {
    render(
      <>
        <label htmlFor="native-select-label">原生标签命名</label>
        <Select
          items={items}
          multiple
          defaultValue={[]}
          placeholder={<ComponentPlaceholder label="由组件渲染的占位" />}
        >
          <SelectTrigger id="native-select-label" display="chips" />
        </Select>
      </>,
    );

    expect(screen.getByRole("combobox", { name: "原生标签命名" })).toBeTruthy();
  });

  it("searchable SelectTrigger 合并消费方 ref 与内部锚点 ref", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Select items={items} searchable>
        <SelectTrigger ref={ref} />
      </Select>,
    );
    expect(ref.current).toBe(getTrigger());
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

function Multi(props: {
  defaultValue?: string[];
  maxDisplay?: number;
  open?: boolean;
  display?: "text" | "chips";
  removable?: boolean;
}) {
  return (
    <Select
      items={items}
      placeholder="请选择字体"
      multiple
      defaultValue={props.defaultValue}
      open={props.open}
    >
      <SelectTrigger
        maxDisplay={props.maxDisplay}
        display={props.display}
        removable={props.removable}
      />
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

  it("默认 text 多选：消费方 cancel 变更时不更新镜像、触发器或选中态", () => {
    const onValueChange = vi.fn((_next, eventDetails) => {
      (eventDetails as { cancel: () => void }).cancel();
    });
    render(
      <Select items={items} multiple defaultValue={["sans"]} onValueChange={onValueChange} open>
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

    const serif = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(serif, { pointerType: "mouse" });
    fireEvent.click(serif);

    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(getTrigger().textContent).toContain("无衬线");
    expect(getTrigger().textContent).not.toContain("、衬线");
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "false",
    );
  });

  it("默认 text 多选：未 cancel 的变更更新镜像与触发器", () => {
    render(
      <Select items={items} multiple defaultValue={["sans"]} open>
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

    const serif = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(serif, { pointerType: "mouse" });
    fireEvent.click(serif);

    expect(getTrigger().textContent).toContain("无衬线、衬线");
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe("true");
  });
});

// ——— chips ———

describe("Select chips", () => {
  it("chips 渲染可见 label 与 +N，默认没有删除按钮", () => {
    render(<Multi defaultValue={["sans", "serif", "mono"]} maxDisplay={2} display="chips" />);
    expect(document.querySelectorAll('[data-slot="select-chip"]')).toHaveLength(2);
    expect(getTrigger().textContent).toContain("无衬线");
    expect(getTrigger().textContent).toContain("衬线");
    expect(screen.getByText("+1")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
  });

  it("空值标准 chips 在真实 Trigger Value 渲染唯一带样式的 ReactNode placeholder", () => {
    render(
      <Select
        items={items}
        multiple
        defaultValue={[]}
        placeholder={
          <span data-testid="standard-chip-placeholder">
            选择 <strong>字体</strong>
          </span>
        }
      >
        <SelectTrigger display="chips" />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );

    const placeholders = screen.getAllByTestId("standard-chip-placeholder");
    expect(placeholders).toHaveLength(1);
    const placeholder = placeholders[0]!;
    expect(placeholder.textContent).toBe("选择 字体");
    expect(placeholder.parentElement?.className).toContain("text-muted-foreground");
    expect(placeholder.closest("button[role='combobox']")).toBe(getTrigger());
    expect(placeholder.closest(".sr-only")).toBeNull();
    expect(screen.getByRole("combobox", { name: /选择\s*字体/ })).toBeTruthy();
  });

  it("空值标准 chips 的组件型 placeholder 只挂载一次、稳定关联且可见", () => {
    const onMount = vi.fn();
    function Fixture() {
      return (
        <Select
          items={items}
          multiple
          defaultValue={[]}
          placeholder={
            <ComponentPlaceholder
              id="standard-component-placeholder"
              label="标准组件占位"
              onMount={onMount}
            />
          }
        >
          <SelectTrigger display="chips" />
        </Select>
      );
    }

    const view = render(<Fixture />);
    const placeholder = screen.getByTestId("component-placeholder");
    const trigger = screen.getByRole("combobox", { name: "标准组件占位" });
    const labelledBy = trigger.getAttribute("aria-labelledby");
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("#standard-component-placeholder")).toHaveLength(1);
    expect(placeholder.closest("button[role='combobox']")).toBe(trigger);
    expect(placeholder.closest(".sr-only")).toBeNull();
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy!)).not.toBeNull();

    view.rerender(<Fixture />);
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(getTrigger().getAttribute("aria-labelledby")).toBe(labelledBy);
    expect(document.querySelectorAll(`[id="${labelledBy}"]`)).toHaveLength(1);
    expect(screen.getByRole("combobox", { name: "标准组件占位" })).toBeTruthy();
  });

  it("空值 searchable chips 也在真实 Trigger Value 渲染唯一 ReactNode placeholder", () => {
    render(
      <Select
        items={items}
        multiple
        searchable
        defaultValue={[]}
        placeholder={<span data-testid="searchable-chip-placeholder">搜索并选择字体</span>}
      >
        <SelectTrigger display="chips" />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );

    const placeholders = screen.getAllByTestId("searchable-chip-placeholder");
    expect(placeholders).toHaveLength(1);
    const placeholder = placeholders[0]!;
    expect(placeholder.textContent).toBe("搜索并选择字体");
    expect(placeholder.parentElement?.className).toContain("text-muted-foreground");
    expect(placeholder.closest("button[role='combobox']")).toBe(getTrigger());
    expect(placeholder.closest(".sr-only")).toBeNull();
    expect(screen.getByRole("combobox", { name: "搜索并选择字体" })).toBeTruthy();
  });

  it("空值 searchable chips 的组件型 placeholder 只挂载一次且可见命名", () => {
    const onMount = vi.fn();
    render(
      <Select
        items={items}
        multiple
        searchable
        defaultValue={[]}
        placeholder={
          <ComponentPlaceholder
            id="searchable-component-placeholder"
            label="搜索组件占位"
            onMount={onMount}
          />
        }
      >
        <SelectTrigger display="chips" />
      </Select>,
    );

    const placeholder = screen.getByTestId("component-placeholder");
    const trigger = screen.getByRole("combobox", { name: "搜索组件占位" });
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("#searchable-component-placeholder")).toHaveLength(1);
    expect(placeholder.closest("button[role='combobox']")).toBe(trigger);
    expect(placeholder.closest(".sr-only")).toBeNull();
  });

  it("removable 按当前顺序删除单项，按钮不嵌套在 trigger", () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} multiple defaultValue={["sans", "serif"]} onValueChange={onValueChange}>
        <SelectTrigger display="chips" removable />
      </Select>,
    );
    const remove = screen.getByRole("button", { name: "移除 无衬线" });
    expect(remove.closest("button[role='combobox']")).toBeNull();
    fireEvent.click(remove);
    expect(onValueChange.mock.calls[0][0]).toEqual(["serif"]);
  });

  it("remove 的 Space/Enter keydown 不冒泡到 Select，其他键保持原生冒泡", () => {
    const onKeyDown = vi.fn();
    render(
      <div onKeyDown={onKeyDown}>
        <Select items={items} multiple defaultOpen defaultValue={["sans", "serif"]}>
          <SelectTrigger display="chips" removable />
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>,
    );

    const highlightedOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerMove(highlightedOption, { pointerType: "mouse" });
    expect(highlightedOption.hasAttribute("data-highlighted")).toBe(true);

    const remove = screen.getByRole("button", { name: "移除 无衬线" });
    remove.focus();
    fireEvent.keyDown(remove, { key: " " });
    fireEvent.keyDown(remove, { key: "Enter" });
    expect(onKeyDown).not.toHaveBeenCalled();

    fireEvent.keyDown(remove, { key: "Tab" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("受控值未回传时视觉不自行删除", () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} multiple value={["sans", "serif"]} onValueChange={onValueChange}>
        <SelectTrigger display="chips" removable />
      </Select>,
    );
    fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
    expect(onValueChange).toHaveBeenCalledWith(["serif"], expect.anything());
    expect(screen.getByRole("button", { name: "移除 无衬线" })).toBeTruthy();
  });

  it("复杂 label 的删除名称回退 value", () => {
    const complex = [{ value: "status", label: <strong>运行中</strong> }];
    render(
      <Select items={complex} multiple defaultValue={["status"]}>
        <SelectTrigger display="chips" removable />
      </Select>,
    );
    expect(screen.getByRole("button", { name: "移除 status" })).toBeTruthy();
  });

  it("chips 的触发器名称包含所有选中项，不受 maxDisplay 视觉截断影响", () => {
    render(<Multi defaultValue={["sans", "serif", "mono"]} maxDisplay={2} display="chips" />);
    expect(screen.getByRole("combobox", { name: "无衬线、衬线、等宽" })).toBeTruthy();
  });

  it("chip 的非删除视觉层不截获指针，底层真实 trigger 仍可命中", () => {
    render(<Multi defaultValue={["sans"]} display="chips" />);
    const layer = document.querySelector('[data-slot="select-chip-layer"]')!;
    expect(layer.className).toContain("pointer-events-none");
    expect(document.querySelector("button[role='combobox'] button")).toBeNull();
  });

  it("removable 与 clearable 共存：单删一个，clear-all 清空剩余项", () => {
    const spy = vi.fn();
    function Fixture() {
      const [value, setValue] = useState(["sans", "serif"]);
      return (
        <Select
          items={items}
          multiple
          clearable
          value={value}
          onValueChange={(next) => {
            spy(next);
            setValue(next as string[]);
          }}
        >
          <SelectTrigger display="chips" removable />
        </Select>
      );
    }
    render(<Fixture />);
    fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
    expect(spy.mock.calls[0][0]).toEqual(["serif"]);
    fireEvent.click(screen.getByRole("button", { name: "清除" }));
    expect(spy.mock.calls[1][0]).toEqual([]);
  });

  it("删除最后一项后在真实 Trigger Value 回落唯一组件型 placeholder 并恢复命名", () => {
    const onMount = vi.fn();
    function Fixture() {
      const [value, setValue] = useState(["sans"]);
      return (
        <Select
          items={items}
          multiple
          value={value}
          placeholder={
            <ComponentPlaceholder
              id="final-component-placeholder"
              label="最后一项组件占位"
              onMount={onMount}
            />
          }
          onValueChange={(next) => setValue(next as string[])}
        >
          <SelectTrigger display="chips" removable />
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

    render(<Fixture />);
    expect(onMount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
    const placeholder = screen.getByTestId("component-placeholder");
    const trigger = screen.getByRole("combobox", { name: "最后一项组件占位" });
    expect(onMount).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll("#final-component-placeholder")).toHaveLength(1);
    expect(placeholder.closest("button[role='combobox']")).toBe(trigger);
    expect(placeholder.closest(".sr-only")).toBeNull();
  });

  it("disabled chips 不暴露删除入口或值变更", () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} multiple disabled defaultValue={["sans"]} onValueChange={onValueChange}>
        <SelectTrigger display="chips" removable />
        <SelectContent>
          <SelectItem value="sans">无衬线</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("readOnly chips 不暴露删除入口或值变更", () => {
    const onValueChange = vi.fn();
    render(
      <Select items={items} multiple readOnly defaultValue={["sans"]} onValueChange={onValueChange}>
        <SelectTrigger display="chips" removable />
        <SelectContent>
          <SelectItem value="sans">无衬线</SelectItem>
        </SelectContent>
      </Select>,
    );

    expect(screen.queryByRole("button", { name: "移除 无衬线" })).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("连续删除按当时状态顺序推进，不回写已删值", () => {
    const changes: string[][] = [];
    render(
      <Select
        items={items}
        multiple
        defaultValue={["sans", "serif", "mono"]}
        onValueChange={(next) => changes.push(next as string[])}
      >
        <SelectTrigger display="chips" removable maxDisplay={3} />
        <SelectContent>
          {items.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    fireEvent.click(screen.getByRole("button", { name: "移除 无衬线" }));
    fireEvent.click(screen.getByRole("button", { name: "移除 衬线" }));

    expect(changes).toEqual([["serif", "mono"], ["mono"]]);
    expect(screen.getByRole("button", { name: "移除 等宽" })).toBeTruthy();
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
      <Select
        items={items}
        placeholder="请选择字体"
        clearable
        value="serif"
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

  // #283：加载期间浮层卸掉全部选项，Base UI 会把「已卸载」的选中项当成被移除而回调剔除后的值；
  // loading 是展示态，不许借这条路改写受控值。
  function ControlledMulti(props: {
    loading?: boolean;
    value: string[];
    onValueChange: (v: unknown) => void;
    itemList?: typeof items;
  }) {
    const list = props.itemList ?? items;
    return (
      <Select
        items={list}
        multiple
        open
        value={props.value}
        onValueChange={props.onValueChange}
        loading={props.loading}
      >
        <SelectTrigger />
        <SelectContent>
          {list.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  it("受控多选浮层开着时把 loading 置 true 再置回：不回调 onValueChange，值原样保留", () => {
    const spy = vi.fn();
    const r = render(<ControlledMulti value={["serif"]} onValueChange={spy} />);
    r.rerender(<ControlledMulti value={["serif"]} onValueChange={spy} loading />);
    r.rerender(<ControlledMulti value={["serif"]} onValueChange={spy} loading={false} />);
    expect(spy).not.toHaveBeenCalled();
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe("true");
  });

  it("受控单选同样：loading 往返不回调 null", () => {
    const spy = vi.fn();
    const Single = (p: { loading?: boolean }) => (
      <Select items={items} open value="serif" onValueChange={spy} loading={p.loading}>
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
    const r = render(<Single />);
    r.rerender(<Single loading />);
    r.rerender(<Single loading={false} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it("非受控多选：loading 往返后 Base UI 内部值也保住（cancel 了内部剔除）", () => {
    const Un = (p: { loading?: boolean }) => (
      <Select items={items} multiple open defaultValue={["serif"]} loading={p.loading}>
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
    const r = render(<Un />);
    r.rerender(<Un loading />);
    r.rerender(<Un loading={false} />);
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe("true");
    expect(getTrigger().textContent).toContain("衬线");
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
  function SearchableModeFixture({
    searchable,
    onValueChange,
    defaultValue,
  }: {
    searchable: boolean;
    onValueChange: (value: unknown) => void;
    defaultValue?: string;
  }) {
    return (
      <Select
        items={items}
        placeholder="请选择字体"
        searchable={searchable}
        open
        defaultValue={defaultValue}
        onValueChange={onValueChange}
      >
        <SelectTrigger />
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  function BatchedSkinFixture() {
    const [searchable, setSearchable] = useState(true);
    return (
      <Select
        items={items}
        searchable={searchable}
        open
        onValueChange={() => setSearchable(false)}
      >
        <SelectTrigger />
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  it("同一实例从标准模式切到 searchable 时保持可用，不触发 Hook 顺序错误", () => {
    const onValueChange = vi.fn();
    const view = render(
      <SearchableModeFixture searchable={false} onValueChange={onValueChange} />,
    );
    expect(view.container.querySelector("button[role='combobox']")).not.toBeNull();
    expect(screen.getByRole("listbox")).toBeTruthy();

    expect(() =>
      view.rerender(<SearchableModeFixture searchable onValueChange={onValueChange} />),
    ).not.toThrow();

    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector("button[role='combobox']")).not.toBeNull();
    expect(screen.getByRole("listbox")).toBeTruthy();
    const searchableOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(searchableOption, { pointerType: "mouse" });
    fireEvent.click(searchableOption);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("serif");
  });

  it("同一实例从 searchable 切回标准模式时保持可用，不触发 Hook 顺序错误", () => {
    const onValueChange = vi.fn();
    const view = render(<SearchableModeFixture searchable onValueChange={onValueChange} />);
    expect(view.container.querySelector("button[role='combobox']")).not.toBeNull();
    expect(screen.getByRole("listbox")).toBeTruthy();

    expect(() =>
      view.rerender(
        <SearchableModeFixture searchable={false} onValueChange={onValueChange} />,
      ),
    ).not.toThrow();

    expect(view.container.firstElementChild).not.toBeNull();
    expect(view.container.querySelector("button[role='combobox']")).not.toBeNull();
    expect(screen.getByRole("listbox")).toBeTruthy();
    const standardOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(standardOption, { pointerType: "mouse" });
    fireEvent.click(standardOption);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("serif");
  });

  it("searchable 中的非受控选择切回标准模式后仍保留", () => {
    const onValueChange = vi.fn();
    const view = render(<SearchableModeFixture searchable onValueChange={onValueChange} />);

    const searchableOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(searchableOption, { pointerType: "mouse" });
    fireEvent.click(searchableOption);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("serif");

    view.rerender(
      <SearchableModeFixture searchable={false} onValueChange={onValueChange} />,
    );

    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("combobox").textContent).toContain("衬线");
  });

  it("标准模式中的非受控选择往返 searchable 后仍保留", () => {
    const onValueChange = vi.fn();
    const view = render(
      <SearchableModeFixture
        searchable={false}
        defaultValue="sans"
        onValueChange={onValueChange}
      />,
    );

    const standardOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(standardOption, { pointerType: "mouse" });
    fireEvent.click(standardOption);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("serif");

    view.rerender(
      <SearchableModeFixture searchable defaultValue="sans" onValueChange={onValueChange} />,
    );
    expect(view.container.querySelector("button[role='combobox']")?.textContent).toContain(
      "衬线",
    );

    view.rerender(
      <SearchableModeFixture
        searchable={false}
        defaultValue="sans"
        onValueChange={onValueChange}
      />,
    );
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("combobox").textContent).toContain("衬线");
  });

  it("searchable 的 onValueChange 同批切回标准模式时首帧保留选择", () => {
    render(<BatchedSkinFixture />);

    const searchableOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(searchableOption, { pointerType: "mouse" });
    fireEvent.click(searchableOption);

    expect(screen.queryByPlaceholderText("搜索")).toBeNull();
    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("combobox").textContent).toContain("衬线");
  });

  it("稳定标准模式下改变 defaultValue 不会覆盖用户的非受控选择", () => {
    const onValueChange = vi.fn();
    const view = render(
      <SearchableModeFixture
        searchable={false}
        defaultValue="sans"
        onValueChange={onValueChange}
      />,
    );

    const standardOption = screen.getByRole("option", { name: "衬线" });
    fireEvent.pointerDown(standardOption, { pointerType: "mouse" });
    fireEvent.click(standardOption);
    expect(onValueChange.mock.calls.at(-1)?.[0]).toBe("serif");

    view.rerender(
      <SearchableModeFixture
        searchable={false}
        defaultValue="mono"
        onValueChange={onValueChange}
      />,
    );

    expect(screen.getByRole("option", { name: "衬线" }).getAttribute("aria-selected")).toBe(
      "true",
    );
    expect(screen.getByRole("combobox").textContent).toContain("衬线");
  });

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

// ——— selectedFirst ———

describe("Select selectedFirst", () => {
  it("按 value 数组排列已选项，未选项保持原顺序", () => {
    render(
      <Select items={items} multiple selectedFirst defaultValue={["mono", "sans"]} open>
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
    expect(optionTexts()).toEqual(["等宽", "无衬线", "衬线"]);
  });

  it("分组时只在组内置顶，组顺序不变", () => {
    render(
      <Select items={items} multiple selectedFirst defaultValue={["serif", "mono"]} open>
        <SelectTrigger />
        <SelectContent>
          <SelectGroup>
            <SelectGroupLabel>西文</SelectGroupLabel>
            <SelectItem value="sans">无衬线</SelectItem>
            <SelectItem value="serif">衬线</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectGroupLabel>代码</SelectGroupLabel>
            <SelectItem value="mono">等宽</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>,
    );
    expect(optionTexts()).toEqual(["衬线", "无衬线", "等宽"]);
  });

  it("跨兄弟 Fragment 全局置顶，Fragment 不形成排序边界", () => {
    render(
      <Select items={items} multiple selectedFirst defaultValue={["serif"]} open>
        <SelectTrigger />
        <SelectContent>
          <Fragment>
            <Fragment>
              <SelectItem value="sans">无衬线</SelectItem>
            </Fragment>
          </Fragment>
          <Fragment>
            <Fragment>
              <SelectItem value="serif">衬线</SelectItem>
            </Fragment>
          </Fragment>
        </SelectContent>
      </Select>,
    );

    expect(optionTexts()).toEqual(["衬线", "无衬线"]);
  });

  it("跨 Fragment 置顶时保留 keyed option 的组件与 DOM 身份", async () => {
    const onMount = vi.fn();
    const onUnmount = vi.fn();
    const renderSelect = (value: string[]) => (
      <Select items={items} multiple selectedFirst value={value} open onValueChange={() => {}}>
        <SelectTrigger />
        <SelectContent>
          <Fragment key="sans-fragment">
            <SelectItem key="sans" value="sans">
              <MountedOptionLabel
                id="sans"
                label="无衬线"
                onMount={onMount}
                onUnmount={onUnmount}
              />
            </SelectItem>
          </Fragment>
          <Fragment key="serif-fragment">
            <SelectItem key="serif" value="serif">
              <MountedOptionLabel
                id="serif"
                label="衬线"
                onMount={onMount}
                onUnmount={onUnmount}
              />
            </SelectItem>
          </Fragment>
        </SelectContent>
      </Select>
    );
    const view = render(renderSelect([]));
    const initialSans = screen.getByTestId("mounted-option-sans");
    const initialSerif = screen.getByTestId("mounted-option-serif");

    await act(async () => {
      view.rerender(renderSelect(["serif"]));
    });

    expect(optionTexts()).toEqual(["衬线", "无衬线"]);
    expect(screen.getByTestId("mounted-option-sans")).toBe(initialSans);
    expect(screen.getByTestId("mounted-option-serif")).toBe(initialSerif);
    expect(onMount.mock.calls).toEqual([["sans"], ["serif"]]);
    expect(onUnmount).not.toHaveBeenCalled();
  });

  it("searchable 先过滤，未命中的已选项不被强插", () => {
    render(
      <Select items={items} multiple searchable selectedFirst defaultValue={["mono", "sans"]} open>
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
    fireEvent.change(getSearchInput(), { target: { value: "衬线" } });
    expect(optionTexts()).toEqual(["无衬线", "衬线"]);
  });

  it("searchable 在筛出的候选中仍按已选 value 顺序置顶", () => {
    render(
      <Select items={items} multiple searchable selectedFirst defaultValue={["serif"]} open>
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
    fireEvent.change(getSearchInput(), { target: { value: "衬线" } });
    expect(optionTexts()).toEqual(["衬线", "无衬线"]);
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

  it("searchable: virtualized 透传给 Combobox —— 传 false 时超阈值也全量挂载", async () => {
    const many = Array.from({ length: 150 }, (_, i) => ({
      value: `f-${i}`,
      label: `字体 ${i}`,
    }));
    render(
      <Select items={many} placeholder="请选择字体" searchable virtualized={false} open>
        <SelectTrigger />
        <SelectContent>
          {many.map((it) => (
            <SelectItem key={it.value} value={it.value}>
              {it.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>,
    );
    // 自定义 SelectItem 高度 ≠ 32px 时的逃生口；不透传的话消费方无从关闭自动虚拟化。
    expect(document.querySelector("[data-hulian-virtual-count]")).toBeNull();
    expect(document.querySelectorAll("[role='option']").length).toBe(many.length);
  });
});
