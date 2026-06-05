import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { ProfileCard } from "./profile-card";

// mock motion/react 的 useReducedMotion，覆盖 reduced-motion 分支（默认 false）。
const reduce = { value: false };
vi.mock("motion/react", () => ({
  useReducedMotion: () => reduce.value,
}));

describe("ProfileCard", () => {
  it("默认渲染根容器 + 卡牌主体，姓名/职位/handle 都出现（jsdom 无真实布局/RAF）", () => {
    reduce.value = false;
    const { container, getByText, getByRole } = render(<ProfileCard />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).not.toBeNull();
    expect(root.className).toContain("[perspective:520px]");
    expect(getByText("瑚琏")).not.toBeNull();
    expect(getByText("前端工程师")).not.toBeNull();
    expect(getByText("@hulianui")).not.toBeNull();
    expect(getByRole("button", { name: /联系 瑚琏/ })).not.toBeNull();
  });

  it("无 avatarUrl 时落「姓名首字母」占位，不渲染 img", () => {
    reduce.value = false;
    const { container, getAllByText } = render(<ProfileCard name="林屿" />);
    // CJK 取首字符
    expect(getAllByText("林").length).toBeGreaterThan(0);
    expect(container.querySelector("img")).toBeNull();
  });

  it("全息层带 hulian-profile-card 动画类 + motion-reduce 禁用类", () => {
    reduce.value = false;
    const { container } = render(<ProfileCard />);
    const shine = container.querySelector("[data-shine]") as HTMLElement;
    expect(shine).not.toBeNull();
    expect(shine.className).toContain("[animation:hulian-profile-card");
    expect(shine.className).toContain("motion-reduce:[animation:none]");
  });

  it("glowColor token 与 aspectRatio 写入根容器 CSS 变量", () => {
    reduce.value = false;
    const { container } = render(
      <ProfileCard glowColor="var(--color-chart-3)" aspectRatio={0.66} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--glow")).toBe("var(--color-chart-3)");
    expect(root.style.getPropertyValue("--card-aspect")).toBe("0.66");
  });

  it("reduced-motion 时不挂指针交互（无 onPointerMove），但内容 DOM 不变", () => {
    reduce.value = true;
    const { container, getByText } = render(
      <ProfileCard enableTilt showUserInfo={false} />,
    );
    // 内容仍在
    expect(getByText("瑚琏")).not.toBeNull();
    // 全息层仍渲染（DOM 跨两态一致），仅动画被 motion-reduce 类禁用
    expect(container.querySelector("[data-shine]")).not.toBeNull();
    reduce.value = false;
  });

  it("className 与 props 透传到根容器，showUserInfo=false 时无联系按钮", () => {
    reduce.value = false;
    const { container } = render(
      <ProfileCard className="test-pc-class" showUserInfo={false} data-testid="pc" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain("test-pc-class");
    expect(root.getAttribute("data-testid")).toBe("pc");
    expect(container.querySelector("button")).toBeNull();
  });
});
