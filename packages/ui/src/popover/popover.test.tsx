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
    const popup = document.querySelector(".bg-surface.border-border");
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
