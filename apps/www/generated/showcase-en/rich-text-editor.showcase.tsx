"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../../../../packages/ui/src/showcase/types";
import { RichTextEditor } from "../../../../packages/ui/src/rich-text-editor/rich-text-editor";
import { Field } from "../../../../packages/ui/src/field";
const SAMPLE = [
    "<p style=\"text-align: center\"><strong>Double 11 spend-and-save rules</strong></p>",
    "<p>Spend <span style=\"color: #e4393c\">299 yuan</span> during the campaign and take 50 yuan off, stackable with coupons.</p>",
    "<ul><li>Window: Nov 1, 00:00 to Nov 11, 24:00</li><li>Scope: the entire skincare category</li></ul>",
    "<blockquote>The organizer reserves the right of final interpretation.</blockquote>",
].join("");
function ControlledDemo() {
    const [html, setHtml] = useState("<p>Edit this text and watch <strong>the HTML string that gets stored</strong> below.</p>");
    return (<div className="w-[36rem] max-w-full space-y-2">
      <RichTextEditor value={html} onChange={setHtml} minRows={5}/>
      <pre className="max-h-32 overflow-auto rounded bg-surface-hover p-2 text-xs text-muted-foreground">
        {html}
      </pre>
    </div>);
}
export const richTextEditorShowcase: ShowcaseSpec = {
    examples: [
        {
            title: "Basic usage",
            description: "The value going in and out is an HTML fragment string, which is exactly what the database already stores and what v-html or a mini-program rich-text consumes directly.",
            code: `<RichTextEditor
  defaultValue='<p style="text-align: center"><strong>Campaign rules</strong></p>'
  className="w-[36rem]"
/>`,
            render: () => <RichTextEditor defaultValue={SAMPLE} className="w-[36rem] max-w-full"/>,
        },
        {
            title: "Trimming the toolbar",
            description: "toolbar names the entries you want, in render order. Trimming an entry also disables its extension, so it decides which tags survive a paste or a reload.",
            code: `<RichTextEditor
  toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]}
  placeholder="Trimmed toolbar"
/>`,
            render: () => (<RichTextEditor toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]} placeholder="Trimmed toolbar" minRows={4} className="w-[36rem] max-w-full"/>),
        },
        {
            title: "Image uploads stay with the consumer",
            description: "onUploadImage receives the File and returns a URL; the component only inserts <img src>. Without it the button falls back to a URL prompt, and base64 is never inlined.",
            code: `<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>`,
            render: () => (<RichTextEditor placeholder="Use the image button in the toolbar to pick a file" minRows={4} className="w-[36rem] max-w-full" onUploadImage={async (file) => ({ url: URL.createObjectURL(file) })}/>),
        },
        {
            title: "Inside a Field",
            description: "Pair it with Field: invalid switches the shell to the danger color, and name bridges to a native form whose submitted value is the HTML string.",
            code: `<Field label="Campaign details" required error="Details are required" className="w-[36rem]">
  <RichTextEditor name="detail" invalid placeholder="Required" />
</Field>`,
            render: () => (<Field label="Campaign details" required error="Details are required" className="w-[36rem] max-w-full">
          <RichTextEditor name="detail" invalid placeholder="Required" minRows={4}/>
        </Field>),
        },
    ],
    controls: [
        { prop: "placeholder", type: "text", defaultValue: "Write something\u2026" },
        { prop: "minRows", type: "number", defaultValue: 6 },
        { prop: "invalid", type: "boolean", defaultValue: false },
        { prop: "disabled", type: "boolean", defaultValue: false },
    ],
    states: [
        { name: "default", render: () => <RichTextEditor defaultValue={SAMPLE} className="w-[36rem] max-w-full"/> },
        { name: "Controlled (watch the stored HTML)", render: () => <ControlledDemo /> },
        {
            name: "Trimmed toolbar",
            render: () => (<RichTextEditor toolbar={["bold", "italic", "link"]} defaultValue="<p>Only three entries left</p>" className="w-[36rem] max-w-full"/>),
        },
        {
            name: "disabled",
            render: () => <RichTextEditor disabled defaultValue={SAMPLE} className="w-[36rem] max-w-full"/>,
        },
    ],
    renderWithProps: (p) => (<RichTextEditor placeholder={p.placeholder as string} minRows={p.minRows as number} invalid={p.invalid as boolean} disabled={p.disabled as boolean} defaultValue={SAMPLE} className="w-[36rem] max-w-full"/>),
    toCode: (p) => `<RichTextEditor${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} placeholder="${p.placeholder}" minRows={${p.minRows}} />`,
};
