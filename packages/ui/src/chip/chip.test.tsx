import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Chip } from "./chip";
import { ConfigProvider, enUS } from "../config";
import { expectMemoSkipsSubtree } from "../../test/memo-guard";

describe("Chip", () => {
  it("稳定父更新时跳过标签子树", async () => {
    await expectMemoSkipsSubtree(() => <Chip tone="brand">稳定标签</Chip>);
  });

  it("渲染内容", () => {
    const { getByText } = render(<Chip>标签</Chip>);
    expect(getByText("标签")).toBeTruthy();
  });

  it("无 onClose 时不渲染关闭按钮", () => {
    const { queryByLabelText } = render(<Chip>标签</Chip>);
    expect(queryByLabelText("移除")).toBeNull();
  });

  it("有 onClose 时渲染关闭按钮，点击触发回调", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(<Chip onClose={fn}>标签</Chip>);
    fireEvent.click(getByLabelText("移除"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("enUS localizes the close button accessible label", () => {
    const fn = vi.fn();
    const { getByLabelText } = render(
      <ConfigProvider locale={enUS}>
        <Chip onClose={fn}>Tag</Chip>
      </ConfigProvider>,
    );
    fireEvent.click(getByLabelText("Remove"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("a legacy custom locale without chip keeps the Chinese close label", () => {
    const locale = { ...enUS, components: { ...enUS.components!, chip: undefined } };
    const { getByLabelText } = render(
      <ConfigProvider locale={locale}>
        <Chip onClose={() => {}}>Tag</Chip>
      </ConfigProvider>,
    );
    expect(getByLabelText("移除")).toBeTruthy();
  });

  it("variant=outline tone=danger 皮肤类", () => {
    const { container } = render(
      <Chip variant="outline" tone="danger">
        x
      </Chip>,
    );
    expect(container.firstElementChild!.className).toContain("border-danger");
  });

  it("dot 渲染前导圆点", () => {
    const { container } = render(<Chip dot>x</Chip>);
    expect(container.querySelector(".rounded-full.bg-primary")).toBeTruthy();
  });

  it("透传 className", () => {
    const { container } = render(<Chip className="my-chip">x</Chip>);
    expect(container.firstElementChild!.classList.contains("my-chip")).toBe(true);
  });

  it("渲染 startContent / endContent", () => {
    const { getByText } = render(
      <Chip startContent={<i>start</i>} endContent={<i>end</i>}>
        标签
      </Chip>,
    );
    expect(getByText("start")).toBeTruthy();
    expect(getByText("end")).toBeTruthy();
  });

  it("avatar 存在时不渲染 dot 也不渲染 startContent", () => {
    const { getByText, queryByText, container } = render(
      <Chip dot avatar={<span>头像</span>} startContent={<i>start</i>}>
        标签
      </Chip>,
    );
    expect(getByText("头像")).toBeTruthy();
    expect(queryByText("start")).toBeNull();
    expect(container.querySelector(".size-1\\.5")).toBeNull();
  });

  it("isDisabled 降透明度且关闭按钮禁用", () => {
    const fn = vi.fn();
    const { getByLabelText, container } = render(
      <Chip isDisabled onClose={fn}>
        标签
      </Chip>,
    );
    expect(container.firstElementChild!.className).toContain("opacity-50");
    const btn = getByLabelText("移除") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
    fireEvent.click(btn);
    expect(fn).not.toHaveBeenCalled();
  });
});
