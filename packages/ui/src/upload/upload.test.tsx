import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { Upload, matchesAccept } from "./upload";
import type { UploadFile } from "./upload.types";

const file = (name: string, type = "", size = 10) => {
  const f = new File([new Uint8Array(size)], name, { type });
  return f;
};

function fileInput(container: HTMLElement) {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("matchesAccept", () => {
  it("无 accept → 全通过", () => {
    expect(matchesAccept(file("a.png", "image/png"))).toBe(true);
  });
  it("扩展名匹配", () => {
    expect(matchesAccept(file("a.pdf", "application/pdf"), ".pdf")).toBe(true);
    expect(matchesAccept(file("a.png", "image/png"), ".pdf")).toBe(false);
  });
  it("mime 通配 image/*", () => {
    expect(matchesAccept(file("a.png", "image/png"), "image/*")).toBe(true);
    expect(matchesAccept(file("a.pdf", "application/pdf"), "image/*")).toBe(false);
  });
  it("精确 mime", () => {
    expect(matchesAccept(file("a.png", "image/png"), "image/png")).toBe(true);
    expect(matchesAccept(file("a.gif", "image/gif"), "image/png")).toBe(false);
  });
});

describe("Upload", () => {
  it("选择文件触发 onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(<Upload multiple onSelect={onSelect} />);
    fireEvent.change(fileInput(container), { target: { files: [file("a.png", "image/png")] } });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toHaveLength(1);
  });

  it("超 maxSize → onReject reason=size", () => {
    const onSelect = vi.fn();
    const onReject = vi.fn();
    const { container } = render(<Upload maxSize={5} onSelect={onSelect} onReject={onReject} />);
    fireEvent.change(fileInput(container), { target: { files: [file("big.png", "image/png", 100)] } });
    expect(onSelect).not.toHaveBeenCalled();
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "size" })]);
  });

  it("不符 accept → onReject reason=type", () => {
    const onReject = vi.fn();
    const { container } = render(<Upload accept="image/*" onReject={onReject} />);
    fireEvent.change(fileInput(container), { target: { files: [file("a.pdf", "application/pdf")] } });
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "type" })]);
  });

  it("multiple=false 只取首个", () => {
    const onSelect = vi.fn();
    const { container } = render(<Upload onSelect={onSelect} />);
    fireEvent.change(fileInput(container), {
      target: { files: [file("a.png", "image/png"), file("b.png", "image/png")] },
    });
    expect(onSelect.mock.calls[0][0]).toHaveLength(1);
  });

  it("渲染受控文件列表并触发 onRemove", () => {
    const onRemove = vi.fn();
    const files: UploadFile[] = [{ id: "x", name: "doc.pdf", size: 2048, status: "success" }];
    const { getByText, getByLabelText } = render(<Upload files={files} onRemove={onRemove} />);
    expect(getByText("doc.pdf")).toBeTruthy();
    fireEvent.click(getByLabelText("移除 doc.pdf"));
    expect(onRemove).toHaveBeenCalledWith("x");
  });

  it("uploading 状态渲染进度条", () => {
    const files: UploadFile[] = [{ id: "x", name: "v.mov", status: "uploading", progress: 40 }];
    const { container } = render(<Upload files={files} />);
    const bar = container.querySelector('[style*="width"]') as HTMLElement;
    expect(bar.style.width).toBe("40%");
  });

  it("disabled 落区不可聚焦", () => {
    const { container } = render(<Upload disabled />);
    const zone = container.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute("tabindex")).toBe("-1");
  });

  it("button 形态渲染按钮", () => {
    const { getByText } = render(<Upload variant="button" buttonLabel="上传附件" />);
    expect(getByText("上传附件")).toBeTruthy();
  });
});
