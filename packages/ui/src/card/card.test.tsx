import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { cardVariants, Card, CardHeader, CardBody, CardFooter } from "./card";

describe("cardVariants", () => {
  it("默认 outline 带边框", () => {
    expect(cardVariants({})).toContain("border-border");
  });
  it("elevated 带 hover 阴影", () => {
    expect(cardVariants({ variant: "elevated" })).toContain("hover:shadow-md");
  });
  it("featured 带 primary 描边", () => {
    expect(cardVariants({ variant: "featured" })).toContain("border-primary");
  });

  // hulianui/hulian#159：bg-surface 原先在 base 里，plain 无论怎么写都去不掉底色。
  it("plain 不画边框/底色/阴影", () => {
    const cls = cardVariants({ variant: "plain" });
    expect(cls).not.toContain("border");
    expect(cls).not.toContain("bg-surface");
    expect(cls).not.toContain("shadow-sm");
    expect(cls).not.toContain("shadow-md");
  });

  it("其余三档各自带 bg-surface（底色跟着变体走，不在 base）", () => {
    for (const variant of ["outline", "elevated", "featured"] as const) {
      expect(cardVariants({ variant })).toContain("bg-surface");
    }
  });

  it("plain 仍保留圆角与文字色", () => {
    const cls = cardVariants({ variant: "plain" });
    expect(cls).toContain("rounded-[var(--radius)]");
    expect(cls).toContain("text-foreground");
  });
});

describe("divided（#203）", () => {
  const slotOf = (c: HTMLElement, slot: string) => c.querySelector(`[data-slot="${slot}"]`)!;

  it("三个分区各自带 data-slot（divided 靠它们定位，不靠 context）", () => {
    const { container } = render(
      <Card>
        <CardHeader>标题</CardHeader>
        <CardBody>正文</CardBody>
        <CardFooter>页脚</CardFooter>
      </Card>,
    );
    expect(slotOf(container, "card-header")).not.toBeNull();
    expect(slotOf(container, "card-body")).not.toBeNull();
    expect(slotOf(container, "card-footer")).not.toBeNull();
  });

  it("默认仍画分隔线：Card 上不挂任何关线类", () => {
    const { container } = render(
      <Card>
        <CardHeader>标题</CardHeader>
      </Card>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).not.toContain("card-header");
    expect(slotOf(container, "card-header").className).toContain("border-b");
  });

  it("divided={false} 时关线并收内边距（两者要一起，只关线会剩一道无来由的留白）", () => {
    const { container } = render(
      <Card divided={false}>
        <CardHeader>标题</CardHeader>
        <CardFooter>页脚</CardFooter>
      </Card>,
    );
    const cls = (container.firstElementChild as HTMLElement).className;
    expect(cls).toContain("[&>[data-slot=card-header]]:border-b-0");
    expect(cls).toContain("[&>[data-slot=card-header]]:pb-2");
    expect(cls).toContain("[&>[data-slot=card-footer]]:border-t-0");
    expect(cls).toContain("[&>[data-slot=card-footer]]:pt-2");
  });

  it("divided={true} 与省略等价（显式为真不额外挂类）", () => {
    const { container } = render(
      <Card divided>
        <CardHeader>标题</CardHeader>
      </Card>,
    );
    expect((container.firstElementChild as HTMLElement).className).not.toContain("border-b-0");
  });

  it("divided 不落到 DOM 属性上（是样式开关，不是透传的 div 属性）", () => {
    const { container } = render(<Card divided={false} />);
    expect((container.firstElementChild as HTMLElement).hasAttribute("divided")).toBe(false);
  });
});

