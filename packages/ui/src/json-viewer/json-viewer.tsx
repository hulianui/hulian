"use client";
import { useState } from "react";

import { useComponentLocale } from "../config/locale-context";
import { cn } from "../lib/cn";
import { ChevronRight, Copy, Check } from "../_icons";
import type { JsonValueType, JsonViewerProps } from "./json-viewer.types";

// JsonViewer = 折叠式 JSON 树查看器（只读）：递归零依赖，语法着色，行级展开/折叠，
// 折叠态显 {…} N keys / […] N items，大对象按阈值懒展开，hover 复制节点值 + JSON path。
// 网关请求/响应日志检查器刚需。仅消费语义 token。

/** 判定 JSON 值类型（可测）。 */
export function valueType(v: unknown): JsonValueType {
  if (v === null || v === undefined) return "null";
  if (Array.isArray(v)) return "array";
  const t = typeof v;
  if (t === "object") return "object";
  if (t === "string") return "string";
  if (t === "number") return "number";
  if (t === "boolean") return "boolean";
  return "string";
}

/** 拼 JSON path（可测）：对象用点，数组用方括号。 */
export function jsonPath(parent: string, keyOrIndex: string | number, isIndex: boolean): string {
  return isIndex ? `${parent}[${keyOrIndex}]` : `${parent}.${keyOrIndex}`;
}

const valueClass: Record<JsonValueType, string> = {
  string: "text-success",
  number: "text-primary",
  boolean: "text-warning",
  null: "text-muted",
  object: "text-foreground",
  array: "text-foreground",
};

function renderLeaf(value: unknown, t: JsonValueType) {
  if (t === "string") return `"${value as string}"`;
  if (t === "null") return value === undefined ? "undefined" : "null";
  return String(value);
}

type Entry = [key: string | number, value: unknown, isIndex: boolean];

function entriesOf(value: unknown, t: JsonValueType): Entry[] {
  if (t === "array") return (value as unknown[]).map((v, i) => [i, v, true]);
  if (t === "object")
    return Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, v, false]);
  return [];
}

interface NodeProps {
  name?: string | number;
  isIndex?: boolean;
  value: unknown;
  depth: number;
  path: string;
  defaultExpandedDepth: number;
  maxAutoExpandKeys: number;
  onCopyPath?: (path: string) => void;
}

function JsonNode({
  name,
  isIndex,
  value,
  depth,
  path,
  defaultExpandedDepth,
  maxAutoExpandKeys,
  onCopyPath,
}: NodeProps) {
  const locale = useComponentLocale().jsonViewer ?? { copy: "复制", copied: "已复制" };
  const t = valueType(value);
  const isContainer = t === "object" || t === "array";
  const entries = isContainer ? entriesOf(value, t) : [];
  const count = entries.length;
  const [expanded, setExpanded] = useState(
    isContainer && depth < defaultExpandedDepth && count <= maxAutoExpandKeys,
  );
  const [copied, setCopied] = useState(false);

  const keyLabel = name != null ? <span className="text-foreground/80">{name}</span> : null;

  const copy = () => {
    void navigator.clipboard?.writeText(JSON.stringify(value, null, 2));
    onCopyPath?.(path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const copyBtn = (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? locale.copied : locale.copy}
      className="ml-2 hidden size-5 shrink-0 items-center justify-center rounded text-muted opacity-0 transition group-hover/row:opacity-100 hover:text-foreground group-hover/row:inline-flex"
    >
      {copied ? <Check className="size-3 text-primary" /> : <Copy className="size-3" />}
    </button>
  );

  if (!isContainer) {
    return (
      <div className="group/row flex items-center py-0.5">
        {keyLabel}
        {keyLabel && <span className="mr-1 text-muted">:</span>}
        <span className={valueClass[t]}>{renderLeaf(value, t)}</span>
        {copyBtn}
      </div>
    );
  }

  const openBrace = t === "array" ? "[" : "{";
  const closeBrace = t === "array" ? "]" : "}";
  const summary = t === "array" ? `[…] ${count} items` : `{…} ${count} keys`;

  return (
    <div>
      <div className="group/row flex items-center py-0.5">
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex items-center gap-1 text-left outline-none"
          aria-expanded={expanded}
        >
          <ChevronRight
            className={cn(
              "size-3 shrink-0 text-muted transition-transform",
              expanded && "rotate-90",
            )}
          />
          {keyLabel}
          {keyLabel && <span className="mr-1 text-muted">:</span>}
          {expanded ? (
            <span className="text-muted">{openBrace}</span>
          ) : (
            <span className="text-muted">{summary}</span>
          )}
        </button>
        {copyBtn}
      </div>
      {expanded && (
        <>
          <div className="ml-1.5 border-l border-border pl-3">
            {entries.map(([k, v, idx]) => (
              <JsonNode
                key={String(k)}
                name={k}
                isIndex={idx}
                value={v}
                depth={depth + 1}
                path={jsonPath(path, k, idx)}
                defaultExpandedDepth={defaultExpandedDepth}
                maxAutoExpandKeys={maxAutoExpandKeys}
                onCopyPath={onCopyPath}
              />
            ))}
          </div>
          <div className="pl-1 text-muted">{closeBrace}</div>
        </>
      )}
    </div>
  );
}

export function JsonViewer({
  data,
  rootName,
  defaultExpandedDepth = 1,
  maxAutoExpandKeys = 50,
  onCopyPath,
  className,
}: JsonViewerProps) {
  const t = valueType(data);
  const isContainer = t === "object" || t === "array";

  return (
    <div className={cn("font-mono text-xs leading-relaxed text-foreground", className)}>
      {isContainer ? (
        entriesOf(data, t).map(([k, v, idx]) => (
          <JsonNode
            key={String(k)}
            name={k}
            isIndex={idx}
            value={v}
            depth={1}
            path={jsonPath(rootName ? `$.${rootName}` : "$", k, idx)}
            defaultExpandedDepth={defaultExpandedDepth}
            maxAutoExpandKeys={maxAutoExpandKeys}
            onCopyPath={onCopyPath}
          />
        ))
      ) : (
        <span className={valueClass[t]}>{renderLeaf(data, t)}</span>
      )}
    </div>
  );
}
