"use client";
import { useRef, useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { Upload } from "./upload";
import type { UploadFile } from "./upload.types";

function useUploadDemo() {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const seq = useRef(0);
  const add = (picked: File[]) =>
    setFiles((prev) => [
      ...prev,
      ...picked.map((f) => ({ id: `f${seq.current++}`, name: f.name, size: f.size, status: "success" as const })),
    ]);
  const remove = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));
  return { files, add, remove };
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

const PROGRESS_FILES: UploadFile[] = [
  { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
  { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
  { id: "c", name: "huge-video.mov", status: "error", error: "超过 5MB 上限" },
];

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
      description: "files 受控展示：success / uploading（带进度条）/ error（带错误文案）三态共存。",
      code: `const files = [
  { id: "a", name: "report-2026.pdf", size: 1.8 * 1024 * 1024, status: "success" },
  { id: "b", name: "cover.png", size: 820 * 1024, status: "uploading", progress: 62 },
  { id: "c", name: "huge-video.mov", status: "error", error: "超过 5MB 上限" },
];

<Upload variant="button" files={files} onRemove={(id) => remove(id)} />`,
      render: () => <Upload className="w-80" variant="button" files={PROGRESS_FILES} onRemove={() => {}} />,
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
