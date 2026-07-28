import { describe, it, expect, vi, afterEach } from "vitest";
import { render, fireEvent, cleanup } from "@testing-library/react";
import { Upload, matchesAccept, moveUploadFile } from "./upload";
import type { UploadFile } from "./upload.types";

afterEach(cleanup);

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

describe("Upload · progress 展示位", () => {
  it("uploading 渲染 progressbar 语义 + 百分比文本", () => {
    const files: UploadFile[] = [{ id: "x", name: "v.mov", status: "uploading", progress: 62.4 }];
    const { getByRole, getByText } = render(<Upload files={files} />);
    const bar = getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("62");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(getByText("62%")).toBeTruthy();
  });

  it("progress 越界被 clamp 到 0–100", () => {
    const files: UploadFile[] = [{ id: "x", name: "v.mov", status: "uploading", progress: 180 }];
    const { container, getByText } = render(<Upload files={files} />);
    expect((container.querySelector('[style*="width"]') as HTMLElement).style.width).toBe("100%");
    expect(getByText("100%")).toBeTruthy();
  });

  it("非 uploading 不渲染 progressbar", () => {
    const files: UploadFile[] = [{ id: "x", name: "v.mov", status: "success", progress: 100 }];
    const { queryByRole } = render(<Upload files={files} />);
    expect(queryByRole("progressbar")).toBeNull();
  });
});

describe("Upload · limit 数量上限", () => {
  it("超出剩余名额的文件进 onReject reason=limit", () => {
    const onSelect = vi.fn();
    const onReject = vi.fn();
    const existing: UploadFile[] = [{ id: "a", name: "a.png", status: "success" }];
    const { container } = render(
      <Upload multiple limit={2} files={existing} onSelect={onSelect} onReject={onReject} />,
    );
    fireEvent.change(fileInput(container), {
      target: { files: [file("b.png", "image/png"), file("c.png", "image/png")] },
    });
    // 剩余名额 1：b 通过、c 被拒
    expect(onSelect.mock.calls[0][0].map((f: File) => f.name)).toEqual(["b.png"]);
    expect(onReject).toHaveBeenCalledWith([expect.objectContaining({ reason: "limit" })]);
    expect(onReject.mock.calls[0][0][0].file.name).toBe("c.png");
  });

  it("已达上限：触发器禁用且不再回调 onSelect", () => {
    const onSelect = vi.fn();
    const files: UploadFile[] = [
      { id: "a", name: "a.png", status: "success" },
      { id: "b", name: "b.png", status: "success" },
    ];
    const { container, getByText } = render(<Upload multiple limit={2} files={files} onSelect={onSelect} />);
    const zone = container.querySelector('[role="button"]') as HTMLElement;
    expect(zone.getAttribute("aria-disabled")).toBe("true");
    expect(zone.getAttribute("tabindex")).toBe("-1");
    expect(fileInput(container).disabled).toBe(true);
    expect(getByText("已选 2/2")).toBeTruthy();
    fireEvent.click(zone);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("button 形态达上限时按钮 disabled", () => {
    const files: UploadFile[] = [{ id: "a", name: "a.png", status: "success" }];
    const { getByText } = render(<Upload variant="button" limit={1} files={files} buttonLabel="选图" />);
    expect((getByText("选图").closest("button") as HTMLButtonElement).disabled).toBe(true);
  });

  it("不传 limit → 无计数器、无名额限制", () => {
    const onSelect = vi.fn();
    const { container, queryByText } = render(<Upload multiple onSelect={onSelect} />);
    expect(queryByText(/^已选 /)).toBeNull();
    fireEvent.change(fileInput(container), {
      target: { files: [file("a.png", "image/png"), file("b.png", "image/png")] },
    });
    expect(onSelect.mock.calls[0][0]).toHaveLength(2);
  });
});

describe("Upload · renderPreview 缩略图", () => {
  const files: UploadFile[] = [
    { id: "a", name: "cover.png", status: "success", url: "https://cdn.test/cover.png" },
  ];

  it("返回节点时渲染到列表项内，并可读到 url", () => {
    const renderPreview = vi.fn((f: UploadFile) => <img src={f.url} alt={f.name} />);
    const { getByAltText } = render(<Upload files={files} renderPreview={renderPreview} />);
    expect(renderPreview).toHaveBeenCalledWith(files[0]);
    expect(getByAltText("cover.png").getAttribute("src")).toBe("https://cdn.test/cover.png");
  });

  it("返回 null 时回落默认状态点（不渲染预览位）", () => {
    const { container } = render(<Upload files={files} renderPreview={() => null} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("li .size-2")).toBeTruthy();
  });

  it("预览位与移除按钮共存", () => {
    const onRemove = vi.fn();
    const { getByAltText, getByLabelText } = render(
      <Upload files={files} onRemove={onRemove} renderPreview={(f) => <img src={f.url} alt={f.name} />} />,
    );
    expect(getByAltText("cover.png")).toBeTruthy();
    fireEvent.click(getByLabelText("移除 cover.png"));
    expect(onRemove).toHaveBeenCalledWith("a");
  });
});

describe("Upload · sortable 调序", () => {
  const files: UploadFile[] = [
    { id: "a", name: "1.png", status: "success" },
    { id: "b", name: "2.png", status: "success" },
    { id: "c", name: "3.png", status: "success" },
  ];

  it("moveUploadFile 把 active 移到 over 的位置", () => {
    expect(moveUploadFile(files, "c", "a").map((f) => f.id)).toEqual(["c", "a", "b"]);
    expect(moveUploadFile(files, "a", "b").map((f) => f.id)).toEqual(["b", "a", "c"]);
  });

  it("moveUploadFile 原地/未知 id → 返回同一引用（不触发无谓 onSort）", () => {
    expect(moveUploadFile(files, "a", "a")).toBe(files);
    expect(moveUploadFile(files, "zzz", "a")).toBe(files);
    expect(moveUploadFile(files, "a", "zzz")).toBe(files);
  });

  it("sortable + onSort → 每行渲染带 sortable 语义的拖拽手柄（activator 落在手柄上）", () => {
    const { getAllByLabelText, getByLabelText } = render(<Upload files={files} sortable onSort={() => {}} />);
    expect(getAllByLabelText(/^拖拽排序 /).length).toBe(3);
    expect(getByLabelText("拖拽排序 2.png").getAttribute("aria-roledescription")).toBe("sortable");
  });

  it("sortable 但没给 onSort → 退回静态列表（不挂 dnd）", () => {
    const { queryByLabelText, container } = render(<Upload files={files} sortable />);
    expect(queryByLabelText(/^拖拽排序 /)).toBeNull();
    expect(container.querySelectorAll("li").length).toBe(3);
  });

  it("挂载时不触发 onSort", () => {
    const onSort = vi.fn();
    render(<Upload files={files} sortable onSort={onSort} />);
    expect(onSort).not.toHaveBeenCalled();
  });
});
