import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

describe("Tooltip", () => {
  it("闭合态: 触发器在, 浮层文本不在 DOM", () => {
    render(
      <Tooltip>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent>提示内容</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("悬停")).toBeTruthy();
    expect(screen.queryByText("提示内容")).toBeNull();
  });

  it("受控 open: 浮层 Portal mount + 反相气泡皮肤(bg-foreground/text-bg)", () => {
    render(
      <Tooltip open>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent>提示内容</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("提示内容")).toBeTruthy();
    const popup = document.querySelector(".bg-foreground.text-bg");
    expect(popup).not.toBeNull();
    expect(popup!.textContent).toContain("提示内容");
  });

  // a11y 串联(aria-describedby)走 hover/focus 交互路径，受控 open 不触发 → 留给 Playwright；
  // 单测守组件真正负责的契约：side/align 透传到 Positioner + open 态 data 属性。
  it("side/align 透传 Positioner: 浮层带 data-open + data-side/data-align", () => {
    render(
      <Tooltip open>
        <TooltipTrigger render={<button>悬停</button>} />
        <TooltipContent side="right" align="start">
          提示内容
        </TooltipContent>
      </Tooltip>,
    );
    const popup = document.querySelector(".bg-foreground.text-bg")!;
    expect(popup.getAttribute("data-open")).toBe("");
    expect(popup.getAttribute("data-side")).toBe("right");
    expect(popup.getAttribute("data-align")).toBe("start");
  });
});
