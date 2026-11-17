import { describe, it, expect } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("eyebrow + h2 标题 + 主色强调 + 导语", () => {
    const { getByRole, getByText } = render(
      <SectionHeader eyebrow="产品" title="从一个按钮，" accent="到一整个后台" description="四层粒度" />,
    );
    const h = getByRole("heading", { level: 2 });
    expect(h.textContent).toBe("从一个按钮，到一整个后台");
    expect(getByText("到一整个后台").className).toContain("text-primary");
    expect(getByText("产品").className).toContain("text-primary");
    expect(getByText("四层粒度").className).toContain("text-muted-foreground");
  });

  it("accentBreak：always 换行 / mobile 窄屏换行 / space 空格 / none 相连", () => {
    const html = (b: "always" | "mobile" | "space" | "none") => {
      cleanup();
      return render(<SectionHeader title="A" accent="B" accentBreak={b} />).getByRole("heading")
        .innerHTML;
    };
    expect(html("always")).toContain("<br>");
    expect(html("mobile")).toContain('class="sm:hidden"');
    expect(html("space")).toMatch(/A <span/);
    expect(html("none")).toMatch(/A<span/);
  });

  it("align=center 居中、导语水平居中；level 改语义层级", () => {
    const { container, getByRole, getByText } = render(
      <SectionHeader title="T" description="D" align="center" level={3} />,
    );
    expect((container.firstElementChild as HTMLElement).className).toContain("text-center");
    expect(getByText("D").className).toContain("mx-auto");
    expect(getByRole("heading", { level: 3 })).toBeTruthy();
  });
});
