import { describe, it, expect } from "vitest";
import { render, within } from "@testing-library/react";
import { Descriptions, DescriptionsItem } from "./descriptions";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

// 模块级常量：memo 只认引用相等，写成内联数组字面量每次都是新引用，测试会假红。
const STABLE_ITEMS = [
  { label: "用户名", children: "zhangsan" },
  { label: "手机", children: "138 0000 0000" },
];

describe("Descriptions", () => {
  // 回归护栏：Descriptions 外层的 memo 一旦被拆掉，本例立刻红。
  it("稳定父更新时跳过 Descriptions 子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <Descriptions title="用户信息" column={3} items={STABLE_ITEMS} />
    ));
  });

  it("根元素带 className 透传", () => {
    const { container } = render(
      <Descriptions className="my-desc">
        <DescriptionsItem label="姓名">张三</DescriptionsItem>
      </Descriptions>,
    );
    expect(container.firstElementChild!.classList.contains("my-desc")).toBe(true);
  });

  it("渲染 title 与 extra", () => {
    const { getByText } = render(
      <Descriptions title="用户信息" extra={<a href="/edit">编辑</a>}>
        <DescriptionsItem label="姓名">张三</DescriptionsItem>
      </Descriptions>,
    );
    expect(getByText("用户信息")).toBeTruthy();
    expect(getByText("编辑")).toBeTruthy();
  });

  it("无 title/extra 时不渲染头部行", () => {
    const { container } = render(
      <Descriptions>
        <DescriptionsItem label="姓名">张三</DescriptionsItem>
      </Descriptions>,
    );
    // 根下只有 grid 容器一个子节点
    expect(container.firstElementChild!.children.length).toBe(1);
  });

  it("从 DescriptionsItem 子节点读取 label + value", () => {
    const { getByText } = render(
      <Descriptions>
        <DescriptionsItem label="姓名">张三</DescriptionsItem>
        <DescriptionsItem label="电话">13800000000</DescriptionsItem>
      </Descriptions>,
    );
    expect(getByText("姓名")).toBeTruthy();
    expect(getByText("张三")).toBeTruthy();
    expect(getByText("电话")).toBeTruthy();
    expect(getByText("13800000000")).toBeTruthy();
  });

  it("items 数组 prop 等价渲染", () => {
    const { getByText } = render(
      <Descriptions
        items={[
          { label: "姓名", children: "李四" },
          { label: "城市", children: "广州" },
        ]}
      />,
    );
    expect(getByText("姓名")).toBeTruthy();
    expect(getByText("李四")).toBeTruthy();
    expect(getByText("广州")).toBeTruthy();
  });

  it("items 优先于 children", () => {
    const { getByText, queryByText } = render(
      <Descriptions items={[{ label: "来自 items", children: "A" }]}>
        <DescriptionsItem label="来自 children">B</DescriptionsItem>
      </Descriptions>,
    );
    expect(getByText("来自 items")).toBeTruthy();
    expect(queryByText("来自 children")).toBeNull();
  });

  it("column 落到 grid 容器的 gridTemplateColumns inline style", () => {
    const { container } = render(
      <Descriptions column={4}>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.style.gridTemplateColumns).toContain("repeat(4");
  });

  it("span 落到单元格 gridColumn inline style", () => {
    const { getByText } = render(
      <Descriptions column={3}>
        <DescriptionsItem label="备注" span={2}>
          一段较长的备注
        </DescriptionsItem>
      </Descriptions>,
    );
    const cell = getByText("一段较长的备注").closest('[style*="grid-column"]') as HTMLElement;
    expect(cell).toBeTruthy();
    expect(cell.style.gridColumn).toContain("span 2");
  });

  it("span 超过 column 被钳制到 column", () => {
    const { getByText } = render(
      <Descriptions column={2}>
        <DescriptionsItem label="备注" span={5}>
          值
        </DescriptionsItem>
      </Descriptions>,
    );
    const cell = getByText("值").closest('[style*="grid-column"]') as HTMLElement;
    expect(cell.style.gridColumn).toContain("span 2");
  });

  it("label 用 text-muted，value 用 text-foreground", () => {
    const { getByText } = render(
      <Descriptions>
        <DescriptionsItem label="键">值内容</DescriptionsItem>
      </Descriptions>,
    );
    const label = getByText("键");
    const value = getByText("值内容");
    expect(label.className).toContain("text-muted");
    expect(value.className).toContain("text-foreground");
  });

  it("bordered 给 grid 容器加 border 边框态", () => {
    const { container } = render(
      <Descriptions bordered>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[style*="grid-template-columns"]') as HTMLElement;
    expect(grid.className).toContain("border");
  });

  it("layout=vertical 单元格走纵向（flex-col），horizontal 不走", () => {
    const v = render(
      <Descriptions layout="vertical">
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const vCell = within(v.container)
      .getByText("值")
      .closest('[style*="grid-column"]') as HTMLElement;
    expect(vCell.className).toContain("flex-col");

    const h = render(
      <Descriptions layout="horizontal">
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const hCell = within(h.container)
      .getByText("值")
      .closest('[style*="grid-column"]') as HTMLElement;
    expect(hCell.className).not.toContain("flex-col");
  });

  it("忽略非元素子节点（如条件渲染的 null/字符串）不报错", () => {
    const show = false;
    const { getByText } = render(
      <Descriptions>
        <DescriptionsItem label="姓名">张三</DescriptionsItem>
        {show && <DescriptionsItem label="隐藏">x</DescriptionsItem>}
        {"   "}
      </Descriptions>,
    );
    expect(getByText("张三")).toBeTruthy();
  });
});
