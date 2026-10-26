"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "../button";
import { Empty } from "../empty";
import { Input } from "../input";
import { Markdown } from "../markdown";
import { MarkdownEditor } from "../markdown-editor";
import { Popconfirm } from "../popconfirm";
import { ScrollArea } from "../scroll-area";
import { Sortable } from "../sortable";
import { Text } from "../text";
import { Toolbar, ToolbarButton, ToolbarToggle } from "../toolbar";
import { VirtualList } from "../virtual-list";
import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { novelCharCount } from "../novel-reader/novel-reader.logic";
import type { NovelChapter } from "../novel-reader/novel-reader.types";
import type { NovelEditorProps } from "./novel-editor.types";

const SORTABLE_LIMIT = 40;

const FALLBACK = {
  chapters: "章节",
  newChapter: "新建章节",
  delete: "删除",
  deleteConfirm: "删除这一章？",
  deleteDescription: "删除后不能恢复。",
  save: "保存",
  emptyTitle: "还没有章节",
  emptyDescription: "先新建一章再写正文。",
  preview: "预览",
  previewEmpty: "这一章还没有正文。",
  titlePlaceholder: "章节标题",
  untitled: "未命名章节",
  wordCount: (count: number) => `${count} 字`,
  editorLabel: "正文",
  showPreview: "显示预览",
  hidePreview: "收起预览",
  collapseChapters: "收起章节",
  expandChapters: "展开章节",
  moveUp: "上移",
  moveDown: "下移",
};

type Labels = typeof FALLBACK;

function useControllable<T>(controlled: T | undefined, fallback: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = useState(fallback);
  const value = controlled !== undefined ? controlled : uncontrolled;
  const setValue = (next: T) => {
    if (controlled === undefined) setUncontrolled(next);
    onChange?.(next);
  };
  return [value, setValue] as const;
}

