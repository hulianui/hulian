import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { FilterChip, FilterChipGroup } from "./filter-chip";
import { ConfigProvider, enUS } from "../config";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("FilterChip", () => {
  it("稳定父更新时跳过胶囊子树", async () => {
    await expectMemoSkipsSubtree(() => <FilterChip subject="状态" operator="属于" value="进行中" />);
  });

  it("三段依次渲染主语/操作符/值", () => {
    const { getByText } = render(
      <FilterChip subject="状态" operator="属于以下任一项" value="已选 2 项" />,
    );
    expect(getByText("状态")).toBeTruthy();
    expect(getByText("属于以下任一项")).toBeTruthy();
    expect(getByText("已选 2 项")).toBeTruthy();
  });

  it("值收 ReactNode（头像堆叠 + 文字这类富节点）", () => {
    const { getByText } = render(
      <FilterChip
        subject="负责人"
        value={
          <>
            <span>头像堆</span>
            <span>已选 3 人</span>
          </>
        }
      />,
    );
    expect(getByText("头像堆")).toBeTruthy();
    expect(getByText("已选 3 人")).toBeTruthy();
  });

  // 默认观感钉死：不给 operator 时只有一条竖线（两段），给了才有两条（三段）。
  it("省略 operator 退化成两段，只留一条分隔线", () => {
    const { container } = render(<FilterChip subject="负责人" value="张三" />);
    expect(container.querySelectorAll(".w-px").length).toBe(1);
  });

  it("给了 operator 是三段两条分隔线", () => {
    const { container } = render(<FilterChip subject="状态" operator="属于" value="进行中" />);
    expect(container.querySelectorAll(".w-px").length).toBe(2);
  });

  it("无 onRemove 时不渲染移除按钮（默认无 ×）", () => {
    const { container } = render(<FilterChip subject="状态" value="进行中" />);
    expect(container.querySelectorAll("button").length).toBe(0);
  });

  it("无 onClick 时本体不是按钮（默认不可点）", () => {
    const fn = vi.fn();
    const { container } = render(<FilterChip subject="状态" value="进行中" onRemove={fn} />);
    // 只有移除按钮这一个 button
    expect(container.querySelectorAll("button").length).toBe(1);
  });

  it("移除按钮的无障碍名带上主语", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <FilterChip subject="状态" operator="属于" value="进行中" onRemove={fn} />,
    );
    fireEvent.click(getByLabelText("移除筛选条件：状态"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("subject 是节点时用 subjectLabel 作无障碍名", () => {
    const { getByLabelText } = render(
      <FilterChip
        subject={<span>状态</span>}
        subjectLabel="状态"
        value="进行中"
        onRemove={() => {}}
      />,
    );
    expect(getByLabelText("移除筛选条件：状态")).toBeTruthy();
  });

  it("subject 是节点且没有 subjectLabel 时退回无主语文案", () => {
    const { getByLabelText } = render(
      <FilterChip subject={<span>状态</span>} value="进行中" onRemove={() => {}} />,
    );
    expect(getByLabelText("移除筛选条件")).toBeTruthy();
  });

  it("enUS 本地化移除按钮与分组无障碍名", () => {
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <FilterChipGroup onClearAll={() => {}}>
          <FilterChip subject="Status" value="In progress" onRemove={() => {}} />
        </FilterChipGroup>
      </ConfigProvider>,
    );
    expect(getByLabelText("Remove filter: Status")).toBeTruthy();
    expect(getByLabelText("Applied filters")).toBeTruthy();
    expect(getByLabelText("Applied filters").textContent).toContain("Clear all");
  });

  it("旧的自定义 locale 没有 filterChip 时保留中文文案", () => {
    const locale = { ...enUS, components: { ...enUS.components!, filterChip: undefined } };
    const { getByLabelText } = render(
      <ConfigProvider locale={locale}>
        <FilterChip subject="状态" value="进行中" onRemove={() => {}} />
      </ConfigProvider>,
    );
    expect(getByLabelText("移除筛选条件：状态")).toBeTruthy();
  });

  // issue #214 第 3 点：点 × 不能顺带触发「重开筛选菜单」。
  // 这里不靠 stopPropagation，而是把 × 放在本体按钮的**外面**（兄弟节点），结构上就冒不上去。
  it("点移除按钮不触发 onClick", () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { getByLabelText } = render(
      <FilterChip subject="状态" value="进行中" onClick={onClick} onRemove={onRemove} />,
    );
    fireEvent.click(getByLabelText("移除筛选条件：状态"));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("移除按钮不是本体按钮的后代（不产生 button 套 button）", () => {
    const { container } = render(
      <FilterChip subject="状态" value="进行中" onClick={() => {}} onRemove={() => {}} />,
    );
    for (const btn of container.querySelectorAll("button")) {
      expect(btn.querySelector("button")).toBeNull();
    }
  });

  it("onClick 让本体可点", () => {
    const onClick = vi.fn();
    const { getByText } = render(
      <FilterChip subject="状态" operator="属于" value="进行中" onClick={onClick} />,
    );
    fireEvent.click(getByText("进行中"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("isDisabled 降透明度且两个按钮都禁用", () => {
    const onClick = vi.fn();
    const onRemove = vi.fn();
    const { container, getByLabelText } = render(
      <FilterChip
        subject="状态"
        value="进行中"
        isDisabled
        onClick={onClick}
        onRemove={onRemove}
      />,
    );
    expect(container.firstElementChild!.className).toContain("opacity-50");
    const remove = getByLabelText("移除筛选条件：状态") as HTMLButtonElement;
    expect(remove.disabled).toBe(true);
    fireEvent.click(remove);
    expect(onRemove).not.toHaveBeenCalled();
  });

  it("size=sm 换一档高度与字号", () => {
    const { container } = render(<FilterChip size="sm" subject="状态" value="进行中" />);
    expect(container.firstElementChild!.className).toContain("h-6");
  });

  it("默认 size=md", () => {
    const { container } = render(<FilterChip subject="状态" value="进行中" />);
    expect(container.firstElementChild!.className).toContain("h-7");
  });

  it("透传 className", () => {
    const { container } = render(
      <FilterChip className="my-filter" subject="状态" value="进行中" />,
    );
    expect(container.firstElementChild!.classList.contains("my-filter")).toBe(true);
  });

  it("SSR 渲染不抛错且输出三段文字", () => {
    const html = renderToStaticMarkup(
      <FilterChipGroup onClearAll={() => {}}>
        <FilterChip subject="状态" operator="属于" value="进行中" onRemove={() => {}} />
      </FilterChipGroup>,
    );
    expect(html).toContain("状态");
    expect(html).toContain("属于");
    expect(html).toContain("进行中");
  });
});

describe("FilterChipGroup", () => {
  it("成行排布并在尾部渲染清除全部", () => {
    const onClearAll = vi.fn();
    const { getByText } = render(
      <FilterChipGroup onClearAll={onClearAll}>
        <FilterChip subject="状态" value="进行中" />
      </FilterChipGroup>,
    );
    fireEvent.click(getByText("清除全部"));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("没有子胶囊时整行不渲染（不留孤零零的清除全部）", () => {
    const { container } = render(
      <FilterChipGroup onClearAll={() => {}}>{false}</FilterChipGroup>,
    );
    expect(container.firstElementChild).toBeNull();
  });

  it("不传 onClearAll 就没有清除全部按钮", () => {
    const { queryByText } = render(
      <FilterChipGroup>
        <FilterChip subject="状态" value="进行中" />
      </FilterChipGroup>,
    );
    expect(queryByText("清除全部")).toBeNull();
  });

  it("clearAllLabel 覆盖文案，aria-label 覆盖分组名", () => {
    const { getByText, getByLabelText } = render(
      <FilterChipGroup onClearAll={() => {}} clearAllLabel="重置" aria-label="当前过滤器">
        <FilterChip subject="状态" value="进行中" />
      </FilterChipGroup>,
    );
    expect(getByText("重置")).toBeTruthy();
    expect(getByLabelText("当前过滤器")).toBeTruthy();
  });
});
