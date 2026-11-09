---
"@hulianui/ui": minor
---

feat(novel): 正文的字族、字号和行距可以真正落到字上。

**`NovelReader.articleClassName`**：字号和行距本来就写在正文 `<article>` 上，字族之前换不了。阅读站要把正文换成宋体，用这个 prop，不要在外面写 `[&_article]` 去改组件内部。

**`Markdown.inheritTypography`**：内部 Prose 钉死了 `text-base` 和 `leading-7`，阅读器里改字号、行距时正文不动。打开后这两项跟外层走。文档页默认关闭，表现不变。

**`NovelEditor.previewClassName`**：预览区可以铺成和阅读器同一张纸、同一副字。编辑栏仍是工具，不把整屏写成后台。

<!-- changelog-en:start -->
feat(novel): the text's font family, size, and line height can actually land on the glyphs.

**`NovelReader.articleClassName`**: size and line height were already written on the text `<article>`, but the font family could not be changed. A reading site that wants the text in a Song typeface uses this prop, instead of writing `[&_article]` outside the component to reach inside it.

**`Markdown.inheritTypography`**: the inner Prose pins `text-base` and `leading-7`, so changing size or line height in the reader left the text still. Turning this on lets both follow the outer layer. Docs pages leave it off, and their appearance stays the same.

**`NovelEditor.previewClassName`**: the preview can use the same paper and the same type as the reader. The editing bar stays a tool and does not turn the whole screen into an admin page.
<!-- changelog-en:end -->

