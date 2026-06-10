import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { ImageCropper } from "./image-cropper";

// 1×1 透明 GIF（jsdom 不真正解码，仅作合法 src）
const IMG = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

describe("ImageCropper", () => {
  it("渲染确认/取消按钮与缩放滑杆", () => {
    const { getByText, getByLabelText } = render(
      <ImageCropper image={IMG} onCropped={() => {}} onCancel={() => {}} />,
    );
    expect(getByText("确认")).toBeTruthy();
    expect(getByText("取消")).toBeTruthy();
    expect(getByLabelText("缩放")).toBeTruthy();
  });

  it("不传 onCancel 则无取消按钮", () => {
    const { queryByText } = render(<ImageCropper image={IMG} onCropped={() => {}} />);
    expect(queryByText("取消")).toBeNull();
  });

  it("文案可配", () => {
    const { getByText } = render(
      <ImageCropper image={IMG} onCropped={() => {}} onCancel={() => {}} confirmLabel="用这张" cancelLabel="再选" />,
    );
    expect(getByText("用这张")).toBeTruthy();
    expect(getByText("再选")).toBeTruthy();
  });

  it("取消按钮触发 onCancel", () => {
    const onCancel = vi.fn();
    const { getByText } = render(<ImageCropper image={IMG} onCropped={() => {}} onCancel={onCancel} />);
    fireEvent.click(getByText("取消"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("图片未加载完成（无裁剪区域）时确认按钮禁用", () => {
    const { getByText } = render(<ImageCropper image={IMG} onCropped={() => {}} />);
    const btn = getByText("确认").closest("button")!;
    expect(btn.disabled).toBe(true);
  });
});
