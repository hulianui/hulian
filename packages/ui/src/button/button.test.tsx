import { describe, it, expect } from "vitest";
import { render as rtlRender } from "@testing-library/react";
import { Button, buttonVariants } from "./button";
import { cn } from "../lib/cn";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("buttonVariants", () => {
  it("稳定父更新时跳过按钮子树", async () => {
    await expectMemoSkipsSubtree(() => <Button>稳定按钮</Button>);
  });

  it("default = solid brand md", () => {
    const c = buttonVariants({});
    expect(c).toContain("bg-primary");
    expect(c).toContain("h-10");
  });
  it("danger solid swaps to danger bg", () => {
    expect(buttonVariants({ variant: "solid", tone: "danger" })).toContain("bg-danger");
  });
  it("link 变体去掉横向内边距（文字贴单元格左缘，对齐表头）", () => {
    // cva 原串里 size 档的 px-3 与 compound 的 px-0 同时存在，靠组件内 cn(twMerge) 去重，
    // 故在真实渲染的元素上断言：最终只剩 px-0，且不含 px-3。
    const { container } = rtlRender(
      <Button variant="link" size="sm">
        查看
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("px-0");
    expect(cls).not.toContain("px-3");
    expect(cls).toContain("text-primary");
  });
});

describe("Button render（按钮样式的链接）", () => {
  it("render=<a> 时渲染为锚点、带 href、套上按钮样式、文案取 children", () => {
    const { container, getByText } = rtlRender(
      <Button render={<a href="/docs" />}>浏览组件</Button>,
    );
    const el = container.querySelector("a");
    expect(el).toBeTruthy();
    expect(el!.getAttribute("href")).toBe("/docs");
    expect(el!.className).toContain("bg-primary"); // solid 默认皮肤已合并
    expect(getByText("浏览组件")).toBeTruthy();
    // 不应再渲染原生 button
    expect(container.querySelector("button")).toBeNull();
  });

  it("render 元素自带 children 时作为文案兜底", () => {
    const { container } = rtlRender(<Button render={<a href="/x">主题</a>} />);
    expect(container.querySelector("a")!.textContent).toBe("主题");
  });

  it("disabled/loading → aria-disabled + 禁用样式（非 button 无原生 disabled）", () => {
    const { container } = rtlRender(
      <Button render={<a href="/x" />} disabled>
        禁用链接
      </Button>,
    );
    const el = container.querySelector("a")!;
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.className).toContain("pointer-events-none");
    expect(el.hasAttribute("disabled")).toBe(false); // <a> 不应有原生 disabled
  });

  it("不传 render 时仍渲染原生 <button>", () => {
    const { container } = rtlRender(<Button>点我</Button>);
    expect(container.querySelector("button")).toBeTruthy();
    expect(container.querySelector("a")).toBeNull();
  });

  // #97：icon 档曾是孤立的 36px（size-9），与任何文字档都对不齐，ButtonGroup 连排露台阶。
  // 这条锁住「图标档边长 == 同名文字档高度」的不变量：Tailwind 的 h-N 与 size-N 共用同一
  // 刻度（h-8/size-8=32、h-10/size-10=40、h-12/size-12=48），所以比对数字后缀即可。
  it.each([
    ["sm", "iconSm", "8"],
    ["md", "icon", "10"],
    ["lg", "iconLg", "12"],
  ])("尺寸档 %s 与图标档 %s 等高（刻度 %s）", (text, icon, step) => {
    expect(buttonVariants({ size: text as "sm" })).toContain(`h-${step}`);
    expect(buttonVariants({ size: icon as "icon" })).toContain(`size-${step}`);
  });

  // #204：24px 密集文字档。中后台工具栏 / 表格行内的主流形态是 20~28px 高、10~12px 字，
  // sm(32px/14px) 对它们是大一档。这里锁住三件事：高度、字号、圆角降档。
  it("xs 是 24px 高、12px 字的密集档", () => {
    const { container } = rtlRender(<Button size="xs">导出</Button>);
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("h-6");
    expect(cls).toContain("text-xs");
    expect(cls).toContain("px-2");
    // sm 的那套必须被替换掉而不是叠加——消费方迁移时写覆盖类正是因为撤不掉它们。
    expect(cls).not.toContain("h-8");
    expect(cls).not.toContain("text-sm");
    expect(cls).not.toContain("px-3");
  });

  it("xs 的圆角降到 rounded-sm，且不是裸 rounded / --radius", () => {
    const cls = cn(buttonVariants({ size: "xs" }));
    expect(cls).toContain("rounded-sm");
    // 与 iconXs 同源的坑：本库在 @theme 注册了 --radius，裸 `rounded` 就是 var(--radius)(10px)，
    // twMerge 去重后半径没降下来。className 断言拦不住它（两个类名确实不同），
    // 留这条是锁「不许改回裸 rounded / --radius」的意图，真判据是实机量 borderRadius。
    expect(cls).not.toContain("rounded-[var(--radius)]");
    expect(cls.split(/\s+/)).not.toContain("rounded");
  });

  it("xs 收紧图文间距（base 的 gap-2 在 24px 档上太松）", () => {
    const { container } = rtlRender(
      <Button size="xs">
        <span aria-hidden>◆</span>导出
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("gap-1");
    expect(cls.split(/\s+/)).not.toContain("gap-2");
  });

  // xs(24px) 与 iconXs(20px) **不等高**，这是刻意的：把 iconXs 抬到 24px 会把
  // density="compact" 的表格行撑高，那正是 #146 当初要解决的问题。
  it("xs 与 iconXs 不等高（密集刻度上的已知落差，不是漏配）", () => {
    expect(buttonVariants({ size: "xs" })).toContain("h-6");
    expect(buttonVariants({ size: "iconXs" })).toContain("size-5");
  });

  // #146：密集表格行内的 20px 微型操作档。它刻意**不**对应任何文字档，
  // 所以不在上面那条等高不变量里。
  it("iconXs 是 20px 方形，且圆角不吃 --radius", () => {
    const cls = cn(buttonVariants({ size: "iconXs" }));
    expect(cls).toContain("size-5");
    // 10px 的 --radius 落在 20px 方块上就是个圆片，必须降到 rounded-sm(4px)。
    // 特别不能是**裸** `rounded`：本库在 @theme 注册了 --radius，v4 的裸 rounded 就是
    // border-radius: var(--radius)，与 base 那条同义，twMerge 去重后仍然是 10px。
    // 这条断言拦不住那个坑（两个类名确实不同），真正的判据是实机量 borderRadius；
    // 留它是为了锁住「不许改回裸 rounded / --radius」这个意图。
    expect(cls).toContain("rounded-sm");
    expect(cls).not.toContain("rounded-[var(--radius)]");
    expect(cls.split(/\s+/)).not.toContain("rounded");
  });

  // #138：按钮文字是控件标签不是内容，连点会被浏览器识别成双击选词。
  it("base 带 select-none（全库按钮一起受益）", () => {
    const { container } = rtlRender(<Button>点我</Button>);
    expect(container.querySelector("button")!.className).toContain("select-none");
  });

  // #122：语义色 token 早就齐了，缺的只是接线；danger 的 hover 此前写回自身 = 没有悬停反馈。
  it.each(["success", "warning", "danger"] as const)("solid + %s 有独立的 hover 档", (tone) => {
    const cls = buttonVariants({ variant: "solid", tone });
    expect(cls).toContain(`bg-${tone}`);
    expect(cls).toContain(`text-${tone}-foreground`);
    expect(cls).toContain(`hover:bg-${tone}-hover`);
  });

  it.each(["success", "warning", "danger"] as const)("outline / ghost + %s 只换文字色", (tone) => {
    expect(buttonVariants({ variant: "outline", tone })).toContain(`border-${tone}`);
    expect(buttonVariants({ variant: "ghost", tone })).toContain(`text-${tone}`);
  });

  // 断言渲染后的 className：cva 只做拼接，冲突类由 cn(tailwind-merge) 在渲染时消解，
  // 所以「brand 的底色没留下」这件事只能在渲染产物上验，直接读 buttonVariants() 会假红。
  it("neutral 的 solid 是反色而不是灰底（灰底与 outline 不可分辨）", () => {
    const { container } = rtlRender(
      <Button variant="solid" tone="neutral">
        跳过
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("bg-foreground");
    expect(cls).toContain("text-bg");
    expect(cls).not.toContain("bg-primary");
  });

  it("block 铺满容器宽度", () => {
    const { container } = rtlRender(<Button block>登录</Button>);
    expect(container.querySelector("button")!.className).toContain("w-full");
    expect(buttonVariants({})).not.toContain("w-full");
  });
});

describe("soft 变体（#197）", () => {
  it("默认 tone=brand：浅主色底 + 主色文字 + 更深的 hover", () => {
    const cls = buttonVariants({ variant: "soft" });
    expect(cls).toContain("bg-primary/12");
    expect(cls).toContain("text-primary");
    expect(cls).toContain("hover:bg-primary/20");
  });

  it("与 outline+brand 渲染结果不同（旧口径下二者一致，激活与否分辨不出来）", () => {
    expect(buttonVariants({ variant: "soft", tone: "brand" })).not.toBe(
      buttonVariants({ variant: "outline", tone: "brand" }),
    );
  });

  it("覆盖 tone 全族，且都不是实心语义底", () => {
    for (const tone of ["brand", "success", "warning", "danger", "neutral"] as const) {
      const cls = buttonVariants({ variant: "soft", tone });
      expect(cls).toMatch(/bg-(primary|success|warning|danger|foreground)\/\d+/);
      expect(cls).not.toContain("shadow-sm");
    }
  });

  it("neutral 与其余四档同构（低透明度语义色底，亮暗自适应，不引新 token）", () => {
    const cls = buttonVariants({ variant: "soft", tone: "neutral" });
    expect(cls).toContain("bg-foreground/8");
    expect(cls).toContain("hover:bg-foreground/14");
  });

  it("渲染到 DOM 上", () => {
    const { getByRole } = rtlRender(<Button variant="soft">已激活的筛选</Button>);
    expect(getByRole("button").className).toContain("bg-primary/12");
  });

  // #205：底色走 bg-{tone}/12 的透明度口径，与 Tag / Chip / Alert 的 soft 同一套，
  // **刻意不用** --color-*-subtle 那族 token —— 换过去 brand 要新造 --color-primary-subtle
  // 加四个 *-subtle-hover，库里就会有两套 soft 配色（理由与已知代价写在 button.md 那一节）。
  // 这条锁住那个决定：改成 bg-primary-subtle 会在这里红。
  it("底色派生自语义色本身，不引 -subtle 族 token", () => {
    for (const tone of ["brand", "success", "warning", "danger", "neutral"] as const) {
      const cls = buttonVariants({ variant: "soft", tone });
      expect(cls).not.toContain("-subtle");
    }
  });

  it("与最小的密集档组合可用（工具栏里的激活态芯片就是这个形态）", () => {
    const { container } = rtlRender(
      <Button variant="soft" size="xs">
        已筛选
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("bg-primary/12");
    expect(cls).toContain("h-6");
  });
});
