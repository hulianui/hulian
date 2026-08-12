import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Tag } from "./tag";
import { ConfigProvider, enUS } from "../config";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Tag", () => {
  it("稳定父更新时跳过标签子树", async () => {
    await expectMemoSkipsSubtree(() => <Tag tone="success">已通过</Tag>);
  });

  it("渲染内容", () => {
    const { getByText } = render(<Tag>状态</Tag>);
    expect(getByText("状态")).toBeTruthy();
  });

  it("默认 tone=neutral soft 皮肤", () => {
    const { container } = render(<Tag>x</Tag>);
    expect(container.firstElementChild!.className).toContain("text-muted-foreground");
  });

  it("tone=success outline 皮肤类", () => {
    const { container } = render(
      <Tag variant="outline" tone="success">
        x
      </Tag>,
    );
    expect(container.firstElementChild!.className).toContain("border-success");
  });

  // #232：info 曾经只有 Alert / toast 有，Tag 缺这一档，于是「当前处于什么模式」这类中性事实
  // 只能退到 neutral（灰得读不出来）或借 brand（紫色，与主 CTA 抢注意力）。
  // 判据是「与其余五档同构」而不是「有个 info 就行」——半档（只有 soft 有）等于把选型负担推回消费方。
  it("tone=info 的三个 variant 与其余五档同构", () => {
    for (const [variant, expected] of [
      ["soft", ["bg-info/12", "text-info"]],
      ["solid", ["bg-info", "text-info-foreground"]],
      ["outline", ["border-info", "text-info"]],
    ] as const) {
      const { container, unmount } = render(
        <Tag variant={variant} tone="info">
          外接浏览器模式
        </Tag>,
      );
      const cls = container.firstElementChild!.className;
      for (const token of expected) expect(cls).toContain(token);
      unmount();
    }
  });

  // info 与 brand 是两个语义色不是两种叫法（#173 起 tokens 有独立的 --color-info）。
  // 这条钉住「没有偷偷把 info 做成 brand 的别名」——那正是 Alert 在 #173 之前的形态。
  it("tone=info 不落在主色上", () => {
    const { container } = render(<Tag tone="info">x</Tag>);
    const cls = container.firstElementChild!.className;
    expect(cls).not.toContain("primary");
  });

  it("dot 颜色也覆盖 info（圆点色随 tone，缺一档就是无声退回灰点）", () => {
    const { container } = render(
      <Tag dot tone="info">
        x
      </Tag>,
    );
    expect(container.querySelector(".rounded-full.bg-info")).toBeTruthy();
  });

  it("dot 渲染状态圆点（颜色随 tone）", () => {
    const { container } = render(
      <Tag dot tone="success">
        x
      </Tag>,
    );
    expect(container.querySelector(".rounded-full.bg-success")).toBeTruthy();
  });

  it("pulse 渲染呼吸动画层", () => {
    const { container } = render(
      <Tag dot pulse tone="brand">
        x
      </Tag>,
    );
    expect(container.querySelector(".animate-ping")).toBeTruthy();
  });

  it("pulse 仅在 dot 为真时生效", () => {
    const { container } = render(
      <Tag pulse tone="brand">
        x
      </Tag>,
    );
    expect(container.querySelector(".animate-ping")).toBeNull();
  });

  it("icon 存在时不渲染 dot", () => {
    const { getByText, container } = render(
      <Tag dot icon={<i>ic</i>} tone="success">
        x
      </Tag>,
    );
    expect(getByText("ic")).toBeTruthy();
    expect(container.querySelector(".size-1\\.5")).toBeNull();
  });

  it("无 onClose 时不渲染关闭按钮", () => {
    const { queryByLabelText } = render(<Tag>x</Tag>);
    expect(queryByLabelText("移除")).toBeNull();
  });

  it("有 onClose 时点击触发回调", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Tag onClose={fn}>x</Tag>);
    fireEvent.click(getByLabelText("移除"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("enUS localizes the close button accessible label", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Tag onClose={fn}>Status</Tag>
      </ConfigProvider>,
    );
    fireEvent.click(getByLabelText("Remove"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("a legacy custom locale without tag keeps the Chinese close label", () => {
    const locale = { ...enUS, components: { ...enUS.components!, tag: undefined } };
    const { getByLabelText } = render(
      <ConfigProvider locale={locale}>
        <Tag onClose={() => {}}>Status</Tag>
      </ConfigProvider>,
    );
    expect(getByLabelText("移除")).toBeTruthy();
  });

  it("isDisabled 降透明度且关闭按钮禁用不触发", () => {
    const fn = vi.fn();
    const { getByLabelText, container } = render(
      <Tag isDisabled onClose={fn}>
        x
      </Tag>,
    );
    expect(container.firstElementChild!.className).toContain("opacity-50");
    const btn = getByLabelText("移除") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(fn).not.toHaveBeenCalled();
  });

  it("透传 className", () => {
    const { container } = render(<Tag className="my-tag">x</Tag>);
    expect(container.firstElementChild!.classList.contains("my-tag")).toBe(true);
  });

  // #148：TagProps 曾是封闭接口，title / data-* / aria-* / id 一个都传不了，
  // 而状态标签恰恰最需要 title 做 hover 全文（表格里显示「Word」、title 是完整 MIME）。
  it("透传 span 原生属性（title / data-* / aria-* / id）", () => {
    const { container } = render(
      <Tag title="application/pdf" id="mime" data-testid="mime-tag" aria-label="文件类型">
        PDF
      </Tag>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("title")).toBe("application/pdf");
    expect(el.id).toBe("mime");
    expect(el.dataset.testid).toBe("mime-tag");
    expect(el.getAttribute("aria-label")).toBe("文件类型");
  });

  // 组件自己的 aria-disabled 仍然可被调用方覆盖（rest 在后），但默认态不受影响。
  it("isDisabled 与透传属性并存", () => {
    const { container } = render(
      <Tag isDisabled title="t">
        x
      </Tag>,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("aria-disabled")).toBe("true");
    expect(el.getAttribute("title")).toBe("t");
  });
});
