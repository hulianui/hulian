"use client";
import { useEffect, useRef, useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { demoImage } from "../../../../packages/ui/src/lib/demo-image";
import { Upload } from "../../../../packages/ui/src/upload/upload";
import { useUpload } from "../../../../packages/ui/src/upload/use-upload";
import type { UploadFile, UploadRequest } from "../../../../packages/ui/src/upload/upload.types";
function useUploadDemo() {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const seq = useRef(0);
    const add = (picked: File[]) => setFiles((prev) => [
        ...prev,
        ...picked.map((f) => ({ id: `f${seq.current++}`, name: f.name, size: f.size, status: "success" as const })),
    ]);
    const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
    return { files, add, remove, setFiles };
}
function DropzoneDemo() {
    const { files, add, remove } = useUploadDemo();
    return (<Upload className="w-80" multiple hint="Supports any format, single file ≤ 5MB" maxSize={5 * 1024 * 1024} files={files} onSelect={add} onRemove={remove}/>);
}
function ButtonDemo() {
    const { files, add, remove } = useUploadDemo();
    return (<Upload className="w-80" variant="button" accept="image/*" files={files} onSelect={add} onRemove={remove}/>);
}
const demoRequest: UploadRequest = (file, { onProgress, signal }) => new Promise((resolve, reject) => {
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
        reject(new DOMException("Canceled", "AbortError"));
    });
});
function AutoUploadDemo() {
    const up = useUpload({ request: demoRequest, concurrency: 2 });
    return (<Upload className="w-80" multiple limit={5} hint={up.uploading ? "Uploading... (Concurrent 2)" : "Automatically upload files after selecting them, up to 5 files"} files={up.files} onSelect={up.add} onRemove={up.remove}/>);
}
function useObjectUrls() {
    const urls = useRef(new Map<string, string>());
    useEffect(() => {
        const map = urls.current;
        return () => {
            for (const u of map.values())
                URL.revokeObjectURL(u);
            map.clear();
        };
    }, []);
    return (f: UploadFile) => {
        if (f.url)
            return f.url;
        if (!f.raw)
            return undefined;
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
    return (<Upload className="w-80" multiple accept="image/*" limit={6} sortable hint="Up to 6 pictures, drag handle to sequence" files={up.files} onSelect={up.add} onRemove={up.remove} onSort={up.reorder} renderPreview={(f) => {
            const src = srcOf(f);
            return src ? <img src={src} alt={f.name}/> : null;
        }}/>);
}
const PROGRESS_FILES: UploadFile[] = [
    { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
    { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
    { id: "c", name: "huge-video.mov", status: "error", error: "Exceeds the upper limit of 5MB" },
];
const REMOTE_FILES: UploadFile[] = [
    { id: "p1", name: "banner-1.png", size: 240 * 1024, status: "success", url: demoImage("hu1", 80, 80) },
    { id: "p2", name: "banner-2.png", size: 310 * 1024, status: "success", url: demoImage("hu2", 80, 80) },
    { id: "p3", name: "banner-3.png", size: 180 * 1024, status: "success", url: demoImage("hu3", 80, 80) },
];
function RemoteSortDemo() {
    const [list, setList] = useState(REMOTE_FILES);
    return (<Upload className="w-80" variant="button" multiple limit={3} sortable buttonLabel="Add image" files={list} onSort={setList} onRemove={(id) => setList((prev) => prev.filter((f) => f.id !== id))} renderPreview={(f) => (f.url ? <img src={f.url} alt={f.name}/> : null)}/>);
}
export const uploadShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage (drag and drop area)",
            description: "Default dropzone form: click or drag the file, the file that passes the verification is thrown out by onSelect, and the status/progress is backfilled by the consumer to files.",
            code: `<Upload
  multiple
  hint="Support any format, single file \u2264 5MB"
  maxSize={5 * 1024 * 1024}
  files={files}
  onSelect={(picked) => /* Upload and backfill files */}
  onRemove={(id) => /* Remove */}
/>`,
            render: () => (<Upload className="w-80" multiple hint="Supports any format, single file ≤ 5MB" maxSize={5 * 1024 * 1024}/>),
        },
        {
            title: "Button form",
            description: "variant=\"button\" Harvest single button, accept limited file type.",
            code: `<Upload variant="button" accept="image/*" buttonLabel="Upload avatar" />`,
            render: () => <Upload className="w-80" variant="button" accept="image/*" buttonLabel="Upload avatar"/>,
        },
        {
            title: "File List and Status",
            description: "files Controlled display: success / uploading (with progress bar + percentage) / error (with error copy) three-state coexistence.",
            code: `const files = [
  { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
  { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
  { id: "c", name: "huge-video.mov", status: "error", error: "Exceeds 5MB upper limit" },
];

<Upload variant="button" files={files} onRemove={(id) => remove(id)} />`,
            render: () => <Upload className="w-80" variant="button" files={PROGRESS_FILES} onRemove={() => { }}/>,
        },
        {
            title: "Automatic upload (useUpload)",
            description: "The transport layer is split into independent hook: request is provided by you (fetch/XHR/OSS SDK is optional), hook only handles queuing, concurrency gate, progress backfill and cancellation. The action/headers/envelope shape is not recognized in the library.",
            code: `const up = useUpload({
  request: async (file, { onProgress, signal }) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd, signal });
    onProgress(100);
    return { url: (await res.json()).data.url }; // Envelope unpacking is at the application layer
  },
  concurrency: 2,
});

<Upload multiple limit={5} files={up.files} onSelect={up.add} onRemove={up.remove} />`,
            render: () => <AutoUploadDemo />,
        },
        {
            title: "Maximum quantity limit",
            description: "After reaching limit, the trigger is automatically disabled and \"n/limit selected\" is displayed; files exceeding the remaining quota in this selection are entered into onReject (reason=\"limit\").",
            code: `<Upload
  multiple
  limit={3}
  files={files}
  onSelect={add}
  onRemove={remove}
  onReject={(rs) => rs.some((r) => r.reason === "limit") && toast("Max 3 ")}
/>`,
            render: () => <Upload className="w-80" multiple limit={3} files={PROGRESS_FILES} onRemove={() => { }}/>,
        },
        {
            title: "Thumbnail + drag and drop to order",
            description: "renderPreview is the rendering hook (local files use URL.createObjectURL (raw), historical files use url); sortable + onSort open the handle and drag to adjust the sequence, the sequence is still written back by you files.",
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
            title: "Disabled",
            code: `<Upload disabled hint="Disabled" />`,
            render: () => <Upload className="w-80" disabled hint="Disabled"/>,
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
            name: "Status/Progress",
            render: () => <Upload className="w-80" variant="button" files={PROGRESS_FILES} onRemove={() => { }}/>,
        },
        { name: "Automatic upload", render: () => <AutoUploadDemo /> },
        { name: "Thumbnail + Sequence", render: () => <RemoteSortDemo /> },
        { name: "Local preview + sequencing", render: () => <PreviewSortDemo /> },
        {
            name: "The upper limit has been reached",
            render: () => <Upload className="w-80" multiple limit={3} files={PROGRESS_FILES} onRemove={() => { }}/>,
        },
        {
            name: "disabled",
            render: () => <Upload className="w-80" disabled hint="Disabled"/>,
        },
    ],
    renderWithProps: (p) => (<Upload className="w-80" variant={(p.variant as "dropzone" | "button") ?? "dropzone"} multiple={(p.multiple as boolean) ?? true} disabled={(p.disabled as boolean) ?? false} hint="Support any format"/>),
    toCode: (p) => `<Upload
  variant="${(p.variant as string) ?? "dropzone"}"${(p.multiple as boolean) ?? true ? "\n  multiple" : ""}${(p.disabled as boolean) ? "\n  disabled" : ""}
  maxSize={5 * 1024 * 1024}
  files={files}
  onSelect={(picked) => /* Upload and backfill files */}
  onRemove={(id) => /* Remove */}
/>`,
};
