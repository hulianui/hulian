"use client";
import { useState, type ReactNode } from "react";
import { Button } from "../button";
import { useLocale } from "../config/locale";
import { Input } from "../input";
import { cn } from "../lib/cn";
import type { EditableTableProps } from "./editable-table.types";

// EditableTable = 行内编辑表格（企业录入场景）。自包含表格皮肤(复用 Table 同款 token 类) + Input/Button。
// 行级编辑：编辑→草稿副本→保存(可校验)提交 onChange / 取消还原；可删行、可新增一行(自动进编辑态)。
const alignClass = { left: "text-left", center: "text-center", right: "text-right" } as const;

export function EditableTable<T>({
  columns,
  data,
  rowKey,
  onChange,
  addable,
  newRow,
  deletable,
  validateRow,
  className,
}: EditableTableProps<T>) {
  const loc = useLocale().editableTable;
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<T | null>(null);

  const colCount = columns.length + 1;

  const startEdit = (row: T) => {
    setEditingKey(rowKey(row));
    setDraft({ ...row });
  };
  const cancel = () => {
    setEditingKey(null);
    setDraft(null);
  };
  const save = () => {
    if (!draft) return;
    if (validateRow && !validateRow(draft)) return; // 校验不过：保持编辑态
    onChange?.(data.map((r) => (rowKey(r) === editingKey ? draft : r)));
    setEditingKey(null);
    setDraft(null);
  };
  const remove = (row: T) => onChange?.(data.filter((r) => rowKey(r) !== rowKey(row)));
  const add = () => {
    if (!newRow) return;
    const r = newRow();
    onChange?.([...data, r]);
    setEditingKey(rowKey(r));
    setDraft({ ...r });
  };
  const setDraftField = (key: string, v: unknown) =>
    setDraft((d) => (d ? ({ ...d, [key]: v } as T) : d));

  const busy = editingKey !== null;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="overflow-x-auto rounded-[var(--radius)] border border-border">
        <table className="w-full border-collapse text-sm">
          <thead className="text-muted">
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={cn("px-3 py-2 font-medium", alignClass[c.align ?? "left"])}
                >
                  {c.title}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">{loc.actions}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="py-10 text-center text-muted">
                  {loc.empty}
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const editing = rowKey(row) === editingKey;
                const current = (editing && draft ? draft : row) as Record<string, unknown>;
                return (
                  <tr
                    key={rowKey(row)}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-hover"
                  >
                    {columns.map((c) => {
                      const value = current[c.key];
                      return (
                        <td
                          key={c.key}
                          className={cn("px-3 py-2 align-middle", alignClass[c.align ?? "left"])}
                        >
                          {editing && c.editable ? (
                            c.editor ? (
                              c.editor(value, (v) => setDraftField(c.key, v), current as T)
                            ) : (
                              <Input
                                value={value == null ? "" : String(value)}
                                onChange={(e) => setDraftField(c.key, e.target.value)}
                                aria-label={c.key}
                              />
                            )
                          ) : c.render ? (
                            c.render(value as T[keyof T], row)
                          ) : (
                            (value as ReactNode)
                          )}
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 text-right align-middle whitespace-nowrap">
                      {editing ? (
                        <span className="inline-flex gap-1.5">
                          <Button size="sm" onClick={save}>
                            {loc.save}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={cancel}>
                            {loc.cancel}
                          </Button>
                        </span>
                      ) : (
                        <span className="inline-flex gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => startEdit(row)} disabled={busy}>
                            {loc.edit}
                          </Button>
                          {deletable && (
                            <Button
                              size="sm"
                              variant="ghost"
                              tone="danger"
                              onClick={() => remove(row)}
                              disabled={busy}
                            >
                              {loc.delete}
                            </Button>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {addable && newRow && (
        <div>
          <Button variant="outline" size="sm" onClick={add} disabled={busy}>
            + {loc.add}
          </Button>
        </div>
      )}
    </div>
  );
}
