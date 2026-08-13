import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
} from "./combobox";
import { ConfigProvider } from "../config/config-provider";
import { enUS } from "../config/locale";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const FRUITS = [
  { value: "apple", label: "苹果 Apple" },
  { value: "banana", label: "香蕉 Banana" },
  { value: "cherry", label: "樱桃 Cherry" },
];

function Demo(props: { defaultOpen?: boolean; invalid?: boolean; defaultValue?: (typeof FRUITS)[number] }) {
  return (
    <Combobox items={FRUITS} defaultOpen={props.defaultOpen} defaultValue={props.defaultValue}>
      <ComboboxInput placeholder="搜索水果…" invalid={props.invalid} clearable />
      <ComboboxContent>
        {(item) => (
          <ComboboxItem key={item.value} value={item} disabled={item.value === "cherry"}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  it("渲染输入框 + placeholder", () => {
    render(<Demo />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.tagName).toBe("INPUT");
  });

  it("默认闭合：未展开时选项不在 DOM", () => {
    render(<Demo />);
    expect(screen.queryByText("苹果 Apple")).toBeNull();
  });

  it("defaultOpen 展开后渲染全部候选项", () => {
    render(<Demo defaultOpen />);
    expect(screen.getByText("苹果 Apple")).toBeTruthy();
    expect(screen.getByText("香蕉 Banana")).toBeTruthy();
    expect(screen.getByText("樱桃 Cherry")).toBeTruthy();
  });

  it("disabled item 落 data-disabled + 皮肤钩子类齐备", () => {
    render(<Demo defaultOpen />);
    const cherry = screen.getByText("樱桃 Cherry").closest("[role='option']") as HTMLElement;
    expect(cherry).toBeTruthy();
    expect(cherry.getAttribute("data-disabled")).not.toBeNull();
    expect(cherry.className).toContain("data-[highlighted]:bg-surface-hover");
  });

  it("invalid → input 落 data-invalid/aria-invalid，外壳 has-[[data-invalid]] 钩子", () => {
    render(<Demo invalid />);
    const input = screen.getByPlaceholderText("搜索水果…");
    expect(input.getAttribute("data-invalid")).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const shell = input.parentElement as HTMLElement;
    expect(shell.className).toContain("has-[[data-invalid]]:border-danger");
  });

  it("defaultValue → input 显示对应 label", () => {
    render(<Demo defaultValue={FRUITS[1]} />);
    const input = screen.getByDisplayValue("香蕉 Banana");
    expect(input).toBeTruthy();
  });

  it("大数据集只挂载可视窗口，过滤后仍能找到远端选项", async () => {
    const observer = class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        const size = [{ inlineSize: 320, blockSize: 320 }] as ReadonlyArray<ResizeObserverSize>;
        queueMicrotask(() =>
          this.callback(
            [
              {
                target,
                contentRect: {
                  width: 320,
                  height: 320,
                  top: 0,
                  left: 0,
                  right: 320,
                  bottom: 320,
                  x: 0,
                  y: 0,
                } as DOMRectReadOnly,
                borderBoxSize: size,
                contentBoxSize: size,
                devicePixelContentBoxSize: size,
              },
            ],
            this as unknown as ResizeObserver,
          ),
        );
      }
      unobserve() {}
      disconnect() {}
    };
    vi.stubGlobal("ResizeObserver", observer);
    const rect = vi
      .spyOn(Element.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: Element) {
        const height = this.hasAttribute("data-index") ? 32 : 320;
        return {
          width: 320,
          height,
          top: 0,
          left: 0,
          right: 320,
          bottom: height,
          x: 0,
          y: 0,
          toJSON() {},
        } as DOMRect;
      });
    const many = Array.from({ length: 1_000 }, (_, index) => ({
      value: `item-${index}`,
      label: `选项 ${index}`,
    }));

    render(
      <Combobox items={many} defaultOpen>
        <ComboboxInput placeholder="搜索千项" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );

    await waitFor(() =>
      expect(document.querySelectorAll("[role='option']").length).toBeLessThan(40),
    );
    expect(screen.queryByText("选项 999")).toBeNull();
    fireEvent.change(screen.getByPlaceholderText("搜索千项"), { target: { value: "选项 999" } });
    await waitFor(() => expect(screen.getByText("选项 999")).toBeTruthy());

    rect.mockRestore();
  });

  it("virtualized={false} 关掉自动虚拟化：超阈值也全量挂载", async () => {
    const many = Array.from({ length: 150 }, (_, index) => ({
      value: `item-${index}`,
      label: `选项 ${index}`,
    }));

    render(
      <Combobox items={many} virtualized={false} defaultOpen>
        <ComboboxInput placeholder="搜索" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );

    // 逃生口：项高不是默认 32px 时必须能回到全量渲染，否则滚动落位会偏且无声。
    await waitFor(() =>
      expect(document.querySelectorAll("[role='option']").length).toBe(many.length),
    );
    expect(document.querySelector("[data-hulian-virtual-count]")).toBeNull();
    expect(screen.getByText("选项 149")).toBeTruthy();
  });
});

