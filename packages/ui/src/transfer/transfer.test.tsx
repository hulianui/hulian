import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Transfer } from "./transfer";
import type { TransferItem } from "./transfer.types";

const items: TransferItem[] = [
  { key: "a", label: "Apple" },
  { key: "b", label: "Banana", disabled: true },
  { key: "c", label: "Cherry" },
];

describe("Transfer", () => {
  it("按 targetKeys 把数据分流到左右两个 listbox 面板", () => {
    const { getAllByRole, getByText } = render(<Transfer dataSource={items} defaultTargetKeys={["c"]} />);
    // 左(Apple/Banana) + 右(Cherry) 各一个 listbox
    expect(getAllByRole("listbox")).toHaveLength(2);
    expect(getByText("Cherry")).toBeTruthy();
    expect(getByText("Apple")).toBeTruthy();
  });

  it("右面板为空时渲染 Empty 空态而非 listbox", () => {
    const { getAllByRole, getByText } = render(<Transfer dataSource={items} defaultTargetKeys={[]} />);
    expect(getAllByRole("listbox")).toHaveLength(1); // 仅左面板
    expect(getByText("暂无数据")).toBeTruthy();
  });

  it("「全部移入」移走所有启用项、禁用项留在左侧", () => {
    const onChange = vi.fn();
    const { getByLabelText } = render(<Transfer dataSource={items} defaultTargetKeys={[]} onChange={onChange} />);
    fireEvent.click(getByLabelText("全部移入"));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"], "right", ["a", "c"]);
  });

  it("勾选左项后「移入选中」只移选中项 + direction=right", () => {
    const onChange = vi.fn();
    const { getByText, getByLabelText } = render(
      <Transfer dataSource={items} defaultTargetKeys={[]} onChange={onChange} />,
    );
    fireEvent.click(getByText("Apple")); // multiple 模式勾选 a
    fireEvent.click(getByLabelText("移入选中"));
    expect(onChange).toHaveBeenLastCalledWith(["a"], "right", ["a"]);
  });

  it("勾选右项后「移出选中」回到左侧 + direction=left", () => {
    const onChange = vi.fn();
    const { getByText, getByLabelText } = render(
      <Transfer dataSource={items} defaultTargetKeys={["a", "c"]} onChange={onChange} />,
    );
    fireEvent.click(getByText("Cherry")); // 右面板勾选 c
    fireEvent.click(getByLabelText("移出选中"));
    expect(onChange).toHaveBeenLastCalledWith(["a"], "left", ["c"]);
  });

  it("无选中 / 空面板时对应移动按钮禁用", () => {
    const { getByLabelText } = render(<Transfer dataSource={items} defaultTargetKeys={[]} />);
    expect(getByLabelText("移入选中").hasAttribute("disabled")).toBe(true); // 无选中
    expect(getByLabelText("移出选中").hasAttribute("disabled")).toBe(true); // 右空
    expect(getByLabelText("全部移出").hasAttribute("disabled")).toBe(true); // 右空
    expect(getByLabelText("全部移入").hasAttribute("disabled")).toBe(false); // 左有启用项
  });

  it("searchable 搜索框按 label 过滤当前面板", () => {
    const { getByLabelText, queryByText } = render(
      <Transfer dataSource={items} defaultTargetKeys={[]} searchable titles={["源列表", "已选"]} />,
    );
    fireEvent.change(getByLabelText("搜索源列表"), { target: { value: "App" } });
    expect(queryByText("Apple")).toBeTruthy();
    expect(queryByText("Banana")).toBeNull();
    expect(queryByText("Cherry")).toBeNull();
  });

  it("disabled 时所有移动按钮禁用", () => {
    const { getByLabelText } = render(<Transfer dataSource={items} defaultTargetKeys={["c"]} disabled />);
    expect(getByLabelText("全部移入").hasAttribute("disabled")).toBe(true);
    expect(getByLabelText("全部移出").hasAttribute("disabled")).toBe(true);
  });

  it("受控 targetKeys：onChange 触发但不自动更新 DOM（由外部驱动）", () => {
    const onChange = vi.fn();
    const { getByLabelText, queryAllByRole } = render(
      <Transfer dataSource={items} targetKeys={[]} onChange={onChange} />,
    );
    fireEvent.click(getByLabelText("全部移入"));
    expect(onChange).toHaveBeenCalledWith(["a", "c"], "right", ["a", "c"]);
    // 受控未回填 targetKeys → 右面板仍空（仅左 listbox）
    expect(queryAllByRole("listbox")).toHaveLength(1);
  });

  describe("listHeight / showSelectAll", () => {
    it("listHeight 落成列表的 maxHeight（默认 240）", () => {
      const a = render(<Transfer dataSource={items} />);
      expect((a.getAllByRole("listbox")[0] as HTMLElement).style.maxHeight).toBe("240px");
      a.unmount();
      const b = render(<Transfer dataSource={items} listHeight={520} />);
      expect((b.getAllByRole("listbox")[0] as HTMLElement).style.maxHeight).toBe("520px");
    });

    it("不开 showSelectAll 时标题栏没有全选框", () => {
      const { queryByLabelText } = render(<Transfer dataSource={items} titles={["左", "右"]} />);
      expect(queryByLabelText("全选左")).toBeNull();
    });

    it("全选勾上当前面板的全部可用项（跳过 disabled 的 Banana）", () => {
      const onChange = vi.fn();
      const { getByLabelText } = render(
        <Transfer dataSource={items} titles={["左", "右"]} showSelectAll onChange={onChange} />,
      );
      fireEvent.click(getByLabelText("全选左"));
      fireEvent.click(getByLabelText("移入选中"));
      expect(onChange).toHaveBeenCalledWith(["a", "c"], "right", ["a", "c"]);
    });

    it("再点一次全选 → 取消全选，「移入选中」重新禁用", () => {
      const { getByLabelText } = render(
        <Transfer dataSource={items} titles={["左", "右"]} showSelectAll />,
      );
      const all = getByLabelText("全选左");
      fireEvent.click(all);
      expect(getByLabelText("移入选中").hasAttribute("disabled")).toBe(false);
      fireEvent.click(all);
      expect(getByLabelText("移入选中").hasAttribute("disabled")).toBe(true);
    });

    it("搜索后全选只作用于命中项，不碰被过滤掉的", () => {
      const onChange = vi.fn();
      const { getByLabelText, getAllByRole } = render(
        <Transfer dataSource={items} titles={["左", "右"]} showSelectAll searchable onChange={onChange} />,
      );
      // 搜 Apple → 左面板只剩它；Cherry 虽同为可用项但已被过滤掉
      fireEvent.change(getAllByRole("textbox")[0], { target: { value: "Apple" } });
      fireEvent.click(getByLabelText("全选左"));
      fireEvent.click(getByLabelText("移入选中"));
      expect(onChange).toHaveBeenCalledWith(["a"], "right", ["a"]);
    });
  });
});
// 见 hulianui/hulian#107：解构默认只认 undefined，null 须显式回落。
describe("Transfer · null 回落", () => {
  it("defaultTargetKeys 传 null 不抛错，与传 [] 一致（右栏空态）", () => {
    const { getAllByRole, getByText } = render(
      <Transfer dataSource={items} defaultTargetKeys={null as never} />,
    );
    expect(getAllByRole("listbox")).toHaveLength(1);
    expect(getByText("暂无数据")).toBeTruthy();
  });
});
