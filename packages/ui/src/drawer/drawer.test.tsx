import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Drawer, DrawerContent, drawerVariants } from "./drawer";

describe("drawerVariants", () => {
  it("默认 right：贴右、border-l、滑出向右", () => {
    const c = drawerVariants({});
    expect(c).toContain("right-0");
    expect(c).toContain("inset-y-0");
    expect(c).toContain("border-l");
    expect(c).toContain("data-[ending-style]:translate-x-full");
  });
  it("left：贴左、border-r、负向滑出", () => {
    const c = drawerVariants({ side: "left" });
    expect(c).toContain("left-0");
    expect(c).toContain("border-r");
    expect(c).toContain("data-[starting-style]:-translate-x-full");
  });
  it("top：贴顶、border-b、纵向滑出", () => {
    const c = drawerVariants({ side: "top" });
    expect(c).toContain("top-0");
    expect(c).toContain("inset-x-0");
    expect(c).toContain("border-b");
    expect(c).toContain("data-[ending-style]:-translate-y-full");
  });
  it("bottom：贴底、border-t、正向纵滑", () => {
    const c = drawerVariants({ side: "bottom" });
    expect(c).toContain("bottom-0");
    expect(c).toContain("border-t");
    expect(c).toContain("data-[starting-style]:translate-y-full");
  });
  it("base 带 z-50 + 语义皮肤；定位(fixed/absolute)由 DrawerContent 按 container 决定，不写死在变体里", () => {
    const c = drawerVariants({});
    expect(c).toContain("z-50");
    expect(c).toContain("bg-surface");
    expect(c).not.toContain("fixed");
  });
});

describe("drawerVariants size 档（#230）", () => {
  // 精确切词：`w-[min(90vw,24rem)]` 用 toContain 会被 `w-[min(90vw,240rem)]` 之类误判通过，
  // 且要证明「不传 size 与今天逐字相同」必须逐个 class 比对，不能只看包含关系。
  const classes = (c: string) => c.split(/\s+/).filter(Boolean);

  it("不传 size：左右仍是 24rem、上下仍是 20rem（向后兼容）", () => {
    expect(classes(drawerVariants({}))).toContain("w-[min(90vw,24rem)]");
    expect(classes(drawerVariants({ side: "left" }))).toContain("w-[min(90vw,24rem)]");
    expect(classes(drawerVariants({ side: "top" }))).toContain("h-[min(90vh,20rem)]");
    expect(classes(drawerVariants({ side: "bottom" }))).toContain("h-[min(90vh,20rem)]");
  });

  it("显式 size=md 与不传等价（compoundVariants 在 defaultVariants 之后匹配）", () => {
    expect(drawerVariants({ side: "bottom", size: "md" })).toBe(drawerVariants({ side: "bottom" }));
  });

  it("主轴随 side 换手：左右压宽、上下压高，同档两轴不同值", () => {
    const right = classes(drawerVariants({ side: "right", size: "sm" }));
    expect(right).toContain("w-[min(90vw,20rem)]");
    expect(right.some((c) => c.startsWith("h-[min"))).toBe(false); // 交叉轴是 h-full，不吃档位

    const top = classes(drawerVariants({ side: "top", size: "sm" }));
    expect(top).toContain("h-[min(90vh,16rem)]");
    expect(top.some((c) => c.startsWith("w-[min"))).toBe(false);
  });

  it("xl 覆盖 760px 级面板（issue #230 的实际诉求：底部抽屉要 760px 高）", () => {
    expect(classes(drawerVariants({ side: "bottom", size: "xl" }))).toContain("h-[min(90vh,48rem)]");
    expect(classes(drawerVariants({ side: "right", size: "xl" }))).toContain("w-[min(90vw,48rem)]");
  });

  it("lg 居中档 32rem；full 不设上限直接铺满", () => {
    expect(classes(drawerVariants({ side: "right", size: "lg" }))).toContain("w-[min(90vw,32rem)]");
    expect(classes(drawerVariants({ side: "top", size: "lg" }))).toContain("h-[min(90vh,32rem)]");
    expect(classes(drawerVariants({ side: "right", size: "full" }))).toContain("w-full");
    expect(classes(drawerVariants({ side: "bottom", size: "full" }))).toContain("h-full");
  });
});

describe("Drawer (defaultOpen 渲染)", () => {
  it("Portal 挂载 popup：title + 内容 + role=dialog 出现", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="设置面板">抽屉内容X</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("设置面板")).toBeTruthy();
    expect(screen.getByText("抽屉内容X")).toBeTruthy();
  });
  it("side 默认 right 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="t">x</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("right-0");
  });
  it("side=left 落到 popup className", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent side="left" title="t">
          x
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className).toContain("left-0");
  });
  it("size 落到 popup className（#230）", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent side="bottom" size="xl" title="合同条款">
          分栏编辑区
        </DrawerContent>
      </Drawer>,
    );
    const cls = screen.getByRole("dialog").className.split(/\s+/);
    expect(cls).toContain("h-[min(90vh,48rem)]");
    expect(cls).not.toContain("h-[min(90vh,20rem)]");
  });

  it("不传 size 的 popup 保持 24rem（既有调用点零影响）", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent title="t">x</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("dialog").className.split(/\s+/)).toContain("w-[min(90vw,24rem)]");
  });

  it("无 title 也能挂载内容", () => {
    render(
      <Drawer defaultOpen>
        <DrawerContent>仅内容</DrawerContent>
      </Drawer>,
    );
    expect(screen.getByText("仅内容")).toBeTruthy();
  });
});

describe("DrawerContent 关闭按钮（hulianui/hulian#63）", () => {
  it("默认渲染右上角关闭按钮，带无障碍名", () => {
    const { getByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航">内容</DrawerContent>
      </Drawer>,
    );
    expect(getByLabelText("关闭")).toBeTruthy();
  });

  it("closeLabel 可覆盖无障碍名", () => {
    const { getByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航" closeLabel="收起菜单">
          内容
        </DrawerContent>
      </Drawer>,
    );
    expect(getByLabelText("收起菜单")).toBeTruthy();
  });

  it("showClose=false 关掉", () => {
    const { queryByLabelText } = render(
      <Drawer open>
        <DrawerContent title="导航" showClose={false}>
          内容
        </DrawerContent>
      </Drawer>,
    );
    expect(queryByLabelText("关闭")).toBeNull();
  });
});

describe("DrawerContent 遮罩与正文滚动（#185 / #188）", () => {
  it("backdrop=false 不渲染遮罩，抽屉本体照常", () => {
    render(
      <Drawer open modal={false}>
        <DrawerContent side="right" title="执行进度" backdrop={false}>
          <p>2 个任务正在处理</p>
        </DrawerContent>
      </Drawer>,
    );
    expect(document.querySelector(".fixed.inset-0.z-40")).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("backdropClassName 调浓度 / scrollable=false 交出正文高度", () => {
    render(
      <Drawer open>
        <DrawerContent
          side="right"
          title="执行进度"
          backdropClassName="bg-black/10"
          scrollable={false}
        >
          <div data-testid="drawer-body-child" />
        </DrawerContent>
      </Drawer>,
    );
    expect(document.querySelector(".fixed.inset-0.z-40")!.className).toContain("bg-black/10");
    const body = screen.getByTestId("drawer-body-child").parentElement!;
    expect(body.className).not.toContain("overflow-y-auto");
    expect(body.className).toContain("flex flex-col");
  });
});
