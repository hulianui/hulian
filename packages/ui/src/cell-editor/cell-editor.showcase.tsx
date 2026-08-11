"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { CellEditor } from "./cell-editor";

interface Field {
  key: string;
  label: string;
  value: string;
  multiline?: boolean;
}

const INITIAL_FIELDS: Field[] = [
  { key: "name", label: "客户名称", value: "杭州云枢科技有限公司" },
  { key: "contact", label: "联系人", value: "" },
  { key: "phone", label: "联系电话", value: "0571-8888 6120" },
  { key: "address", label: "开票地址", value: "", multiline: true },
  {
    key: "remark",
    label: "备注",
    value: "季度对账已确认\n发票抬头以营业执照为准",
    multiline: true,
  },
];

const isBlank = (value: string) => value.trim().length === 0;

function CommitLog({ entries }: { entries: string[] }) {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-subtle p-3 text-xs">
      <p className="mb-1 font-medium text-foreground">提交记录</p>
      {entries.length === 0 ? (
        <p className="text-muted-foreground">
          还没有提交。点进去看一眼再点走不会发请求，只有值真的变了才发。
        </p>
      ) : (
        <ul className="space-y-0.5 text-muted-foreground">
          {entries.map((entry, index) => (
            <li key={`${entry}-${String(index)}`}>{entry}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BasicDemo() {
  const [value, setValue] = useState("杭州云枢科技有限公司");
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="w-full max-w-md space-y-3">
      <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
        <CellEditor
          aria-label="客户名称"
          value={value}
          placeholder="未填写"
          onCommit={(next) => {
            setValue(next);
            setLog((prev) => [...prev, `提交：${next}`]);
          }}
        />
      </div>
      <CommitLog entries={log} />
    </div>
  );
}

function TableDemo() {
  const [fields, setFields] = useState(INITIAL_FIELDS);
  const [log, setLog] = useState<string[]>([]);

  return (
    <div className="w-full max-w-2xl space-y-3">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="w-32 px-3 py-2 font-medium">字段</th>
            <th className="px-3 py-2 font-medium">值</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.key} className="border-b border-border align-top">
              <th scope="row" className="px-3 py-2 text-left font-normal text-muted-foreground">
                {field.label}
              </th>
              <td className="px-3 py-2">
                <CellEditor
                  aria-label={field.label}
                  value={field.value}
                  multiline={field.multiline}
                  missing={isBlank(field.value)}
                  placeholder="未填写"
                  onCommit={(next) => {
                    setFields((prev) =>
                      prev.map((item) =>
                        item.key === field.key ? { ...item, value: next } : item,
                      ),
                    );
                    setLog((prev) => [...prev, `${field.label} → ${next.trim() || "（清空）"}`]);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <CommitLog entries={log} />
    </div>
  );
}

function AsyncDemo() {
  const [value, setValue] = useState("0571-8888 6120");
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div className="w-full max-w-md space-y-2">
      <div className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
        <CellEditor
          aria-label="联系电话"
          value={value}
          placeholder="未填写"
          onCommit={async (next) => {
            await new Promise((resolve) => setTimeout(resolve, 900));
            setValue(next);
            setSaved(next);
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {saved === null ? "改一个字再失焦：请求飞出去的那 0.9 秒里这一格自己禁用。" : `已存：${saved}`}
      </p>
    </div>
  );
}

function PlaygroundCell({
  initial,
  missing,
  multiline,
  disabled,
  placeholder,
}: {
  initial: string;
  missing: boolean;
  multiline: boolean;
  disabled: boolean;
  placeholder: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-72 rounded-[var(--radius)] border border-border bg-surface px-3 py-2">
      <CellEditor
        aria-label="单元格"
        value={value}
        missing={missing}
        multiline={multiline}
        disabled={disabled}
        placeholder={placeholder}
        onCommit={setValue}
      />
    </div>
  );
}

export const cellEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "静止时就是表格里的一段文字，聚焦才出浅底 + 下划线。失焦或 Enter 提交，Esc 回滚到进入编辑前的值；值没变不会调 onCommit。",
      code: `const [value, setValue] = useState("杭州云枢科技有限公司");

<CellEditor
  value={value}
  placeholder="未填写"
  onCommit={(next) => setValue(next)}
/>`,
      render: () => <BasicDemo />,
    },
    {
      title: "核对表 · missing 与多行",
      description:
        "核对场景的主场：空字段用 missing 降成灰斜体，一眼看出哪儿还没填；长文本用 multiline，高度靠 CSS field-sizing 跟着内容长，不是 JS 测高。",
      code: `<CellEditor
  value={field.value}
  multiline={field.multiline}
  missing={field.value.trim() === ""}
  placeholder="未填写"
  onCommit={(next) => save(field.key, next)}
/>`,
      render: () => <TableDemo />,
    },
    {
      title: "异步提交",
      description:
        "onCommit 返回 Promise 时这一格自己进 pending 态并禁用，消费方不必再传一个 saving 标志位。",
      code: `<CellEditor
  value={value}
  onCommit={async (next) => {
    await api.patch(id, { phone: next });
    setValue(next);
  }}
/>`,
      render: () => <AsyncDemo />,
    },
  ],
  controls: [
    { prop: "value", type: "text", defaultValue: "杭州云枢科技有限公司", label: "值" },
    { prop: "placeholder", type: "text", defaultValue: "未填写", label: "占位文案" },
    { prop: "missing", type: "boolean", defaultValue: false, label: "缺失态" },
    { prop: "multiline", type: "boolean", defaultValue: false, label: "多行" },
    { prop: "disabled", type: "boolean", defaultValue: false, label: "禁用" },
  ],
  states: [
    { name: "默认", render: () => <BasicDemo /> },
    { name: "核对表 · missing 与多行", render: () => <TableDemo /> },
    { name: "异步提交", render: () => <AsyncDemo /> },
  ],
  renderWithProps: (props) => {
    const initial = String(props.value ?? "杭州云枢科技有限公司");
    const placeholder = String(props.placeholder ?? "未填写");
    return (
      <PlaygroundCell
        key={`${initial}-${placeholder}`}
        initial={initial}
        placeholder={placeholder}
        missing={Boolean(props.missing)}
        multiline={Boolean(props.multiline)}
        disabled={Boolean(props.disabled)}
      />
    );
  },
  toCode: (props) =>
    `<CellEditor
  value={value}
  placeholder="${String(props.placeholder ?? "未填写")}"${props.missing ? "\n  missing" : ""}${
    props.multiline ? "\n  multiline" : ""
  }${props.disabled ? "\n  disabled" : ""}
  onCommit={(next) => setValue(next)}
/>`,
};