export function NovelEditor({
  chapters: chaptersProp,
  defaultChapters,
  onChaptersChange,
  activeChapterId: activeChapterIdProp,
  defaultActiveChapterId,
  onActiveChapterChange,
  onSave,
  disabled,
  className,
  ...rest
}: NovelEditorProps) {
  const labels: Labels = { ...FALLBACK, ...useComponentLocale().novelEditor };
  const [chapters, setChapters] = useControllable(chaptersProp, defaultChapters ?? [], onChaptersChange);
  const [activeId, setActiveId] = useControllable(
    activeChapterIdProp,
    defaultActiveChapterId ?? chapters[0]?.id ?? "",
    onActiveChapterChange,
  );
  const [preview, setPreview] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const sequence = useRef(0);

  const active = chapters.find((chapter) => chapter.id === activeId) ?? chapters[0] ?? null;

  const update = (next: NovelChapter[], nextActive = active?.id) => {
    setChapters(next);
    const resolved =
      nextActive && next.some((chapter) => chapter.id === nextActive) ? nextActive : (next[0]?.id ?? "");
    if (resolved !== activeId) setActiveId(resolved);
  };

  const patch = (id: string, partial: Partial<NovelChapter>) => {
    update(
      chapters.map((chapter) => (chapter.id === id ? { ...chapter, ...partial } : chapter)),
      id,
    );
  };

  const createChapter = () => {
    sequence.current += 1;
    const id = `n-${sequence.current}`;
    update([...chapters, { id, title: labels.untitled, content: "" }], id);
  };

  const removeChapter = (id: string) => {
    const next = chapters.filter((chapter) => chapter.id !== id);
    const fallback = next[Math.max(0, chapters.findIndex((chapter) => chapter.id === id) - 1)]?.id;
    update(next, active?.id === id ? fallback : active?.id);
  };

  const moveChapter = (from: number, delta: number) => {
    const to = from + delta;
    if (to < 0 || to >= chapters.length) return;
    const next = chapters.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    update(next, active?.id);
  };

  const chapterButton = (chapter: NovelChapter, chapterIndex: number, extra?: ReactNode) => (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1", chapter.id === active?.id && "text-primary")}>
      <Button
        type="button"
        variant={chapter.id === active?.id ? "solid" : "ghost"}
        size="sm"
        className="min-w-0 flex-1 justify-start"
        disabled={disabled}
        aria-current={chapter.id === active?.id ? "page" : undefined}
        onClick={() => setActiveId(chapter.id)}
      >
        <span className="truncate">
          {chapterIndex + 1}. {chapter.title}
        </span>
      </Button>
      {extra}
      <Popconfirm
        title={labels.deleteConfirm}
        description={labels.deleteDescription}
        danger
        onConfirm={() => removeChapter(chapter.id)}
      >
        <Button type="button" variant="ghost" size="sm" muted disabled={disabled} aria-label={labels.delete}>
          {labels.delete}
        </Button>
      </Popconfirm>
    </div>
  );

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-bg text-foreground", className)} {...rest}>
      {chapters.length === 0 || !active ? (
        <Empty title={labels.emptyTitle} description={labels.emptyDescription} icon={null}>
          <Button type="button" onClick={createChapter} disabled={disabled}>
            {labels.newChapter}
          </Button>
        </Empty>
      ) : (
        <div className="flex min-h-0 flex-1">
          {collapsed ? null : (
            <aside className="flex w-64 shrink-0 flex-col border-r border-border">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <Text size="sm" weight="medium">
                  {labels.chapters}
                </Text>
                <Button type="button" variant="ghost" size="sm" onClick={createChapter} disabled={disabled}>
                  {labels.newChapter}
                </Button>
              </div>
              {chapters.length > SORTABLE_LIMIT ? (
                <VirtualList
                  items={chapters}
                  itemHeight={44}
                  height="100%"
                  className="min-h-0 flex-1"
                  getKey={(chapter) => chapter.id}
                  renderItem={(chapter, chapterIndex) => (
                    <div className="flex items-center gap-1 px-2">
                      {chapterButton(
                        chapter,
                        chapterIndex,
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            muted
                            disabled={disabled || chapterIndex === 0}
                            aria-label={labels.moveUp}
                            onClick={() => moveChapter(chapterIndex, -1)}
                          >
                            {labels.moveUp}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            muted
                            disabled={disabled || chapterIndex === chapters.length - 1}
                            aria-label={labels.moveDown}
                            onClick={() => moveChapter(chapterIndex, 1)}
                          >
                            {labels.moveDown}
                          </Button>
                        </>,
                      )}
                    </div>
                  )}
                />
              ) : (
                <ScrollArea className="min-h-0 flex-1">
                  <Sortable
                    items={chapters}
                    handle
                    onChange={(next) => update(next, active.id)}
                    renderItem={(chapter, state) => chapterButton(chapter, state.index)}
                  />
                </ScrollArea>
              )}
            </aside>
          )}
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                muted
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((value) => !value)}
              >
                {collapsed ? labels.expandChapters : labels.collapseChapters}
              </Button>
              <Input
                aria-label={labels.titlePlaceholder}
                placeholder={labels.titlePlaceholder}
                value={active.title}
                disabled={disabled}
                className="max-w-sm flex-1"
                onChange={(event) => patch(active.id, { title: event.target.value })}
              />
              <Text size="xs" tone="muted">
                {labels.wordCount(active.wordCount ?? novelCharCount(active.content))}
              </Text>
              <Toolbar aria-label={labels.preview} className="ml-auto">
                <ToolbarToggle
                  pressed={preview}
                  disabled={disabled}
                  aria-label={preview ? labels.hidePreview : labels.showPreview}
                  onPressedChange={setPreview}
                >
                  {preview ? labels.hidePreview : labels.showPreview}
                </ToolbarToggle>
                {onSave ? (
                  <ToolbarButton disabled={disabled} aria-label={labels.save} onClick={() => onSave(chapters)}>
                    {labels.save}
                  </ToolbarButton>
                ) : null}
              </Toolbar>
            </div>
            <div className={cn("grid min-h-0 flex-1", preview && "lg:grid-cols-2")}>
              <div className="min-h-0 overflow-auto p-3">
                <MarkdownEditor
                  key={active.id}
                  value={active.content}
                  disabled={disabled}
                  minRows={12}
                  aria-label={labels.editorLabel}
                  className="min-h-full"
                  onChange={(markdown) => patch(active.id, { content: markdown })}
                />
              </div>
              {preview ? (
                <div
                  className="min-h-0 overflow-auto border-t border-border p-4 lg:border-l lg:border-t-0"
                  aria-label={labels.preview}
                >
                  {active.content.trim() ? (
                    <Markdown>{active.content}</Markdown>
                  ) : (
                    <Text tone="muted">{labels.previewEmpty}</Text>
                  )}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
