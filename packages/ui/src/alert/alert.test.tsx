import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { alertVariants, Alert } from "./alert";

describe("alertVariants", () => {
  it("默认 soft + info（/12 alpha 底 + primary accent）", () => {
    const c = alertVariants({});
    expect(c).toContain("bg-primary/12");
    expect(c).toContain("text-primary");
  });
  it("variant outline 带 border", () => {
    expect(alertVariants({ variant: "outline" })).toContain("border");
  });
  it("compound: soft danger 用 danger/12 底", () => {
    expect(alertVariants({ variant: "soft", tone: "danger" })).toContain("bg-danger/12");
  });
  it("compound: outline danger 用 border-danger + text-danger", () => {
    const c = alertVariants({ variant: "outline", tone: "danger" });
    expect(c).toContain("border-danger");
    expect(c).toContain("text-danger");
  });
  it("compound: neutral 用 surface/foreground 系（不引未注册色）", () => {
    expect(alertVariants({ variant: "soft", tone: "neutral" })).toContain("bg-surface-hover");
    expect(alertVariants({ variant: "outline", tone: "neutral" })).toContain("border-border");
  });
  it("compound: success 用 success token（soft /12 + outline border）", () => {
    expect(alertVariants({ variant: "soft", tone: "success" })).toContain("bg-success/12");
    expect(alertVariants({ variant: "outline", tone: "success" })).toContain("border-success");
  });
  it("compound: warning 用 warning token（soft /12 + outline border）", () => {
    expect(alertVariants({ variant: "soft", tone: "warning" })).toContain("bg-warning/12");
    expect(alertVariants({ variant: "outline", tone: "warning" })).toContain("border-warning");
  });
});

describe("Alert", () => {
  it("渲染 title + description(children)", () => {
    const { getByText } = render(<Alert title="标题">正文内容</Alert>);
    expect(getByText("标题")).toBeTruthy();
    expect(getByText("正文内容")).toBeTruthy();
  });

  it("title 作 ReactNode 渲染，不落成 DOM 的 title 属性", () => {
    const { container, getByText } = render(<Alert title="提示标题">x</Alert>);
    expect(getByText("提示标题")).toBeTruthy();
    // 关键：ReactNode title 不应写成根 div 的 HTML title 属性
    expect(container.querySelector("[role]")!.hasAttribute("title")).toBe(false);
  });

  it("role 由 tone 派生：danger → alert", () => {
    const { container } = render(<Alert tone="danger">出错了</Alert>);
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it("role 由 tone 派生：默认(info) / neutral → status", () => {
    const { container: a } = render(<Alert>提示</Alert>);
    expect(a.querySelector('[role="status"]')).toBeTruthy();
    const { container: b } = render(<Alert tone="neutral">中性</Alert>);
    expect(b.querySelector('[role="status"]')).toBeTruthy();
  });

  it("props.role 可显式覆盖派生 role", () => {
    const { container } = render(
      <Alert tone="danger" role="alertdialog">
        x
      </Alert>,
    );
    expect(container.querySelector('[role="alertdialog"]')).toBeTruthy();
  });

  it("传 icon 时渲染 icon slot", () => {
    const { getByTestId } = render(
      <Alert icon={<svg data-testid="ic" />} title="带图标">
        x
      </Alert>,
    );
    expect(getByTestId("ic")).toBeTruthy();
  });

  it("不传 title / 不传 icon 时不渲染对应节点（仅 description）", () => {
    const { container } = render(<Alert>只有正文</Alert>);
    // 根容器内直接子节点只有 content 容器（无 icon span）
    expect(container.querySelector("svg")).toBeNull();
  });

  it("传 action 时渲染动作 slot", () => {
    const { getByText } = render(
      <Alert title="更新" action={<button>刷新</button>}>
        x
      </Alert>,
    );
    expect(getByText("刷新")).toBeTruthy();
  });

  it("传 onClose 渲染关闭按钮，点击触发回调", () => {
    const onClose = vi.fn();
    const { getByLabelText } = render(
      <Alert title="成功" onClose={onClose}>
        x
      </Alert>,
    );
    const btn = getByLabelText("关闭");
    fireEvent.click(btn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closeLabel 可自定义关闭按钮无障碍标签", () => {
    const { getByLabelText } = render(<Alert onClose={() => {}} closeLabel="dismiss" />);
    expect(getByLabelText("dismiss")).toBeTruthy();
  });

  it("不传 action / onClose 时不渲染右侧操作区", () => {
    const { queryByRole } = render(<Alert title="纯提示">x</Alert>);
    expect(queryByRole("button")).toBeNull();
  });

  // tone 取值与 Tag / Button / Badge 对齐：本组件早于全库统一，历史上只有 info 没有 brand
  describe("tone=brand（与 info 同配方）", () => {
    it("soft brand 与 soft info 产出同一套色", () => {
      expect(alertVariants({ variant: "soft", tone: "brand" })).toBe(
        alertVariants({ variant: "soft", tone: "info" }),
      );
    });
    it("outline brand 与 outline info 产出同一套色", () => {
      expect(alertVariants({ variant: "outline", tone: "brand" })).toBe(
        alertVariants({ variant: "outline", tone: "info" }),
      );
    });
    it("组件上直接用 tone=brand 能渲染出主色皮肤", () => {
      const { container } = render(
        <Alert tone="brand" title="品牌">
          x
        </Alert>,
      );
      expect(container.firstElementChild!.className).toContain("bg-primary/12");
    });
  });
});
