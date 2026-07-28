"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Upload } from "./upload";
import { useUpload } from "./use-upload";
import type { UploadFile, UploadRequest } from "./upload.types";

function useUploadDemo() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const seq = useRef(0);
  const add = (picked: File[]) =>
    setFiles((prev) => [
      ...prev,
      ...picked.map((f) => ({ id: `f${seq.current++}`, name: f.name, size: f.size, status: "success" as const })),
    ]);
  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  return { files, add, remove, setFiles };
}

function DropzoneDemo() {
  const { files, add, remove } = useUploadDemo();
  return (
    <Upload
      className="w-80"
      multiple
      hint="支持任意格式，单文件 ≤ 5MB"
      maxSize={5 * 1024 * 1024}
      files={files}
      onSelect={add}
      onRemove={remove}
    />
  );
}

function ButtonDemo() {
  const { files, add, remove } = useUploadDemo();
  return (
    <Upload className="w-80" variant="button" accept="image/*" files={files} onSelect={add} onRemove={remove} />
  );
}

/** 演示用假传输：按 120ms 一跳把进度推到 100，第三个及以后随机失败一次以展示 error 态。 */
const demoRequest: UploadRequest = (file, { onProgress, signal }) =>
  new Promise((resolve, reject) => {
    let p = 0;
    const timer = setInterval(() => {
      p += 12 + Math.random() * 18;
      if (p >= 100) {
        clearInterval(timer);
        onProgress(100);
        resolve({ url: `https://cdn.example.com/${encodeURIComponent(file.name)}` });
        return;
      }
      onProgress(p);
    }, 120);
    signal.addEventListener("abort", () => {
      clearInterval(timer);
      reject(new DOMException("已取消", "AbortError"));
    });
  });

/** 自动上传：useUpload 管队列/并发/进度/取消，Upload 只负责皮肤。 */
function AutoUploadDemo() {
  const up = useUpload({ request: demoRequest, concurrency: 2 });
  return (
    <Upload
      className="w-80"
      multiple
      limit={5}
      hint={up.uploading ? "上传中…（并发 2）" : "选文件后自动上传，最多 5 个"}
      files={up.files}
      onSelect={up.add}
      onRemove={up.remove}
    />
  );
}

/** 本地缩略图：URL.createObjectURL(raw)，卸载时统一回收。 */
function useObjectUrls() {
  const urls = useRef(new Map<string, string>());
  useEffect(() => {
    const map = urls.current;
    return () => {
      for (const u of map.values()) URL.revokeObjectURL(u);
      map.clear();
    };
  }, []);
  return (f: UploadFile) => {
    if (f.url) return f.url;
    if (!f.raw) return undefined;
    let u = urls.current.get(f.id);
    if (!u) {
      u = URL.createObjectURL(f.raw);
      urls.current.set(f.id, u);
    }
    return u;
  };
}

function PreviewSortDemo() {
  const up = useUpload({ request: demoRequest, concurrency: 3 });
  const srcOf = useObjectUrls();
  return (
    <Upload
      className="w-80"
      multiple
      accept="image/*"
      limit={6}
      sortable
      hint="最多 6 张，可拖手柄调序"
      files={up.files}
      onSelect={up.add}
      onRemove={up.remove}
      onSort={up.reorder}
      renderPreview={(f) => {
        const src = srcOf(f);
        return src ? <img src={src} alt={f.name} /> : null;
      }}
    />
  );
}

