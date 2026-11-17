import { memo } from "react";
import { cn } from "../lib/cn";
import { File } from "../_icons";
import { diffLines, diffStat, type DiffRow } from "./code-diff.diff";
import type { CodeDiffAnnotation, CodeDiffProps } from "./code-diff.types";

// 行底色（字面类）：add 绿 / del 红 / context 透明。
const ROW_BG: Record<DiffRow["type"], string> = {
  add: "bg-success/10",
  del: "bg-danger/10",
  context: "",
};
const SIGN: Record<DiffRow["type"], string> = { add: "+", del: "-", context: " " };
const SIGN_COLOR: Record<DiffRow["type"], string> = {
  add: "text-success",
  del: "text-danger",
  context: "text-muted-foreground",
};

function Gutter({ no }: { no: number | null }) {
  return (
    <span className="inline-block w-8 shrink-0 select-none pr-2 text-right text-muted-foreground tabular-nums">
      {no ?? ""}
    </span>
  );
}

// 按行匹配 annotation：new 侧比 newNo、old 侧比 oldNo（默认 new）。
function findAnno(annos: CodeDiffAnnotation[] | undefined, r: DiffRow): CodeDiffAnnotation | undefined {
  if (!annos) return undefined;
  return annos.find((a) => ((a.side ?? "new") === "new" ? r.newNo === a.line : r.oldNo === a.line));
}

function CodeDiffImpl({
  oldText,
  newText,
  mode = "unified",
  filename,
  showLineNumbers = true,
  annotations,
  className,
}: CodeDiffProps) {
  const rows = diffLines(oldText, newText);
  const { added, removed } = diffStat(rows);
  const hasGutterSlot = annotations?.some((a) => a.gutter != null) ?? false;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius)] border border-border bg-surface font-mono text-xs",
        className,
      )}
    >
      {(filename != null || added > 0 || removed > 0) && (
        // 文件头：surface 亮底 + 文件图标 + 加粗文件名 + 彩色药丸统计。
        // 此前是 bg-subtle 灰带（亮 gray-100 / 暗 gray-800），压在整块顶上反而比代码区更暗，
        // 文件名只是一行等宽小字，读者扫一页 diff 时找不到「这是哪个文件」。
        <div
          data-slot="code-diff-header"
          className="flex items-center justify-between gap-3 border-b border-border bg-surface px-3 py-2"
        >
          {filename != null && (
            <span className="flex min-w-0 items-center gap-2 text-foreground">
              <File aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{filename}</span>
            </span>
          )}
          <span className="ml-auto flex shrink-0 items-center gap-1.5 tabular-nums">
            <span className="rounded-full bg-success-subtle px-1.5 py-px font-medium text-success">+{added}</span>
            <span className="rounded-full bg-danger-subtle px-1.5 py-px font-medium text-danger">−{removed}</span>
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        {mode === "unified" ? (
          <div className="min-w-max">
            {rows.map((r, i) => {
              const anno = findAnno(annotations, r);
              return (
                <div key={i}>
                  <div className={cn("flex whitespace-pre px-2 leading-relaxed", ROW_BG[r.type])}>
                    {showLineNumbers && (
                      <>
                        <Gutter no={r.oldNo} />
                        <Gutter no={r.newNo} />
                      </>
                    )}
                    {hasGutterSlot && (
                      <span className="inline-flex w-4 shrink-0 select-none items-center justify-center">
                        {anno?.gutter}
                      </span>
                    )}
                    <span className={cn("w-4 shrink-0 select-none text-center", SIGN_COLOR[r.type])}>
                      {SIGN[r.type]}
                    </span>
                    <span className="text-foreground">{r.text || " "}</span>
                  </div>
                  {anno?.content && (
                    <div
                      data-cd-annotation
                      className="whitespace-normal border-y border-border bg-subtle px-2 py-2 font-sans"
                    >
                      {anno.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="min-w-max">
            {rows.map((r, i) => {
              const left = r.type === "add" ? null : r;
              const right = r.type === "del" ? null : r;
              return (
                <div key={i} className="grid grid-cols-2 leading-relaxed">
                  <div className={cn("flex whitespace-pre border-r border-border px-2", left ? ROW_BG[left.type] : "")}>
                    {showLineNumbers && <Gutter no={left?.oldNo ?? null} />}
                    {left && (
                      <span className={cn("w-4 shrink-0 select-none text-center", SIGN_COLOR[left.type])}>
                        {left.type === "del" ? "-" : " "}
                      </span>
                    )}
                    <span className="text-foreground">{left ? left.text || " " : ""}</span>
                  </div>
                  <div className={cn("flex whitespace-pre px-2", right ? ROW_BG[right.type] : "")}>
                    {showLineNumbers && <Gutter no={right?.newNo ?? null} />}
                    {right && (
                      <span className={cn("w-4 shrink-0 select-none text-center", SIGN_COLOR[right.type])}>
                        {right.type === "add" ? "+" : " "}
                      </span>
                    )}
                    <span className="text-foreground">{right ? right.text || " " : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export const CodeDiff = memo(CodeDiffImpl);
CodeDiff.displayName = "CodeDiff";
