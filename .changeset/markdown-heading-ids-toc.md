---
"@hulianui/ui": minor
---

Markdown 新增 `headingIds`：开启后给渲染出的标题挂锚点 id，长文可做目录与 `#片段` 深链（#303）。传字符串则同时开启并把它当 id 前缀（`headingIds="doc-"` → `doc-props`），把这批 id 关进自己的命名空间，免与宿主页面已有 id 撞。

同时导出 `slugifyHeading` / `extractHeadings(src, prefix?)` 两个纯函数：目录项从**同一份源文本**抽，与渲染共用一套 slug 规则（剥行内标记 → 转小写 → 空白折连字符 → 只留 Unicode 字母数字与 `-` `_`，故中文标题原样保留；同名标题追加 `-1` / `-2`；纯符号与空标题回落 `section`），href 与 DOM 里的 id 不会错位。

`extractHeadings` 每项给 `{ level, text, plainText, id }`，目录标签用 `plainText`（行内标记已剥掉）。

`headingIds` 默认关闭：id 是全局命名空间，默认生成会让存量调用点凭空多出一批可能与页面已有 id 撞车的锚点。

`Markdown` 的行内解析支持多反引号围栏（CommonMark 的 code span）：此前只认单反引号，
于是 `` `x` `` 这种「把反引号本身放进代码里」的写法会被从第一个反引号切开，围栏错位后
整行剩下的标记跟着错 —— 实测「剥掉行内标记（`` `代码` `` / `**粗**` / `[文字](链接)`）」
里的 `**粗**` 渲染成了 <strong>、`[文字](链接)` 渲染成了真链接。凡是「用 Markdown 讲
Markdown 语法」的文档都会踩（本库自己的 markdown.md 就踩了，静态导出后被链接门禁判成
悬空链接才暴露）。围栏内容按 CommonMark 处理首尾空格：两端各有一个且内容不全为空格时
各去掉一个。
