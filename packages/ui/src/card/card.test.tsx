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
