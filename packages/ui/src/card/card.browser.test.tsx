import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { page } from "@vitest/browser/context";
import { Card, CardHeader } from "./card";
import { PageHeader } from "../page-header";

/**
 * CardHeader / PageHeader 的**换行判据**只能在真实浏览器里验（#263）。
 *
 * 同目录的 card.test.tsx 跑在 jsdom 上，那里没有布局：`getBoundingClientRect()` 恒为 0，
 * flex 也不换行，所以「description 长到某个程度 extra 就掉到第二行」这件事在 jsdom 里
 * **根本不会发生**，写多少断言都是绿的。类名断言同样拦不住：`min-w-0` 一直都在、看着也对，
 * 错的是它管不到换行（Flexbox 收集行时用的是 item 的 hypothetical main size = max-content）。
 *
 * 这里的判据照 issue 提的写：**同一个 header，只改 description 的字符数，extra 的 top 不许变**。
 * 这个 bug 的形态是「每一处单看都对」，只有拿数据长度当参数才测得出来。
 */

afterEach(cleanup);

const CARD_WIDTH = 515; // 消费方现场的三列网格卡宽

function renderHeader(description: string) {
  render(
    <div style={{ width: CARD_WIDTH }}>
      <Card>
        <CardHeader
          title={<span className="truncate">销售日报</span>}
          description={<span className="line-clamp-1">{description}</span>}
          extra={<span data-testid="extra">›</span>}
        />
      </Card>
    </div>,
  );
  const extra = screen.getByTestId("extra");
  const header = document.querySelector<HTMLElement>('[data-slot="card-header"]')!;
  return { extraTop: extra.getBoundingClientRect().top, headerHeight: header.offsetHeight };
}

describe("CardHeader 的换行判据（#263）", () => {
  it("description 变长不把 extra 挤到第二行：extra 的 top 与 header 高度都不变", () => {
    const short = renderHeader("每日汇总");
    cleanup();
    const long = renderHeader(
      "每日汇总各门店的成交额、客单价与退款率，按战区分组后同步至企业微信群，供区域经理晨会使用",
    );
    expect(long.extraTop).toBe(short.extraTop);
    expect(long.headerHeight).toBe(short.headerHeight);
  });

  it("左列该收缩就收缩：长 description 的盒宽给 extra 让出位置，而不是独占整行", () => {
    render(
      <div style={{ width: CARD_WIDTH }}>
        <Card>
          <CardHeader
            title={<span className="truncate">销售日报</span>}
            description={
              <span className="line-clamp-1">
                每日汇总各门店的成交额、客单价与退款率，按战区分组后同步至企业微信群，供区域经理晨会使用
              </span>
            }
            extra={<span data-testid="extra">›</span>}
          />
        </Card>
      </div>,
    );
    const header = document.querySelector<HTMLElement>('[data-slot="card-header"]')!;
    const left = document.querySelector<HTMLElement>('[data-slot="card-title"]')!.parentElement!;
    const extra = document.querySelector<HTMLElement>('[data-slot="card-header-extra"]')!;
    const l = left.getBoundingClientRect();
    const e = extra.getBoundingClientRect();
    // 左列没有占满内容区 —— 占满就是「extra 被挤走」那个 bug 的形态
    expect(l.width).toBeLessThan(header.clientWidth);
    // 同一行的判据是「extra 在左列右侧且纵向有交集」，不是 top 相等：
    // 容器 items-center，两行高的左列与一行高的 extra 顶边本来就对不齐。
    expect(e.left).toBeGreaterThanOrEqual(l.right);
    expect(e.top).toBeLessThan(l.bottom);
  });

  it("不传槽的裸插槽分支不受影响（那条分支根本不是 flex）", () => {
    render(
      <div style={{ width: CARD_WIDTH }}>
        <Card>
          <CardHeader>纯文本标题</CardHeader>
        </Card>
      </div>,
    );
    const header = document.querySelector<HTMLElement>('[data-slot="card-header"]')!;
    expect(getComputedStyle(header).display).toBe("block");
  });
});

describe("PageHeader 的换行判据（#263 同源）", () => {
  // 宽度不写死：这一族的判据一半是视口断点，容器钉成常数就把断点测没了。
  const measure = (title: string) => {
    render(
      <div style={{ width: "100%" }}>
        <PageHeader title={title} extra={<button data-testid="action">新建</button>} />
      </div>,
    );
    const top = screen.getByTestId("action").getBoundingClientRect().top;
    cleanup();
    return top;
  };
  const LONG = "华南大区 2026 年第三季度门店经营情况汇总报表（含退款与客诉明细）";

  it("宽视口：标题变长不把操作区挤到第二行", async () => {
    await page.viewport(1200, 800);
    expect(measure(LONG)).toBe(measure("报表"));
  });

  // 页头总是全宽，所以「视口窄」就等于「页头窄」——这一档的换行是**想要**的行为，
  // 别在修上一条时把它一起改掉（CardHeader 那边没有这一档，理由见 card.tsx 的注释）。
  it("窄视口：操作区仍旧让位换行到下一行", async () => {
    await page.viewport(390, 800);
    expect(measure(LONG)).toBeGreaterThan(measure("报表"));
  });
});