describe("CardHeader 的标题词汇（#226）", () => {
  const headerOf = (c: HTMLElement) => c.querySelector('[data-slot="card-header"]') as HTMLElement;

  it("三个槽一个都不传时行为不变：裸插槽 + font-medium，不多套一层", () => {
    const { container } = render(<CardHeader>瑚琏卡片</CardHeader>);
    const header = headerOf(container);
    expect(header.className).toContain("font-medium");
    expect(header.className).not.toContain("flex");
    // children 直接就是正文，没有中间容器
    expect(header.firstChild?.nodeType).toBe(Node.TEXT_NODE);
    expect(header.textContent).toBe("瑚琏卡片");
    expect(container.querySelector('[data-slot="card-title"]')).toBeNull();
  });

  it("title 有自己的元素（独立字号/行高/字重）", () => {
    const { container } = render(<CardHeader title="指派任务" />);
    const title = container.querySelector('[data-slot="card-title"]') as HTMLElement;
    expect(title).not.toBeNull();
    expect(title.textContent).toBe("指派任务");
    expect(title.className).toContain("text-base");
    expect(title.className).toContain("leading-snug");
    expect(title.className).toContain("font-medium");
  });

  it("传了标题词汇后 font-medium 从容器撤到标题上：同行的 Tag/按钮不再被染成标题字重", () => {
    const { container } = render(
      <CardHeader title="指派任务" extra={<button type="button">展开</button>} />,
    );
    const header = headerOf(container);
    expect(header.className).not.toContain("font-medium");
    expect(header.className).toContain("flex");
    expect(container.querySelector('[data-slot="card-title"]')!.className).toContain("font-medium");
  });

  it("description 排在标题下方，走次要文字色", () => {
    const { container } = render(<CardHeader title="指派任务" description="指派后立即生效" />);
    const desc = container.querySelector('[data-slot="card-description"]') as HTMLElement;
    expect(desc.textContent).toBe("指派后立即生效");
    expect(desc.className).toContain("text-muted-foreground");
    // 副标题在标题之后
    const title = container.querySelector('[data-slot="card-title"]')!;
    expect(title.compareDocumentPosition(desc) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("extra 落在独立的右侧操作区，不与标题群混在一起", () => {
    const { container } = render(
      <CardHeader title="指派任务" extra={<button type="button">展开</button>} />,
    );
    const extra = container.querySelector('[data-slot="card-header-extra"]') as HTMLElement;
    expect(extra.textContent).toBe("展开");
    expect(extra.querySelector('[data-slot="card-title"]')).toBeNull();
  });

  it("children 是逃生口：与 title 并存时仍渲染（排在标题/副标题之后）", () => {
    const { container, getByText } = render(
      <CardHeader title="指派任务" description="说明">
        <span data-testid="escape">自定义一行</span>
      </CardHeader>,
    );
    expect(getByText("自定义一行")).toBeTruthy();
    const desc = container.querySelector('[data-slot="card-description"]')!;
    const escape = container.querySelector('[data-testid="escape"]')!;
    expect(desc.compareDocumentPosition(escape) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("只传 extra 也成立（children 作标题群，右侧操作区自己对齐）", () => {
    const { container } = render(
      <CardHeader extra={<button type="button">展开</button>}>待办审批</CardHeader>,
    );
    expect(headerOf(container).className).toContain("justify-between");
    expect(container.querySelector('[data-slot="card-header-extra"]')).not.toBeNull();
    expect(container.textContent).toContain("待办审批");
  });

  it("title 为条件表达式的假值（false / \"\" / null）时不算传：仍是裸插槽", () => {
    for (const empty of [false, "", null, undefined] as const) {
      const { container, unmount } = render(<CardHeader title={empty}>待办审批</CardHeader>);
      const header = headerOf(container);
      expect(header.className).toContain("font-medium");
      expect(container.querySelector('[data-slot="card-title"]')).toBeNull();
      unmount();
    }
  });

  it("title 不落到 DOM 的 title 属性上（类型已 Omit，避免原生 tooltip 串味）", () => {
    const { container } = render(<CardHeader title="指派任务" />);
    expect(headerOf(container).hasAttribute("title")).toBe(false);
  });

  it("className 与分隔线口径不受影响（结构态下 border-b 与内边距照旧）", () => {
    const { container } = render(<CardHeader title="标题" className="my-header" />);
    const header = headerOf(container);
    expect(header.className).toContain("border-b");
    expect(header.className).toContain("px-5");
    expect(header.classList.contains("my-header")).toBe(true);
  });
});
