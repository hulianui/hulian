import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Descriptions, DescriptionsItem } from "./descriptions";

afterEach(cleanup);

// 这两条判据 jsdom 一条也答不了：它没有布局，宽度和坐标全是 0，容器查询更不存在。
// 而「键列对不对齐」「窄容器降不降列」恰恰是这个组件唯一难做对的两件事，所以放真实浏览器。

function Fixture({ width }: { width: number }) {
  return (
    <div style={{ width }}>
      <Descriptions bordered column={2}>
        <DescriptionsItem label="昵称">叮当</DescriptionsItem>
        <DescriptionsItem label="手机号">18192500803</DescriptionsItem>
        <DescriptionsItem label="POS会员卡号">901421341</DescriptionsItem>
        <DescriptionsItem label="小程序绑定门店">延安百货大楼</DescriptionsItem>
      </Descriptions>
    </div>
  );
}

const boxOf = (el: Element) => el.getBoundingClientRect();

describe("Descriptions 布局（真实浏览器）", () => {
  it("键列宽度由整表最长的键名统一决定，长短键名的值仍在同一条竖线上", () => {
    const { container } = render(<Fixture width={900} />);
    const labels = [...container.querySelectorAll('[data-slot="descriptions-label"]')];
    expect(labels).toHaveLength(4);

    // 键宽**按列**统一（每列一条键轨道，取该列最长的键名），与 <table> 的列宽行为一致：
    // 「昵称」被拉到与「POS会员卡号」同宽、「手机号」被拉到与「小程序绑定门店」同宽。
    // 改用共享轨道之前这里是四个各不相同的宽度 —— 每格按自己的文字算。
    const w = (i: number) => Math.round(boxOf(labels[i]!).width);
    expect(w(0)).toBe(w(2));
    expect(w(1)).toBe(w(3));
    // 两列的键名长度不同，所以两列的键宽本来就不该相等（相等反而说明轨道没在按列取值）
    expect(w(0)).not.toBe(w(1));

    // 同一列里上下两行的值起点必须重合（同列 = 索引同奇偶）
    const values = labels.map((el) => el.nextElementSibling!);
    const left = (i: number) => Math.round(boxOf(values[i]!).left);
    expect(left(0)).toBe(left(2));
    expect(left(1)).toBe(left(3));
    // 两列确实是分开的两列，不是被挤成一列
    expect(left(1)).toBeGreaterThan(left(0));
  });

  it("容器窄到放不下时降成一列（判据是容器宽度，不是视口）", () => {
    // 视口没变，只有这块自己变窄 —— 抽屉/分栏里就是这个情形
    const { container } = render(<Fixture width={380} />);
    const labels = [...container.querySelectorAll('[data-slot="descriptions-label"]')];
    const top = (i: number) => Math.round(boxOf(labels[i]!).top);

    // 四项各占一行：前两项不再同排
    expect(top(1)).toBeGreaterThan(top(0));
    expect(top(2)).toBeGreaterThan(top(1));
    // 所有值仍然对齐在同一条竖线上
    const lefts = labels.map((el) => Math.round(boxOf(el.nextElementSibling!).left));
    expect(new Set(lefts).size).toBe(1);
  });

  it("labelWidth 钉死键列后，两张表的值起点能对齐", () => {
    const { container } = render(
      <div style={{ width: 900 }}>
        <Descriptions bordered column={1} labelWidth={160}>
          <DescriptionsItem label="昵称">叮当</DescriptionsItem>
        </Descriptions>
        <Descriptions bordered column={1} labelWidth={160}>
          <DescriptionsItem label="清理小程序积分记录">0 条</DescriptionsItem>
        </Descriptions>
      </div>,
    );
    const labels = [...container.querySelectorAll('[data-slot="descriptions-label"]')];
    const widths = labels.map((el) => Math.round(boxOf(el).width));
    expect(widths).toEqual([160, 160]);
  });

  it("跨列项在窄容器里整项占一行，不会把栅格挤出隐式列", () => {
    const { container } = render(
      <div style={{ width: 380 }}>
        <Descriptions bordered column={2}>
          <DescriptionsItem label="昵称">叮当</DescriptionsItem>
          <DescriptionsItem label="小程序绑定门店" span={2}>
            延安百货大楼
          </DescriptionsItem>
        </Descriptions>
      </div>,
    );
    const grid = container.querySelector('[data-slot="descriptions-grid"]') as HTMLElement;
    const labels = [...container.querySelectorAll('[data-slot="descriptions-label"]')];
    // 跨列项的右边界不超过栅格自身 —— 溢出即说明它去占了并不存在的轨道
    const spanned = labels[1]!.parentElement!;
    expect(Math.round(boxOf(spanned).right)).toBeLessThanOrEqual(Math.round(boxOf(grid).right) + 1);
  });
});