// 口径见 docs/consuming.md 第 7 节。这里的落点断言比「有没有透传」更重要：
// 三个可见字段件里有两个是「皮肤外壳 + 内层 input」，机械展开到外壳等于没透传（#160）。
describe("Combobox 可见字段透传原生属性（#160）", () => {
  it("ComboboxInput：aria-label / id / name 落到内层 input（不是外壳 span）", () => {
    render(
      <Combobox items={FRUITS}>
        <ComboboxInput
          aria-label="搜索任务、客户、文件"
          id="task-search"
          name="q"
          data-testid="probe"
        />
      </Combobox>,
    );
    const input = screen.getByRole("combobox");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("aria-label")).toBe("搜索任务、客户、文件");
    expect(input.id).toBe("task-search");
    expect(input.getAttribute("name")).toBe("q");
    expect(input.getAttribute("data-testid")).toBe("probe");
  });

  it("ComboboxInput：onBlur 落到内层 input —— 能接 react-hook-form 的 Controller", () => {
    const onBlur = vi.fn();
    render(
      <Combobox items={FRUITS}>
        <ComboboxInput aria-label="水果" onBlur={onBlur} />
      </Combobox>,
    );
    fireEvent.blur(screen.getByRole("combobox"));
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("ComboboxInput：外部属性顶不掉组件自己的无效态与皮肤类名", () => {
    render(
      <Combobox items={FRUITS}>
        <ComboboxInput aria-label="水果" invalid aria-invalid={false} className="my-shell" />
      </Combobox>,
    );
    const input = screen.getByRole("combobox");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    // className 仍归外壳（皮肤在外壳上），不会被 rest 抢走
    expect((input.parentElement as HTMLElement).className).toContain("my-shell");
  });

  it("ComboboxInput：prefix 渲染在输入框之前，showChevron={false} 去掉右侧箭头", () => {
    const { container } = render(
      <Combobox items={FRUITS}>
        <ComboboxInput aria-label="搜索" prefix={<span data-testid="magnifier" />} showChevron={false} />
      </Combobox>,
    );
    const shell = screen.getByRole("combobox").parentElement as HTMLElement;
    const prefix = screen.getByTestId("magnifier");
    expect(shell.contains(prefix)).toBe(true);
    expect(prefix.compareDocumentPosition(screen.getByRole("combobox")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelector("svg")).toBeNull();
  });

  it("ComboboxInput：默认仍渲染 chevron（不传 showChevron 时行为不变）", () => {
    const { container } = render(
      <Combobox items={FRUITS}>
        <ComboboxInput aria-label="搜索" />
      </Combobox>,
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("ComboboxTrigger：原生属性落到按钮自身", () => {
    render(
      <Combobox items={FRUITS}>
        <ComboboxTrigger aria-label="选择水果" id="fruit-trigger" data-testid="probe" />
      </Combobox>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger.getAttribute("aria-label")).toBe("选择水果");
    expect(trigger.id).toBe("fruit-trigger");
    expect(trigger.getAttribute("data-testid")).toBe("probe");
  });

  it("ComboboxChips：原生属性落到内层 input（chips 容器是 role=toolbar 的皮肤壳）", () => {
    render(
      <Combobox items={FRUITS} multiple>
        <ComboboxChips aria-label="选择水果" name="fruits" className="my-chips">
          <ComboboxChip>苹果 Apple</ComboboxChip>
        </ComboboxChips>
      </Combobox>,
    );
    const input = screen.getByRole("combobox");
    expect(input.tagName).toBe("INPUT");
    expect(input.getAttribute("aria-label")).toBe("选择水果");
    expect(input.getAttribute("name")).toBe("fruits");
    expect(document.querySelector(".my-chips")!.contains(input)).toBe(true);
  });
});

// #235：长尾字段（发证机构这类）几百个常见值做成选项能让多数人少打字，但运营手里就是有
// 一张列表上没有的 —— 没有这一档只能整块自绘 allowCustom。
describe("Combobox creatable（自由输入创建新值）", () => {
  const ISSUERS = [
    { value: "bj-psb", label: "北京市公安局" },
    { value: "sh-psb", label: "上海市公安局" },
  ];

  function CreatableDemo(props: { onCreate?: (value: string) => void; onValueChange?: (value: unknown) => void }) {
    return (
      <Combobox
        items={ISSUERS}
        creatable
        defaultOpen
        onCreate={props.onCreate}
        onValueChange={props.onValueChange}
      >
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>
    );
  }

  function type(text: string) {
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: text } });
    return input;
  }

  it("无精确匹配时列表首位出现创建项", async () => {
    render(<CreatableDemo />);
    type("杭州市公安局");
    await waitFor(() => expect(screen.getByText("使用 “杭州市公安局”")).toBeTruthy());
    const options = screen.getAllByRole("option");
    expect(options[0]!.getAttribute("data-hulian-create")).not.toBeNull();
  });

  it("点击创建项：onCreate 拿到输入串，onValueChange 同时拿到同一串当值", async () => {
    const onCreate = vi.fn();
    const onValueChange = vi.fn();
    render(<CreatableDemo onCreate={onCreate} onValueChange={onValueChange} />);
    type("杭州市公安局");
    await waitFor(() => expect(screen.getByText("使用 “杭州市公安局”")).toBeTruthy());
    fireEvent.click(screen.getByText("使用 “杭州市公安局”"));
    expect(onCreate).toHaveBeenCalledWith("杭州市公安局");
    expect(onValueChange).toHaveBeenCalledWith(
      expect.objectContaining({ value: "杭州市公安局", label: "杭州市公安局" }),
      expect.anything(),
    );
  });

  // 创建项是货真价实的 Combobox.Item 而不是自绘的一行 —— 键盘导航能不能走到它，是这句话的判据。
  it("键盘能走到创建项（ArrowDown 首站就是它）", async () => {
    render(<CreatableDemo />);
    const input = type("杭州市公安局");
    await waitFor(() => expect(screen.getByText("使用 “杭州市公安局”")).toBeTruthy());
    fireEvent.keyDown(input, { key: "ArrowDown" });
    await waitFor(() => {
      const create = document.querySelector("[data-hulian-create]") as HTMLElement;
      expect(create.getAttribute("data-highlighted")).not.toBeNull();
    });
  });

  it("两端空白去掉后再判重与提交", async () => {
    const onCreate = vi.fn();
    render(<CreatableDemo onCreate={onCreate} />);
    type("  杭州市公安局  ");
    await waitFor(() => expect(screen.getByText("使用 “杭州市公安局”")).toBeTruthy());
    fireEvent.click(screen.getByText("使用 “杭州市公安局”"));
    expect(onCreate).toHaveBeenCalledWith("杭州市公安局");
  });

  it("输入串与既有项 label 完全相同时不出创建项（部分匹配时仍出）", async () => {
    render(<CreatableDemo />);
    type("北京市");
    await waitFor(() => expect(screen.getByText("使用 “北京市”")).toBeTruthy());
    type("北京市公安局");
    await waitFor(() => expect(screen.queryByText("使用 “北京市公安局”")).toBeNull());
    expect(screen.getByText("北京市公安局")).toBeTruthy();
  });

  it("与既有项 value 完全相同时也不出创建项", async () => {
    render(<CreatableDemo />);
    type("bj-psb");
    await waitFor(() => expect(screen.queryByText("使用 “bj-psb”")).toBeNull());
  });

  it("输入为空（含只有空白）时不出创建项", async () => {
    render(<CreatableDemo />);
    await waitFor(() => expect(screen.getByText("北京市公安局")).toBeTruthy());
    expect(document.querySelector("[data-hulian-create]")).toBeNull();
    type("   ");
    expect(document.querySelector("[data-hulian-create]")).toBeNull();
  });

  it("零结果时不再同时喊「无匹配项」——列表里明摆着有一条可选", async () => {
    render(<CreatableDemo />);
    type("完全不存在的机构");
    await waitFor(() => expect(screen.getByText("使用 “完全不存在的机构”")).toBeTruthy());
    expect(screen.queryByText("无匹配项")).toBeNull();
  });

  it("英文 locale 下创建项文案跟着走", async () => {
    render(
      <ConfigProvider locale={enUS}>
        <CreatableDemo />
      </ConfigProvider>,
    );
    type("Hangzhou PSB");
    await waitFor(() => expect(screen.getByText("Use “Hangzhou PSB”")).toBeTruthy());
  });

  // 长尾字段（发证机构）几百个候选正好越过自动虚拟化阈值，所以这一档必须在虚拟化下也成立 ——
  // 创建项是塞进 items 的真选项，虚拟化那条路照样认它。
  it("超过自动虚拟化阈值时创建项仍然出现", async () => {
    // 虚拟化在 jsdom 下要有尺寸才会渲染任何一项，故照抄本文件既有虚拟化用例的量尺桩。
    const observer = class {
      constructor(private readonly callback: ResizeObserverCallback) {}
      observe(target: Element) {
        const size = [{ inlineSize: 320, blockSize: 320 }] as ReadonlyArray<ResizeObserverSize>;
        queueMicrotask(() =>
          this.callback(
            [
              {
                target,
                contentRect: {
                  width: 320,
                  height: 320,
                  top: 0,
                  left: 0,
                  right: 320,
                  bottom: 320,
                  x: 0,
                  y: 0,
                } as DOMRectReadOnly,
                borderBoxSize: size,
                contentBoxSize: size,
                devicePixelContentBoxSize: size,
              },
            ],
            this as unknown as ResizeObserver,
          ),
        );
      }
      unobserve() {}
      disconnect() {}
    };
    vi.stubGlobal("ResizeObserver", observer);
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function (
      this: Element,
    ) {
      const height = this.hasAttribute("data-index") ? 32 : 320;
      return {
        width: 320,
        height,
        top: 0,
        left: 0,
        right: 320,
        bottom: height,
        x: 0,
        y: 0,
        toJSON() {},
      } as DOMRect;
    });

    const many = Array.from({ length: 200 }, (_, i) => ({ value: `v${i}`, label: `选项 ${i}` }));
    render(
      <Combobox items={many} creatable defaultOpen>
        <ComboboxInput aria-label="多" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    expect(document.querySelector("[data-hulian-virtual-count]")).not.toBeNull();
    fireEvent.change(screen.getByLabelText("多"), { target: { value: "选项" } });
    await waitFor(() => expect(screen.getByText("使用 “选项”")).toBeTruthy());
  });

  it("不传 creatable 时一条创建项都不会冒出来（旧用法零变化）", async () => {
    render(<Demo defaultOpen />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "不存在的水果" } });
    await waitFor(() => expect(screen.getByText("无匹配项")).toBeTruthy());
    expect(document.querySelector("[data-hulian-create]")).toBeNull();
  });

  // 创建项一出现 items 的 identity 就变，而 Base UI 有一条「items 变了就把输入框拉回选中项 label」
  // 的同步；不接管输入串的话第一个字符会被它抹掉。这条钉住「打进去的字还在」。
  it("第一个字符不会被 items 变化引发的输入同步抹掉", async () => {
    render(<CreatableDemo />);
    const input = type("杭");
    await waitFor(() => expect(screen.getByText("使用 “杭”")).toBeTruthy());
    expect((input as HTMLInputElement).value).toBe("杭");
  });

  it("挂载时输入框仍显示已选项的 label（接管输入串不该把这条弄丢）", () => {
    render(
      <Combobox items={ISSUERS} creatable defaultValue={ISSUERS[0]}>
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    expect(screen.getByDisplayValue("北京市公安局")).toBeTruthy();
  });

  it("消费方自己的 onInputValueChange 不被吃掉", async () => {
    const onInputValueChange = vi.fn();
    render(
      <Combobox items={ISSUERS} creatable onInputValueChange={onInputValueChange}>
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    type("杭州");
    await waitFor(() => expect(onInputValueChange).toHaveBeenCalledWith("杭州", expect.anything()));
  });
});

// #235 的另一半：emptyMessage 只在零结果时出现，「找不到就直接输入」这类常驻提示挂不上去。
describe("ComboboxContent header 槽", () => {
  it("header 渲染在列表上方，且零结果时仍在（那正是最需要它的时候）", async () => {
    render(
      <Combobox items={FRUITS} defaultOpen>
        <ComboboxInput aria-label="搜索" />
        <ComboboxContent header={<p>找不到就直接输入</p>}>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    const header = screen.getByText("找不到就直接输入");
    const list = screen.getByRole("listbox");
    expect(
      header.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "不存在的水果" } });
    await waitFor(() => expect(screen.getByText("无匹配项")).toBeTruthy());
    expect(screen.getByText("找不到就直接输入")).toBeTruthy();
  });

  it("不传 header 时不多渲染任何节点", () => {
    render(<Demo defaultOpen />);
    expect(screen.queryByText("找不到就直接输入")).toBeNull();
    expect(document.querySelector(".border-b.border-hairline")).toBeNull();
  });
});

// #257 / #258 / #259：消费方在「触发钮 + 弹层内搜索」范式下报的三条。
describe("Combobox 图4 范式（ComboboxTrigger + 弹层内搜索）", () => {
  const ISSUERS = [
    { value: "bj-psb", label: "北京市公安局" },
    { value: "sh-psb", label: "上海市公安局" },
  ];

  it("#257 ComboboxTrigger 收 children：触发钮整段换成自定义内容", () => {
    render(
      <Combobox items={ISSUERS} defaultValue={ISSUERS[0]}>
        <ComboboxTrigger aria-label="绑定公司">
          <span data-testid="slot">已绑定</span>
        </ComboboxTrigger>
      </Combobox>,
    );
    const trigger = screen.getByRole("combobox");
    expect(screen.getByTestId("slot")).toBeTruthy();
    // 默认那块「已选 label」被整段替换掉，而不是并排多一份
    expect(trigger.textContent).not.toContain("北京市公安局");
  });

  it("#257 children 传函数：按有没有选中分叉（触发钮退化成状态图标的典型形态）", () => {
    const renderState = (value: { label: unknown } | null) => (
      <span data-testid="state">{value == null ? "未绑定" : "已绑定"}</span>
    );
    const unbound = render(
      <Combobox items={ISSUERS}>
        <ComboboxTrigger aria-label="绑定公司">{renderState}</ComboboxTrigger>
      </Combobox>,
    );
    expect(screen.getByTestId("state").textContent).toBe("未绑定");
    unbound.unmount();

    render(
      <Combobox items={ISSUERS} defaultValue={ISSUERS[0]}>
        <ComboboxTrigger aria-label="绑定公司">{renderState}</ComboboxTrigger>
      </Combobox>,
    );
    expect(screen.getByTestId("state").textContent).toBe("已绑定");
  });

  it("#257 showChevron={false} 去掉箭头（省宽度正是走 children 的理由）", () => {
    const withChevron = render(
      <Combobox items={ISSUERS}>
        <ComboboxTrigger aria-label="a" />
      </Combobox>,
    );
    expect(screen.getByRole("combobox").querySelectorAll("svg").length).toBe(1);
    withChevron.unmount();

    render(
      <Combobox items={ISSUERS}>
        <ComboboxTrigger aria-label="b" showChevron={false}>
          <span>图标</span>
        </ComboboxTrigger>
      </Combobox>,
    );
    expect(screen.getByRole("combobox").querySelectorAll("svg").length).toBe(0);
  });

  it("#257 不传 children 时仍是「已选 label ?? placeholder」（向后兼容）", () => {
    const empty = render(
      <Combobox items={ISSUERS}>
        <ComboboxTrigger aria-label="a" placeholder="请选择" />
      </Combobox>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("请选择");
    empty.unmount();

    render(
      <Combobox items={ISSUERS} defaultValue={ISSUERS[0]}>
        <ComboboxTrigger aria-label="b" placeholder="请选择" />
      </Combobox>,
    );
    expect(screen.getByRole("combobox").textContent).toContain("北京市公安局");
  });

  it("#258 creatable + Trigger：弹层里的搜索框不被预填成已选 label", async () => {
    render(
      <Combobox items={ISSUERS} creatable defaultValue={ISSUERS[0]} defaultOpen>
        <ComboboxTrigger aria-label="发证机构" />
        <ComboboxContent searchPlaceholder="搜索">
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    const search = screen.getByPlaceholderText("搜索") as HTMLInputElement;
    expect(search.value).toBe("");
    // 打字不会追加在已选项全名后面，创建项文案也就干净
    fireEvent.change(search, { target: { value: "杭州市公安局" } });
    await waitFor(() => expect(screen.getByText("使用 “杭州市公安局”")).toBeTruthy());
  });

  it("#258 内联范式不受影响：输入框挂载时照旧显示已选 label", () => {
    render(
      <Combobox items={ISSUERS} creatable defaultValue={ISSUERS[0]}>
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    expect(screen.getByDisplayValue("北京市公安局")).toBeTruthy();
  });

  it("#258 消费方显式传的 defaultInputValue 仍然最大（两档都不抢）", () => {
    render(
      <Combobox items={ISSUERS} creatable defaultValue={ISSUERS[0]} defaultInputValue="预填">
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    expect(screen.getByDisplayValue("预填")).toBeTruthy();
  });

  it("#259 createLabel 单点覆盖创建项文案，不传则回落全局默认", async () => {
    render(
      <Combobox
        items={ISSUERS}
        creatable
        defaultOpen
        createLabel={(value) => `使用「${value}」（PDF 原文非标状态）`}
      >
        <ComboboxInput aria-label="发证机构" />
        <ComboboxContent>
          {(item) => (
            <ComboboxItem key={item.value} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxContent>
      </Combobox>,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "在职" } });
    await waitFor(() =>
      expect(screen.getByText("使用「在职」（PDF 原文非标状态）")).toBeTruthy(),
    );
    expect(screen.queryByText("使用 “在职”")).toBeNull();
  });
});
