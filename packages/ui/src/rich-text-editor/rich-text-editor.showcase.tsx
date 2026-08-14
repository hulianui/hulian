"use client";
import { useState } from "react";
import type { ShowcaseSpec } from "../showcase/types";
import { RichTextEditor } from "./rich-text-editor";
import { Field } from "../field";

// 运营在后台攒出来的那种正文：居中标题、红字重点、列表、表格 —— 都是内联样式的 HTML。
const SAMPLE = [
  '<p style="text-align: center"><strong>双十一满减活动细则</strong></p>',
  '<p>活动期间下单满 <span style="color: #e4393c">299 元</span> 立减 50 元，可与优惠券叠加。</p>',
  "<ul><li>时间：11 月 1 日 0 点 — 11 月 11 日 24 点</li><li>范围：全场护肤品类</li></ul>",
  "<blockquote>最终解释权归主办方所有。</blockquote>",
].join("");

// 存量长文那一档：隐私条款 / 商品详情动辄七八千字，不给上限就会把整页撑到上万 px。
const LONG_TITLE = "<p style=\"text-align: center\"><strong>用户服务协议</strong></p>";
const LONG_PARAGRAPH =
  "本条为运营逐年追加的正文段落示例。存量正文里这样的段落常有几十上百段，不给高度上限时编辑区会一直往下长，把工具栏和页面底部的保存按钮一起顶出视口。";
const LONG_SAMPLE = [
  LONG_TITLE,
  ...Array.from({ length: 12 }, (_, i) => `<p>${i + 1}. ${LONG_PARAGRAPH}</p>`),
].join("");

function ControlledDemo() {
  const [html, setHtml] = useState('<p>改这段文字，右下方看<strong>存进库里的那串 HTML</strong></p>');
  return (
    <div className="w-[36rem] max-w-full space-y-2">
      <RichTextEditor value={html} onChange={setHtml} minRows={5} />
      <pre className="max-h-32 overflow-auto rounded bg-surface-hover p-2 text-xs text-muted-foreground">
        {html}
      </pre>
    </div>
  );
}

export const richTextEditorShowcase: ShowcaseSpec = {
  examples: [
    {
      title: "基础用法",
      description:
        "值进出都是 HTML 片段串：存量数据库里躺的就是它，前台 v-html / 小程序 rich-text 直接吃。",
      code: `<RichTextEditor
  defaultValue='<p style="text-align: center"><strong>活动细则</strong></p>'
  className="w-[36rem]"
/>`,
      render: () => <RichTextEditor defaultValue={SAMPLE} className="w-[36rem] max-w-full" />,
    },
    {
      title: "工具栏裁剪",
      description:
        "toolbar 点名要哪几档，顺序即渲染顺序。裁掉一档同时会关掉对应扩展，所以它也决定了粘贴/回填时哪些标签能活下来。",
      code: `<RichTextEditor
  toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]}
  placeholder="精简工具栏"
/>`,
      render: () => (
        <RichTextEditor
          toolbar={["bold", "italic", "underline", "divider", "bulletList", "link"]}
          placeholder="精简工具栏"
          minRows={4}
          className="w-[36rem] max-w-full"
        />
      ),
    },
    {
      title: "长正文给高度上限",
      description:
        "maxRows / maxHeight 给一档上限，超过就让正文自己内部滚动，工具栏留在滚动区外 —— 滚到第几千 px 也够得着加粗按钮。",
      code: `<RichTextEditor minRows={8} maxRows={12} defaultValue={LONG_HTML} />
// 或直接给长度：maxHeight={480} / maxHeight="60vh"`,
      render: () => (
        <RichTextEditor
          minRows={8}
          maxRows={12}
          defaultValue={LONG_SAMPLE}
          className="w-[36rem] max-w-full"
        />
      ),
    },
    {
      title: "图片上传交还消费方",
      description:
        "onUploadImage 拿到 File、还回 URL，组件只负责插 <img src>。不传则退回填 URL —— 任何情况下都不内联 base64。",
      code: `<RichTextEditor
  onUploadImage={async (file) => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form, headers: authHeaders });
    return { url: (await res.json()).url };
  }}
/>`,
      render: () => (
        <RichTextEditor
          placeholder="点工具栏的图片按钮选文件"
          minRows={4}
          className="w-[36rem] max-w-full"
          onUploadImage={async (file) => ({ url: URL.createObjectURL(file) })}
        />
      ),
    },
    {
      title: "表单内（Field）",
      description: "配 Field 用：invalid 触发 danger 外壳，name 桥接原生表单（提交的值是 HTML 串）。",
      code: `<Field label="活动详情" required error="详情不能为空" className="w-[36rem]">
  <RichTextEditor name="detail" invalid placeholder="必填" />
</Field>`,
      render: () => (
        <Field label="活动详情" required error="详情不能为空" className="w-[36rem] max-w-full">
          <RichTextEditor name="detail" invalid placeholder="必填" minRows={4} />
        </Field>
      ),
    },
  ],
  controls: [
    { prop: "placeholder", type: "text", defaultValue: "写点什么…" },
    { prop: "minRows", type: "number", defaultValue: 6 },
    { prop: "invalid", type: "boolean", defaultValue: false },
    { prop: "disabled", type: "boolean", defaultValue: false },
  ],
  states: [
    { name: "default", render: () => <RichTextEditor defaultValue={SAMPLE} className="w-[36rem] max-w-full" /> },
    { name: "受控（看存进库的 HTML）", render: () => <ControlledDemo /> },
    {
      name: "精简工具栏",
      render: () => (
        <RichTextEditor
          toolbar={["bold", "italic", "link"]}
          defaultValue="<p>只留三档</p>"
          className="w-[36rem] max-w-full"
        />
      ),
    },
    {
      name: "disabled",
      render: () => <RichTextEditor disabled defaultValue={SAMPLE} className="w-[36rem] max-w-full" />,
    },
  ],
  renderWithProps: (p) => (
    <RichTextEditor
      placeholder={p.placeholder as string}
      minRows={p.minRows as number}
      invalid={p.invalid as boolean}
      disabled={p.disabled as boolean}
      defaultValue={SAMPLE}
      className="w-[36rem] max-w-full"
    />
  ),
  toCode: (p) =>
    `<RichTextEditor${p.invalid ? " invalid" : ""}${p.disabled ? " disabled" : ""} placeholder="${p.placeholder}" minRows={${p.minRows}} />`,
};
