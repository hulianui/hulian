import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
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
