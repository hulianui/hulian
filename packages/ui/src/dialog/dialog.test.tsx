import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Dialog, DialogContent } from "./dialog";

afterEach(cleanup);

describe("DialogContent", () => {
  it("open 时渲染 title/description + role=dialog", () => {
    render(
      <Dialog open>
        <DialogContent title="导入数据" description="支持 csv 与 xlsx。">
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("导入数据")).toBeTruthy();
    expect(screen.getByText("支持 csv 与 xlsx。")).toBeTruthy();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  // #179：title 收 ReactNode。「图标 + 文案」是最常见的标题形态，此前类型卡成 string，
  // 消费方只能摘图标 / 塞正文（a11y 名字就错了）/ as unknown as string。
  it("title 收 ReactNode：图标 + 文案同时渲染，且无障碍名取到文字", () => {
    render(
      <Dialog open>
        <DialogContent
          title={
            <>
              <svg data-icon="branch" aria-hidden />
              浏览仓库
            </>
          }
        >
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector('[data-icon="branch"]')).toBeTruthy();
    expect(screen.getByRole("dialog", { name: "浏览仓库" })).toBeTruthy();
  });

  it("footer 渲染在正文之外", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" footer={<button>确定</button>}>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByText("确定")).toBeTruthy();
  });

  it("关闭态不渲染内容", () => {
    render(
      <Dialog>
        <DialogContent title="不该出现">
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByText("不该出现")).toBeNull();
  });

  // #185：自动弹出的「陪跑型」浮层里，40% 黑 + 模糊是错的默认值。
  it("backdrop=false 不渲染遮罩（配 Root 的 modal={false} 才是真非模态）", () => {
    render(
      <Dialog open modal={false}>
        <DialogContent title="进度" backdrop={false}>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector(".fixed.inset-0.z-40")).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeTruthy();
  });

  it("backdropClassName 顶掉默认遮罩浓度（twMerge）", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" backdropClassName="bg-black/10 backdrop-blur-none">
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const backdrop = document.querySelector(".fixed.inset-0.z-40")!;
    expect(backdrop.className).toContain("bg-black/10");
    expect(backdrop.className).not.toContain("bg-black/40");
  });

  // #188：正文强制包滚动盒时，子级写 flex-1 拿不到确定高度，双栏各自滚动只能靠魔法 vh。
  it("scrollable=false：正文区不再滚动，改成列向 flex 容器把高度传给 children", () => {
    render(
      <Dialog open>
        <DialogContent title="选一份材料" scrollable={false}>
          <div data-testid="two-col" className="flex min-h-0 flex-1" />
        </DialogContent>
      </Dialog>,
    );
    const body = screen.getByTestId("two-col").parentElement!;
    expect(body.className).not.toContain("overflow-y-auto");
    expect(body.className).toContain("flex flex-col");
    expect(body.className).toContain("flex-1");
  });

  it("默认仍然是滚动盒（既有行为不变）", () => {
    render(
      <Dialog open>
        <DialogContent title="标题">
          <div data-testid="body-child" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("body-child").parentElement!.className).toContain("overflow-y-auto");
  });

  it("bodyClassName 追加到正文容器", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" bodyClassName="my-body">
          <div data-testid="body-child2" />
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByTestId("body-child2").parentElement!.className).toContain("my-body");
  });
});

// #272 与 DrawerContent 同源：铺满型对话框的可见 header 进不了 <h2>，需要 aria-* 与 extra。
describe("DialogContent 无障碍名与 extra 槽（#272）", () => {
  const popup = () => document.querySelector('[role="dialog"]') as HTMLElement;

  it("只传 title：aria-labelledby 仍指向 Dialog.Title（回归防护）", () => {
    // 新增的 aria-* 若写成常规属性，Base UI 的 mergeProps 会用 undefined 覆盖内部的 titleElementId。
    render(
      <Dialog open>
        <DialogContent title="导入数据">正文</DialogContent>
      </Dialog>,
    );
    const id = popup().getAttribute("aria-labelledby");
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)!.textContent).toBe("导入数据");
  });

  it("不传 title、只传 aria-label：对话框拿到名字，不渲染空标题", () => {
    render(
      <Dialog open>
        <DialogContent aria-label="通知" className="p-0 [--hl-overlay-pad:0px]">
          <div>列表</div>
        </DialogContent>
      </Dialog>,
    );
    expect(popup().getAttribute("aria-label")).toBe("通知");
    expect(popup().querySelector("h2")).toBeNull();
  });

  it("extra：操作是标题的兄弟，无障碍名里不含按钮文案", () => {
    render(
      <Dialog open>
        <DialogContent title="通知" extra={<button type="button">全部已读</button>}>
          列表
        </DialogContent>
      </Dialog>,
    );
    const h2 = popup().querySelector("h2")!;
    expect(h2.textContent).toBe("通知");
    expect(screen.getByText("全部已读").closest("h2")).toBeNull();
    expect(document.getElementById(popup().getAttribute("aria-labelledby")!)).toBe(h2);
  });

  it("titleClassName 走 twMerge", () => {
    render(
      <Dialog open>
        <DialogContent title="通知" titleClassName="text-base">
          正文
        </DialogContent>
      </Dialog>,
    );
    const cls = popup().querySelector("h2")!.className;
    expect(cls).toContain("text-base");
    expect(cls).not.toContain("text-lg");
  });
});

