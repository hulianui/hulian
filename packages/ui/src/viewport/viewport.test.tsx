import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Viewport } from "./viewport";

afterEach(cleanup);

function frame(c: HTMLElement) {
  return c.querySelector("[data-device]") as HTMLElement;
}

describe("Viewport", () => {
  it("渲染子内容并建立 @container 容器查询上下文", () => {
    const { container, getByText } = render(
      <Viewport>
        <div>内容</div>
      </Viewport>,
    );
    expect(getByText("内容")).toBeTruthy();
    expect(frame(container).className).toContain("@container");
  });

  it("device 预设映射宽度(定值)：phone=390 / tablet=768 / web=1280，maxWidth 恒 100%", () => {
    const { container, rerender } = render(
      <Viewport device="phone">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.width).toBe("390px");
    expect(frame(container).style.maxWidth).toBe("100%");
    rerender(
      <Viewport device="tablet">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.width).toBe("768px");
    rerender(
      <Viewport device="web">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.width).toBe("1280px");
  });

  it("data-device 反映当前设备", () => {
    const { container } = render(
      <Viewport device="tablet">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).getAttribute("data-device")).toBe("tablet");
  });

  it("width 覆盖 device 预设（数字转 px）", () => {
    const { container } = render(
      <Viewport device="phone" width={320}>
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.width).toBe("320px");
  });

  it("controls 渲染设备切换器，点击切换(非受控)并回调", () => {
    const onDeviceChange = vi.fn();
    const { container, getByText } = render(
      <Viewport controls defaultDevice="web" onDeviceChange={onDeviceChange}>
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.width).toBe("1280px");
    fireEvent.click(getByText("手机"));
    expect(onDeviceChange).toHaveBeenCalledWith("phone");
    expect(frame(container).style.width).toBe("390px");
  });

  it("受控 device 下点击不内部切换，仅回调", () => {
    const onDeviceChange = vi.fn();
    const { container, getByText } = render(
      <Viewport controls device="web" onDeviceChange={onDeviceChange}>
        <div>x</div>
      </Viewport>,
    );
    fireEvent.click(getByText("平板"));
    expect(onDeviceChange).toHaveBeenCalledWith("tablet");
    expect(frame(container).style.width).toBe("1280px"); // 受控未变(仍 web)
  });

  it("framed：phone 加设备边框，web 细边框", () => {
    const { container, rerender } = render(
      <Viewport device="phone">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).className).toContain("border-[6px]");
    rerender(
      <Viewport device="web">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).className).toContain("border-border");
  });

  it("name 设置具名容器 container-name", () => {
    const { container } = render(
      <Viewport name="main">
        <div>x</div>
      </Viewport>,
    );
    expect(frame(container).style.containerName).toBe("main");
  });
});
