import { existsSync, readFileSync } from "node:fs";
import { describe, it, expect, vi } from "vitest";
import { render as rtlRender } from "@testing-library/react";
import { Button, buttonVariants } from "./button";
import { EFFECT_BUTTON_BASE_CLASS } from "./button-base";
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

  // #222：密集端的两个插档。24px 是 xs 文字档的配套（此前只有文字档没有图标档，消费方只能
  // 手写 size-6），28px 钉的是 Chip md / Sidebar sm 那条行刻度。名字用数字：xs~sm 之间的
  // t-shirt 名已被 iconXs(20px) 占掉，而 20px 那档不能动（消费方的树形展开器靠它）。
  it("icon24 与 xs 文字档等高（24px），是它一直缺的配套图标档", () => {
    expect(buttonVariants({ size: "xs" })).toContain("h-6");
    expect(buttonVariants({ size: "icon24" })).toContain("size-6");
    // 图标档不能带文字档的横向内边距，否则不是方的
    expect(buttonVariants({ size: "icon24" })).toContain("p-0");
    expect(buttonVariants({ size: "icon24" }).split(/\s+/)).not.toContain("px-2");
  });

  it("icon28 是 28px 方形（Chip md / Sidebar sm 那条行刻度）", () => {
    const cls = cn(buttonVariants({ size: "icon28" }));
    expect(cls).toContain("size-7");
    expect(cls).toContain("p-0");
  });

  // 圆角按边长分组，判据是 --radius(10px) 落上去是否读成圆片（半径/边长趋近 0.5 即圆）：
  // 24px 上是 0.42 → 必须降档；28px 上是 0.36，与 iconSm(32px) 的 0.31 同组 → 保持 --radius。
  it("icon24 圆角降到 rounded-sm，icon28 保持 --radius", () => {
    const c24 = cn(buttonVariants({ size: "icon24" }));
    expect(c24).toContain("rounded-sm");
    expect(c24).not.toContain("rounded-[var(--radius)]");
    // 同 xs / iconXs 的坑：裸 rounded 就是 var(--radius)，等于没降
    expect(c24.split(/\s+/)).not.toContain("rounded");

    const c28 = cn(buttonVariants({ size: "icon28" }));
    expect(c28).toContain("rounded-[var(--radius)]");
    expect(c28).not.toContain("rounded-sm");
  });

  it("四个密集图标档互不等高（20 / 24 / 28 / 32，各服务各的行刻度）", () => {
    const side = (size: "iconXs" | "icon24" | "icon28" | "iconSm") =>
      buttonVariants({ size }).match(/\bsize-(\d+)\b/)![1];
    expect([side("iconXs"), side("icon24"), side("icon28"), side("iconSm")]).toEqual([
      "5",
      "6",
      "7",
      "8",
    ]);
  });

  // #228：28px 那条行刻度上此前**只有图标形态**（icon28 是 #222 补的），文字档缺这一格，
  // 于是同一行里图标钮迁得了、紧挨着的文字按钮只能继续裸 <button>。
  it('size="28" 是 28px 高、12px 字的密集文字档', () => {
    const { container } = rtlRender(<Button size="28">筛选</Button>);
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("h-7");
    // 字号跟 xs 走（密集端的带就是 10~12px），不跟同高度的 Chip md / Sidebar sm 走
    expect(cls).toContain("text-xs");
    expect(cls).toContain("px-2.5");
    // 相邻两档的那套必须被替换掉而不是叠加
    expect(cls).not.toContain("h-6");
    expect(cls).not.toContain("h-8");
    expect(cls).not.toContain("text-sm");
    expect(cls.split(/\s+/)).not.toContain("px-2");
    expect(cls.split(/\s+/)).not.toContain("px-3");
  });

  // 与 icon28 是密集端唯一的等高一对：这一行的全部意义就是「文字钮与图标钮并排不参差」。
  it('size="28" 与 icon28 等高，且圆角同为 --radius（并排不露台阶）', () => {
    const text28 = cn(buttonVariants({ size: "28" }));
    const icon28 = cn(buttonVariants({ size: "icon28" }));
    expect(text28).toContain("h-7");
    expect(icon28).toContain("size-7");
    // 28px 上 --radius(10px) 是 0.36，与 iconSm(32px) 同组，读不成圆片 → 不降档
    expect(text28).toContain("rounded-[var(--radius)]");
    expect(icon28).toContain("rounded-[var(--radius)]");
    expect(text28).not.toContain("rounded-sm");
  });

  it('size="28" 的图文间距插在 xs 与 base 之间（gap-1 / 6px / gap-2）', () => {
    const { container } = rtlRender(
      <Button size="28">
        <span aria-hidden>◆</span>筛选
      </Button>,
    );
    const cls = container.querySelector("button")!.className;
    expect(cls).toContain("gap-1.5");
    expect(cls.split(/\s+/)).not.toContain("gap-2");
    expect(cls.split(/\s+/)).not.toContain("gap-1");
  });

  // 加一档不许动别的档：这三档在 0.39.0 的渲染结果一个字符都不该变。
  it('新增 "28" 不影响相邻的 xs / sm / md', () => {
    expect(cn(buttonVariants({ size: "xs" }))).toContain("h-6 gap-1 px-2 text-xs rounded-sm");
    expect(cn(buttonVariants({ size: "sm" }))).toContain("h-8 px-3 text-sm");
    expect(cn(buttonVariants({ size: "md" }))).toContain("h-10 px-4 text-sm");
  });

  // 五个密集档的高度谱：只有 "28" 与 icon28 重合，其余各钉一条行刻度。
  it("密集端文字档 24 / 28 与图标档 20 / 24 / 28 各就各位", () => {
    const h = (size: "xs" | "28") => buttonVariants({ size }).match(/\bh-(\d+)\b/)![1];
    expect([h("xs"), h("28")]).toEqual(["6", "7"]);
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

describe("muted 层级档（#211）", () => {
  const classesOf = (el: React.ReactElement) =>
    rtlRender(el).container.querySelector("button")!.className;

  it("不传 muted 时一个类都不变 —— 207 处既有 ghost 调用不许被这档带偏", () => {
    // 这条是本档最重要的一条：muted 是 opt-in，静息 ghost 仍是正文黑。
    // 若把 ghost 的 neutral 直接重定义成 muted（issue 倾向的方案 B），
    // 本仓 207 处 ghost 会全部变色，其中多数是表格行/工具栏里的正常强度动作。
    expect(classesOf(<Button variant="ghost">x</Button>)).toContain("text-foreground");
    expect(classesOf(<Button variant="ghost">x</Button>)).not.toContain("text-muted-foreground");
    expect(classesOf(<Button variant="link">x</Button>)).toContain("text-primary");
  });

  it("ghost + muted 正是消费方手写的那串：静息次要灰 → hover 正文黑 + 浅底", () => {
    const cls = classesOf(
      <Button variant="ghost" muted>
        x
      </Button>,
    );
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("hover:text-foreground");
    expect(cls).toContain("hover:bg-surface-hover");
    // 静息色必须被顶掉，不能两条同时留下（tailwind-merge 后来者胜）
    expect(cls.split(/\s+/)).not.toContain("text-foreground");
  });

  it("link + muted：静息次要灰，hover 回本 tone 的色（默认 brand → 主色）", () => {
    const brand = classesOf(
      <Button variant="link" muted>
        x
      </Button>,
    );
    expect(brand).toContain("text-muted-foreground");
    expect(brand).toContain("hover:text-primary");
    expect(brand.split(/\s+/)).not.toContain("text-primary");

    const neutral = classesOf(
      <Button variant="link" tone="neutral" muted>
        x
      </Button>,
    );
    expect(neutral).toContain("hover:text-foreground");
  });

  it("非中性 tone 静息也降成灰，hover 才亮出语义色（密集行里的删除链接形态）", () => {
    for (const [tone, hover] of [
      ["danger", "hover:text-danger"],
      ["success", "hover:text-success"],
      ["warning", "hover:text-warning"],
    ] as const) {
      for (const variant of ["ghost", "link"] as const) {
        const cls = classesOf(
          <Button variant={variant} tone={tone} muted>
            x
          </Button>,
        );
        expect(cls, `${variant}/${tone}`).toContain("text-muted-foreground");
        expect(cls, `${variant}/${tone}`).toContain(hover);
        // 语义色不能还留在静息位上
        expect(cls.split(/\s+/), `${variant}/${tone}`).not.toContain(`text-${tone}`);
      }
    }
  });

  it("落在 solid / soft 上不加任何类（静默无效比报错更难查，故开发期另有 warnOnce）", () => {
    for (const variant of ["solid", "soft"] as const) {
      expect(classesOf(<Button variant={variant}>x</Button>)).toBe(
        classesOf(
          <Button variant={variant} muted>
            x
          </Button>,
        ),
      );
    }
  });
});

// ===== outline 的 muted 档（#221）=====
//
// 0.35.0 把这一档记成「结构上说得通但没有实际需求，等有人提再加」。消费方按 #211 迁完
// ghost / link 之后剩下的 3 处正是这个形状：边框是它自己要表达的东西（「这是个可点的框」），
// 但静息文字不该是正文黑。ghost muted 顶不了——那会连边框一起丢掉。
describe("outline + muted（#221）", () => {
  const classesOf = (el: React.ReactElement) =>
    rtlRender(el).container.querySelector("button")!.className;

  it("只降文字：描边与底色原样保留，静息灰 → hover 回正文黑", () => {
    const cls = classesOf(
      <Button variant="outline" muted>
        中止
      </Button>,
    );
    expect(cls).toContain("text-muted-foreground");
    expect(cls).toContain("hover:text-foreground");
    // 边框与底色是 outline 的身份，一个都不能丢（丢了就等于 ghost）
    expect(cls).toContain("border-hairline");
    expect(cls).toContain("bg-surface");
    expect(cls).toContain("hover:bg-surface-hover");
    // 静息色必须被顶掉而不是两条并存
    expect(cls.split(/\s+/)).not.toContain("text-foreground");
  });

  it("不传 muted 的 outline 一个像素都不动（opt-in）", () => {
    expect(classesOf(<Button variant="outline">描边</Button>)).toContain("text-foreground");
    expect(classesOf(<Button variant="outline">描边</Button>)).not.toContain(
      "text-muted-foreground",
    );
  });

  it("非中性 tone：描边保持语义色，文字静息灰、hover 才亮出语义色", () => {
    for (const tone of ["danger", "success", "warning"] as const) {
      const cls = classesOf(
        <Button variant="outline" tone={tone} muted>
          删除
        </Button>,
      );
      expect(cls, tone).toContain(`border-${tone}`);
      expect(cls, tone).toContain("text-muted-foreground");
      expect(cls, tone).toContain(`hover:text-${tone}`);
      expect(cls.split(/\s+/), tone).not.toContain(`text-${tone}`);
    }
  });

  it("不再点名 outline（此前的 warnOnce 指路 ghost，会连边框一起丢掉）", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rtlRender(
      <Button variant="outline" muted>
        中止
      </Button>,
    );
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

// ===== buttonVariants 出口过 tailwind-merge（#217）=====
//
// cva 只拼接不消解，base 的 text-foreground 与 compound 的 text-danger 会同时留在串里。
// <Button> 内部的 cn() 一直兜着，但 buttonVariants 作为公共出口（文档明示「只要样式不要
// <button> 语义就用它」）没有这层：两条规则都进 DOM，谁生效由样式表顺序裁决。
describe("buttonVariants 出口收敛（#217）", () => {
  const classes = (s: string) => s.split(/\s+/).filter(Boolean);

  // 消费方实测的 6 个错色组合，其中 3 个是「危险按钮丢掉红色」。
  it.each([
    ["ghost", "danger", "text-danger", "text-foreground"],
    ["outline", "danger", "text-danger", "text-foreground"],
    ["link", "danger", "text-danger", "text-primary"],
    ["link", "neutral", "text-foreground", "text-primary"],
    ["solid", "neutral", "text-bg", "text-primary-foreground"],
  ] as const)("%s + %s 只留 %s，撤掉 %s", (variant, tone, kept, dropped) => {
    const out = classes(buttonVariants({ variant, tone }));
    expect(out).toContain(kept);
    expect(out).not.toContain(dropped);
  });

  // 0.35.0 新增的这一格一上线就在错色名单里 —— #211 的验收走的是 <Button>（经过 cn），
  // 所以没暴露出来。
  it("link + muted 静息是次要灰而不是主色", () => {
    const out = classes(buttonVariants({ variant: "link", muted: true }));
    expect(out).toContain("text-muted-foreground");
    expect(out).not.toContain("text-primary");
  });

  // 同一个 CSS 属性在出口串里只能剩一条 —— 否则「谁生效」就不是本库能保证的。
  it("任一组合的出口串里 text-* 至多一条", () => {
    for (const variant of ["solid", "outline", "ghost", "soft", "link"] as const) {
      for (const tone of ["brand", "success", "warning", "danger", "neutral"] as const) {
        for (const muted of [false, true]) {
          const hit = classes(buttonVariants({ variant, tone, muted })).filter((c) =>
            /^text-(?!xs$|sm$|base$)/.test(c),
          );
          expect(hit.length, `${variant}/${tone}/muted=${muted} → ${hit.join(" ")}`).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  // 对 <Button> 侧必须是幂等的：那条路上 cn 会再跑一遍，结果不能因此变。
  it("对 <Button> 幂等（twMerge 跑两遍结果相同）", () => {
    const once = buttonVariants({ variant: "ghost", tone: "danger" });
    expect(cn(once)).toBe(once);
    expect(classesOfButton(<Button variant="ghost" tone="danger" />)).toBe(once);
  });
});

function classesOfButton(el: React.ReactElement) {
  return rtlRender(el).container.querySelector("button")!.className;
}

// ===== tone="current"：不设色、跟随容器（#215）=====
describe('tone="current"（#215）', () => {
  it("ghost / outline 上撤掉写死的静息色，交还给继承", () => {
    for (const variant of ["ghost", "outline"] as const) {
      const out = buttonVariants({ variant, tone: "current" }).split(/\s+/);
      expect(out, variant).toContain("text-current");
      // 关键：base/variant 的绝对色必须被顶掉，否则继承根本轮不到
      expect(out, variant).not.toContain("text-foreground");
    }
  });

  it("不传 tone 时一个类都不变 —— current 是 opt-in", () => {
    for (const variant of ["ghost", "outline"] as const) {
      expect(buttonVariants({ variant })).toContain("text-foreground");
    }
  });

  it("solid / soft / link 上不加任何类（自带背景或自带主色，跟随容器会做出不合规组合）", () => {
    for (const variant of ["solid", "soft", "link"] as const) {
      expect(buttonVariants({ variant, tone: "current" })).toBe(buttonVariants({ variant }));
    }
  });

  it("落在无效档上开发期点名", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rtlRender(
      <Button variant="solid" tone="current">
        x
      </Button>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tone="current"'));
    warn.mockRestore();
  });
});

// ===== ghost 上的 tone="brand"（#218）=====
//
// 它与不写 tone 渲染结果逐字相同。补 compoundVariants 这条路是堵死的：cva 拿到的是
// 应用默认值之后的 tone，分不出「显式写了 brand」和「没写」，补格子会把所有默认 ghost
// 一起改掉。组件层能分（没传就是 undefined），所以在这里点名。
describe('ghost + tone="brand"（#218）', () => {
  it("与不写 tone 渲染结果相同（ghost 的中性外观就是它的默认形态）", () => {
    expect(buttonVariants({ variant: "ghost", tone: "brand" })).toBe(
      buttonVariants({ variant: "ghost" }),
    );
  });

  // 这条钉的是「补格子会误伤默认档」：ghost muted 不写 tone 时 hover 必须回正文黑，
  // 那是 #211 收编的、消费方 18 处手写的形状。
  it("ghost + muted 不写 tone 时 hover 仍回正文黑，没有被 brand 带成主色", () => {
    const out = buttonVariants({ variant: "ghost", muted: true });
    expect(out).toContain("hover:text-foreground");
    expect(out).not.toContain("hover:text-primary");
  });

  it("显式写 tone=\"brand\" 才点名，不写不点名", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    rtlRender(<Button variant="ghost">不写 tone</Button>);
    expect(warn).not.toHaveBeenCalled();
    rtlRender(
      <Button variant="ghost" tone="brand">
        显式 brand
      </Button>,
    );
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('tone="brand"'));
    warn.mockRestore();
  });
});

// ===== 默认 type="button"（#219）=====
describe("默认 type（#219）", () => {
  it("默认 type=button，而不是原生 <button> 的 submit", () => {
    const { container } = rtlRender(<Button>查看</Button>);
    expect(container.querySelector("button")!.getAttribute("type")).toBe("button");
  });

  it("显式 type=submit 照常覆盖（提交按钮不受影响）", () => {
    const { container } = rtlRender(<Button type="submit">提交</Button>);
    expect(container.querySelector("button")!.getAttribute("type")).toBe("submit");
  });

  // 表单里的辅助按钮点一下就走完整条提交链路，是本次修的原始现象。
  it("表单内的辅助按钮不再触发 submit", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    const { getByText } = rtlRender(
      <form onSubmit={onSubmit}>
        <Button>查看模板配置</Button>
      </form>,
    );
    getByText("查看模板配置").click();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("render 成 <a> 时不注入 type（那是 button 专有属性）", () => {
    const { container } = rtlRender(<Button render={<a href="#x">去详情</a>} />);
    expect(container.querySelector("a")!.hasAttribute("type")).toBe(false);
  });
});

// ===== base 的 shrink-0（#216）=====
describe("base 防压缩（#216）", () => {
  it("base 带 shrink-0：flex 行里按钮不被压到声明尺寸以下", () => {
    const { container } = rtlRender(<Button size="iconXs" aria-label="上移" />);
    expect(container.querySelector("button")!.className).toContain("shrink-0");
  });

  it("与 block 不冲突（w-full + shrink-0 = 铺满但不被压）", () => {
    const out = buttonVariants({ block: true }).split(/\s+/);
    expect(out).toContain("w-full");
    expect(out).toContain("shrink-0");
  });
});

describe("Button 按压反馈（底座）", () => {
  it("base 带按压缩放，且带的是含颜色项的完整过渡列表（不是 transition-colors）", () => {
    const { getByRole } = rtlRender(<Button>确定</Button>);
    const cls = getByRole("button", { name: "确定" }).className;
    expect(cls).toContain("active:scale-[0.97]");
    // tailwind-merge 把 transition-* 视作同一冲突组只留最后一个：并列 transition-colors
    // 会让颜色与按压二选一，所以底座里只能有这一条含颜色项的完整列表。
    expect(cls).toContain("transition-[scale,background-color,border-color,color,box-shadow,filter,opacity]");
    expect(cls).not.toContain("transition-colors");
  });

  it("减弱动效下缩放与过渡都撤掉（这条偏好由库负责，不指望调用处关）", () => {
    const { getByRole } = rtlRender(<Button>确定</Button>);
    const cls = getByRole("button", { name: "确定" }).className;
    expect(cls).toContain("motion-reduce:transition-none");
    expect(cls).toContain("motion-reduce:active:scale-100");
  });

  it("特效按钮底座刻意不含它：那几件变的是自绘背景，过渡属性各管各的", () => {
    expect(EFFECT_BUTTON_BASE_CLASS).not.toContain("active:scale-");
  });

  // #260：0.43.0 把 pressableClass 放进底座时，<Button> 上原有的 motion whileTap 没撤，
  // 两条走不同 CSS 属性（内联 transform vs 独立的 scale 属性）互不覆盖而是相乘，
  // 按下去缩 0.97² ≈ 6%。两处各自都对、合起来才错，逐处 review 看不出来，故钉死这条。
  it("同一颗按钮上只有一个缩放来源：底座给 CSS 那份，元素上不再挂 motion 的 whileTap", () => {
    const { getByRole } = rtlRender(<Button>确定</Button>);
    const el = getByRole("button", { name: "确定" });
    // motion 的 whileTap 会在按下时写内联 style.transform；退一步说，只要元素不是 motion
    // 组件渲染的，就不可能有第二个来源——motion 会在挂载时就打上自己的标记属性。
    expect(el.tagName).toBe("BUTTON");
    expect(el.style.transform).toBe("");
    expect(el.getAttribute("style")).toBeNull();
    // 缩放只出现在 className 里那一处
    expect(el.className.match(/active:scale-\[[\d.]+\]/g)).toHaveLength(1);
  });

  it("Button 不再拖 motion 运行时：源码不从 ../motion 与 motion/react 引任何东西", () => {
    // 静息态的 DOM 断言拦不住回归——motion 的 whileTap 只在按下的那一刻写内联 transform，
    // 而 jsdom 里那串指针事件走不通。所以这条直接看源码，且只看 import 行：
    // 上面那段注释本身要提 whileTap / m.button，扫正文会自己撞自己。
    // vitest 下 import.meta.url 不是 file: 协议，只能从 cwd 拼（turbo 在包目录里跑测试）。
    const rel = "src/button/button.tsx";
    const src = readFileSync(existsSync(rel) ? rel : `packages/ui/${rel}`, "utf8");
    const imports = src.split("\n").filter((l) => /^import\b/.test(l));
    expect(imports.filter((l) => /["'](\.\.\/motion|motion\/react)/.test(l))).toEqual([]);
  });
});
