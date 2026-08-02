import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AuthPanel } from "./auth-panel";

const root = (ui: React.ReactElement) => render(ui).container.firstElementChild as HTMLElement;

describe("AuthPanel", () => {
  it("渲染品牌 / 标题 / 说明 / 卖点 / 底部", () => {
    const { getByText, getAllByRole } = render(
      <AuthPanel
        brand={<span>瀚云</span>}
        title="把想法送上全球边缘"
        description="五分钟创建账号"
        highlights={["免费开始", "秒级上线"]}
        footer="京ICP备 000000 号"
      />,
    );
    expect(getByText("瀚云")).toBeTruthy();
    expect(getByText("把想法送上全球边缘")).toBeTruthy();
    expect(getByText("五分钟创建账号")).toBeTruthy();
    expect(getAllByRole("listitem")).toHaveLength(2);
    expect(getByText("京ICP备 000000 号")).toBeTruthy();
  });

  it("标题是真 heading，级别可调（视觉尺寸不跟着变）", () => {
    const { getByRole } = render(<AuthPanel title="欢迎回来" titleLevel={1} />);
    expect(getByRole("heading", { level: 1, name: "欢迎回来" })).toBeTruthy();
  });

  it("默认 level=2", () => {
    const { getByRole } = render(<AuthPanel title="欢迎回来" />);
    expect(getByRole("heading", { level: 2 })).toBeTruthy();
  });

  // 这正是本组件存在的理由：渐变配方收进库里，消费方不再裸写 inline style（#71）。
  it("默认 radial 渐变：token 混色，不写死颜色字面量", () => {
    const bg = root(<AuthPanel title="x" />).style.background;
    expect(bg).toContain("radial-gradient");
    expect(bg).toContain("color-mix");
    expect(bg).toContain("var(--color-primary)");
    expect(bg).toContain("var(--color-bg)");
  });

  it("color 走 resolveTone（与 Brand.color / Dot.color 同路）", () => {
    expect(root(<AuthPanel color="chart-2" />).style.background).toContain("var(--color-chart-2)");
  });

  it("任意 CSS 色也接得住", () => {
    expect(root(<AuthPanel color="#0af" />).style.background).toContain("#0af");
  });

  it("linear / mesh 各自的配方", () => {
    expect(root(<AuthPanel gradient="linear" />).style.background).toContain("linear-gradient");
    const mesh = root(<AuthPanel gradient="mesh" />).style.background;
    // 三处光斑叠加
    expect(mesh.match(/radial-gradient/g)).toHaveLength(3);
  });

  it("gradient=\"none\" 不写 background，退回 surface 底（留给自叠图案）", () => {
    const el = root(<AuthPanel gradient="none" />);
    expect(el.style.background).toBe("");
    expect(el.className).toContain("bg-surface");
  });

  it("消费方 style 仍可覆盖（逃生口）", () => {
    const el = root(<AuthPanel style={{ background: "url(/hero.jpg)" }} />);
    expect(el.style.background).toContain("hero.jpg");
  });

  it("不传任何内容也不炸（只出一块渐变底）", () => {
    expect(root(<AuthPanel />)).toBeTruthy();
  });

  it("高度交给外层栅格（自己只 h-full，不定死 dvh）", () => {
    const el = root(<AuthPanel title="x" />);
    expect(el.className).toContain("h-full");
    expect(el.className).not.toContain("h-dvh");
  });

  it("透传 className 与其它 div 属性", () => {
    const el = root(<AuthPanel className="rounded-xl" data-testid="panel" />);
    expect(el.className).toContain("rounded-xl");
    expect(el.getAttribute("data-testid")).toBe("panel");
  });

  it("children 作为中部自由内容渲染", () => {
    const { getByTestId } = render(
      <AuthPanel title="x">
        <div data-testid="art">插画</div>
      </AuthPanel>,
    );
    expect(getByTestId("art")).toBeTruthy();
  });
});
