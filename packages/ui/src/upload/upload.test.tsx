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

describe("Upload · name/原生表单提交（#234）", () => {
  it("不传 name：input 无 name、aria-hidden、选完清空 value（0.39.0 行为逐字不变）", () => {
    const { container } = render(<Upload />);
    const input = fileInput(container);
    expect(input.hasAttribute("name")).toBe(false);
    expect(input.getAttribute("aria-hidden")).toBe("true");
    fireEvent.change(input, { target: { files: [file("a.png", "image/png")] } });
    expect(input.value).toBe("");
  });

  it("给了 name：input 带 name 且不再 aria-hidden，表单里能被 FormData 认领", () => {
    const { container } = render(
      <form>
        <Upload name="file" required />
      </form>,
    );
    const input = fileInput(container);
    expect(input.getAttribute("name")).toBe("file");
    expect(input.hasAttribute("aria-hidden")).toBe(false);
    expect(input.required).toBe(true);
    // jsdom 的 FormData 读不到 fireEvent 塞进去的 files（内部槽没被写），
    // 但「这个控件有没有进表单」是能证的：没有 name 时它整个不出现在 entries 里。
    const form = container.querySelector("form") as HTMLFormElement;
    expect([...new FormData(form).keys()]).toEqual(["file"]);
  });

  it("不传 name 时 input 完全不参与表单", () => {
    const { container } = render(
      <form>
        <Upload />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect([...new FormData(form).keys()]).toEqual([]);
  });

  it("给了 name：选完不清 value（清了 FormData 就永远读不到文件）", () => {
    const { container } = render(<Upload name="file" />);
    const input = fileInput(container);
    fireEvent.change(input, { target: { files: [file("a.png", "image/png")] } });
    expect(input.files).toHaveLength(1);
  });

  it("resetInputAfterSelect 可显式覆盖两侧默认", () => {
    const { container } = render(<Upload name="file" resetInputAfterSelect />);
    const input = fileInput(container);
    fireEvent.change(input, { target: { files: [file("a.png", "image/png")] } });
    expect(input.value).toBe("");
  });

  it("给了 name：达 limit 时 input 不跟着禁用（禁用控件会被 FormData 整个跳过）", () => {
    const files: UploadFile[] = [{ id: "a", name: "a.png", status: "success" }];
    const { container } = render(<Upload name="file" limit={1} files={files} />);
    expect(fileInput(container).disabled).toBe(false);
    // 触发器那侧照旧拦住
    expect((container.querySelector('[role="button"]') as HTMLElement).getAttribute("aria-disabled")).toBe("true");
  });

  it("disabled 仍然禁用 input（与 limit 不同，那是消费者显式关掉）", () => {
    const { container } = render(<Upload name="file" disabled />);
    expect(fileInput(container).disabled).toBe(true);
  });

  it("inputRef 拿得到内层 input，且组件自己仍能用它开选择框", () => {
    const ref = { current: null as HTMLInputElement | null };
    const { container } = render(<Upload inputRef={ref} />);
    expect(ref.current).toBe(fileInput(container));
    const click = vi.spyOn(ref.current as HTMLInputElement, "click");
    fireEvent.click(container.querySelector('[role="button"]') as HTMLElement);
    expect(click).toHaveBeenCalled();
  });
});

describe("Upload · onRetry 失败行重试（#242）", () => {
  const failed: UploadFile[] = [
    { id: "x", name: "a.png", status: "error", error: "网络异常" },
    { id: "y", name: "b.png", status: "success" },
  ];

  it("传了 onRetry：只有失败行渲染重试入口，点击回调该行 id", () => {
    const onRetry = vi.fn();
    const { getByLabelText, queryByLabelText } = render(<Upload files={failed} onRetry={onRetry} />);
    expect(queryByLabelText("重新上传 b.png")).toBeNull();
    fireEvent.click(getByLabelText("重新上传 a.png"));
    expect(onRetry).toHaveBeenCalledWith("x");
  });

  it("不传 onRetry：失败行不渲染重试入口（与 onRemove 同口径）", () => {
    const { queryByLabelText } = render(<Upload files={failed} />);
    expect(queryByLabelText(/^重新上传 /)).toBeNull();
  });

  it("重试与移除共存，各自回调各自的 id", () => {
    const onRetry = vi.fn();
    const onRemove = vi.fn();
    const { getByLabelText } = render(<Upload files={failed} onRetry={onRetry} onRemove={onRemove} />);
    fireEvent.click(getByLabelText("重新上传 a.png"));
    fireEvent.click(getByLabelText("移除 a.png"));
    expect(onRetry).toHaveBeenCalledWith("x");
    expect(onRemove).toHaveBeenCalledWith("x");
  });

  it("sortable 行同样有重试入口", () => {
    const onRetry = vi.fn();
    const { getByLabelText } = render(
      <Upload files={failed} sortable onSort={() => {}} onRetry={onRetry} />,
    );
    fireEvent.click(getByLabelText("重新上传 a.png"));
    expect(onRetry).toHaveBeenCalledWith("x");
  });
});

describe("Upload · size 尺寸档（#243）", () => {
  function zone(container: HTMLElement) {
    return container.querySelector('[role="button"]') as HTMLElement;
  }

  it("不传 size = md，落区内边距与 0.39.0 逐字相同", () => {
    const { container } = render(<Upload />);
    expect(zone(container).className).toContain("px-6");
    expect(zone(container).className).toContain("py-8");
  });

  it("sm / lg 换掉落区内边距（不是叠加）", () => {
    const { container: sm } = render(<Upload size="sm" />);
    expect(zone(sm).className).toContain("py-4");
    expect(zone(sm).className).not.toContain("py-8");
    const { container: lg } = render(<Upload size="lg" />);
    expect(zone(lg).className).toContain("py-12");
    expect(zone(lg).className).not.toContain("py-8");
  });

  it("button 形态按档换高度，与 Button 同名档等高", () => {
    // 多次 render 共用 document.body，getByText 会跨实例撞车，这里按各自 container 取
    const trigger = (c: HTMLElement) => c.querySelector("button") as HTMLElement;
    const md = trigger(render(<Upload variant="button" />).container);
    expect(md.className).toContain("h-10");
    const sm = trigger(render(<Upload variant="button" size="sm" />).container);
    expect(sm.className).toContain("h-8");
    expect(sm.className).not.toContain("h-10");
    const lg = trigger(render(<Upload variant="button" size="lg" />).container);
    expect(lg.className).toContain("h-12");
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
