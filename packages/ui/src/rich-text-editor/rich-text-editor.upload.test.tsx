import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { render, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { RichTextEditor } from "./rich-text-editor";
import { sanitizePastedHtml, isAllowedUrl } from "./rich-text-editor.sanitize";

afterEach(cleanup);

// 插入内容之后 ProseMirror 会 scrollToSelection → coordsAtPos → 对文本节点调 getClientRects，
// 而 jsdom 没有布局、Text 上根本没有这个方法 —— 抛出的是 **unhandled error**，
// Vitest 会因此让整轮 exit 1（用例本身还是绿的，很容易看漏）。
// 补桩而不是给组件传 scrollIntoView:false：真实浏览器里滚到新插入的图片是对的行为，
// 不该为了迁就 jsdom 把它关掉。
beforeAll(() => {
  const rect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 };
  const list = Object.assign([rect], { item: () => rect });
  for (const proto of [Text.prototype, Element.prototype, Range.prototype] as unknown as Record<
    string,
    unknown
  >[]) {
    if (!proto.getClientRects) proto.getClientRects = () => list;
    if (!proto.getBoundingClientRect) proto.getBoundingClientRect = () => rect;
  }
});

/** 1×1 透明 PNG。够短，放进用例里不影响阅读。 */
const B64_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

/** 够用的 DataTransfer 替身：组件只会读 files 与 getData 两处。 */
function fakeTransfer(files: File[], html?: string): DataTransfer {
  return {
    files,
    items: [],
    types: html ? ["text/html"] : [],
    getData: (type: string) => (type === "text/html" ? (html ?? "") : ""),
  } as unknown as DataTransfer;
}

const pngFile = (name = "shot.png") =>
  new File([new Uint8Array([1, 2, 3])], name, { type: "image/png" });

async function mountEditor(props: Record<string, unknown> = {}) {
  const view = render(<RichTextEditor defaultValue="<p>abc</p>" {...props} />);
  await waitFor(() => expect(view.container.querySelector('[role="textbox"]')).toBeTruthy());
  return { ...view, box: view.container.querySelector('[role="textbox"]') as HTMLElement };
}

describe("URL 协议白名单（#213）", () => {
  it("data: / blob: / file: 一律进不来", () => {
    // data: 是把几 MB base64 写进数据库字段（文档承诺的是「图片永远不内联 base64」）；
    // blob: 只在当前页面生命周期内有效、file: 只在那台机器上有效 —— 存下来就是永久碎图，
    // 而且字段大小看不出异常，比 base64 更难查。
    for (const url of [B64_PNG, "blob:https://x/abc", "file:///Users/a.png"]) {
      // <img> 没了 src 就是个空壳，所以整个元素删掉而不是只删属性
      expect(sanitizePastedHtml(`<p>x<img src="${url}"></p>`)).toBe("<p>x</p>");
    }
  });

  it("正常 URL 照常放行：绝对 / 相对 / 协议相对 / 锚点", () => {
    for (const url of ["https://cdn/a.png", "/local.png", "//cdn/a.png", "#anchor"]) {
      expect(sanitizePastedHtml(`<img src="${url}">`)).toContain(url);
    }
  });

  it("javascript: 只删属性、留下文字（链接没了，字还在）", () => {
    expect(sanitizePastedHtml('<a href="javascript:alert(1)">字还在</a>')).toBe("<a>字还在</a>");
  });

  it("控制字符绕过也挡得住 —— 浏览器解析 URL 时本就会先剥掉它们", () => {
    expect(isAllowedUrl("java\tscript:alert(1)")).toBe(false);
    expect(isAllowedUrl(" javascript:alert(1)")).toBe(false);
    expect(isAllowedUrl("java\u0000script:alert(1)")).toBe(false);
  });

  it("isAllowedUrl 的边界", () => {
    expect(isAllowedUrl("https://a")).toBe(true);
    expect(isAllowedUrl("mailto:a@b.c")).toBe(true);
    expect(isAllowedUrl("tel:+8613800138000")).toBe(true);
    expect(isAllowedUrl("./rel/a.png")).toBe(true);
    expect(isAllowedUrl("")).toBe(false);
    expect(isAllowedUrl("data:image/png;base64,x")).toBe(false);
    expect(isAllowedUrl("vbscript:msgbox")).toBe(false);
  });
});

