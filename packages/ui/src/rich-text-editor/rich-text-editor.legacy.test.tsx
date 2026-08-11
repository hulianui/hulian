import { describe, it, expect, afterEach } from "vitest";
import { render, cleanup, waitFor } from "@testing-library/react";
import { RichTextEditor } from "./rich-text-editor";
import { normalizeLegacyHtml } from "./rich-text-editor.legacy";
import { sanitizePastedHtml } from "./rich-text-editor.sanitize";

afterEach(cleanup);

/**
 * 读回编辑器内容区的 HTML。
 *
 * ProseMirror 会在空块尾部塞 `<br class="ProseMirror-trailingBreak">` 作渲染占位，
 * 它不进 `getHTML()`。不剥掉会把 br 数量算成翻倍 —— #208 的复现里点名了这个陷阱。
 */
async function readback(container: HTMLElement): Promise<string> {
  await waitFor(() => expect(container.querySelector('[role="textbox"]')).toBeTruthy());
  const body = container.querySelector('[role="textbox"]')!.cloneNode(true) as HTMLElement;
  for (const br of Array.from(body.querySelectorAll("br.ProseMirror-trailingBreak"))) br.remove();
  return body.innerHTML;
}

// 取自 #208 的真实存量形态：微信编辑器 / 老 UEditor 吐出来的正文。
const FONT_HTML = '<p><font color="#e4393c" face="微软雅黑" size="3">红色强调</font></p>';
const IMG_HTML = '<p><img src="https://cdn/a.png" style="max-width:100%;height:auto"></p>';
const SECTION_HTML = '<section style="text-align:center"><p>居中段</p></section>';
// #210：运营拿它做「暗红底白字」那种标记。存量里它和 color 写在同一个 style 上。
const BG_HTML = '<p><span style="background-color: rgb(194, 79, 74);">重点内容</span></p>';

describe("normalizeLegacyHtml（#208 纯函数）", () => {
  it("<font color|face|size> 三个属性全部翻成 <span style>", () => {
    const out = normalizeLegacyHtml(FONT_HTML);
    expect(out).not.toContain("<font");
    expect(out).toContain("color: #e4393c");
    expect(out).toContain("font-family: '微软雅黑'");
    expect(out).toContain("font-size: 16px"); // size="3" 是正文号，同浏览器口径
    expect(out).toContain("红色强调");
  });

  it("<font size> 认相对值，越界夹到 1..7", () => {
    expect(normalizeLegacyHtml('<font size="+2">x</font>')).toContain("font-size: 24px");
    expect(normalizeLegacyHtml('<font size="-1">x</font>')).toContain("font-size: 13px");
    expect(normalizeLegacyHtml('<font size="99">x</font>')).toContain("font-size: 48px");
  });

  it("非 ASCII 与带空格的族名都加单引号（不加会被整条丢、后备栈还会被截断）", () => {
    const out = normalizeLegacyHtml('<font face="Microsoft YaHei, 宋体, Arial">x</font>');
    expect(out).toContain("font-family: 'Microsoft YaHei', '宋体', Arial");
  });

  it("一个属性都没有的 <font> 解掉标签、留下文字", () => {
    const out = normalizeLegacyHtml("<p><font>纯文字</font></p>");
    expect(out).toBe("<p>纯文字</p>");
  });

  it("属性值过形状白名单：拼不出第二条声明", () => {
    // color 是消费方数据库里的用户可写字段，直接拼进 style 等于把整个属性交出去。
    const injected = normalizeLegacyHtml(
      '<font color="red;position:fixed;z-index:9999" face="宋体;top:0">x</font>',
    );
    expect(injected).not.toContain("position");
    expect(injected).not.toContain("z-index");
    expect(injected).not.toContain("top:");
    // 两个值都不合法 → 整个 <font> 退化成解标签
    expect(injected).toBe("x");
    // 合法值照常
    expect(normalizeLegacyHtml('<font color="rgb(228, 57, 60)">x</font>')).toContain(
      "color: rgb(228, 57, 60)",
    );
  });

  it("<section> 上的 text-align 下推到子块", () => {
    const out = normalizeLegacyHtml(SECTION_HTML);
    expect(out).toContain("<p style=\"text-align: center;\">居中段</p>");
  });

  it("子块自己声明了对齐就不被父级覆盖（同 CSS 的子覆盖父）", () => {
    const out = normalizeLegacyHtml(
      '<section style="text-align:center"><p style="text-align:right">右</p></section>',
    );
    expect(out).toContain("text-align:right");
    expect(out).not.toContain("center;\">右");
  });

  it("只裹行内内容的包裹块直接转成 <p>，把对齐带上", () => {
    const out = normalizeLegacyHtml('<section style="text-align:center">直接文字</section>');
    expect(out).toBe('<p style="text-align: center">直接文字</p>');
  });

  it("只裹一张图的包裹块不转 <p>（图是块级节点，转了只会多出一个空段落）", () => {
    const out = normalizeLegacyHtml(
      '<section style="text-align:center"><img src="https://cdn/a.png"></section>',
    );
    expect(out).not.toContain("<p");
  });

  it("认 align 属性与 <center> 标签（老 UEditor / Word 的另外两种写法）", () => {
    expect(normalizeLegacyHtml('<div align="center"><p>x</p></div>')).toContain(
      "text-align: center",
    );
    expect(normalizeLegacyHtml("<center>x</center>")).toBe('<p style="text-align: center">x</p>');
    // align="middle" 是垂直对齐语义，不认
    expect(normalizeLegacyHtml('<p align="middle">x</p>')).toBe("<p>x</p>");
  });

  it("分档独立：只开一档时另一档一个字节都不动", () => {
    expect(normalizeLegacyHtml(SECTION_HTML, { font: true })).toBe(SECTION_HTML);
    expect(normalizeLegacyHtml(FONT_HTML, { align: true })).toBe(FONT_HTML);
    expect(normalizeLegacyHtml(FONT_HTML, {})).toBe(FONT_HTML);
  });

  it("不是消毒函数，但也不会自己造出脏东西：净化仍能接在后面", () => {
    const piped = sanitizePastedHtml(
      normalizeLegacyHtml('<p class="MsoNormal" onclick="steal()"><font color="#e4393c">红</font></p>'),
      { extraStyleProps: ["font-family"] },
    );
    expect(piped).not.toContain("MsoNormal");
    expect(piped).not.toContain("onclick");
    expect(piped).toContain("color: #e4393c");
  });
});

