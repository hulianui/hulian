---
"@hulianui/ui": minor
---

`RichTextEditor` 补一档存量 HTML 兼容：`legacyHtml` prop + 导出纯函数 `normalizeLegacyHtml`（#208）。

消费方拿生产库里的真实正文跑「打开 → 不做任何编辑 → 取回 HTML」，测出简单正文无损、但运营从微信编辑器粘过来的正文有明显丢失：`<font>` 29→0、`color` 11→0、`face` 25→0、`style` 13→1。本地按同样形态复现，三项确认全丢 —— `<font color="#e4393c" face="微软雅黑" size="3">红色强调</font>` 只剩 `<p>红色强调</p>`，`<img style="max-width:100%">` 的 style 整条没了，`<section style="text-align:center">` 连标签带对齐一起消失。丢的这几样恰好都是运营真正在用的排版（红字、字号、居中、以及微信给每张图带的 `max-width` —— 少了它图片在前台会撑破容器），不是脏标记。80 个待迁页面里有 ~50 个卡在这里。

定级 minor 而不是 patch：新增了 prop 与导出，且**默认关**，关着时行为与不认识这个 prop 时逐字节一致（有专门一条测试钉死这点）。

**为什么两个入口都要，而不是只做纯函数。** issue 给了两个候选，纯函数看起来更省表面积，实测下来它救不全：

- `<font>` → `<span style>` 与块级对齐下推，都是**解析前**的标记翻译，纯函数完全够。
- 但 `<img>` 上的 `style` 与 `font-family` **必须 schema 参与**：schema 里没有的属性在 ProseMirror 解析那一刻就没了，转成什么形状都白搭。实测把 `<span style="font-family:…">` 直接喂进去，输出里仍然只剩 `color` 与 `font-size`（缺 `FontFamily` 扩展）；`<img style>` 同理（`Image` 节点没有 `style` 属性）。

所以：`legacyHtml` prop 覆盖三档（含装 `FontFamily`、给 `Image` 加白名单 `style` 属性），`normalizeLegacyHtml(html, { font, align })` 覆盖能纯函数化的那两档，供批量洗库 / 迁移脚本 / 跟别的编辑器共用同一套映射口径。

几个非显然的取舍：

- **兼容档不吃 `toolbar` 裁剪。** 开着 `legacyHtml.font` 就无条件装上 `TextStyle` / `Color` / `FontSize` / `FontFamily`，哪怕工具栏里既没有调色也没有字号按钮。schema 决定存量能不能活，按钮决定用户能不能改，这是两件事 —— 不能为了「别丢红字」逼消费方开一个他并不想要的调色按钮。`FontFamily` 更是刻意只进 schema 不进工具栏：装它是为了别把存量的字体丢了，不是为了让运营选字体。
- **对齐是「下推」不是「保留」。** CSS 里 `text-align` 继承，ProseMirror 里不继承：`<section>` 本身进不了 schema，它一被拆，挂在它身上的居中就跟着没了。所以归一时把对齐推到子块上，只裹行内内容的包裹块直接转成 `<p style="text-align">`。顺带认了 `align="center"` 属性与 `<center>` 标签 —— 同一批存量里它们和 `<font>` 是一起出现的。
- **只裹一张图的居中包裹层刻意不转。** 图片是块级节点，套一层 `<p>` 只会让 ProseMirror 把它提出去、再留下一个空段落 —— 那是拿一个新 bug 换一个旧 bug。这一条写进了文档：图片居中应该在前台样式里给。
- **属性值走形状白名单，不是字符串拼接。** `<font color>` 的值来自消费方数据库里的用户可写字段，直接拼进 `style` 等于把整个属性交出去（`color="red;position:fixed;z-index:9999"`）。颜色只认命名色 / `#hex` / `rgb()`，`face` 里带结构字符的一律丢，`size` 只认 `1..7` 与 `+n`/`-n`（按浏览器自己那张表映射到 px）。`<img style>` 同样是白名单三条（`max-width` / `width` / `height`），`position` / `z-index` 进不来。
- **粘贴净化的删除类规则一条都不松。** `legacyHtml` 开着时粘贴路径变成「先归一后净化」（反过来的话 `color`/`face`/`size` 早被属性白名单删光了，翻译无从谈起），净化那一步只是多放行 `font-family` 与 `max-width` 两条白名单条目，`class` / `on*` / `<style>` / `javascript:` 照删。
- **中文族名一律加引号。** `font-family: 微软雅黑` 按 CSS 规范合法，实测撑不住：jsdom 的 cssstyle 把整条声明判为非法直接丢掉，`'Arial', 宋体` 这种后备栈还会从非法那一项起被截断。用单引号 —— 双引号序列化成 `&quot;` 之后会变成族名字面量的一部分。

复现与回归都按 issue 点名的那个陷阱写：读 `.ProseMirror` 的 `innerHTML` 前先剥掉 `<br class="ProseMirror-trailingBreak">`，那是渲染占位、不进 `getHTML`，不剥会把 `<br>` 数量算成翻倍。