const PROGRESS_FILES: UploadFile[] = [
  { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
  { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
  { id: "c", name: "huge-video.mov", status: "error", error: "超过 5MB 上限" },
];

const REMOTE_FILES: UploadFile[] = [
  { id: "p1", name: "banner-1.png", size: 240 * 1024, status: "success", url: "https://picsum.photos/seed/hu1/80" },
  { id: "p2", name: "banner-2.png", size: 310 * 1024, status: "success", url: "https://picsum.photos/seed/hu2/80" },
  { id: "p3", name: "banner-3.png", size: 180 * 1024, status: "success", url: "https://picsum.photos/seed/hu3/80" },
];

function RemoteSortDemo() {
  const [list, setList] = useState(REMOTE_FILES);
  return (
    <Upload
      className="w-80"
      variant="button"
      multiple
      limit={3}
      sortable
      buttonLabel="添加图片"
      files={list}
      onSort={setList}
      onRemove={(id) => setList((prev) => prev.filter((f) => f.id !== id))}
      renderPreview={(f) => (f.url ? <img src={f.url} alt={f.name} /> : null)}
    />
  );
}

export const uploadShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法（拖拽落区）",
      description: "默认 dropzone 形态：点击或拖拽文件，校验通过的文件经 onSelect 抛出，状态/进度由消费者回填到 files。",
      code: `<Upload
  multiple
  hint="支持任意格式，单文件 ≤ 5MB"
  maxSize={5 * 1024 * 1024}
  files={files}
  onSelect={(picked) => /* 上传并回填 files */}
  onRemove={(id) => /* 移除 */}
/>`,
      render: () => (
        <Upload className="w-80" multiple hint="支持任意格式，单文件 ≤ 5MB" maxSize={5 * 1024 * 1024} />
      ),
    },
    {
      title: "按钮形态",
      description: "variant=\"button\" 收成单按钮，accept 限定文件类型。",
      code: `<Upload variant="button" accept="image/*" buttonLabel="上传头像" />`,
      render: () => <Upload className="w-80" variant="button" accept="image/*" buttonLabel="上传头像" />,
    },
    {
      title: "文件列表与状态",
      description: "files 受控展示：success / uploading（带进度条 + 百分比）/ error（带错误文案）三态共存。",
      code: `const files = [
  { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
  { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
  { id: "c", name: "huge-video.mov", status: "error", error: "超过 5MB 上限" },
];

<Upload variant="button" files={files} onRemove={(id) => remove(id)} />`,
      render: () => <Upload className="w-80" variant="button" files={PROGRESS_FILES} onRemove={() => {}} />,
    },
    {
      title: "自动上传（useUpload）",
      description:
        "传输层拆成独立 hook：request 由你提供（fetch/XHR/OSS SDK 随意），hook 只管排队、并发闸门、进度回填与取消。库内不认识 action/headers/信封形状。",
      code: `const up = useUpload({
  request: async (file, { onProgress, signal }) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, signal });
    onProgress(100);
    return { url: (await res.json()).data.url }; // 信封解包在应用层
  },
  concurrency: 2,
});

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} />`,
      render: () => <AutoUploadDemo />,
    },
    {
      title: "数量上限 limit",
      description: "达到 limit 后触发器自动禁用并显示「已选 n/limit」；本次选择中超出剩余名额的文件进 onReject(reason=\"limit\")。",
      code: `<Upload
  multiple
  limit={3}
  files={files}
  onSelect={add}
  onRemove={remove}
  onReject={(rs) => rs.some((r) => r.reason === "limit") && toast("最多 3 个")}
/>`,
      render: () => <Upload className="w-80" multiple limit={3} files={PROGRESS_FILES} onRemove={() => {}} />,
    },
    {
      title: "缩略图 + 拖拽调序",
      description:
        "renderPreview 是渲染钩子（本地文件用 URL.createObjectURL(raw)，历史文件用 url）；sortable + onSort 打开手柄拖拽调序，顺序仍由你写回 files。",
      code: `<Upload
  multiple
  accept="image/*"
  limit={6}
  sortable
  files={files}
  onSelect={add}
  onRemove={remove}
  onSort={setFiles}
  renderPreview={(f) => <img src={f.url ?? preview(f.raw)} alt={f.name} />}
/>`,
      render: () => <RemoteSortDemo />,
    },
    {
      title: "禁用态",
      code: `<Upload disabled hint="已禁用" />`,
      render: () => <Upload className="w-80" disabled hint="已禁用" />,
    },
  ],
  controls: [
    { prop: "variant", type: "select", options: ["dropzone", "button"], defaultValue: "dropzone" },
    { prop: "multiple", type: "boolean", defaultValue: true },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "dropzone", render: () => <DropzoneDemo /> },
    { name: "button", render: () => <ButtonDemo /> },
    {
      name: "状态/进度",
      render: () => <Upload className="w-80" variant="button" files={PROGRESS_FILES} onRemove={() => {}} />,
    },
    { name: "自动上传", render: () => <AutoUploadDemo /> },
    { name: "缩略图+调序", render: () => <RemoteSortDemo /> },
    { name: "本地预览+调序", render: () => <PreviewSortDemo /> },
    {
      name: "已达上限",
      render: () => <Upload className="w-80" multiple limit={3} files={PROGRESS_FILES} onRemove={() => {}} />,
    },
    {
      name: "disabled",
      render: () => <Upload className="w-80" disabled hint="已禁用" />,
    },
  ],
  renderWithProps: (p) => (
    <Upload
      className="w-80"
      variant={(p.variant as "dropzone" | "button") ?? "dropzone"}
      multiple={(p.multiple as boolean) ?? true}
      disabled={(p.disabled as boolean) ?? false}
      hint="支持任意格式"
    />
  ),
  toCode: (p) =>
    `<Upload\n  variant="${(p.variant as string) ?? "dropzone"}"${(p.multiple as boolean) ?? true ? "\n  multiple" : ""}${
      (p.disabled as boolean) ? "\n  disabled" : ""
    }\n  maxSize={5 * 1024 * 1024}\n  files={files}\n  onSelect={(picked) => /* 上传并回填 files */}\n  onRemove={(id) => /* 移除 */}\n/>`,
};
