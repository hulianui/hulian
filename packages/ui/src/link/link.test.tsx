import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Link } from "./link";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Link", () => {
  // 回归护栏：Link 若被改回普通函数组件（去掉 memo），这条立刻红。
  it("稳定父更新时跳过链接子树", async () => {
    await expectMemoSkipsSubtree(() => (
      <Link href="/docs" tone="primary" underline="hover">
        文档
      </Link>
    ));
  });

  it("渲染 a 标签 + href", () => {
    const { getByText } = render(<Link href="/docs">文档</Link>);
    const a = getByText("文档") as HTMLAnchorElement;
    expect(a.tagName).toBe("A");
    expect(a.getAttribute("href")).toBe("/docs");
  });

  it("external 加 target=_blank + rel + 外链图标", () => {
    const { container } = render(
      <Link href="https://x.com" external>
        外链
      </Link>,
    );
    const a = container.querySelector("a")!;
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toContain("noopener");
    expect(a.querySelector("svg")).toBeTruthy();
  });

  it("非 external 不加 target", () => {
    const { container } = render(<Link href="/x">内链</Link>);
    expect(container.querySelector("a")!.hasAttribute("target")).toBe(false);
  });

  it("tone=danger 皮肤类", () => {
    const { container } = render(
      <Link href="#" tone="danger">
        x
      </Link>,
    );
    expect(container.querySelector("a")!.className).toContain("text-danger");
  });

  it("underline=always 皮肤类", () => {
    const { container } = render(
      <Link href="#" underline="always">
        x
      </Link>,
    );
    expect(container.querySelector("a")!.className).toContain("underline");
  });

  // ── render 口子：曾因缺它产出「没有 href、也没有 link role」的死锚点 ──
  describe("render", () => {
    // 冒充路由件（next/link、react-router Link 都是这个形状：自己收 href 渲染成 <a>）
    const RouterLink = ({ href, ...rest }: { href: string } & Record<string, unknown>) => (
      // biome-ignore lint/a11y/useAnchorContent: 内容由 cloneElement 注入
      <a data-router="" href={href} {...rest} />
    );

    it("href 落到自定义元素上，且拿得到 link role", () => {
      const { getByRole } = render(<Link render={<RouterLink href="/docs" />}>文档</Link>);
      const a = getByRole("link") as HTMLAnchorElement;
      expect(a.getAttribute("href")).toBe("/docs");
      expect(a.hasAttribute("data-router")).toBe(true);
      expect(a.textContent).toContain("文档");
    });

    it("皮肤 class 与自定义元素自带的 className 合并", () => {
      const { getByRole } = render(
        <Link render={<RouterLink href="/x" className="my-own" />} tone="danger" className="extra">
          x
        </Link>,
      );
      const cls = getByRole("link").className;
      expect(cls).toContain("text-danger");
      expect(cls).toContain("extra");
      expect(cls).toContain("my-own");
    });

    it("external 的 target/rel 与外链图标同样生效", () => {
      const { getByRole } = render(
        <Link render={<RouterLink href="https://x.com" />} external>
          外链
        </Link>,
      );
      const a = getByRole("link");
      expect(a.getAttribute("target")).toBe("_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
      expect(a.querySelector("svg")).toBeTruthy();
    });

    it("children 省略时取自定义元素自己的 children", () => {
      const { getByRole } = render(<Link render={<RouterLink href="/y">内建文案</RouterLink>} />);
      expect(getByRole("link").textContent).toContain("内建文案");
    });
  });
});
