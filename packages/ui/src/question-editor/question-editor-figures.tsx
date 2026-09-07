"use client";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ChevronLeft, ChevronRight, Image as ImageIcon, RefreshCw, X } from "../_icons";
import { Button } from "../button";
import { Image } from "../image";
import { ImageViewer } from "../image-viewer";
import { warnOnce } from "../lib/warn-once";
import { Text } from "../text";
import type { QuestionEditorLocale } from "./question-editor.locale";

interface PendingUpload {
  id: number;
  /** 原文件留着不放：失败那一行的「重试」直接再传它，不该逼老师回去文件对话框里重新找一遍。 */
  file: File;
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
  /** 调序：把第 from 张挪到第 to 位。顺序即展示顺序，所以由编辑器写回题干。 */
  onMove: (from: number, to: number) => void;
  L: QuestionEditorLocale;
}

/**
 * 题图缩略图条 + 「插入图片」。几何图 / 函数图像 / 统计图这类题，图就是题目内容的一部分，
 * 写成文字说明等于把题目改了。图不是 Question 上的新字段，是题干里的 `![](key)` 引用：
 * 组卷预览、学生端、导出搬运的都只是 stem 这一个字段，图挂在别处它们一张也拿不到。
 *
 * 三件事刻意做在库里而不是丢给消费方（#354）：**调序**（顺序就是写在题干末尾的顺序，也就是
 * 组卷 / 学生端 / docx 导出的显示顺序，编辑器手里既有 stem 也有 figureFilter，自己就能写回，
 * 再开一个 `onSortFigures` 只会让「题图顺序」有两个真源）、**看大图**（80px 认得出是哪张，
 * 认不出图里的字母标注）、**失败重试**（文件还在手里）。
 * 调序用前移 / 后移按钮而不是拖拽：与本编辑器里选项调序同一套交互，键盘与读屏天然可用，
 * 也不必为一条缩略图条把 dnd-kit（~20KB gzip）塞给所有 `@hulianui/ui/math` 消费方。
 */
export function FiguresStrip({
  keys,
  disabled,
  resolveFigure,
  onUploadFigure,
  onAdd,
  onRemove,
  onMove,
  L,
}: FiguresStripProps) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  // 看大图：null = 没开。删图会让下标越界，所以开关条件里连带比一次长度。
  const [viewing, setViewing] = useState<number | null>(null);
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
    setPending((rows) => [...rows, { id, file, status: "uploading" }]);
    try {
      const key = await onUploadFigure(file);
      setPending((rows) => rows.filter((row) => row.id !== id));
      latestAdd.current(key);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setPending((rows) => rows.map((row) => (row.id === id ? { ...row, status: "error", message } : row)));
    }
  };

  /** 重试 = 收掉失败那一行、拿同一个 File 再走一遍（新的一行），失败原因不叠着显示。 */
  const retry = (row: PendingUpload) => {
    setPending((rows) => rows.filter((r) => r.id !== row.id));
    void upload(row.file);
  };

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    for (const file of files) void upload(file);
  };

  if (keys.length === 0 && pending.length === 0 && !onUploadFigure) return null;

  const tile =
    "flex size-20 flex-col items-center justify-center overflow-hidden rounded-[var(--radius)] border border-dashed border-border px-1 text-center";
  const iconButton = "size-6 p-0";

  return (
    <div data-slot="question-editor-figures" className="space-y-2">
      {(keys.length > 0 || pending.length > 0) && (
        <ul className="flex flex-wrap items-start gap-3">
          {keys.map((key, index) => (
            <li key={key} className="flex flex-col items-center gap-1">
              <div className="relative">
                {resolveFigure ? (
                  <button
                    type="button"
                    aria-label={L.viewFigure(index + 1)}
                    onClick={() => setViewing(index)}
                    className="block cursor-zoom-in rounded-[var(--radius)] outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Image
                      src={resolveFigure(key)}
                      alt={L.figureAlt(index + 1)}
                      radius="sm"
                      className="size-20 border border-border bg-white"
                      imgClassName="size-full object-contain"
                    />
                  </button>
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
              </div>
              {!disabled && keys.length > 1 && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={L.moveFigureEarlier(index + 1)}
                    disabled={index === 0}
                    className={iconButton}
                    onClick={() => onMove(index, index - 1)}
                  >
                    <ChevronLeft className="size-3" aria-hidden />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={L.moveFigureLater(index + 1)}
                    disabled={index === keys.length - 1}
                    className={iconButton}
                    onClick={() => onMove(index, index + 1)}
                  >
                    <ChevronRight className="size-3" aria-hidden />
                  </Button>
                </div>
              )}
            </li>
          ))}
          {pending.map((row) => (
            <li key={row.id} className={tile}>
              <Text size="xs" tone={row.status === "error" ? "danger" : "muted"} className="line-clamp-3 break-all">
                {row.status === "error" ? L.uploadFailed(row.file.name, row.message ?? "") : L.uploading(row.file.name)}
              </Text>
              {row.status === "error" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={L.retryUpload(row.file.name)}
                    className={iconButton}
                    onClick={() => retry(row)}
                  >
                    <RefreshCw className="size-3" aria-hidden />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={L.dismissUpload}
                    className={iconButton}
                    onClick={() => setPending((rows) => rows.filter((r) => r.id !== row.id))}
                  >
                    <X className="size-3" aria-hidden />
                  </Button>
                </div>
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
      {resolveFigure && (
        <ImageViewer
          open={viewing !== null && viewing < keys.length}
          onOpenChange={(open) => !open && setViewing(null)}
          images={keys.map((key, index) => ({ src: resolveFigure(key), alt: L.figureAlt(index + 1) }))}
          index={viewing ?? 0}
          onIndexChange={setViewing}
        />
      )}
    </div>
  );
}
