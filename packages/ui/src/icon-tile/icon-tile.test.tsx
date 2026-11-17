import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { IconTile } from "./icon-tile";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

const Icon = () => <svg data-testid="icon" />;

describe("IconTile", () => {
  it("默认 soft + brand + md：主色浅底、装饰性 aria-hidden", () => {
    const { container } = render(
      <IconTile>
        <Icon />
      </IconTile>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("bg-primary/12");
    expect(el.className).toContain("size-9");
    expect(el.getAttribute("aria-hidden")).toBe("true");
  });

  it("solid / outline / 中性档各自的配色", () => {
    const cls = (p: Parameters<typeof IconTile>[0]) =>
      (render(<IconTile {...p} />).container.firstElementChild as HTMLElement).className;
    expect(cls({ variant: "solid" })).toContain("bg-primary");
    expect(cls({ variant: "solid" })).toContain("text-primary-foreground");
    expect(cls({ variant: "outline" })).toContain("border-border");
    expect(cls({ variant: "outline" })).toContain("text-primary");
    expect(cls({ tone: "neutral" })).toContain("text-muted-foreground");
    expect(cls({ size: "lg" })).toContain("rounded-xl");
  });

  it("color 覆盖 tone：内联派生色，不再输出主色类", () => {
    const { container } = render(<IconTile variant="solid" color="chart-4" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toContain("chart-4");
    expect(el.className).not.toContain("bg-primary");
  });

  it("给 aria-label 时不再 aria-hidden", () => {
    const { container } = render(<IconTile role="img" aria-label="部署" />);
    expect((container.firstElementChild as HTMLElement).getAttribute("aria-hidden")).toBeNull();
  });

  it("稳定父更新时跳过子树", async () => {
    await expectMemoSkipsSubtree(() => <IconTile />);
  });
});