// #279：关闭键与 DrawerContent（#63）同形状同默认值 —— 只读详情型对话框（没有 footer、
// 正文没有关闭控件）此前唯一的可见退路只有点遮罩，键盘只剩 Esc，读屏没有「关闭」可达元素。
describe("DialogContent 关闭按钮（#279）", () => {
  const popup = () => document.querySelector('[role="dialog"]') as HTMLElement;

  it("默认渲染右上角关闭按钮，带无障碍名", () => {
    render(
      <Dialog open>
        <DialogContent title="审计日志详情">只读字段</DialogContent>
      </Dialog>,
    );
    expect(screen.getByLabelText("关闭")).toBeTruthy();
  });

  it("closeLabel 可覆盖无障碍名", () => {
    render(
      <Dialog open>
        <DialogContent title="详情" closeLabel="关闭详情">
          正文
        </DialogContent>
      </Dialog>,
    );
    expect(screen.getByLabelText("关闭详情")).toBeTruthy();
  });

  it("showClose=false 关掉（全局搜索框这类自带关闭手段的弹层）", () => {
    render(
      <Dialog open>
        <DialogContent title="搜索" showClose={false}>
          正文
        </DialogContent>
      </Dialog>,
    );
    expect(screen.queryByLabelText("关闭")).toBeNull();
  });

  it("点击关闭按钮真的关掉对话框", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent title="详情">正文</DialogContent>
      </Dialog>,
    );
    fireEvent.click(screen.getByLabelText("关闭"));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });

  it("showClose 时标题让出右上角（pr-10），关掉则不让", () => {
    render(
      <Dialog open>
        <DialogContent title="很长很长的标题">正文</DialogContent>
      </Dialog>,
    );
    expect(popup().querySelector("h2")!.className).toContain("pr-10");
    cleanup();
    render(
      <Dialog open>
        <DialogContent title="标题" showClose={false}>
          正文
        </DialogContent>
      </Dialog>,
    );
    expect(popup().querySelector("h2")!.className).not.toContain("pr-10");
  });

  it("extra + showClose：标题行让出右上角，extra 不被关闭按钮压住", () => {
    render(
      <Dialog open>
        <DialogContent title="通知" extra={<button type="button">全部已读</button>}>
          列表
        </DialogContent>
      </Dialog>,
    );
    expect(popup().querySelector("h2")!.parentElement!.className).toContain("pr-10");
  });
});

describe("DialogContent 关闭按钮的 locale 接线", () => {
  it("enUS 下无障碍名是 Close", async () => {
    const { ConfigProvider } = await import("../config/config-provider");
    const { enUS } = await import("../config/locale");
    render(
      <ConfigProvider locale={enUS}>
        <Dialog open>
          <DialogContent title="Details">body</DialogContent>
        </Dialog>
      </ConfigProvider>,
    );
    expect(screen.getByLabelText("Close")).toBeTruthy();
  });
});

