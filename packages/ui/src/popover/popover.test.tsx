import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from "./popover";

describe("Popover", () => {
  it("闭合态: 触发器在, 面板内容不在 DOM", () => {
    render(
      <Popover>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("打开")).toBeTruthy();
    expect(screen.queryByText("标题")).toBeNull();
    expect(screen.queryByText("正文")).toBeNull();
  });

  it("受控 open: title/description/children 渲染 + surface 面板皮肤", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题" description="说明">
          正文
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("标题")).toBeTruthy();
    expect(screen.getByText("说明")).toBeTruthy();
    expect(screen.getByText("正文")).toBeTruthy();
    const popup = document.querySelector(".bg-surface.border-hairline");
    expect(popup).not.toBeNull();
  });

  it("PopoverClose 在面板内渲出可点按钮", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">
          <PopoverClose render={<button>关闭</button>} />
        </PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("关闭")).toBeTruthy();
  });

  // #172：mt-2 是「与上方标题/说明拉开距离」，没有标题也没有说明时它变成顶部一条消不掉的空白。
  it("无 title/description 时 children 包裹层不带 mt-2（有则带）", () => {
    const { unmount } = render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent>正文</PopoverContent>
      </Popover>,
    );
    const bare = screen.getByText("正文");
    expect(bare.className).toContain("text-sm");
    expect(bare.className).not.toContain("mt-2");
    unmount();

    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("正文").className).toContain("mt-2");
  });

  it("plain: 不渲染内层皮肤 div，children 直接进 Popup", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent plain className="p-0">
          <div data-testid="body">贴边内容</div>
        </PopoverContent>
      </Popover>,
    );
    const parent = screen.getByTestId("body").parentElement!;
    expect(parent.className).toContain("bg-surface"); // 父级即 Popup 本体
    expect(parent.className).not.toContain("text-sm");
  });

  it("arrow: 默认渲染，arrow={false} 不渲染", () => {
    const { unmount } = render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    expect(document.querySelector(".h-2.w-2")).not.toBeNull();
    unmount();

    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题" arrow={false}>
          正文
        </PopoverContent>
      </Popover>,
    );
    expect(document.querySelector(".h-2.w-2")).toBeNull();
  });

  it("open 态触发器 aria-expanded=true + aria-haspopup", () => {
    render(
      <Popover open>
        <PopoverTrigger render={<button>打开</button>} />
        <PopoverContent title="标题">正文</PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByText("打开");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-haspopup")).toBeTruthy();
  });
});
