import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Brand } from "./brand";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Brand", () => {
  it("渲染徽章与品牌名", () => {
    const { getByText } = render(<Brand name="瑚琏" />);
    expect(getByText("瑚琏")).toBeTruthy();
  });

  it("mark 缺省时取品牌名首字（中文一个字）", () => {
    const { getByText } = render(<Brand name="瑚琏后台" />);
    expect(getByText("瑚")).toBeTruthy();
  });

  it("英文名取首字母并大写", () => {
    const { getByText } = render(<Brand name="hulian admin" />);
    expect(getByText("H")).toBeTruthy();
  });

  it("mark 可传图标/图片节点", () => {
    const { container } = render(<Brand name="瑚琏" mark={<svg data-logo />} />);
    expect(container.querySelector("[data-logo]")).toBeTruthy();
  });

  it("动图走 <picture>（减弱动效静态回退）时 img 仍受铺满规则约束", () => {
    // 减弱动效回退的标准写法是 <picture><source media="(prefers-reduced-motion: reduce)"/><img/></picture>，
    // img 多包了一层；若尺寸规则只认直接子级 img，动图一加回退就按原图尺寸被裁。
    const { container } = render(
      <Brand
        name="瑚琏"
        mark={
          <picture>
            <source srcSet="static.png" media="(prefers-reduced-motion: reduce)" />
            <img src="motion.gif" alt="" />
          </picture>
        }
      />,
    );
    const badge = container.querySelector("span > span") as HTMLElement;
    expect(badge.querySelector("picture > img")).toBeTruthy();
    expect(badge.className).toContain("[&_img]:size-full");
    expect(badge.className).toContain("[&>picture]:absolute");
    expect(badge.className).toContain("[&>picture]:size-full");
    // 替换元素在 grid 项里 height:100% 不解析，铺满必须走 absolute inset-0（见组件注释）。
    expect(badge.className).toContain("relative");
    expect(badge.className).toContain("[&>img]:absolute");
  });

  it("video / canvas 类动态 mark 同样铺满徽章", () => {
    const { container } = render(
      <Brand name="瑚琏" mark={<video src="brand.webm" muted loop playsInline />} />,
    );
    const badge = container.querySelector("span > span") as HTMLElement;
    expect(badge.querySelector("video")).toBeTruthy();
    expect(badge.className).toContain("[&>video]:absolute");
    expect(badge.className).toContain("[&>video]:size-full");
    expect(badge.className).toContain("[&>canvas]:absolute");
    expect(badge.className).toContain("[&>canvas]:size-full");
    // 图标 svg 仍是半尺寸，不被媒体规则误伤。
    expect(badge.className).toContain("[&>svg]:size-1/2");
  });

  it("省略 name 只出徽章（侧栏收起态）", () => {
    const { container, queryByText } = render(<Brand mark="H" />);
    expect(queryByText("H")).toBeTruthy();
    expect(container.querySelectorAll("span").length).toBe(2); // 根 + 徽章
  });

  it("description 渲染副标题", () => {
    const { getByText } = render(<Brand name="瑚琏" description="v0.18.0" />);
    expect(getByText("v0.18.0")).toBeTruthy();
  });

  it("徽章是方角不是圆（区别 Avatar）", () => {
    const { container } = render(<Brand name="瑚琏" />);
    const markEl = container.querySelector("span > span") as HTMLElement;
    expect(markEl.className).toContain("rounded-[calc(var(--radius)");
    expect(markEl.className).not.toContain("rounded-full");
  });

  it("color 换徽章底色（语义色名走 token）", () => {
    const { container } = render(<Brand name="瑚琏" color="chart-3" />);
    const markEl = container.querySelector("span > span") as HTMLElement;
    expect(markEl.style.backgroundColor).toContain("--color-chart-3");
  });

  it("href 渲染成链接", () => {
    const { container } = render(<Brand name="瑚琏" href="/" />);
    expect(container.querySelector("a")?.getAttribute("href")).toBe("/");
  });

  it("render 逃生口接框架路由件，皮肤 class 合并进去", () => {
    const onClick = vi.fn();
    const { container, getByText } = render(
      <Brand name="瑚琏" render={<a data-router href="/home" onClick={onClick} />} />,
    );
    const el = container.querySelector("[data-router]") as HTMLAnchorElement;
    expect(el.getAttribute("href")).toBe("/home");
    expect(el.className).toContain("inline-flex");
    expect(getByText("瑚琏")).toBeTruthy();
    fireEvent.click(el);
    expect(onClick).toHaveBeenCalled();
  });

  it("三档尺寸给不同徽章边长", () => {
    const size = (s: "sm" | "md" | "lg") => {
      const { container } = render(<Brand name="瑚琏" size={s} />);
      return (container.querySelector("span > span") as HTMLElement).className;
    };
    expect(size("sm")).toContain("size-7");
    expect(size("md")).toContain("size-9");
    expect(size("lg")).toContain("size-11");
  });
});

// 见 hulianui/hulian#89：稳定父更新时整棵子树必须 bail out。
describe("Brand · memo", () => {
  it("稳定父更新时跳过品牌标识子树", async () => {
    await expectMemoSkipsSubtree(() => <Brand name="瑚琏" />);
  });
});