describe("粘贴与拖拽上传图片（#213）", () => {
  it("粘贴截图文件 → 走 onUploadImage，插入的是它返回的 URL", async () => {
    // 组件本来就有完整的上传能力，此前只接在工具栏按钮上 —— 而截图 Cmd+V 才是
    // 运营真正会用的路径，专门去点按钮反倒是少数。
    const onUploadImage = vi.fn(async () => ({ url: "https://cdn/uploaded.png" }));
    const { box } = await mountEditor({ onUploadImage });
    fireEvent.paste(box, { clipboardData: fakeTransfer([pngFile()]) });
    await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(box.querySelector("img")?.getAttribute("src")).toBe("https://cdn/uploaded.png"),
    );
  });

  it("粘贴 Word 正文里的内联 base64 → 转存成 URL，正文里不留 base64", async () => {
    // Word / Excel / 部分网页复制过来的正文，图片是内联在 HTML 里的 base64，
    // 剪贴板里**没有**对应的文件条目，所以 DataTransfer.files 那条路取不到，
    // 只能从 text/html 里把 data: 捞出来再转成 File。
    const onUploadImage = vi.fn(async () => ({ url: "https://cdn/word.png" }));
    const { box } = await mountEditor({ onUploadImage });
    fireEvent.paste(box, { clipboardData: fakeTransfer([], `<p>正文<img src="${B64_PNG}"></p>`) });
    await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(box.querySelector("img")?.getAttribute("src")).toBe("https://cdn/word.png"),
    );
    expect(box.innerHTML).not.toContain("base64");
  });

  it("没传 onUploadImage 时 base64 被丢弃，而不是内联进正文", async () => {
    const { box } = await mountEditor();
    fireEvent.paste(box, { clipboardData: fakeTransfer([], `<p>正文<img src="${B64_PNG}"></p>`) });
    await waitFor(() => expect(box.textContent).toContain("正文"));
    expect(box.innerHTML).not.toContain("base64");
    expect(box.querySelector("img")).toBeNull();
  });

  it("拖入图片文件 → 上传并插入", async () => {
    // jsdom 没有布局，ProseMirror 的 posAtCoords 拿不到位置会提前 return、走不到 handleDrop。
    // 不把它依赖的这两个 API 造出来，这条测的就是 jsdom 而不是组件（实测：补齐后即通过）。
    const onUploadImage = vi.fn(async () => ({ url: "https://cdn/dropped.png" }));
    const { box } = await mountEditor({ onUploadImage });
    const textNode = box.querySelector("p")!.firstChild!;
    (document as unknown as { caretRangeFromPoint: unknown }).caretRangeFromPoint = () => {
      const range = document.createRange();
      range.setStart(textNode, 1);
      range.collapse(true);
      return range;
    };
    document.elementFromPoint = () => box;

    fireEvent.drop(box, { dataTransfer: fakeTransfer([pngFile("d.png")]), clientX: 5, clientY: 5 });
    await waitFor(() => expect(onUploadImage).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(box.querySelector("img")?.getAttribute("src")).toBe("https://cdn/dropped.png"),
    );
  });

  it("普通文字粘贴不受影响 —— 不许把非图片的粘贴一起劫持", async () => {
    const onUploadImage = vi.fn(async () => ({ url: "https://cdn/x.png" }));
    const { box } = await mountEditor({ onUploadImage });
    fireEvent.paste(box, { clipboardData: fakeTransfer([], "<p>只是一段文字</p>") });
    await waitFor(() => expect(box.textContent).toContain("只是一段文字"));
    expect(onUploadImage).not.toHaveBeenCalled();
  });
});

describe("图片节点不在 schema 里时不劫持（#213）", () => {
  it("toolbar 裁掉 image 档时，粘贴图片既不上传也不崩", async () => {
    // 不先挡住的话是「文件传上去了、图却插不进来」：白占一次消费方的对象存储，
    // 用户还看不到任何反馈 —— 比什么都不做更糟。
    const onUploadImage = vi.fn(async () => ({ url: "https://cdn/x.png" }));
    const { box } = await mountEditor({ toolbar: ["bold"], onUploadImage });
    fireEvent.paste(box, { clipboardData: fakeTransfer([pngFile()]) });
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onUploadImage).not.toHaveBeenCalled();
    expect(box.querySelector("img")).toBeNull();
  });
});
