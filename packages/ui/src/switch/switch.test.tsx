import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Switch } from "./switch";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Switch", () => {
  it("稳定父更新时跳过 Switch 子树", async () => {
    await expectMemoSkipsSubtree(() => <Switch aria-label="接收通知" defaultChecked />);
  });

  it("渲染 role=switch，aria-label 透传", () => {
    const { getByRole } = render(<Switch aria-label="接收通知" />);
    expect(getByRole("switch", { name: "接收通知" })).toBeTruthy();
  });

  it("点击切换并回调", () => {
    const onCheckedChange = vi.fn();
    const { getByRole } = render(<Switch aria-label="s" onCheckedChange={onCheckedChange} />);
    fireEvent.click(getByRole("switch"));
    // Base UI 回调第二参是事件详情，这里只关心新值
    expect(onCheckedChange.mock.calls[0][0]).toBe(true);
  });

  it("disabled 不响应点击", () => {
    const onCheckedChange = vi.fn();
    const { getByRole } = render(
      <Switch aria-label="s" disabled onCheckedChange={onCheckedChange} />,
    );
    fireEvent.click(getByRole("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  // 尺寸开关：此前只有一档 24px 高，移动端低于触控目标推荐值且无处可调
  describe("size", () => {
    it("默认 md（h-6 w-10），与加 size 之前一致", () => {
      const { getByRole } = render(<Switch aria-label="s" />);
      const cls = getByRole("switch").className;
      expect(cls).toContain("h-6");
      expect(cls).toContain("w-10");
    });

    it("sm / lg 各自换轨道与旋钮尺寸", () => {
      const sm = render(<Switch aria-label="s" size="sm" />);
      expect(sm.getByRole("switch").className).toContain("h-5");
      expect(sm.container.querySelector("span[class*='size-4']")).toBeTruthy();
      sm.unmount();

      const lg = render(<Switch aria-label="s" size="lg" />);
      expect(lg.getByRole("switch").className).toContain("h-7");
      expect(lg.container.querySelector("span[class*='size-6']")).toBeTruthy();
    });
  });

  describe("touchTarget", () => {
    it("默认关：不加伪元素命中区", () => {
      const { getByRole } = render(<Switch aria-label="s" />);
      expect(getByRole("switch").className).not.toContain("before:h-11");
    });

    it("开启后扩出 44px 命中区，视觉尺寸不变", () => {
      const { getByRole } = render(<Switch aria-label="s" touchTarget />);
      const cls = getByRole("switch").className;
      expect(cls).toContain("before:h-11");
      expect(cls).toContain("h-6"); // 视觉仍是 md
    });
  });

  it("透传 className", () => {
    const { getByRole } = render(<Switch aria-label="s" className="my-switch" />);
    expect(getByRole("switch").classList.contains("my-switch")).toBe(true);
  });

  // #183：Switch 此前连 label 都没有，写 children 会被显式的 Thumb 盖掉——一个字都不渲染。
  it("label / children 渲染成轨道右侧文案并与开关关联", () => {
    const { getByRole } = render(<Switch label="启用推送" />);
    expect(getByRole("switch", { name: "启用推送" })).toBeTruthy();

    const { getByRole: r2 } = render(<Switch>启用短信</Switch>);
    expect(r2("switch", { name: "启用短信" })).toBeTruthy();
  });

  it("不给 label / children 时 DOM 与此前逐字一致（只有轨道，无 <label> 外壳）", () => {
    const { container } = render(<Switch aria-label="s" />);
    expect(container.querySelector("label")).toBeNull();
  });
});