// 可拖动：把手 = 标题行；位移写内联 left/top（不碰 translate/transform，见 dialog-drag.ts）。
// jsdom 没有布局：offsetLeft/offsetTop 与 getBoundingClientRect 全是 0，起点即 0px，
// 视口 1024×768 → 允许的位移区间是 [0, 1024] / [0, 768]，所以正向移动可见、负向被夹回 0。
describe("DialogContent draggable", () => {
  function press(el: Element, x: number, y: number) {
    fireEvent.pointerDown(el, { pointerId: 1, button: 0, clientX: x, clientY: y });
  }
  function move(el: Element, x: number, y: number) {
    fireEvent.pointerMove(el, { pointerId: 1, clientX: x, clientY: y });
  }

  it("默认不可拖：标题上没有把手标记，按住拖也不动", () => {
    render(
      <Dialog open>
        <DialogContent title="标题">
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    expect(document.querySelector("[data-drag-handle]")).toBeNull();
    const h2 = screen.getByText("标题");
    press(h2, 10, 10);
    move(h2, 50, 30);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(popup.style.left).toBe("");
    expect(popup.style.top).toBe("");
  });

  it("draggable：标题是把手（cursor-move + touch-none），按住拖动改 popup 的 left/top", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const h2 = screen.getByText("标题");
    expect(h2.hasAttribute("data-drag-handle")).toBe(true);
    expect(h2.className).toContain("cursor-move");
    expect(h2.className).toContain("touch-none");
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    press(h2, 10, 10);
    move(h2, 50, 30);
    expect(popup.style.left).toBe("40px");
    expect(popup.style.top).toBe("20px");
    // 松手后再动不跟
    fireEvent.pointerUp(h2, { pointerId: 1 });
    move(h2, 500, 500);
    expect(popup.style.left).toBe("40px");
  });

  // 遮罩让开（#346）：40% 黑 + 模糊与「挪开看后面」互相抵消，拖过之后遮罩必须变淡去模糊。
  it("拖过之后遮罩让开：标 data-dragged，浓度降到 10% 且不再模糊", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const h2 = screen.getByText("标题");
    const layer = document.querySelector<HTMLElement>(".fixed.inset-0")!;
    expect(layer.className).toContain("data-[dragged]:bg-black/10");
    expect(layer.className).toContain("data-[dragged]:backdrop-blur-none");
    expect(layer.hasAttribute("data-dragged")).toBe(false);
    // 只按下不算：点一下标题不该改变任何观感。
    press(h2, 10, 10);
    expect(layer.hasAttribute("data-dragged")).toBe(false);
    move(h2, 50, 30);
    expect(layer.hasAttribute("data-dragged")).toBe(true);
    // 松手后不撤回：挪开就是为了看后面，看完之前不能把遮罩糊回去。
    fireEvent.pointerUp(h2, { pointerId: 1 });
    expect(layer.hasAttribute("data-dragged")).toBe(true);
  });

  it("不可拖的对话框不挂让开规则，遮罩层次感不变", () => {
    render(
      <Dialog open>
        <DialogContent title="标题">
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const layer = document.querySelector<HTMLElement>(".fixed.inset-0")!;
    expect(layer.className).not.toContain("data-[dragged]");
  });

  it("backdrop={false} 时拖动照常，不去碰不存在的遮罩", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable backdrop={false}>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const h2 = screen.getByText("标题");
    press(h2, 10, 10);
    move(h2, 50, 30);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(popup.style.left).toBe("40px");
  });

  it("正文不是把手：按住正文拖不动", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const body = screen.getByText("正文");
    press(body, 10, 10);
    move(body, 50, 30);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(popup.style.left).toBe("");
  });

  it("有 extra 时整个标题行是把手，但行里的按钮自己吃按下、不起拖", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable extra={<button>刷新</button>}>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const h2 = screen.getByText("标题");
    const row = h2.parentElement!;
    expect(row.hasAttribute("data-drag-handle")).toBe(true);
    expect(h2.hasAttribute("data-drag-handle")).toBe(false);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;

    const btn = screen.getByText("刷新");
    press(btn, 10, 10);
    move(btn, 50, 30);
    expect(popup.style.left).toBe("");

    press(row, 10, 10);
    move(row, 50, 30);
    expect(popup.style.left).toBe("40px");
  });

  it("消费方自画 header：标 data-drag-handle 的元素就是把手", () => {
    render(
      <Dialog open>
        <DialogContent aria-label="通知" draggable>
          <div data-drag-handle>自画标题</div>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const handle = screen.getByText("自画标题");
    press(handle, 0, 0);
    move(handle, 15, 25);
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(popup.style.left).toBe("15px");
    expect(popup.style.top).toBe("25px");
  });

  it("整块不出视口：越界的位移被夹住", () => {
    render(
      <Dialog open>
        <DialogContent title="标题" draggable>
          <span>正文</span>
        </DialogContent>
      </Dialog>,
    );
    const popup = document.querySelector<HTMLElement>('[role="dialog"]')!;
    // 装一个真实尺寸：popup 居中 400×300，视口 1024×768 → 左上角 (312,234)。
    popup.getBoundingClientRect = () =>
      ({ left: 312, top: 234, right: 712, bottom: 534, width: 400, height: 300 }) as DOMRect;
    const h2 = screen.getByText("标题");
    press(h2, 400, 250);
    move(h2, -1000, 5000);
    // 起点 offsetLeft/offsetTop 在 jsdom 里是 0：允许区间 dx∈[-312,312]、dy∈[-234,234]
    expect(popup.style.left).toBe("-312px");
    expect(popup.style.top).toBe("234px");
  });

  it("嵌套对话框：内层拖动不带动外层", () => {
    render(
      <Dialog open>
        <DialogContent title="外层" draggable>
          <Dialog open>
            <DialogContent title="内层" draggable>
              <span>内层正文</span>
            </DialogContent>
          </Dialog>
        </DialogContent>
      </Dialog>,
    );
    // 内层模态开着时外层被 Base UI 标 inert / aria-hidden，按 role 查名字取不到，直接按 DOM 顺序拿。
    const [outer, inner] = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"]'));
    expect(outer.getAttribute("aria-labelledby")).toBe(screen.getByText("外层").id);
    expect(inner.getAttribute("aria-labelledby")).toBe(screen.getByText("内层").id);
    const innerTitle = screen.getByText("内层");
    press(innerTitle, 10, 10);
    move(innerTitle, 50, 30);
    expect(inner.style.left).toBe("40px");
    expect(outer.style.left).toBe("");
  });
});