describe("RichTextEditor legacyHtml（#208 往返）", () => {
  it("关着时行为与不认识这个 prop 时一致：三项照旧丢", async () => {
    // 这条是最重要的一条 —— 存量消费方的行为不许被静默改掉。
    const font = render(<RichTextEditor defaultValue={FONT_HTML} />);
    expect(await readback(font.container)).toBe("<p>红色强调</p>");
    cleanup();

    const img = render(<RichTextEditor defaultValue={IMG_HTML} />);
    expect(await readback(img.container)).not.toContain("max-width");
    cleanup();

    const section = render(<RichTextEditor defaultValue={SECTION_HTML} />);
    expect(await readback(section.container)).toBe("<p>居中段</p>");
  });

  it("开着时 <font> 的 color / face / size 全部活到载入之后", async () => {
    const { container } = render(<RichTextEditor legacyHtml defaultValue={FONT_HTML} />);
    const html = await readback(container);
    const span = container.querySelector('[role="textbox"] span');
    const style = span?.getAttribute("style") ?? "";
    expect(style).toContain("rgb(228, 57, 60)"); // jsdom 把 #e4393c 规范成 rgb()
    expect(style).toContain("font-family");
    expect(style).toContain("16px");
    expect(html).toContain("红色强调");
  });

  it("开着时 <img> 的 style 保住，且只保住白名单里那几条", async () => {
    const { container } = render(
      <RichTextEditor
        legacyHtml
        defaultValue='<img src="https://cdn/a.png" style="max-width:100%;position:fixed;z-index:9999">'
      />,
    );
    await readback(container);
    const style = container.querySelector('[role="textbox"] img')?.getAttribute("style") ?? "";
    expect(style).toContain("max-width: 100%");
    expect(style).not.toContain("position");
    expect(style).not.toContain("z-index");
  });

  it("开着时 <section> 上的居中活下来（落到子块的 text-align）", async () => {
    const { container } = render(<RichTextEditor legacyHtml defaultValue={SECTION_HTML} />);
    expect(await readback(container)).toContain("text-align: center");
  });

  it("分档开：{ font: true } 只救 <font>，不动图片", async () => {
    const { container } = render(
      <RichTextEditor legacyHtml={{ font: true }} defaultValue={FONT_HTML + IMG_HTML} />,
    );
    await readback(container);
    const textbox = container.querySelector('[role="textbox"]')!;
    expect(textbox.querySelector("span")?.getAttribute("style")).toContain("font-family");
    expect(textbox.querySelector("img")?.getAttribute("style")).toBeFalsy();
  });

  it("兼容档不吃工具栏裁剪：toolbar=[] 时存量的红字照样活", async () => {
    // schema 里没有的 mark 在载入时就被清掉。兼容档必须自带 schema，
    // 不能指望消费方为了「不丢红字」去开一个他并不想要的调色按钮。
    const { container } = render(
      <RichTextEditor legacyHtml toolbar={[]} defaultValue={FONT_HTML} />,
    );
    await readback(container);
    expect(container.querySelector('[role="textbox"] span')?.getAttribute("style")).toContain(
      "rgb(228, 57, 60)",
    );
  });

  it("开着时文字底色 background-color 活下来，且仍是 <span style>（#210）", async () => {
    const { container } = render(<RichTextEditor legacyHtml defaultValue={BG_HTML} />);
    await readback(container);
    const span = container.querySelector('[role="textbox"] span');
    expect(span?.getAttribute("style")).toContain("background-color: rgb(194, 79, 74)");
    // 刻意不用 Highlight 扩展：那个渲染成 <mark>，会把存量的标签形状换掉 ——
    // 消费方存回库里的正文就变样了，等于拿一次静默内容变更换掉另一次。
    expect(container.querySelector('[role="textbox"] mark')).toBeNull();
  });

  it("底色与文字色写在同一个 style 上时一起活（存量的真实形态）", async () => {
    const { container } = render(
      <RichTextEditor
        legacyHtml
        defaultValue='<p><span style="color:#fff;background-color:rgb(194,79,74)">白字暗红底</span></p>'
      />,
    );
    await readback(container);
    const style = container.querySelector('[role="textbox"] span')?.getAttribute("style") ?? "";
    expect(style).toContain("background-color");
    expect(style).toContain("color");
  });

  it("关着时底色照旧丢 —— #210 报的就是这个，默认行为不许被这次改动带偏", async () => {
    const { container } = render(<RichTextEditor defaultValue={BG_HTML} />);
    await readback(container);
    expect(container.querySelector('[role="textbox"] span')?.getAttribute("style")).toBeFalsy();
  });

  it("受控 value 二次灌入同样走归一", async () => {
    const { container, rerender } = render(<RichTextEditor legacyHtml value="<p>第一版</p>" />);
    await waitFor(() => expect(container.textContent).toContain("第一版"));
    rerender(<RichTextEditor legacyHtml value={FONT_HTML} />);
    await waitFor(() =>
      expect(container.querySelector('[role="textbox"] span')).toBeTruthy(),
    );
    expect(container.querySelector('[role="textbox"] span')?.getAttribute("style")).toContain(
      "rgb(228, 57, 60)",
    );
  });
});

describe("sanitizePastedHtml 的存量放宽档（#208）", () => {
  it("默认口径一个字不变：font-family / max-width 照旧剥掉", () => {
    const out = sanitizePastedHtml(
      '<p><span style="font-family:宋体;max-width:100%;color:#e4393c">x</span></p>',
    );
    expect(out).not.toContain("font-family");
    expect(out).not.toContain("max-width");
    expect(out).toContain("color:#e4393c");
  });

  it("放宽档只加白名单条目，删除类规则一条都不松", () => {
    const out = sanitizePastedHtml(
      '<style>.x{}</style><p class="MsoNormal" onclick="steal()" style="font-family:宋体;position:fixed">' +
        '<a href="javascript:alert(1)">x</a><img src="https://cdn/a.png" style="max-width:100%"></p>',
      { extraStyleProps: ["font-family", "max-width"] },
    );
    expect(out).toContain("font-family:宋体");
    expect(out).toContain("max-width:100%");
    expect(out).not.toContain("position");
    expect(out).not.toContain("MsoNormal");
    expect(out).not.toContain("onclick");
    expect(out).not.toContain("javascript:");
    expect(out).not.toContain("<style");
  });
});
