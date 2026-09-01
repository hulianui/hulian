"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Image as ImageIcon, X } from "../_icons";
import { Button } from "../button";
import { Image } from "../image";
import { warnOnce } from "../lib/warn-once";
import { Text } from "../text";
import type { QuestionEditorLocale } from "./question-editor.locale";

interface PendingUpload {
  id: number;
  name: string;
  status: "uploading" | "error";
  message?: string;
}

export interface FiguresStripProps {
  /** 题干里已引用的图 key（题干是唯一真相；正在传 / 传失败的行只活在本地）。 */
  keys: string[];
  disabled: boolean;
  resolveFigure?: (key: string) => string;
  onUploadFigure?: (file: File) => Promise<string>;
  onAdd: (key: string) => void;
  onRemove: (key: string) => void;
  L: QuestionEditorLocale;
}

/**
 * 题图缩略图条 + 「插入图片」。几何图 / 函数图像 / 统计图这类题，图就是题目内容的一部分，
 * 写成文字说明等于把题目改了。图不是 Question 上的新字段，是题干里的 `![](key)` 引用：
 * 组卷预览、学生端、导出搬运的都只是 stem 这一个字段，图挂在别处它们一张也拿不到。
 */
export function FiguresStrip({ keys, disabled, resolveFigure, onUploadFigure, onAdd, onRemove, L }: FiguresStripProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const seq = useRef(0);
  const fileInput = useRef<HTMLInputElement | null>(null);
  // 上传是异步的：回调跑起来时闭包里的 onAdd 早就是旧的了。写回必须读最新那一份，
  // 否则「传图这几秒里又敲进去的题干」会被这次写回整段抹掉，而且一声不响（消费方踩过）。
  const latestAdd = useRef(onAdd);
  useEffect(() => {
    latestAdd.current = onAdd;
  });

  if (keys.length > 0 && resolveFigure === undefined) {
    warnOnce(
      "question-editor:resolve-figure",
      "[瑚琏] QuestionEditor：题干含图但未提供 resolveFigure，缩略图条只能显示 key。",
    );
  }

  const upload = async (file: File) => {
    if (!onUploadFigure) return;
    seq.current += 1;
    const id = seq.current;
    setPending((rows) => [...rows, { id, name: file.name, status: "uploading" }]);
    try {
      const key = await onUploadFigure(file);
      setPending((rows) => rows.filter((row) => row.id !== id));
      latestAdd.current(key);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPending((rows) => rows.map((row) => (row.id === id ? { ...row, status: "error", message } : row)));
    }
  };

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) void upload(file);
  };

  if (keys.length === 0 && pending.length === 0 && !onUploadFigure) return null;

  const tile =
    "flex size-20 flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-border px-1 text-center";

  return (
    <div data-slot="question-editor-figures" className="space-y-2">
      {(keys.length > 0 || pending.length > 0) && (
        <ul className="flex flex-wrap gap-3">
          {keys.map((key, index) => (
            <li key={key} className="relative">
              {resolveFigure ? (
                <Image
                  src={resolveFigure(key)}
                  alt={L.figureAlt(index + 1)}
                  radius="sm"
                  className="size-20 border border-border bg-white"
                  imgClassName="size-full object-contain"
                />
              ) : (
                <div className={tile} title={L.figureMissingResolver}>
                  <Text size="xs" className="break-all font-mono">
                    {key}
                  </Text>
                </div>
              )}
              {!disabled && (
                <Button
                  size="sm"
                  variant="solid"
                  tone="neutral"
                  aria-label={L.removeFigure(index + 1)}
                  className="absolute -end-2 -top-2 size-6 rounded-full p-0"
                  onClick={() => onRemove(key)}
                >
                  <X className="size-3" aria-hidden />
                </Button>
              )}
            </li>
          ))}
          {pending.map((row) => (
            <li key={row.id} className={tile}>
              <Text size="xs" tone={row.status === "error" ? "danger" : "muted"} className="line-clamp-3 break-all">
                {row.status === "error" ? L.uploadFailed(row.name, row.message ?? "") : L.uploading(row.name)}
              </Text>
              {row.status === "error" && (
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={L.dismissUpload}
                  onClick={() => setPending((rows) => rows.filter((r) => r.id !== row.id))}
                >
                  <X className="size-3" aria-hidden />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {onUploadFigure && (
        <div>
          <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={pick} />
          <Button size="sm" variant="outline" disabled={disabled} onClick={() => fileInput.current?.click()}>
            <ImageIcon className="size-4" aria-hidden />
            {L.insertFigure}
          </Button>
        </div>
      )}
    </div>
  );
}
