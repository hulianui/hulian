import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { List, ListItem } from "./list";

describe("List", () => {
  it("数据驱动：items + renderItem 渲染每一项", () => {
    const { getByText } = render(
      <List items={["甲", "乙", "丙"]} renderItem={(it) => <ListItem>{it}</ListItem>} />,
    );
    expect(getByText("甲")).toBeTruthy();
    expect(getByText("乙")).toBeTruthy();
    expect(getByText("丙")).toBeTruthy();
  });

  it("组合模式：直接放 ListItem 子元素", () => {
    const { getByText } = render(
      <List>
        <ListItem>手写行</ListItem>
      </List>,
    );
    expect(getByText("手写行")).toBeTruthy();
  });

  it("列表体为带 role=list 的 ul", () => {
    const { container } = render(<List items={[1]} renderItem={(n) => <ListItem>{n}</ListItem>} />);
    const ul = container.querySelector("[role=list]") as HTMLElement;
    expect(ul.tagName).toBe("UL");
  });

  it("split 默认开启分隔线，关闭后移除", () => {
    const { container, rerender } = render(<List items={[1]} renderItem={() => <ListItem>x</ListItem>} />);
    expect(container.querySelector("ul")!.classList.contains("divide-y")).toBe(true);
    rerender(<List items={[1]} split={false} renderItem={() => <ListItem>x</ListItem>} />);
    expect(container.querySelector("ul")!.classList.contains("divide-y")).toBe(false);
  });

  it("bordered 给外层加边框", () => {
    const { container } = render(<List bordered items={[1]} renderItem={() => <ListItem>x</ListItem>} />);
    expect((container.firstElementChild as HTMLElement).classList.contains("border")).toBe(true);
  });

  it("grid 切栅格态：body 为 grid 容器", () => {
    const { container } = render(<List grid items={[1, 2]} renderItem={(n) => <ListItem>{n}</ListItem>} />);
    const list = container.querySelector("[role=list]") as HTMLElement;
    expect(list.tagName).toBe("UL");
    expect(list.classList.contains("grid")).toBe(true);
  });

  it("空态：items 为空渲染内置 Empty", () => {
    const { getByText, container } = render(<List items={[]} renderItem={() => <ListItem>x</ListItem>} />);
    expect(getByText("暂无数据")).toBeTruthy();
    expect(container.querySelector("[role=list]")).toBeNull();
  });

  it("空态：自定义 empty 覆盖内置", () => {
    const { getByText, queryByText } = render(
      <List items={[]} empty={<div>自定义空</div>} renderItem={() => <ListItem>x</ListItem>} />,
    );
    expect(getByText("自定义空")).toBeTruthy();
    expect(queryByText("暂无数据")).toBeNull();
  });

  it("header / footer 插槽渲染", () => {
    const { getByText } = render(
      <List header={<span>头部</span>} footer={<span>底部</span>} items={[1]} renderItem={() => <ListItem>x</ListItem>} />,
    );
    expect(getByText("头部")).toBeTruthy();
    expect(getByText("底部")).toBeTruthy();
  });

  it("loadMore：点击触发回调，hasMore=false 时不渲染", () => {
    const onLoadMore = vi.fn();
    const { getByText, queryByText, rerender } = render(
      <List items={[1]} renderItem={() => <ListItem>x</ListItem>} loadMore={{ onLoadMore }} />,
    );
    fireEvent.click(getByText("加载更多"));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
    rerender(
      <List items={[1]} renderItem={() => <ListItem>x</ListItem>} loadMore={{ onLoadMore, hasMore: false }} />,
    );
    expect(queryByText("加载更多")).toBeNull();
  });

  it("loadMore：loading 时按钮禁用", () => {
    const { container } = render(
      <List items={[1]} renderItem={() => <ListItem>x</ListItem>} loadMore={{ onLoadMore: () => {}, loading: true }} />,
    );
    const btn = container.querySelector("button") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("pagination 槽渲染在列表下方", () => {
    const { getByText } = render(
      <List items={[1]} renderItem={() => <ListItem>x</ListItem>} pagination={<nav>分页区</nav>} />,
    );
    expect(getByText("分页区")).toBeTruthy();
  });

  it("size=sm 收紧行内边距", () => {
    const { container } = render(<List size="sm" items={[1]} renderItem={() => <ListItem>x</ListItem>} />);
    expect(container.querySelector("li")!.classList.contains("py-2")).toBe(true);
  });
});

describe("ListItem", () => {
  it("actions 渲染右侧操作区，多项间加分隔线", () => {
    const { getByText, container } = render(
      <ul>
        <ListItem actions={[<a key="a">编辑</a>, <a key="b">删除</a>]}>内容</ListItem>
      </ul>,
    );
    expect(getByText("编辑")).toBeTruthy();
    expect(getByText("删除")).toBeTruthy();
    // 两项之间一条分隔竖线
    expect(container.querySelectorAll("span.w-px").length).toBe(1);
  });

  it("单个 action 不加分隔线", () => {
    const { container } = render(
      <ul>
        <ListItem actions={[<a key="a">编辑</a>]}>内容</ListItem>
      </ul>,
    );
    expect(container.querySelectorAll("span.w-px").length).toBe(0);
  });
});

describe("ListItem.Meta", () => {
  it("渲染 avatar / title / description", () => {
    const { getByText, getByTestId } = render(
      <ul>
        <ListItem>
          <ListItem.Meta avatar={<i data-testid="av" />} title="标题" description="描述文案" />
        </ListItem>
      </ul>,
    );
    expect(getByTestId("av")).toBeTruthy();
    expect(getByText("标题")).toBeTruthy();
    expect(getByText("描述文案")).toBeTruthy();
  });

  it("不传 avatar 不渲染头像槽", () => {
    const { queryByTestId } = render(
      <ul>
        <ListItem>
          <ListItem.Meta title="只有标题" />
        </ListItem>
      </ul>,
    );
    expect(queryByTestId("av")).toBeNull();
  });
});
