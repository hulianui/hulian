import { describe, it, expect, vi } from "vitest";
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

  it("column 落到栅格容器的列数变量上，并按容器宽度挂降档区间", () => {
    const { container } = render(
      <Descriptions column={4}>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
    expect(grid).toBeTruthy();
    expect(grid.style.getPropertyValue("--hl-desc-cols")).toBe("4");
    // 三档降级区间（1/2/3 列）都比 4 小，所以三条都在
    expect(grid.className).toContain("@max-lg:");
    expect(grid.className).toContain("@lg:@max-3xl:");
    expect(grid.className).toContain("@3xl:@max-5xl:");
  });

  it("column=2 只挂比它更窄的那一档，不出现 3 列中间态", () => {
    const { container } = render(
      <Descriptions column={2}>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
    expect(grid.className).toContain("@max-lg:");
    expect(grid.className).not.toContain("@3xl:@max-5xl:");
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
    // horizontal 一项占「span 个键/值对」＝ 2×span 条轨道
    expect(cell.style.gridColumn).toContain("span 4");
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
    expect(cell.style.gridColumn).toContain("span 4");
  });

  it("label 用 text-muted-foreground，value 用 text-foreground", () => {
    const { getByText } = render(
      <Descriptions>
        <DescriptionsItem label="键">值内容</DescriptionsItem>
      </Descriptions>,
    );
    const label = getByText("键");
    const value = getByText("值内容");
    expect(label.className).toContain("text-muted-foreground");
    expect(value.className).toContain("text-foreground");
  });

  it("bordered 给 grid 容器加 border 边框态", () => {
    const { container } = render(
      <Descriptions bordered>
        <DescriptionsItem label="A">1</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
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

  it("键与值借用父栅格的轨道（跨行对齐靠布局本身，不靠猜宽度）", () => {
    const { getByText, container } = render(
      <Descriptions bordered column={2}>
        <DescriptionsItem label="昵称">叮当</DescriptionsItem>
        <DescriptionsItem label="小程序绑定门店">延安百货大楼</DescriptionsItem>
      </Descriptions>,
    );
    // 每项借用父轨道 → 键列宽度由整表最长的键名统一决定
    const cell = getByText("延安百货大楼").closest('[style*="grid-column"]') as HTMLElement;
    expect(cell.className).toContain("grid-cols-subgrid");
    // 键列宽度不写死，交给 max-content
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
    expect(grid.style.getPropertyValue("--hl-desc-label")).toBe("max-content");
  });

  it("labelWidth 钉死键列（两张表要对齐时用），数字按 px", () => {
    const { container } = render(
      <Descriptions bordered labelWidth={120}>
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
    expect(grid.style.getPropertyValue("--hl-desc-label")).toBe("120px");
  });

  it("空值落 emptyText，数字 0 是事实值照常渲染", () => {
    const { getByText, getAllByText } = render(
      <Descriptions
        items={[
          { label: "审核人", children: null },
          { label: "备注", children: "" },
          { label: "积分记录", children: 0 },
        ]}
      />,
    );
    expect(getAllByText("—")).toHaveLength(2);
    expect(getByText("0")).toBeTruthy();
  });

  it("emptyText 可换可关（传 null 即回到什么都不渲染）", () => {
    const custom = render(<Descriptions items={[{ label: "A", children: null }]} emptyText="未填写" />);
    expect(within(custom.container).getByText("未填写")).toBeTruthy();

    const off = render(<Descriptions items={[{ label: "A", children: null }]} emptyText={null} />);
    expect(within(off.container).queryByText("—")).toBeNull();
  });

  it("size=sm 收紧格内边距（字号不动，密集表里读得清才是前提）", () => {
    const md = render(
      <Descriptions bordered>
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const sm = render(
      <Descriptions bordered size="sm">
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const cellOf = (r: ReturnType<typeof render>) =>
      within(r.container).getByText("值").parentElement!;
    expect(cellOf(md).className).toContain("py-2.5");
    expect(cellOf(sm).className).toContain("py-1.5");
    // 两档都不动字号：根上仍是同一个 text-sm
    expect(md.container.firstElementChild!.className).toContain("text-sm");
    expect(sm.container.firstElementChild!.className).toContain("text-sm");
  });

  it("align 默认跟布局走：表格态顶对齐、纯文本态基线对齐", () => {
    const plain = render(
      <Descriptions>
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    const plainCell = within(plain.container)
      .getByText("值")
      .closest('[style*="grid-column"]') as HTMLElement;
    expect(plainCell.className).toContain("items-baseline");

    const center = render(
      <Descriptions>
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    expect(
      (within(center.container).getByText("值").closest('[style*="grid-column"]') as HTMLElement)
        .className,
    ).not.toContain("items-center");
  });

  it("align=center 让键跟着高值（图片/标签组）居中", () => {
    const { getByText } = render(
      <Descriptions bordered align="center">
        <DescriptionsItem label="证件照">
          <img src="/id.png" alt="证件照" />
        </DescriptionsItem>
      </Descriptions>,
    );
    expect(getByText("证件照").className).toContain("items-center");
  });

  it("bordered 下的 align=baseline 做不到，开发期点名并按 start 处理", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getByText } = render(
      <Descriptions bordered align="baseline">
        <DescriptionsItem label="键">值</DescriptionsItem>
      </Descriptions>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain("bordered");
    expect(getByText("键").className).toContain("items-start");
    warn.mockRestore();
  });

  it("跨列项在放不下的档位退成整行（否则栅格会长出隐式列）", () => {
    const { getByText } = render(
      <Descriptions column={3}>
        <DescriptionsItem label="备注" span={2}>
          一段较长的备注
        </DescriptionsItem>
      </Descriptions>,
    );
    const cell = getByText("一段较长的备注").closest('[style*="grid-column"]') as HTMLElement;
    // span=2 在 1 列档放不下 → 退整行；2 列档放得下 → 不退
    expect(cell.className).toContain("@max-lg:col-[1/-1]");
    expect(cell.className).not.toContain("@lg:@max-3xl:col-[1/-1]");
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
